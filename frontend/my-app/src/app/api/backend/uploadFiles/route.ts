/**
 * Next.js API Route: /api/backend/uploadFiles
 * Uploads multiple files to Supabase Storage or local filesystem
 * Replaces: backend/uploadFiles.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

// Initialize Supabase client only if configured
const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseServiceKey!)
  : null;

// Local uploads directory (relative to project root)
// process.cwd() is frontend/my-app, so go up two levels to reach project root
const getUploadsDir = () => {
  const projectRoot = join(process.cwd(), '..', '..');
  return join(projectRoot, 'backend', 'uploads');
};

// Helper function to clone FormData by extracting all entries first
async function cloneFormData(originalFormData: FormData): Promise<FormData> {
  const cloned = new FormData();
  const entries: Array<[string, File | string]> = [];
  
  // Extract all entries first (before iterator is consumed)
  for (const [key, value] of originalFormData.entries()) {
    entries.push([key, value]);
  }
  
  // Now append to cloned FormData
  for (const [key, value] of entries) {
    if (value instanceof File) {
      cloned.append(key, value, value.name);
    } else {
      cloned.append(key, value);
    }
  }
  
  return cloned;
}

export async function POST(request: NextRequest) {
  try {
    // Check if request has a body (Content-Type check is lenient - browser sets it automatically)
    const contentType = request.headers.get('content-type') || '';
    // Only reject if it's clearly not a multipart request (e.g., application/json)
    if (contentType && !contentType.includes('multipart/form-data') && contentType.includes('application/json')) {
      console.error('❌ Invalid Content-Type for file upload:', contentType);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request: Content-Type must be multipart/form-data for file uploads',
          debug: { contentType }
        },
        { status: 400 }
      );
    }

    // Read FormData once (can only be read once)
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError: any) {
      console.error('❌ Failed to parse FormData:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to parse request body as FormData. Please ensure files are properly attached.',
          error: parseError.message || 'Unknown parsing error',
          debug: {
            contentType,
            errorType: parseError.name,
            errorMessage: parseError.message
          }
        },
        { status: 400 }
      );
    }
    
    // Extract all entries first (before iterator is consumed)
    const entries: Array<[string, File | string]> = [];
    let fileCount = 0;
    const fileInfo: Array<{field: string, name: string, size: number, type: string}> = [];
    
    for (const [key, value] of formData.entries()) {
      entries.push([key, value]);
      
      // Check for File or Blob objects
      if (key !== 'booking_reference') {
        // More robust file detection - check for File-like objects
        const isFile = value instanceof File || 
                      (typeof value === 'object' && value !== null && 
                       'name' in value && 'size' in value && 'type' in value &&
                       typeof (value as any).stream === 'function');
        
        const isBlob = value instanceof Blob || 
                      (typeof value === 'object' && value !== null && 
                       'size' in value && 'type' in value &&
                       typeof (value as any).stream === 'function' && !('name' in value));
        
        if (isFile) {
          const file = value as File;
          fileCount++;
          fileInfo.push({ 
            field: key, 
            name: file.name || key, 
            size: file.size || 0, 
            type: file.type || 'application/octet-stream' 
          });
        } else if (isBlob) {
          // Handle Blob objects (convert to File-like for processing)
          const blob = value as Blob;
          fileCount++;
          fileInfo.push({ 
            field: key, 
            name: key, 
            size: blob.size || 0, 
            type: blob.type || 'application/octet-stream' 
          });
          console.log(`⚠️ Found Blob instead of File for ${key}:`, { size: blob.size, type: blob.type });
        } else {
          console.log(`⚠️ Non-file entry for ${key}:`, typeof value, value);
        }
      }
    }
    
    console.log(`📁 Found ${fileCount} file(s) in FormData:`, fileInfo);
    console.log(`📋 All FormData keys:`, entries.map(([key]) => key));
    console.log(`📋 All FormData entries:`, entries.map(([key, value]) => {
      const isFile = value instanceof File;
      const isBlob = !isFile && typeof value === 'object' && value !== null && 'size' in value && 'type' in value;
      return {
        key,
        type: isFile ? 'File' : isBlob ? 'Blob' : typeof value,
        name: isFile ? (value as File).name : isBlob ? key : String(value).substring(0, 30),
        size: isFile ? (value as File).size : isBlob ? (value as { size: number }).size : undefined
      };
    }));
    
    if (fileCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No files found in request. Please ensure files are attached.',
          debug: { 
            fileCount, 
            formDataKeys: entries.map(([key]) => key),
            entries: entries.map(([key, value]) => ({ 
              key, 
              type: value instanceof File ? 'File' : typeof value,
              name: value instanceof File ? value.name : String(value).substring(0, 50)
            }))
          }
        },
        { status: 400 }
      );
    }
    
    // Rebuild FormData from extracted entries for processing
    const workingFormData = new FormData();
    for (const [key, value] of entries) {
      // More robust file detection
      const isFile = value instanceof File || 
                    (typeof value === 'object' && value !== null && 
                     'name' in value && 'size' in value && 'type' in value);
      
      const isBlob = value instanceof Blob || 
                    (typeof value === 'object' && value !== null && 
                     'size' in value && 'type' in value && !('name' in value));
      
      if (isFile) {
        const file = value as File;
        workingFormData.append(key, file, file.name || key);
      } else if (isBlob) {
        // Convert Blob to File for processing
        const blob = value as Blob;
        const fileName = key.includes('.') ? key : `${key}.${blob.type?.split('/')[1] || 'bin'}`;
        const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
        workingFormData.append(key, file, fileName);
      } else {
        workingFormData.append(key, value);
      }
    }
    
    // Clone FormData for fallback if needed
    const clonedFormData = await cloneFormData(workingFormData);
    
    // If Supabase is configured, try it first
    if (isSupabaseConfigured && supabase) {
      try {
        const result = await uploadToSupabase(workingFormData);
        if (result.success) {
          return NextResponse.json(result);
        }
        // If Supabase fails, fall back to local filesystem using cloned FormData
        console.warn('⚠️ Supabase upload failed, falling back to local filesystem:', result.message);
        if (result.errors && result.errors.length > 0) {
          console.error('❌ Upload errors:', result.errors);
        }
        return await uploadToLocalFilesystem(clonedFormData);
      } catch (supabaseError: any) {
        console.error('❌ Supabase upload error:', supabaseError);
        // Fall back to local filesystem using cloned FormData
        return await uploadToLocalFilesystem(clonedFormData);
      }
    }

    // Fall back to local filesystem upload
    console.log('📤 Uploading to local filesystem...');
    return await uploadToLocalFilesystem(workingFormData);

  } catch (error: any) {
    console.error('Upload files error:', error);
    return NextResponse.json(
      { success: false, message: 'Error: ' + error.message },
      { status: 500 }
    );
  }
}

async function uploadToSupabase(formData: FormData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const bookingRef = formData.get('booking_reference') as string || 'TEMP_' + Date.now();
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];
  const maxFileSize = 10 * 1024 * 1024;

  const uploadedFiles: string[] = [];
  const errors: string[] = [];

    // Process all files in formData
    for (const [fieldName, value] of formData.entries()) {
      if (fieldName === 'booking_reference') continue;
      
      // More robust file detection
      const isFile = value instanceof File || 
                    (typeof value === 'object' && value !== null && 
                     'name' in value && 'size' in value && 'type' in value);
      
      if (isFile) {
        const file = value as File;
        console.log(`📤 Processing file: ${fieldName} - ${file.name || fieldName} (${file.size || 0} bytes, ${file.type || 'unknown'})`);
        const result = await processFile(file, bookingRef, allowedTypes, maxFileSize);
        if (result.success) {
          uploadedFiles.push(result.url!);
          console.log(`✅ Successfully uploaded: ${file.name || fieldName}`);
        } else {
          const errorMsg = result.error || `Failed to upload ${file.name || fieldName}`;
          errors.push(errorMsg);
          console.error(`❌ Failed to upload ${file.name || fieldName}:`, errorMsg);
        }
      } else {
        console.log(`⚠️ Skipping non-file entry: ${fieldName} = ${typeof value}`, value);
      }
    }

  if (uploadedFiles.length === 0) {
    return {
      success: false,
      message: 'No files uploaded successfully',
      errors: errors.length > 0 ? errors : ['No files were processed']
    };
  }

  return {
    success: true,
    message: `${uploadedFiles.length} file(s) uploaded successfully`,
    files: uploadedFiles,
    errors: errors.length > 0 ? errors : undefined
  };
}

async function uploadToLocalFilesystem(formData: FormData) {
  try {
    const uploadsDir = getUploadsDir();
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const bookingRef = formData.get('booking_reference') as string || 'TEMP_' + Date.now();
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const uploadedFiles: string[] = [];
    const errors: string[] = [];

    // Process all files in formData
    for (const [fieldName, value] of formData.entries()) {
      if (fieldName === 'booking_reference') continue;
      
      // More robust file detection
      const isFile = value instanceof File || 
                    (typeof value === 'object' && value !== null && 
                     'name' in value && 'size' in value && 'type' in value);
      
      if (isFile) {
        const file = value as File;
        console.log(`📤 Processing file: ${fieldName} - ${file.name || fieldName} (${file.size || 0} bytes, ${file.type || 'unknown'})`);
        const result = await processLocalFile(file, bookingRef, uploadsDir, allowedTypes, maxFileSize);
        if (result.success) {
          uploadedFiles.push(result.path!);
          console.log(`✅ Successfully uploaded: ${file.name || fieldName} to ${result.path}`);
        } else {
          const errorMsg = result.error || `Failed to upload ${file.name || fieldName}`;
          errors.push(errorMsg);
          console.error(`❌ Failed to upload ${file.name || fieldName}:`, errorMsg);
        }
      } else {
        console.log(`⚠️ Skipping non-file entry: ${fieldName} = ${typeof value}`, value);
      }
    }

    if (uploadedFiles.length === 0) {
      const errorMessage = errors.length > 0 
        ? `No files uploaded successfully. ${errors.length} error(s): ${errors.join('; ')}`
        : 'No files uploaded successfully. No files were processed.';
      
      console.error('❌ Upload failed:', {
        fileCount: uploadedFiles.length,
        errors: errors,
        message: errorMessage
      });
      
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          errors: errors,
          debug: {
            processedFiles: uploadedFiles.length,
            errorCount: errors.length
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Local filesystem upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to upload files: ' + error.message
      },
      { status: 500 }
    );
  }
}

async function processLocalFile(
  file: File,
  bookingRef: string,
  uploadsDir: string,
  allowedTypes: string[],
  maxFileSize: number
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Get file extension for fallback validation
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
    
    // Validate file type - check both MIME type and extension
    const isValidMimeType = allowedTypes.includes(file.type);
    const isValidExtension = allowedExtensions.includes(extension);
    
    if (!isValidMimeType && !isValidExtension) {
      console.warn(`⚠️ File type validation failed for ${file.name}:`, {
        mimeType: file.type,
        extension: extension,
        allowedTypes: allowedTypes,
        allowedExtensions: allowedExtensions
      });
      return {
        success: false,
        error: `Invalid file type for ${file.name} (${file.type || 'unknown'}). Only images (JPG, PNG, GIF) and documents (PDF, DOC, DOCX) are allowed.`
      };
    }
    
    // If MIME type is empty or generic, but extension is valid, allow it
    if (!isValidMimeType && isValidExtension) {
      console.log(`ℹ️ Allowing file ${file.name} based on extension ${extension} (MIME type: ${file.type || 'empty'})`);
    }

    // Validate file size
    if (file.size > maxFileSize) {
      return {
        success: false,
        error: `File ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum size of 10MB.`
      };
    }
    
    // Check for empty files
    if (file.size === 0) {
      return {
        success: false,
        error: `File ${file.name} is empty.`
      };
    }

    // Generate unique filename (reuse extension from validation above)
    const safeFilename = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/\.[^/.]+$/, '');
    const uniqueFilename = `${bookingRef}_${safeFilename}_${Date.now()}.${extension}`;
    const filePath = join(uploadsDir, uniqueFilename);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Return relative path (matching PHP backend format)
    return {
      success: true,
      path: `uploads/${uniqueFilename}`
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Error processing ${file.name}: ${error.message}`
    };
  }
}

async function processFile(
  file: File,
  bookingRef: string,
  allowedTypes: string[],
  maxFileSize: number
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Get file extension for fallback validation
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
    
    // Validate file type - check both MIME type and extension
    const isValidMimeType = allowedTypes.includes(file.type);
    const isValidExtension = allowedExtensions.includes(extension);
    
    if (!isValidMimeType && !isValidExtension) {
      console.warn(`⚠️ File type validation failed for ${file.name}:`, {
        mimeType: file.type,
        extension: extension,
        allowedTypes: allowedTypes,
        allowedExtensions: allowedExtensions
      });
      return {
        success: false,
        error: `Invalid file type for ${file.name} (${file.type || 'unknown'}). Only images (JPG, PNG, GIF) and documents (PDF, DOC, DOCX) are allowed.`
      };
    }
    
    // If MIME type is empty or generic, but extension is valid, allow it
    if (!isValidMimeType && isValidExtension) {
      console.log(`ℹ️ Allowing file ${file.name} based on extension ${extension} (MIME type: ${file.type || 'empty'})`);
    }

    // Validate file size
    if (file.size > maxFileSize) {
      return {
        success: false,
        error: `File ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum size of 10MB.`
      };
    }
    
    // Check for empty files
    if (file.size === 0) {
      return {
        success: false,
        error: `File ${file.name} is empty.`
      };
    }

    // Generate unique filename (reuse extension variable from validation above)
    const safeFilename = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/\.[^/.]+$/, '');
    const uniqueFilename = `${bookingRef}_${safeFilename}_${Date.now()}.${extension}`;
    const filePath = `bookings/${uniqueFilename}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tribute-images') // Using same bucket, or create 'booking-documents' bucket
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return {
        success: false,
        error: `Failed to upload ${file.name}: ${uploadError.message}`
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tribute-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Error processing ${file.name}: ${error.message}`
    };
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


import { supabase } from '../supabaseClient';

/**
 * Upload file to Supabase Storage
 * @param {File} file - File to upload
 * @param {string} folder - Folder name (tributes, profiles, etc)
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export async function uploadToSupabase(file, folder = 'tributes') {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${folder}/${timestamp}_${randomString}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('tribute-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tribute-images')
      .getPublicUrl(filename);

    console.log('✅ Uploaded to Supabase:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
}

/**
 * Delete file from Supabase Storage
 * @param {string} url - Full Supabase URL
 */
export async function deleteFromSupabase(url) {
  try {
    // Extract path from URL
    const urlParts = url.split('/tribute-images/');
    if (urlParts.length < 2) return;
    
    const path = urlParts[1];
    
    const { error } = await supabase.storage
      .from('tribute-images')
      .remove([path]);

    if (error) throw error;
    console.log('✅ Deleted from Supabase:', path);
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
  }
}

export default { uploadToSupabase, deleteFromSupabase };

import { supabase } from '../supabaseClient';

/**
 * Upload image to Supabase Storage
 * @param {File|Blob} file - Image file to upload
 * @param {string} folder - Folder path (e.g., 'tributes', 'profiles')
 * @returns {Promise<{url: string, path: string}>} - Public URL and storage path
 */
export async function uploadImageToSupabase(file, folder = 'tributes') {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name ? file.name.split('.').pop() : 'jpg';
    const filename = `${folder}/${timestamp}_${randomString}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('tribute-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tribute-images')
      .getPublicUrl(filename);

    return {
      url: publicUrl,
      path: filename
    };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
}

/**
 * Migrate image from localhost URL to Supabase
 * @param {string} localhostUrl - e.g., 'http://localhost/smart_funeral_system/uploads/tributes/photo.jpg'
 * @param {string} backendUrl - Your ngrok backend URL
 * @returns {Promise<string>} - New Supabase URL
 */
export async function migrateImageFromLocalhost(localhostUrl, backendUrl) {
  try {
    // Convert localhost URL to ngrok URL for fetching
    const fetchUrl = localhostUrl.replace(
      'http://localhost/smart_funeral_system',
      backendUrl.replace('/backend', '')
    );

    // Fetch the image from your server
    const response = await fetch(fetchUrl, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    // Get image as blob
    const blob = await response.blob();
    
    // Determine folder from URL
    const folder = localhostUrl.includes('/tributes/') ? 'tributes' : 
                   localhostUrl.includes('/profiles/') ? 'profiles' : 'other';

    // Create a File object from blob
    const filename = localhostUrl.split('/').pop();
    const file = new File([blob], filename, { type: blob.type });

    // Upload to Supabase
    const { url } = await uploadImageToSupabase(file, folder);
    
    return url;
  } catch (error) {
    console.error('Error migrating image:', error);
    throw error;
  }
}

/**
 * Batch migrate all tribute images from database
 * Call this from browser console after deployment
 */
export async function migrateAllTributeImages(backendUrl) {
  try {
    console.log('🚀 Starting image migration to Supabase...');
    
    // Fetch all tributes
    const response = await fetch(`${backendUrl}/getTributes.php`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const data = await response.json();
    
    if (!data.success) throw new Error('Failed to fetch tributes');

    const tributes = data.tributes;
    const migrations = [];

    for (const tribute of tributes) {
      const photoField = tribute.portrait_photo || tribute.photo_url;
      
      // Check if image needs migration (localhost URL or relative path)
      if (photoField && (photoField.includes('localhost') || photoField.startsWith('uploads/'))) {
        console.log(`📷 Migrating portrait for: ${tribute.name || tribute.deceased_name}`);
        
        try {
          // Convert relative path to full localhost URL if needed
          let imageUrl = photoField;
          if (photoField.startsWith('uploads/')) {
            imageUrl = `http://localhost/smart_funeral_system/${photoField}`;
          }
          
          const newUrl = await migrateImageFromLocalhost(imageUrl, backendUrl);
          
          // Update database with new URL (use correct field name)
          const updateField = tribute.portrait_photo ? 'portrait_photo' : 'photo_url';
          await fetch(`${backendUrl}/updateTributeImage.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
              tribute_id: tribute.id,
              field_name: updateField,
              image_url: newUrl
            })
          });

          migrations.push({
            id: tribute.id,
            name: tribute.name || tribute.deceased_name,
            oldUrl: photoField,
            newUrl
          });

          console.log(`✅ Migrated: ${tribute.name || tribute.deceased_name}`);
        } catch (error) {
          console.error(`❌ Failed to migrate ${tribute.deceased_name}:`, error);
        }
      }
    }

    console.log('🎉 Migration complete!');
    console.log(`✅ Successfully migrated ${migrations.length} images`);
    return migrations;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

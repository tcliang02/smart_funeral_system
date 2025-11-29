import { supabase } from './supabaseClient';

/**
 * ========================================
 * SUPABASE DATA HELPERS
 * ========================================
 * Replace PHP backend API calls with Supabase queries
 */

// ========================================
// PACKAGES
// ========================================

/**
 * Get all packages
 * Replaces: /backend/getPackages.php
 */
export async function getPackages() {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('package_id', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      packages: data
    };
  } catch (error) {
    console.error('Error fetching packages:', error);
    return {
      success: false,
      message: 'Failed to load packages'
    };
  }
}

/**
 * Get package by ID with features
 * Replaces: /backend/getPackageDetails.php
 */
export async function getPackageDetails(packageId) {
  try {
    // Get package
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('package_id', packageId)
      .single();

    if (packageError) throw packageError;

    // Get package features
    const { data: features, error: featuresError } = await supabase
      .from('package_features')
      .select('*')
      .eq('package_id', packageId)
      .order('feature_id', { ascending: true });

    if (featuresError) throw featuresError;

    return {
      success: true,
      package: packageData,
      features: features || []
    };
  } catch (error) {
    console.error('Error fetching package details:', error);
    return {
      success: false,
      message: 'Failed to load package details'
    };
  }
}

/**
 * Add new package (provider only)
 * Replaces: /backend/addPackage.php
 */
export async function addPackage(packageData) {
  try {
    const { data, error } = await supabase
      .from('packages')
      .insert([packageData])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      package: data
    };
  } catch (error) {
    console.error('Error adding package:', error);
    return {
      success: false,
      message: 'Failed to add package'
    };
  }
}

// ========================================
// BOOKINGS
// ========================================

/**
 * Get all bookings for a user
 * Replaces: /backend/getBookings.php
 */
export async function getBookings(userId) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        packages (package_id, name, price),
        booking_addons (
          booking_addon_id,
          addon_name,
          addon_price,
          quantity
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      bookings: data
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      success: false,
      message: 'Failed to load bookings'
    };
  }
}

/**
 * Create new booking
 * Replaces: /backend/createBooking.php
 */
export async function createBooking(bookingData) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      booking: data,
      booking_id: data.booking_id
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return {
      success: false,
      message: 'Failed to create booking'
    };
  }
}

// ========================================
// SERVICE PROVIDERS
// ========================================

/**
 * Get all service providers
 * Replaces: /backend/getProviders.php
 */
export async function getServiceProviders() {
  try {
    const { data, error } = await supabase
      .from('service_provider')
      .select(`
        *,
        users (name, email)
      `)
      .eq('is_active', true)
      .order('provider_id', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      providers: data
    };
  } catch (error) {
    console.error('Error fetching providers:', error);
    return {
      success: false,
      message: 'Failed to load service providers'
    };
  }
}

/**
 * Get provider details
 * Replaces: /backend/getProviderDetails.php
 */
export async function getProviderDetails(providerId) {
  try {
    const { data, error } = await supabase
      .from('service_provider')
      .select(`
        *,
        users (name, email, username)
      `)
      .eq('provider_id', providerId)
      .single();

    if (error) throw error;

    return {
      success: true,
      provider: data
    };
  } catch (error) {
    console.error('Error fetching provider details:', error);
    return {
      success: false,
      message: 'Failed to load provider details'
    };
  }
}

// ========================================
// ADD-ONS
// ========================================

/**
 * Get addon templates
 * Replaces: /backend/getAddonTemplates.php
 */
export async function getAddonTemplates(categoryId = null) {
  try {
    let query = supabase
      .from('addon_templates')
      .select('*')
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      addons: data
    };
  } catch (error) {
    console.error('Error fetching addon templates:', error);
    return {
      success: false,
      message: 'Failed to load add-ons'
    };
  }
}

/**
 * Get addon categories
 * Replaces: /backend/getAddonCategories.php
 */
export async function getAddonCategories() {
  try {
    const { data, error } = await supabase
      .from('addon_categories')
      .select('*')
      .order('category_id', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      categories: data
    };
  } catch (error) {
    console.error('Error fetching addon categories:', error);
    return {
      success: false,
      message: 'Failed to load categories'
    };
  }
}

// ========================================
// TRIBUTES
// ========================================

/**
 * Get all tributes
 * Replaces: /backend/getTributes.php
 */
export async function getTributes() {
  try {
    const { data, error } = await supabase
      .from('tributes')
      .select(`
        *,
        users (name, username)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      tributes: data
    };
  } catch (error) {
    console.error('Error fetching tributes:', error);
    return {
      success: false,
      message: 'Failed to load tributes'
    };
  }
}

/**
 * Get tribute by ID
 * Replaces: /backend/getTributeDetails.php
 */
export async function getTributeDetails(tributeId) {
  try {
    const { data, error } = await supabase
      .from('tributes')
      .select(`
        *,
        users (name, username, email)
      `)
      .eq('tribute_id', tributeId)
      .single();

    if (error) throw error;

    return {
      success: true,
      tribute: data
    };
  } catch (error) {
    console.error('Error fetching tribute details:', error);
    return {
      success: false,
      message: 'Failed to load tribute details'
    };
  }
}

// ========================================
// HELPER: Get User by ID
// ========================================

export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, name, username, email, role')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      user: data
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      success: false,
      message: 'User not found'
    };
  }
}

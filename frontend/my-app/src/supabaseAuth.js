import { supabase } from './supabaseClient';
import { API_BASE_URL } from './config';

/**
 * ========================================
 * SUPABASE AUTHENTICATION HELPERS
 * ========================================
 * Replaces PHP backend authentication
 */

/**
 * Login with username/email and password
 * Uses PHP backend for password verification (bcrypt hashed passwords)
 * Then creates a client-side session for Supabase queries
 */
export async function loginWithSupabase(credentials) {
  try {
    const { username, password } = credentials;
    
    // Step 1: Call PHP backend to verify password (bcrypt hash)
    // This is temporary - we keep PHP login for password verification
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Skip ngrok warning page
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Invalid username or password'
      };
    }

    // Step 2: Store user data for Supabase client-side auth
    const user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(user));

    // Step 3: Return user data (matching PHP format)
    return {
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: data.token
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: '⚠️ Server error. Please ensure XAMPP is running.'
    };
  }
}

/**
 * Register new user
 */
export async function registerWithSupabase(userData) {
  try {
    const { name, username, email, password, role = 'family' } = userData;

    // Step 1: Check if username or email already exists
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`);

    if (existing && existing.length > 0) {
      if (existing.some(u => u.username === username)) {
        return {
          success: false,
          message: 'Username already taken'
        };
      }
      if (existing.some(u => u.email === email)) {
        return {
          success: false,
          message: 'Email already registered'
        };
      }
    }

    // Step 2: Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
          role
        }
      }
    });

    if (authError) {
      return {
        success: false,
        message: authError.message || 'Registration failed'
      };
    }

    // Step 3: Insert into users table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        name,
        username,
        email,
        password: authData.user.id, // Store Supabase user ID as password reference
        role,
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      // Rollback: delete auth user if DB insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        message: 'Failed to create user profile'
      };
    }

    return {
      success: true,
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      token: authData.session?.access_token,
      session: authData.session
    };

  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An error occurred during registration. Please try again.'
    };
  }
}

/**
 * Logout current user
 */
export async function logoutWithSupabase() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Logout failed'
    };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getCurrentSession();
  return !!session;
}

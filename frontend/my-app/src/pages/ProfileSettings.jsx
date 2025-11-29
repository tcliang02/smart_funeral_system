'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import {
  Settings,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  Facebook,
  Instagram,
  ArrowLeft,
  LogOut,
  Save,
  RotateCcw,
  Trash2,
  BarChart3,
  Calendar,
  Star,
  Heart,
  Package,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/shadcn/card';
import { Badge } from '../components/ui/shadcn/badge';
import { Input } from '../components/ui/shadcn/input';
import { Label } from '../components/ui/shadcn/label';
import { Select } from '../components/ui/shadcn/select';
import { cn } from '../lib/utils';

export default function ProfileSettings() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [stats, setStats] = useState({
    tributes: 0,
    bookings: 0,
    packages: 0,
    rating: 0,
    reviews: 0
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    // Provider-specific fields
    company_name: '',
    business_type: '',
    business_registration: '',
    description: '',
    city: '',
    state: '',
    postal_code: '',
    website: '',
    operating_hours: '',
    services_offered: '',
    facebook_url: '',
    instagram_url: '',
  });

  useEffect(() => {
    // Check authentication
    const userData = authUser || JSON.parse(localStorage.getItem('user') || 'null');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(userData);
    loadProfile(userData);
  }, [router, authUser]);

  const loadProfile = async (userData) => {
    try {
      setLoading(true);
      
      let endpoint = '';
      if (userData.role === 'provider') {
        // Get provider_id from various possible sources
        let providerId = userData.provider_id;
        
        // If not in user object, check localStorage for provider object
        if (!providerId) {
          const providerData = JSON.parse(localStorage.getItem('provider') || 'null');
          providerId = providerData?.provider_id;
        }
        
        if (!providerId) {
          setMessage({ type: 'error', text: 'Provider ID not found. Please log in again.' });
          setLoading(false);
          return;
        }
        
        endpoint = `/api/backend/getProviderProfile?provider_id=${providerId}`;
      } else if (userData.role === 'family' || userData.role === 'attendee') {
        // Get family profile
        endpoint = `/api/backend/getFamilyProfile?user_id=${userData.user_id}`;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, { headers });
      const data = await response.json();

      if (data.success) {
        // Handle standardized API response format: data is nested under data.data
        const responseData = data.data || data;
        const profile = responseData.profile || responseData;
        
        if (!profile) {
          setMessage({ 
            type: 'error', 
            text: 'Profile data not found in response.' 
          });
          setLoading(false);
          return;
        }
        
        setProfile(profile);
        
        // Populate form with existing data
        if (userData.role === 'provider') {
          setFormData({
            company_name: profile.company_name || '',
            business_type: profile.business_type || '',
            business_registration: profile.business_registration || '',
            description: profile.description || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            postal_code: profile.postal_code || '',
            phone: profile.phone || '',
            email: profile.email || '',
            website: profile.website || '',
            operating_hours: profile.operating_hours || '',
            services_offered: Array.isArray(profile.services_offered) 
              ? profile.services_offered.join(', ') 
              : profile.services_offered || '',
            facebook_url: profile.facebook_url || '',
            instagram_url: profile.instagram_url || '',
          });
          
          // Set provider statistics
          setStats({
            packages: profile.package_count || 0,
            bookings: profile.booking_count || 0,
            rating: parseFloat(profile.rating) || 0,
            reviews: profile.total_reviews || 0
          });
        } else {
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            address: profile.address || '',
          });
          
          // Set family statistics
          setStats({
            tributes: profile.tribute_count || 0,
            bookings: profile.booking_count || 0
          });
        }
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load profile. Please check if you are logged in correctly.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let endpoint = '';
      let payload = {};

      if (user.role === 'provider') {
        endpoint = '/api/backend/updateProviderProfile';
        payload = {
          provider_id: profile.provider_id,
          ...formData
        };
      } else {
        endpoint = '/api/backend/updateFamilyProfile';
        payload = {
          user_id: user.user_id,
          ...formData
        };
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Reload profile to get latest data
        loadProfile(user);
        
        // Update localStorage if name or email changed
        if (formData.name && formData.name !== user.name) {
          const updatedUser = { ...user, name: formData.name };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Please enter your password to confirm deletion');
      return;
    }

    if (!confirm('Are you absolutely sure? This action cannot be undone.')) {
      return;
    }

    try {
      let endpoint = '';
      let payload = {};

      if (user.role === 'provider') {
        endpoint = '/api/backend/deleteProviderAccount';
        payload = {
          provider_id: profile.provider_id,
          password: deletePassword,
          permanent: false // Soft delete by default
        };
      } else {
        endpoint = '/api/backend/deleteFamilyAccount';
        payload = {
          user_id: user.user_id,
          password: deletePassword,
          permanent: false // Soft delete by default
        };
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert('Account deleted successfully. You will be logged out.');
        localStorage.removeItem('user');
        localStorage.removeItem('provider');
        if (logout) {
          logout();
        } else {
          router.push('/login');
        }
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    } finally {
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  if (loading) {
    return (
      <div 
        className="flex min-h-screen flex-col items-center justify-center relative"
        style={{
          backgroundImage: 'url("/images/flower-background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <div className="relative z-10 mb-4 h-12 w-12 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
        <p className="relative z-10 text-sm font-medium text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const isProvider = user?.role === 'provider';

  return (
    <div 
      className="relative min-h-screen"
      style={{
        backgroundImage: 'url("/images/flower-background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Soft overlay for readability */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
      {/* Subtle gradient overlay to maintain the calm aesthetic */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/50 via-transparent to-emerald-50/50" />

      {/* Content wrapper with proper z-index */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 space-y-10">
        {/* Header Card */}
        <Card className="relative overflow-hidden border-none bg-white/90 shadow-xl shadow-sky-100/50">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/70 via-white/90 to-emerald-100/60" />
          <div className="pointer-events-none absolute -right-24 top-0 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-60 w-60 rounded-full bg-emerald-200/45 blur-3xl" />
          
          <CardHeader className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <Badge variant="default" className="w-fit bg-sky-100/80 text-sky-700">
                {isProvider ? 'Business profile' : 'Account settings'}
              </Badge>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                  Profile Settings
                </CardTitle>
                <CardDescription className="text-base leading-relaxed text-slate-600">
                  {isProvider 
                    ? 'Manage your business information and account details'
                    : 'Update your personal information and account settings'
                  }
                </CardDescription>
              </div>
              {user && (
                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm shadow-sky-100">
                    <User size={16} className="text-sky-500" />
                    {user.username || user.name || 'User'}
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm shadow-sky-100">
                    <Mail size={16} className="text-emerald-500" />
                    {user.email || profile?.email || 'No email'}
                  </span>
                  {isProvider && stats.rating > 0 && (
                    <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm shadow-sky-100">
                      <Star size={16} className="text-amber-500" />
                      {stats.rating.toFixed(1)}/5 rating
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex w-full max-w-xs flex-col gap-3">
              {isProvider && (
                <Button
                  variant="outline"
                  className="justify-between border-slate-200 bg-white/70 text-slate-700 hover:bg-slate-100"
                  onClick={() => router.push('/service-provider-dashboard')}
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Back to dashboard
                  </span>
                </Button>
              )}
              <Button
                variant="soft"
                className="justify-center bg-rose-100/80 text-rose-600 hover:bg-rose-100"
                onClick={() => {
                  if (logout) {
                    logout();
                  } else {
                    localStorage.clear();
                    router.push('/');
                  }
                }}
              >
                <LogOut size={18} />
                Sign out
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Message Alert */}
        {message.text && (
          <Card className={cn(
            "border-none shadow-lg",
            message.type === 'success' 
              ? "bg-emerald-50/90 border-emerald-200" 
              : "bg-rose-50/90 border-rose-200"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {message.type === 'success' ? (
                  <CheckCircle2 className="text-emerald-600" size={20} />
                ) : (
                  <AlertTriangle className="text-rose-600" size={20} />
                )}
                <p className={cn(
                  "text-sm font-medium",
                  message.type === 'success' ? "text-emerald-800" : "text-rose-800"
                )}>
                  {message.text}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          {/* Stats Sidebar */}
          <Card className="relative overflow-hidden border-none bg-white/90 shadow-lg shadow-sky-100/50 h-fit">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/50 via-white/90 to-emerald-50/50" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                <BarChart3 size={18} className="text-sky-500" />
                {isProvider ? 'Business Stats' : 'Account Info'}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {isProvider ? 'Overview of your business metrics' : 'Your account summary'}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/60 border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Account Type:</span>
                <Badge variant="default" className="bg-sky-100/80 text-sky-700 capitalize">
                  {user.role}
                </Badge>
              </div>
              {profile && profile.created_at && (
                <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/60 border border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Member Since:</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {isProvider ? (
                <>
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-sky-50/60 via-white to-white border border-slate-100">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Package size={16} className="text-sky-500" />
                      Packages
                    </span>
                    <span className="text-xl font-bold text-sky-600">{stats.packages}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-50/60 via-white to-white border border-slate-100">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-500" />
                      Bookings
                    </span>
                    <span className="text-xl font-bold text-emerald-600">{stats.bookings}</span>
                  </div>
                  {stats.rating > 0 && (
                    <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-amber-50/60 via-white to-white border border-slate-100">
                      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Star size={16} className="text-amber-500" />
                        Rating
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-amber-600">
                          {stats.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-500">({stats.reviews || 0} reviews)</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-sky-50/60 via-white to-white border border-slate-100">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Heart size={16} className="text-sky-500" />
                      Tributes
                    </span>
                    <span className="text-xl font-bold text-sky-600">{stats.tributes}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-50/60 via-white to-white border border-slate-100">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-500" />
                      Bookings
                    </span>
                    <span className="text-xl font-bold text-emerald-600">{stats.bookings}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Main Form */}
          <div className="space-y-6">
            <Card className="relative overflow-hidden border-none bg-white/90 shadow-lg shadow-sky-100/50">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/30 via-transparent to-emerald-50/30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                  {isProvider ? (
                    <>
                      <Building2 size={20} className="text-sky-500" />
                      Business Information
                    </>
                  ) : (
                    <>
                      <User size={20} className="text-sky-500" />
                      Personal Information
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {isProvider 
                    ? 'Update your business details and contact information'
                    : 'Update your personal details and contact information'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {isProvider ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="company_name">
                          Company Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="company_name"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleChange}
                          required
                          placeholder="Enter company name"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="business_type">Business Type</Label>
                          <Input
                            id="business_type"
                            name="business_type"
                            value={formData.business_type}
                            onChange={handleChange}
                            placeholder="e.g. Funeral Home, Memorial Services"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="business_registration">Business Registration No.</Label>
                          <Input
                            id="business_registration"
                            name="business_registration"
                            value={formData.business_registration}
                            onChange={handleChange}
                            placeholder="e.g. SSM12345678"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Describe your services..."
                          className="flex w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-1 resize-none"
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <MapPin size={18} className="text-sky-500" />
                          Contact Information
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Select
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                          >
                            <option value="">Select State</option>
                            <option value="Johor">Johor</option>
                            <option value="Kedah">Kedah</option>
                            <option value="Kelantan">Kelantan</option>
                            <option value="Kuala Lumpur">Kuala Lumpur</option>
                            <option value="Labuan">Labuan</option>
                            <option value="Melaka">Melaka</option>
                            <option value="Negeri Sembilan">Negeri Sembilan</option>
                            <option value="Pahang">Pahang</option>
                            <option value="Penang">Penang</option>
                            <option value="Perak">Perak</option>
                            <option value="Perlis">Perlis</option>
                            <option value="Putrajaya">Putrajaya</option>
                            <option value="Sabah">Sabah</option>
                            <option value="Sarawak">Sarawak</option>
                            <option value="Selangor">Selangor</option>
                            <option value="Terengganu">Terengganu</option>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="postal_code">Postal Code</Label>
                          <Input
                            id="postal_code"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            placeholder="Postal code"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone size={16} />
                            Phone
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+60123456789"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail size={16} />
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="flex items-center gap-2">
                          <Globe size={16} />
                          Website
                        </Label>
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://www.example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="operating_hours" className="flex items-center gap-2">
                          <Clock size={16} />
                          Operating Hours
                        </Label>
                        <textarea
                          id="operating_hours"
                          name="operating_hours"
                          value={formData.operating_hours}
                          onChange={handleChange}
                          rows="3"
                          placeholder="e.g. Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                          className="flex w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-1 resize-none"
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <Globe size={18} className="text-sky-500" />
                          Social Media
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="facebook_url" className="flex items-center gap-2">
                            <Facebook size={16} />
                            Facebook URL
                          </Label>
                          <Input
                            id="facebook_url"
                            name="facebook_url"
                            type="url"
                            value={formData.facebook_url}
                            onChange={handleChange}
                            placeholder="https://facebook.com/yourpage"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="instagram_url" className="flex items-center gap-2">
                            <Instagram size={16} />
                            Instagram URL
                          </Label>
                          <Input
                            id="instagram_url"
                            name="instagram_url"
                            type="url"
                            value={formData.instagram_url}
                            onChange={handleChange}
                            placeholder="https://instagram.com/yourpage"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Full Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail size={16} />
                          Email <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="email@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone size={16} />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+60123456789"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                          <MapPin size={16} />
                          Address
                        </Label>
                        <textarea
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Your address..."
                          className="flex w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-1 resize-none"
                        />
                      </div>
                    </>
                  )}

                  <CardFooter className="relative flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 pt-6 px-0 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto border-slate-200 bg-white/70 text-slate-700 hover:bg-slate-100"
                      onClick={() => loadProfile(user)}
                      disabled={saving}
                    >
                      <RotateCcw size={18} className="mr-2" />
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      className="w-full sm:w-auto bg-sky-600 text-white hover:bg-sky-700 shadow-sm shadow-sky-200/50"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-rose-50/90 via-rose-50/80 to-rose-50/90 shadow-lg shadow-rose-100/50">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-100/30 via-transparent to-rose-100/30" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-lg text-rose-900">
                  <AlertTriangle size={20} className="text-rose-600" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-rose-700/80">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardFooter className="relative">
                <Button
                  variant="destructive"
                  className="bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200/50"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={18} className="mr-2" />
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={() => setShowDeleteModal(false)}
        >
          <Card 
            className="relative overflow-hidden max-w-md w-full border-none bg-white/95 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50/30 via-white/95 to-rose-50/30" />
            <CardHeader className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-rose-50 rounded-full mx-auto mb-4 shadow-sm shadow-rose-100">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-slate-900">
                Delete Account
              </CardTitle>
              <CardDescription className="text-center text-slate-600">
                This will deactivate your account. You can contact support to reactivate it later.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delete-password" className="text-slate-700">
                  Please enter your password to confirm:
                </Label>
                <Input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="border-slate-200 bg-white/90"
                />
              </div>
            </CardContent>
            <CardFooter className="relative flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-200 bg-white/70 text-slate-700 hover:bg-slate-100"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200/50"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

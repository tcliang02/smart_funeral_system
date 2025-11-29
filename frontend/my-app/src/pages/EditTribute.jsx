'use client';

import { useState, useEffect } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Calendar, MapPin, Image, Heart, DollarSign,
  MapPinIcon, Video, Mail, Phone, Users, Lock, Eye,
  MessageSquare, Camera, Upload, X, Plus, Check, Loader, ArrowLeft
} from "lucide-react";

export default function EditTribute({ id }) {
  const router = useRouter();

  const [tribute, setTribute] = useState({
    deceased_name: "",
    date_of_birth: "",
    date_of_death: "",
    location_of_birth: "",
    portrait_photo: null,
    portrait_photo_url: "",
    life_story: "",
    gallery: [],
    donation_items: [],
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    bank_qr_code: null,
    bank_qr_code_url: "",
    grave_invite_message: "",
    grave_location_name: "",
    grave_address: "",
    grave_datetime: "",
    map_link: "",
    virtual_link: "",
    enable_rsvp: false,
    rsvp_max_guests: "",
    is_public: true,
    allow_messages: true,
    allow_photos: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [portraitPreview, setPortraitPreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [donationItem, setDonationItem] = useState({ item: "", price: "", description: "" });

  useEffect(() => {
    fetchTribute();
  }, [id]);

  const fetchTribute = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/backend/getTributeById?id=${id}`);
      const data = await response.json();

      if (data.success) {
        // Handle standardized API response: data is nested under data.data
        const t = data.data?.tribute || data.tribute;

        if (!t) {
          throw new Error("Tribute data not found");
        }

        // Parse donation items if it's a string
        let donationItems = [];
        if (t && t.donation_items) {
          try {
            donationItems = typeof t.donation_items === 'string' ? JSON.parse(t.donation_items) : t.donation_items;
          } catch (e) {
            console.error("Error parsing donation items:", e);
          }
        }

        // Format dates for input fields (YYYY-MM-DD format)
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) return "";
            // Format as YYYY-MM-DD for input type="date"
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          } catch (e) {
            // If it's already in YYYY-MM-DD format, return as is
            if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateString)) {
              return dateString.split('T')[0]; // Remove time part if present
            }
            return "";
          }
        };

        // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm format)
        const formatDateTimeForInput = (dateString) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            
            // Adjust for local timezone offset
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            
            return localDate.toISOString().slice(0, 16); // returns YYYY-MM-DDTHH:mm
          } catch (e) {
            // If it's already a string in a compatible format, try to sanitize it
            if (typeof dateString === 'string') {
              // Try to keep YYYY-MM-DDTHH:mm part
              const match = dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
              if (match) return match[0];
            }
            return "";
          }
        };

        setTribute({
          deceased_name: t.deceased_name || "",
          date_of_birth: formatDateForInput(t.date_of_birth || t.birth_date),
          date_of_death: formatDateForInput(t.date_of_death || t.death_date),
          location_of_birth: t.location_of_birth || "",
          portrait_photo: null,
          portrait_photo_url: t.portrait_photo || "",
          life_story: t.life_story || "",
          gallery: [],
          donation_items: donationItems,
          account_holder_name: t.bank_account_name || "",
          bank_name: t.bank_name || "",
          account_number: t.bank_account_number || "",
          bank_qr_code: null,
          bank_qr_code_url: t.donation_qr_code || "",
          grave_invite_message: t.grave_invite_message || "",
          grave_location_name: t.grave_location_name || "",
          grave_address: t.grave_address || "",
          grave_datetime: formatDateTimeForInput(t.grave_datetime),
          map_link: t.map_link || "",
          virtual_link: t.virtual_link || "",
          enable_rsvp: t.enable_rsvp === 1 || t.enable_rsvp === true,
          rsvp_max_guests: t.rsvp_max_guests || t.max_guests || "",
          is_public: t.is_public === 1 || t.is_public === true,
          allow_messages: t.allow_messages === 1 || t.allow_messages === true,
          allow_photos: t.allow_photos === 1 || t.allow_photos === true
        });

        // Set preview for existing images
        if (t.portrait_photo) {
          setPortraitPreview(getImageUrl(t.portrait_photo));
        }
        if (t.donation_qr_code) {
          setQrPreview(getImageUrl(t.donation_qr_code));
        }
      } else {
        setError(data.message || "Failed to load tribute");
      }
    } catch (err) {
      console.error("Error fetching tribute:", err);
      setError("Failed to load tribute. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('uploads/')) return `http://localhost/smart_funeral_system/${path}`;
    return `http://localhost/smart_funeral_system/${path}`;
  };

  // Handle portrait photo upload
  const handlePortraitUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Portrait photo must be less than 5MB");
        return;
      }
      setTribute((p) => ({ ...p, portrait_photo: file }));
      setPortraitPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Handle QR code upload
  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("QR code image must be less than 5MB");
        return;
      }
      setTribute((p) => ({ ...p, bank_qr_code: file }));
      setQrPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Add donation item
  const addDonationItem = () => {
    if (!donationItem.item || !donationItem.price) {
      setError("Please fill in item name and price");
      return;
    }
    setTribute((p) => ({
      ...p,
      donation_items: [...p.donation_items, donationItem]
    }));
    setDonationItem({ item: "", price: "", description: "" });
    setError("");
  };

  // Remove donation item
  const removeDonationItem = (index) => {
    setTribute((p) => ({
      ...p,
      donation_items: p.donation_items.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!tribute.deceased_name || !tribute.date_of_birth || !tribute.date_of_death) {
      setError("Please fill in all required fields");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.user_id || user.id; // Support both field names

    if (!userId) {
      setError("You must be logged in to edit a tribute");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // 1. Upload portrait photo if new file selected
      let portraitUrl = tribute.portrait_photo_url;
      if (tribute.portrait_photo instanceof File) {
        const photoFormData = new FormData();
        photoFormData.append("file", tribute.portrait_photo);
        photoFormData.append("type", "portrait");

        // Get auth token
        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        const uploadRes = await fetch("/api/backend/uploadFile", {
          method: "POST",
          headers: headers,
          body: photoFormData
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          portraitUrl = uploadData.data?.file_url || uploadData.file_url;
        } else {
          console.error("Portrait upload failed:", uploadData);
        }
      }

      // 2. Upload QR code if new file selected
      let qrUrl = tribute.bank_qr_code_url;
      if (tribute.bank_qr_code instanceof File) {
        const qrFormData = new FormData();
        qrFormData.append("file", tribute.bank_qr_code);
        qrFormData.append("type", "qr");

        // Get auth token
        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        const uploadRes = await fetch("/api/backend/uploadFile", {
          method: "POST",
          headers: headers,
          body: qrFormData
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          qrUrl = uploadData.data?.file_url || uploadData.file_url;
        } else {
          console.error("QR upload failed:", uploadData);
        }
      }

      // 3. Update tribute
      const tributeData = {
        tribute_id: id,
        user_id: userId,
        deceased_name: tribute.deceased_name,
        date_of_birth: tribute.date_of_birth,
        date_of_death: tribute.date_of_death,
        location_of_birth: tribute.location_of_birth || null,
        portrait_photo: portraitUrl,
        life_story: tribute.life_story || null,
        is_public: tribute.is_public ? 1 : 0,
        allow_messages: tribute.allow_messages ? 1 : 0,
        allow_photos: tribute.allow_photos ? 1 : 0,
        donation_items: tribute.donation_items.length > 0 ? JSON.stringify(tribute.donation_items) : null,
        bank_account_name: tribute.account_holder_name || null,
        bank_name: tribute.bank_name || null,
        bank_account_number: tribute.account_number || null,
        donation_qr_code: qrUrl,
        grave_invite_message: tribute.grave_invite_message || null,
        grave_location_name: tribute.grave_location_name || null,
        grave_address: tribute.grave_address || null,
        grave_datetime: tribute.grave_datetime || null,
        map_link: tribute.map_link || null,
        virtual_link: tribute.virtual_link || null,
        enable_rsvp: tribute.enable_rsvp ? 1 : 0,
        rsvp_max_guests: tribute.rsvp_max_guests || null
      };

      console.log("Updating tribute with data:", tributeData);

      // Get auth token
      const token = localStorage.getItem("token");

      const response = await fetch('/api/backend/updateTribute', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(tributeData)
      });

      const data = await response.json();
      console.log("Update response:", data);

      if (data.success) {
        setSuccess("Tribute updated successfully!");
        setTimeout(() => {
          router.push(`/tribute/${id}`);
        }, 1500);
      } else {
        setError(data.message || "Failed to update tribute");
      }
    } catch (err) {
      console.error("Error updating tribute:", err);
      setError("Failed to update tribute. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="w-16 h-16 text-purple-600" />
        </motion.div>
        <p className="mt-4 text-lg text-gray-600">Loading tribute...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push(`/tribute/${id}`)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Edit Tribute</h1>
            <p className="text-gray-600 mt-2">Update the memorial information</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
            >
              <X className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-green-500" />
              <p className="text-green-700 font-semibold">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-600" />
              Basic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deceased Name *
                </label>
                <input
                  type="text"
                  value={tribute.deceased_name}
                  onChange={(e) => setTribute({ ...tribute, deceased_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location of Birth
                </label>
                <input
                  type="text"
                  value={tribute.location_of_birth}
                  onChange={(e) => setTribute({ ...tribute, location_of_birth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={tribute.date_of_birth}
                  onChange={(e) => setTribute({ ...tribute, date_of_birth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Death *
                </label>
                <input
                  type="date"
                  value={tribute.date_of_death}
                  onChange={(e) => setTribute({ ...tribute, date_of_death: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Portrait Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portrait Photo
              </label>
              <div className="flex items-center gap-4">
                {portraitPreview && (
                  <img
                    src={portraitPreview}
                    alt="Portrait preview"
                    className="w-32 h-32 rounded-xl object-cover border-2 border-purple-200"
                  />
                )}
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">Choose new photo (optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortraitUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Life Story */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Life Story
              </label>
              <textarea
                value={tribute.life_story}
                onChange={(e) => setTribute({ ...tribute, life_story: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Share the story of their life..."
              />
            </div>
          </div>

          {/* Donation Information */}
          <div className="space-y-6 border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Donation Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={tribute.account_holder_name}
                  onChange={(e) => setTribute({ ...tribute, account_holder_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={tribute.bank_name}
                  onChange={(e) => setTribute({ ...tribute, bank_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={tribute.account_number}
                  onChange={(e) => setTribute({ ...tribute, account_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* QR Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation QR Code
              </label>
              <div className="flex items-center gap-4">
                {qrPreview && (
                  <img
                    src={qrPreview}
                    alt="QR code preview"
                    className="w-32 h-32 rounded-xl object-cover border-2 border-green-200"
                  />
                )}
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">Choose new QR code (optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Donation Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Items
              </label>
              <div className="space-y-3">
                {tribute.donation_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.item}</p>
                      <p className="text-sm text-gray-600">RM {item.price}</p>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDonationItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <div className="space-y-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={donationItem.item}
                      onChange={(e) => setDonationItem({ ...donationItem, item: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Price (RM)"
                      value={donationItem.price}
                      onChange={(e) => setDonationItem({ ...donationItem, price: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addDonationItem}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <textarea
                    value={donationItem.description}
                    onChange={(e) => setDonationItem({ ...donationItem, description: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Description (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Grave Location & RSVP */}
          <div className="space-y-6 border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Grave Location & RSVP
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grave Invite Message
              </label>
              <textarea
                value={tribute.grave_invite_message}
                onChange={(e) => setTribute({ ...tribute, grave_invite_message: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Invitation message for visitors..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grave Location Name
                </label>
                <input
                  type="text"
                  value={tribute.grave_location_name}
                  onChange={(e) => setTribute({ ...tribute, grave_location_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grave Address
                </label>
                <input
                  type="text"
                  value={tribute.grave_address}
                  onChange={(e) => setTribute({ ...tribute, grave_address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={tribute.grave_datetime}
                  onChange={(e) => setTribute({ ...tribute, grave_datetime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Map Link
                </label>
                <input
                  type="url"
                  value={tribute.map_link}
                  onChange={(e) => setTribute({ ...tribute, map_link: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Google Maps link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Virtual Meeting Link
                </label>
                <input
                  type="url"
                  value={tribute.virtual_link}
                  onChange={(e) => setTribute({ ...tribute, virtual_link: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Zoom/Meet link"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tribute.enable_rsvp}
                    onChange={(e) => setTribute({ ...tribute, enable_rsvp: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable RSVP</span>
                </label>

                {tribute.enable_rsvp && (
                  <div className="ml-7">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maximum Total Guests (Capacity)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g., 5"
                      value={tribute.rsvp_max_guests}
                      onChange={(e) => setTribute({ ...tribute, rsvp_max_guests: e.target.value })}
                      className="w-full md:w-64 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited guests</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-6 border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Lock className="w-6 h-6 text-gray-600" />
              Privacy & Features
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tribute.is_public}
                  onChange={(e) => setTribute({ ...tribute, is_public: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Make tribute public</span>
                  <span className="text-xs text-gray-500">Public tributes appear in search results. Private tributes are only visible to you.</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tribute.allow_messages || tribute.allow_photos}
                  onChange={(e) => setTribute({ ...tribute, allow_messages: e.target.checked, allow_photos: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Allow guest uploads</span>
                  <span className="text-xs text-gray-500">Guests can post messages and upload photos</span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push(`/tribute/${id}`)}
              className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


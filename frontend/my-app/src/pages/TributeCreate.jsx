'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "../config";
import { uploadToSupabase } from "../utils/supabaseStorage";
import { 
  User, Calendar, MapPin, Image, Heart, DollarSign, 
  MapPinIcon, Video, Mail, Phone, Users, Lock, Eye,
  MessageSquare, Camera, Upload, X, Plus, Check
} from "lucide-react";

export default function TributeCreate() {
  const router = useRouter();

  const [tribute, setTribute] = useState({
    deceased_name: "",
    date_of_birth: "",
    date_of_death: "",
    location_of_birth: "",
    portrait_photo: null,
    life_story: "",
    gallery: [],
    donation_items: [],
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    bank_qr_code: null,
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
    allow_photos: true,
    moderate_messages: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [portraitPreview, setPortraitPreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [donationItem, setDonationItem] = useState({ item: "", price: "", description: "" });

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
    if (!user.user_id && !user.id) {
      setError("You must be logged in to create a tribute");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Upload portrait photo if exists (directly to Supabase)
      let portraitUrl = null;
      if (tribute.portrait_photo) {
        portraitUrl = await uploadToSupabase(tribute.portrait_photo, 'tributes');
        if (!portraitUrl) {
          throw new Error("Failed to upload portrait photo");
        }
      }

      // 2. Upload QR code if exists (directly to Supabase)
      let qrUrl = null;
      if (tribute.bank_qr_code) {
        qrUrl = await uploadToSupabase(tribute.bank_qr_code, 'tributes');
        if (!qrUrl) {
          throw new Error("Failed to upload QR code");
        }
      }

      // 3. Create tribute
      const tributeData = {
        creator_user_id: user.user_id || user.id,
        deceased_name: tribute.deceased_name,
        date_of_birth: tribute.date_of_birth,
        date_of_death: tribute.date_of_death,
        location_of_birth: tribute.location_of_birth || null,
        portrait_photo: portraitUrl,
        life_story: tribute.life_story || null,
        is_public: tribute.is_public ? 1 : 0,
        allow_messages: tribute.allow_messages ? 1 : 0,
        allow_photos: tribute.allow_photos ? 1 : 0,
        moderate_messages: tribute.moderate_messages ? 1 : 0,
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

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch('/api/backend/createTribute', {
        method: "POST",
        headers,
        body: JSON.stringify(tributeData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Tribute created successfully!");
        setTimeout(() => {
          router.push(`/tribute/${data.tribute_id}`);
        }, 1500);
      } else {
        setError(data.message || "Failed to create tribute");
      }
    } catch (err) {
      console.error("Error creating tribute:", err);
      setError("Failed to create tribute. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Basic Info", icon: User },
    { id: 2, name: "Life Story", icon: Heart },
    { id: 3, name: "Donations", icon: DollarSign },
    { id: 4, name: "Memorial Service", icon: MapPinIcon },
    { id: 5, name: "Privacy", icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Create Memorial Tribute
          </h1>
          <p className="text-gray-600 text-lg">
            Honor their memory with a beautiful tribute page
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110 shadow-lg"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-white border-2 border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isActive ? "text-purple-600" : "text-gray-500"}`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
            >
              <X className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
              <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
            >
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <User className="w-7 h-7 text-purple-600" />
                Basic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Portrait Photo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Image className="w-5 h-5 inline mr-2" />
                    Portrait Photo *
                  </label>
                  <div className="flex items-center gap-4">
                    {portraitPreview ? (
                      <div className="relative">
                        <img
                          src={portraitPreview}
                          alt="Portrait preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPortraitPreview(null);
                            setTribute((p) => ({ ...p, portrait_photo: null }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 rounded-full border-4 border-dashed border-purple-300 hover:border-purple-500 transition-colors cursor-pointer flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100">
                        <Upload className="w-8 h-8 text-purple-500 mb-1" />
                        <span className="text-xs text-purple-600 font-medium">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePortraitUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        Upload a portrait photo of your loved one. Maximum size: 5MB
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: JPG, PNG, WebP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={tribute.deceased_name}
                    onChange={(e) => setTribute({ ...tribute, deceased_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-lg"
                    placeholder="e.g., John Michael Smith"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={tribute.date_of_birth}
                    onChange={(e) => setTribute({ ...tribute, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                  />
                </div>

                {/* Date of Death */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date of Death *
                  </label>
                  <input
                    type="date"
                    required
                    value={tribute.date_of_death}
                    onChange={(e) => setTribute({ ...tribute, date_of_death: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                  />
                </div>

                {/* Location of Birth */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    value={tribute.location_of_birth}
                    onChange={(e) => setTribute({ ...tribute, location_of_birth: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="e.g., Los Angeles, California"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Next: Life Story →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Life Story */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Heart className="w-7 h-7 text-purple-600" />
                Life Story & Biography
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Share their story
                </label>
                <textarea
                  value={tribute.life_story}
                  onChange={(e) => setTribute({ ...tribute, life_story: e.target.value })}
                  rows="12"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
                  placeholder="Share their life story, achievements, passions, and the memories that made them special..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Tell the world about their journey, accomplishments, and the impact they made
                </p>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Next: Donations →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Donations (Continue in next message due to length) */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <DollarSign className="w-7 h-7 text-purple-600" />
                Memorial Donations (Optional)
              </h2>

              {/* Donation Items List */}
              {tribute.donation_items.length > 0 && (
                <div className="mb-6 space-y-3">
                  {tribute.donation_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border-2 border-purple-200"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.item}</h4>
                        <p className="text-purple-600 font-bold">RM {item.price}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDonationItem(index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Donation Item Form */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">Add Donation Item</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    value={donationItem.item}
                    onChange={(e) => setDonationItem({ ...donationItem, item: e.target.value })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="Item name (e.g., Candle)"
                  />
                  <input
                    type="number"
                    value={donationItem.price}
                    onChange={(e) => setDonationItem({ ...donationItem, price: e.target.value })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="Price (RM)"
                  />
                  <button
                    type="button"
                    onClick={addDonationItem}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Item
                  </button>
                </div>
                <textarea
                  value={donationItem.description}
                  onChange={(e) => setDonationItem({ ...donationItem, description: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
                  placeholder="Description (optional)"
                />
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Bank Account Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={tribute.account_holder_name}
                    onChange={(e) => setTribute({ ...tribute, account_holder_name: e.target.value })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="Account Holder Name"
                  />
                  <input
                    type="text"
                    value={tribute.bank_name}
                    onChange={(e) => setTribute({ ...tribute, bank_name: e.target.value })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="Bank Name"
                  />
                  <input
                    type="text"
                    value={tribute.account_number}
                    onChange={(e) => setTribute({ ...tribute, account_number: e.target.value })}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="Account Number"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR Code</label>
                    {qrPreview ? (
                      <div className="relative inline-block">
                        <img src={qrPreview} alt="QR Code" className="w-24 h-24 rounded-lg border-2 border-purple-200" />
                        <button
                          type="button"
                          onClick={() => {
                            setQrPreview(null);
                            setTribute((p) => ({ ...p, bank_qr_code: null }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="inline-block px-6 py-3 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-500 transition-colors">
                        <Upload className="w-5 h-5 inline mr-2" />
                        Upload QR
                        <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Next: Memorial Service →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Memorial Service */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <MapPinIcon className="w-7 h-7 text-purple-600" />
                Memorial Service Details (Optional)
              </h2>

              <div className="space-y-6">
                {/* Invitation Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Invitation Message
                  </label>
                  <textarea
                    value={tribute.grave_invite_message}
                    onChange={(e) => setTribute({ ...tribute, grave_invite_message: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
                    placeholder="Write a message inviting guests to pay respects..."
                  />
                </div>

                {/* Cemetery/Location Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Cemetery / Location Name
                  </label>
                  <input
                    type="text"
                    value={tribute.grave_location_name}
                    onChange={(e) => setTribute({ ...tribute, grave_location_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="e.g., Nirvana Memorial Park"
                  />
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={tribute.grave_address}
                    onChange={(e) => setTribute({ ...tribute, grave_address: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
                    placeholder="Enter full address of the cemetery"
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date & Time of Memorial Service
                  </label>
                  <input
                    type="datetime-local"
                    value={tribute.grave_datetime}
                    onChange={(e) => setTribute({ ...tribute, grave_datetime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                  />
                </div>

                {/* Map Link */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPinIcon className="w-4 h-4 inline mr-2" />
                    Google Maps Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={tribute.map_link}
                    onChange={(e) => setTribute({ ...tribute, map_link: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="Paste Google Maps link here"
                  />
                </div>

                {/* Virtual Link */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Video className="w-4 h-4 inline mr-2" />
                    Virtual Event Link (Zoom/Meet)
                  </label>
                  <input
                    type="url"
                    value={tribute.virtual_link}
                    onChange={(e) => setTribute({ ...tribute, virtual_link: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="Enter meeting link (optional)"
                  />
                </div>

                {/* Enable RSVP Toggle */}
                <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-gray-800">Enable RSVP Registration</h3>
                        <p className="text-sm text-gray-600">Allow guests to confirm attendance</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTribute({ ...tribute, enable_rsvp: !tribute.enable_rsvp })}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                        tribute.enable_rsvp ? "bg-purple-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          tribute.enable_rsvp ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {tribute.enable_rsvp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 pt-4 border-t-2 border-purple-200"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Guests (Optional)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={tribute.rsvp_max_guests}
                          onChange={(e) => setTribute({ ...tribute, rsvp_max_guests: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                          placeholder="e.g., 50"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Next: Privacy Settings →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Privacy Settings */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Lock className="w-7 h-7 text-purple-600" />
                Privacy & Permissions
              </h2>

              <p className="text-gray-600 mb-8">
                Control who can view and interact with this tribute page
              </p>

              <div className="space-y-4">
                {/* Public Toggle */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Public Tribute</h3>
                      <p className="text-sm text-gray-600">Anyone can view this tribute page</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTribute({ ...tribute, is_public: !tribute.is_public })}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      tribute.is_public ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        tribute.is_public ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Allow Messages Toggle */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Allow Condolence Messages</h3>
                      <p className="text-sm text-gray-600">Visitors can leave messages</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTribute({ ...tribute, allow_messages: !tribute.allow_messages })}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      tribute.allow_messages ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        tribute.allow_messages ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Allow Photos Toggle */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Allow Photo Uploads</h3>
                      <p className="text-sm text-gray-600">Visitors can share memories</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTribute({ ...tribute, allow_photos: !tribute.allow_photos })}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      tribute.allow_photos ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        tribute.allow_photos ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Moderate Messages Toggle */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Moderate Messages</h3>
                      <p className="text-sm text-gray-600">Approve messages before they appear</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTribute({ ...tribute, moderate_messages: !tribute.moderate_messages })}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                      tribute.moderate_messages ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        tribute.moderate_messages ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg flex items-center gap-3 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Tribute...
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6" />
                      Create Tribute Page
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}


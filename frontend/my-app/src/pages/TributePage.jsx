'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PhotoLightbox from "../components/PhotoLightbox";
import Toast from "../components/Toast";
import AnimatedCounter from "../components/AnimatedCounter";
import { API_BASE_URL, BACKEND_URL } from "../config";
import { logger } from "@/lib/logger";
import {
  Heart, MessageSquare, Eye, Users, Share2, MapPin,
  Calendar, Video, ExternalLink, Mail, Phone, User, Flower2,
  DollarSign, CheckCircle, X, ImageIcon, Loader, Upload, Trash2, Download, Lock, AlertCircle
} from "lucide-react";

export default function TributePage({ id }) {
  const router = useRouter();

  // Main tribute data
  const [tribute, setTribute] = useState(null);
  const [messages, setMessages] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [familyPhotos, setFamilyPhotos] = useState([]);
  const [rsvpStats, setRsvpStats] = useState({ count: 0, total_guests: 0 });
  const [rsvpList, setRsvpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [messagePhotoLightboxIndex, setMessagePhotoLightboxIndex] = useState(null);
  const [showBank, setShowBank] = useState(false);
  const [flowerMessage, setFlowerMessage] = useState("");
  const [userRole, setUserRole] = useState("guest");
  const [showRSVPList, setShowRSVPList] = useState(false);
  const [showRSVPPreview, setShowRSVPPreview] = useState(true); // Collapsible RSVP preview
  const [uploadingFamilyPhoto, setUploadingFamilyPhoto] = useState(false);
  const [toast, setToast] = useState(null);
  const [floatingFlowers, setFloatingFlowers] = useState([]);

  // Progressive Disclosure - Forms collapsed by default
  const [showFamilyPhotoForm, setShowFamilyPhotoForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);

  // Theme state (can be extended to use tribute.theme if available)
  const [theme, setTheme] = useState("serene"); // serene, respectful, loving

  // Forms
  const [messageForm, setMessageForm] = useState({ name: "", email: "", message: "", photo: null });
  const [submittingMessage, setSubmittingMessage] = useState(false);

  const [familyPhotoForm, setFamilyPhotoForm] = useState({ photo: null, description: "" });

  const [rsvpForm, setRsvpForm] = useState({ name: "", phone: "", email: "", guests: 1, type: "physical" });
  const [submittingRSVP, setSubmittingRSVP] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTribute();
    } else {
      setError("Tribute ID is missing");
      setLoading(false);
    }
  }, [id]);


  useEffect(() => {
    // Check if user is creator/family
    if (tribute) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.user_id || user.id;
      const creatorId = tribute.created_by || tribute.creator_user_id;

      if (userId && creatorId === userId) {
        setUserRole("family");
        // Automatically fetch RSVP list for family members
        fetchRSVPListSilently();
      }
    }
  }, [tribute]);

  // Ensure RSVP preview starts expanded
  useEffect(() => {
    if (userRole === "family" && rsvpList.length > 0) {
      console.log("👨‍👩‍👧‍👦 Family member with RSVPs - ensuring preview is expanded");
      setShowRSVPPreview(true);
    }
  }, [userRole, rsvpList]);

  // Theme colors helper
  const getThemeColors = () => {
    switch (theme) {
      case "serene":
        return {
          primary: "blue",
          primaryBg: "from-blue-50 to-indigo-50",
          primaryBorder: "border-blue-200",
          primaryText: "text-blue-600",
          primaryButton: "from-blue-600 to-indigo-600",
          accent: "indigo"
        };
      case "respectful":
        return {
          primary: "slate",
          primaryBg: "from-slate-50 to-gray-50",
          primaryBorder: "border-slate-200",
          primaryText: "text-slate-600",
          primaryButton: "from-slate-600 to-gray-600",
          accent: "gray"
        };
      case "loving":
        return {
          primary: "rose",
          primaryBg: "from-rose-50 to-pink-50",
          primaryBorder: "border-rose-200",
          primaryText: "text-rose-600",
          primaryButton: "from-rose-500 to-pink-600",
          accent: "pink"
        };
      default:
        return {
          primary: "purple",
          primaryBg: "from-purple-50 to-pink-50",
          primaryBorder: "border-purple-200",
          primaryText: "text-purple-600",
          primaryButton: "from-purple-600 to-pink-600",
          accent: "pink"
        };
    }
  };

  const themeColors = getThemeColors();

  // Check if RSVP event date has passed
  const isRSVPEventPassed = () => {
    if (!tribute?.grave_datetime) return false;
    const eventDate = new Date(tribute.grave_datetime);
    const now = new Date();
    return now > eventDate;
  };

  // Helper function to show toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // Auto-dismiss after 4 seconds
  };

  // Helper function to format dates as relative time
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  };

  // Helper function to construct full image URL
  const getImageUrl = (path) => {
    if (!path) return '/images/default-portrait.png';

    // If path is a Supabase URL, use as-is
    if (path.includes('supabase.co')) return path;

    // If path already contains full URL, return as-is
    if (path.startsWith('http')) return path;

    // If path starts with 'uploads/', use Next.js API route
    if (path.startsWith('uploads/')) {
      return `/api/${path}`;
    }

    // If path is just a filename (e.g., "portrait_xxx.jpg"), assume it's in uploads/tributes/
    if (path.includes('portrait_') || path.includes('qr_') || path.includes('family_gallery_') || path.includes('tribute_message_')) {
      return `/api/uploads/tributes/${path}`;
    }

    // Otherwise, assume it's a relative path from uploads
    return `/api/uploads/${path}`;
  };

  const fetchTribute = async () => {
    if (!id) {
      setError("Tribute ID is missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/backend/getTributeById?id=${id}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      // Check if response is OK before parsing
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error?.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use status text
        }
        console.error('❌ Tribute API HTTP error:', { status: response.status, statusText: response.statusText, errorMessage });
        setError(errorMessage || "Failed to load tribute. Please try again.");
        setTimeout(() => router.push("/tribute"), 2000);
        return;
      }

      // Parse JSON response
      let data;
      try {
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from server');
        }
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse Tribute API response:', parseError);
        setError("Invalid response from server. Please try again.");
        setTimeout(() => router.push("/tribute"), 2000);
        return;
      }

      console.log('🔍 Tribute API Response:', { status: response.status, data, id }); // DEBUG

      // Check if response has success property
      if (!data || typeof data !== 'object') {
        console.error('❌ Tribute API returned invalid data:', data);
        setError("Invalid response format. Please try again.");
        setTimeout(() => router.push("/tribute"), 2000);
        return;
      }

      if (data.success) {
        // Handle standardized API response: data is nested under data.data
        const tributeData = data.data?.tribute || data.tribute;
        const messagesData = data.data?.messages || data.messages || [];
        const familyPhotosData = data.data?.family_photos || data.family_photos || [];
        const photosData = data.data?.photos || data.photos || [];
        const rsvpStatsData = data.data?.rsvp_stats || data.rsvp_stats || { count: 0, total_guests: 0 };

        // Validate that we have tribute data
        if (!tributeData) {
          console.error('❌ Tribute API returned success but no tribute data:', data);
          setError("Tribute data not found in response.");
          setTimeout(() => router.push("/tribute"), 2000);
          return;
        }

        // Debug logging for photos
        logger.debug('Tribute data loaded', { 
          familyPhotosCount: familyPhotosData.length,
          photosCount: photosData.length,
          familyPhotos: familyPhotosData.slice(0, 2) // First 2 for debugging
        });

        // Debug logging for messages with photos
        const messagesWithPhotos = messagesData.filter(m => m.photo_url);
        logger.debug('Tribute data loaded', { 
          familyPhotosCount: familyPhotosData.length,
          photosCount: photosData.length,
          messagesCount: messagesData.length,
          messagesWithPhotosCount: messagesWithPhotos.length,
          messagesWithPhotos: messagesWithPhotos.slice(0, 2).map(m => ({ 
            id: m.message_id || m.id, 
            photo_url: m.photo_url 
          }))
        });

        setTribute(tributeData);
        setMessages(messagesData);
        setFamilyPhotos(familyPhotosData);
        setPhotos(photosData);
        setRsvpStats(rsvpStatsData);

        // Debug logging (with null safety)
        if (tributeData) {
          console.log("📸 Portrait Photo:", {
            stored: tributeData.portrait_photo,
            computed: getImageUrl(tributeData.portrait_photo)
          });
          console.log("🏦 Bank Details:", {
            account: tributeData.bank_account_number,
            name: tributeData.bank_account_name,
            bank: tributeData.bank_name,
            qr: tributeData.donation_qr_code
          });
        }
      } else {
        // Handle error response
        const errorMessage = data.message || data.error?.message || "Tribute not found";
        console.error('❌ Tribute API failed:', { 
          message: errorMessage, 
          error: data.error,
          fullResponse: data 
        });
        setError(errorMessage);
        setTimeout(() => router.push("/tribute"), 2000);
      }
    } catch (err) {
      console.error("❌ Error fetching tribute:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load tribute. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!messageForm.name.trim() || !messageForm.message.trim()) {
      showToast("Please fill in your name and message", "error");
      return;
    }

    setSubmittingMessage(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      let photoUrl = null;

      // 1. Upload photo if provided
      if (messageForm.photo) {
        const photoFormData = new FormData();
        photoFormData.append("file", messageForm.photo);
        photoFormData.append("type", "tribute_message");

        // Get auth token
        const token = localStorage.getItem("token");
        const headers = token ? { "Authorization": `Bearer ${token}` } : {};

        const uploadRes = await fetch("/api/backend/uploadFile", {
          method: "POST",
          headers: headers,
          body: photoFormData
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          console.error("Upload failed:", uploadRes.status, errorText);
          throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
        }

        const uploadData = await uploadRes.json();
        console.log("📸 Message Photo Upload Response:", uploadData); // DEBUG
        if (uploadData.success) {
          // Handle standardized API response format: data.data.file_url or data.file_url
          photoUrl = uploadData.data?.file_url || uploadData.file_url;
          if (!photoUrl) {
            console.error("❌ No photo URL in upload response:", uploadData);
            throw new Error("Photo upload succeeded but no URL returned");
          }
        } else {
          const errorMsg = uploadData.error?.message || uploadData.message || "Photo upload failed";
          throw new Error(errorMsg);
        }
      }

      // 2. Submit message with photo
      const messagePayload = {
        tribute_id: id,
        user_id: user.id || null,
        guest_name: messageForm.name,
        guest_email: messageForm.email,
        message: messageForm.message,
        photo_url: photoUrl
      };
      
      console.log("📝 Submitting message with payload:", { ...messagePayload, photo_url: photoUrl ? "present" : "null" }); // DEBUG

      const response = await fetch("/api/backend/addMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagePayload)
      });

      const data = await response.json();
      console.log("📝 Message submission response:", data); // DEBUG
      
      if (data.success) {
        showToast("✅ Your tribute message has been posted successfully!");
        setMessageForm({ name: "", email: "", message: "", photo: null });
        setShowMessageForm(false); // Close form after submission
        // Force refresh to show new message with photo
        await fetchTribute();
      } else {
        const errorMsg = data.error?.message || data.message || "Failed to post message";
        showToast(errorMsg, "error");
        logger.error('Message submission failed', { response: data });
      }
    } catch (err) {
      console.error("Error posting message:", err);
      showToast("Failed to post message. Please try again.", "error");
    } finally {
      setSubmittingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (userRole !== "family") {
      alert("Only family members can delete messages");
      return;
    }

    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.user_id || user.id; // Support both field names
      const token = localStorage.getItem("token");

      const response = await fetch("/api/backend/deleteMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message_id: messageId,
          user_id: userId,
          tribute_id: id
        })
      });

      const data = await response.json();
      if (data.success) {
        // Optimistic UI update
        setMessages(prev => prev.filter(m => (m.message_id || m.id) !== messageId));
        showToast("Message deleted successfully");
      } else {
        showToast(data.message || "Failed to delete message", "error");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      showToast("Failed to delete message. Please try again.", "error");
    }
  };

  const handleSubmitRSVP = async (e) => {
    e.preventDefault();
    if (!rsvpForm.name.trim() || !rsvpForm.phone.trim()) {
      showToast("Please fill in your name and phone number", "error");
      return;
    }

    setSubmittingRSVP(true);
    try {
      const response = await fetch("/api/backend/submitRSVP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tribute_id: id,
          guest_name: rsvpForm.name,
          guest_phone: rsvpForm.phone,
          guest_email: rsvpForm.email,
          number_of_guests: rsvpForm.guests,
          attendance_type: rsvpForm.type
        })
      });

      const data = await response.json();
      if (data.success) {
        showToast("✅ RSVP submitted successfully!");
        setRsvpForm({ name: "", phone: "", email: "", guests: 1, type: "physical" });
        fetchTribute();
      } else {
        showToast(data.message || "Failed to submit RSVP", "error");
      }
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      showToast("Failed to submit RSVP. Please try again.", "error");
    } finally {
      setSubmittingRSVP(false);
    }
  };

  const offerFlower = async () => {
    try {
      // Trigger floating flowers animation
      const flowerEmojis = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '💐', '🏵️'];
      const newFlowers = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
        left: `${50 + (Math.random() - 0.5) * 30}%`, // Spread around center
        delay: i * 0.1
      }));
      setFloatingFlowers(newFlowers);

      // Remove flowers after animation
      setTimeout(() => {
        setFloatingFlowers([]);
      }, 3000);

      // Optimistically update UI
      setTribute(prev => ({ ...prev, flower_count: (prev.flower_count || 0) + 1 }));
      setFlowerMessage("Thank you for offering a flower 🌸✨");
      setTimeout(() => setFlowerMessage(""), 3000);

      // Save to database
      const response = await fetch("/api/backend/offerFlower", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tribute_id: id })
      });

      const data = await response.json();
      if (!data.success) {
        // If failed, revert the count
        setTribute(prev => ({ ...prev, flower_count: (prev.flower_count || 1) - 1 }));
        console.error("Failed to save flower:", data.message);
      }
    } catch (err) {
      console.error("Error offering flower:", err);
      // Revert the count on error
      setTribute(prev => ({ ...prev, flower_count: (prev.flower_count || 1) - 1 }));
    }
  };

  // Family Photo Upload Handler
  const handleFamilyPhotoUpload = async (e) => {
    e.preventDefault();
    if (!familyPhotoForm.photo) {
      alert("Please select a photo to upload");
      return;
    }

    if (userRole !== "family") {
      showToast("Only family members can upload to the gallery", "error");
      return;
    }

    setUploadingFamilyPhoto(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // 1. Upload photo file
      const formData = new FormData();
      formData.append("file", familyPhotoForm.photo);
      formData.append("type", "family_gallery");

      // Get auth token
      const token = localStorage.getItem("token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};

      const uploadRes = await fetch("/api/backend/uploadFile", {
        method: "POST",
        headers: headers,
        body: formData
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("Family photo upload failed:", uploadRes.status, errorText);
        throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
      }

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.message || "Photo upload failed");
      }

      // 2. Save to database
      const fileUrl = uploadData.data?.file_url || uploadData.file_url;

      const payload = {
        tribute_id: id,
        user_id: user.user_id || user.id, // Support both field names
        photo_url: fileUrl,
        photo_description: familyPhotoForm.description
      };

      console.log("📸 Uploading family photo with payload:", payload); // DEBUG

      // Validate payload
      if (!payload.tribute_id) throw new Error("Missing tribute ID");
      if (!payload.user_id) throw new Error("Missing user ID - please try logging out and back in");
      if (!payload.photo_url) throw new Error("Photo upload failed - no URL returned from server");

      const response = await fetch("/api/backend/uploadFamilyPhoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token} ` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("📸 Upload Family Photo Response:", data); // DEBUG
      
      if (data.success) {
        showToast("✅ Photo added to family gallery!");
        setFamilyPhotoForm({ photo: null, description: "" });
        setShowFamilyPhotoForm(false); // Close form after submission
        
        // Force refresh tribute data to show new photo
        logger.debug('Refreshing tribute data after photo upload');
        await fetchTribute();
      } else {
        const errorMsg = data.error?.message || data.message || "Failed to add photo";
        showToast(errorMsg, "error");
        logger.error('Photo upload failed', { response: data });
      }
    } catch (err) {
      console.error("Error uploading family photo:", err);
      showToast("Failed to upload photo. Please try again.", "error");
    } finally {
      setUploadingFamilyPhoto(false);
    }
  };

  // Delete Family Photo Handler
  const handleDeleteFamilyPhoto = async (photo) => {
    if (userRole !== "family") {
      alert("Only family members can delete photos");
      return;
    }

    if (!confirm("Delete this photo? This action cannot be undone.")) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.user_id || user.id; // Support both field names

      // Get photo_id from photo object (could be photo_id or id)
      const photoId = photo.photo_id || photo.id;

      if (!photoId) {
        alert("Error: Could not identify photo to delete");
        return;
      }

      // Get auth token
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/backend/deleteFamilyPhoto", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          photo_id: photoId,
          user_id: userId,
          tribute_id: id
        })
      });

      const data = await response.json();
      if (data.success) {
        // Optimistic UI update - filter by both photo_id and id
        setFamilyPhotos(prev => prev.filter(p => (p.photo_id || p.id) !== photoId));
        showToast("Photo deleted successfully");
        // Refresh tribute data to ensure consistency
        fetchTribute();
      } else {
        const errorMsg = data.error?.message || data.message || "Failed to delete photo";
        showToast(errorMsg, "error");
        logger.error('Photo deletion failed', { response: data });
      }
    } catch (err) {
      console.error("Error deleting photo:", err);
      showToast("Failed to delete photo. Please try again.", "error");
      logger.error('Photo deletion error', { error: err });
    }
  };

  // Fetch RSVP List (Family Only)
  const fetchRSVPList = async () => {
    if (userRole !== "family") {
      showToast("Only family members can view RSVP list", "error");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.user_id || user.id; // Support both field names
      const response = await fetch(
        `/api/backend/getRSVPList?tribute_id=${id}&user_id=${userId}`
      );

      const data = await response.json();
      if (data.success) {
        // Handle standardized API response format: data.data.rsvps or fallback to data.rsvps
        const rsvps = data.data?.rsvps || data.rsvps || [];
        const statistics = data.data?.statistics || data.statistics;
        
        setRsvpList(rsvps);
        // Update RSVP stats from the fetched list
        if (rsvps && rsvps.length > 0) {
          const totalGuests = rsvps.reduce((sum, r) => sum + parseInt(r.number_of_guests || r.guest_count || 1), 0);
          setRsvpStats({
            count: rsvps.length,
            total_guests: totalGuests,
            attending_guests: totalGuests
          });
        } else if (statistics) {
          // Use statistics from API if available
          setRsvpStats({
            count: parseInt(statistics.total_rsvps || '0'),
            total_guests: parseInt(statistics.total_guests || '0'),
            attending_guests: parseInt(statistics.attending_guests || '0')
          });
        }
        setShowRSVPList(true);
      } else {
        showToast(data.message || "Failed to fetch RSVP list", "error");
      }
    } catch (err) {
      console.error("Error fetching RSVP list:", err);
      showToast("Failed to fetch RSVP list. Please try again.", "error");
    }
  };

  // Silent version for automatic fetching (no alerts/modals)
  const fetchRSVPListSilently = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.user_id || user.id; // Support both field names
      console.log("🔍 Fetching RSVP List:", { tribute_id: id, user_id: userId });

      const response = await fetch(
        `/api/backend/getRSVPList?tribute_id=${id}&user_id=${userId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ RSVP fetch failed:", response.status, errorText);
        throw new Error(`Failed to fetch RSVP list: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 RSVP Data received:", data);

      if (data.success) {
        // Handle standardized API response format: data.data.rsvps or fallback to data.rsvps
        const rsvps = data.data?.rsvps || data.rsvps || [];
        const statistics = data.data?.statistics || data.statistics;
        
        setRsvpList(rsvps);
        // Update RSVP stats from the fetched list
        if (rsvps && rsvps.length > 0) {
          const totalGuests = rsvps.reduce((sum, r) => sum + parseInt(r.number_of_guests || r.guest_count || 1), 0);
          const attendingCount = rsvps.filter(r => {
            const willAttend = r.will_attend;
            return willAttend === true || willAttend === 1 || willAttend === '1' || willAttend === 'true' || willAttend === 't';
          }).length;
          setRsvpStats({
            count: rsvps.length,
            total_guests: totalGuests,
            attending_guests: totalGuests // Use total guests for now
          });
        } else if (statistics) {
          // Use statistics from API if available
          setRsvpStats({
            count: parseInt(statistics.total_rsvps || '0'),
            total_guests: parseInt(statistics.total_guests || '0'),
            attending_guests: parseInt(statistics.attending_guests || '0')
          });
        }
        logger.debug('RSVP List set', { rsvpCount: rsvps?.length });
      } else {
        console.log("❌ RSVP fetch failed:", data.message);
      }
    } catch (err) {
      console.error("❌ Error fetching RSVP list silently:", err);
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error}</h2>
          <button
            onClick={() => router.push("/tribute")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            ← Back to Tributes
          </button>
        </div>
      </div>
    );
  }

  if (!tribute) return null;

  // Parse donation items - handle various formats
  let donationItems = [];
  if (tribute.donation_items) {
    try {
      if (typeof tribute.donation_items === 'string') {
        donationItems = JSON.parse(tribute.donation_items || '[]');
      } else if (Array.isArray(tribute.donation_items)) {
        donationItems = tribute.donation_items;
      }
    } catch (e) {
      console.error('Error parsing donation_items:', e);
      donationItems = [];
    }
  }

  // Log donation items (development only)
  logger.debug('Donation items parsed', {
    itemCount: donationItems.length,
    hasItems: donationItems.length > 0
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Hero Section with Portrait */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[600px] flex items-center justify-center mb-16 overflow-hidden"
      >
        {/* Action Buttons - Top Right */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
          {/* Privacy Badge (Family Only) */}
          {userRole === "family" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-sm ${tribute.is_public
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white'
              }`}
            >
              {tribute.is_public ? (
                <>
                  <Eye className="w-4 h-4" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Private
                </>
              )}
            </motion.div>
          )}

          {/* Share Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({
                  title: `${tribute.deceased_name} - Memorial Tribute`,
                  text: `In loving memory of ${tribute.deceased_name} `,
                  url: url
                }).catch(err => console.log('Share cancelled'));
              } else {
                navigator.clipboard.writeText(url);
                alert('Link copied to clipboard!');
              }
            }}
            className="px-5 py-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </motion.button>

          {/* Edit Button (Family Only) */}
          {userRole === "family" && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => router.push(`/tribute/edit/${id}`)}
              className="px-5 py-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </motion.button>
          )}
        </div>

        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: tribute.portrait_photo ? `url(${getImageUrl(tribute.portrait_photo)
              })` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={getImageUrl(tribute.portrait_photo)}
            alt={tribute.deceased_name}
            className="w-56 h-56 rounded-full object-cover border-8 border-white shadow-2xl mx-auto mb-8"
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {tribute.deceased_name}
            </h1>
            <p className="text-2xl text-white/90 mb-2">
              {(() => {
                const formatDisplayDate = (dateString) => {
                  if (!dateString) return "N/A";
                  try {
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) return dateString;
                    return date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  } catch (e) {
                    return dateString;
                  }
                };
                return `${formatDisplayDate(tribute.date_of_birth || tribute.birth_date)} — ${formatDisplayDate(tribute.date_of_death || tribute.death_date)} `;
              })()}
            </p>
            {tribute.location_of_birth && (
              <p className="text-xl text-white/90 mb-2 flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                Born in {tribute.location_of_birth}
              </p>
            )}
            {tribute.age && (
              <p className="text-xl text-white/80">
                Age {tribute.age} years
              </p>
            )}
          </motion.div>
        </div>

        {/* Decorative Bottom Curve */}
        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50" style={{ clipPath: "ellipse(70% 100% at 50% 100%)" }} />
      </motion.div>

      {/* Statistics Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="container mx-auto px-4 -mt-32 mb-16 relative z-20"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <Eye className="w-10 h-10 text-purple-600 mb-2" />
            <span className="text-3xl font-bold text-gray-800">
              <AnimatedCounter value={tribute.view_count || 0} />
            </span>
            <span className="text-sm text-gray-600 font-medium">Views</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <MessageSquare className="w-10 h-10 text-blue-600 mb-2" />
            <span className="text-3xl font-bold text-gray-800">
              <AnimatedCounter value={messages.length} />
            </span>
            <span className="text-sm text-gray-600 font-medium">Messages</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors">
            <Flower2 className="w-10 h-10 text-pink-600 mb-2" />
            <span className="text-3xl font-bold text-gray-800">
              <AnimatedCounter value={tribute.flower_count || 0} />
            </span>
            <span className="text-sm text-gray-600 font-medium">Flowers</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <Users className="w-10 h-10 text-green-600 mb-2" />
            <span className="text-3xl font-bold text-gray-800">
              <AnimatedCounter value={rsvpStats.total_guests || 0} />
            </span>
            <span className="text-sm text-gray-600 font-medium">RSVPs</span>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 pb-16 max-w-6xl">
        {/* Life Story */}
        {tribute.life_story && tribute.life_story.trim() ? (
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Heart className={`w - 8 h - 8 ${themeColors.primaryText} `} />
                Life Story
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p className="whitespace-pre-wrap">{tribute.life_story}</p>
              </div>
            </div>
          </motion.section>
        ) : userRole === "family" ? (
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-dashed border-gray-300">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Heart className={`w - 8 h - 8 ${themeColors.primaryText} `} />
                Life Story
              </h2>
              <p className="text-gray-600 mb-4">Share their life story and memories</p>
              <button
                onClick={() => router.push(`/tribute/edit/${id}`)}
                className={`px-6 py-3 bg-gradient-to-r ${themeColors.primaryButton} text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2`}
              >
                <MessageSquare className="w-5 h-5" />
                Write Life Story
              </button >
            </div >
          </motion.section >
        ) : null}

        {/* Family Gallery (Family Only Upload) */}
        {
          (familyPhotos.length > 0 || userRole === "family") && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <ImageIcon className="w-8 h-8 text-purple-600" />
                    Family Gallery
                    <span className="text-sm font-normal text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      Family Only
                    </span>
                  </h2>
                </div>

                {/* Family Upload Form - Collapsible */}
                {userRole === "family" && (
                  <>
                    {!showFamilyPhotoForm && (
                      <button
                        onClick={() => setShowFamilyPhotoForm(true)}
                        className={`mb-8 w-full px-6 py-4 bg-gradient-to-r ${themeColors.primaryButton} text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2`}
                      >
                        <Upload className="w-5 h-5" />
                        Add Photo to Gallery
                      </button>
                    )}
                    {showFamilyPhotoForm && (
                      <form onSubmit={handleFamilyPhotoUpload} className="mb-8 bg-white rounded-xl p-6 border-2 border-purple-300">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Upload className="w-5 h-5 text-purple-600" />
                          Upload Family Photo
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Select Photo *
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              required
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && file.size <= 5 * 1024 * 1024) {
                                  setFamilyPhotoForm({ ...familyPhotoForm, photo: file });
                                } else if (file) {
                                  alert("Photo size must be less than 5MB");
                                  e.target.value = "";
                                }
                              }}
                              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                            />
                            {familyPhotoForm.photo && (
                              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Selected: {familyPhotoForm.photo.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Photo Caption (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Family reunion 2020"
                              value={familyPhotoForm.description}
                              onChange={(e) => setFamilyPhotoForm({ ...familyPhotoForm, description: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={uploadingFamilyPhoto || !familyPhotoForm.photo}
                            className={`w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 ${(uploadingFamilyPhoto || !familyPhotoForm.photo) ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                          >
                            {uploadingFamilyPhoto ? (
                              <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-5 h-5" />
                                Upload to Family Gallery
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowFamilyPhotoForm(false);
                              setFamilyPhotoForm({ photo: null, description: "" });
                            }}
                            className="mt-3 w-full px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* Family Photos Grid - IMPROVED */}
                {familyPhotos.length > 0 ? (
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {familyPhotos.map((photo, index) => (
                      <motion.div
                        key={photo.photo_id || photo.id || `photo-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative break-inside-avoid mb-4 group"
                      >
                        <div className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
                          <div className="relative">
                            <img
                              src={getImageUrl(photo.photo_url)}
                              alt={photo.photo_description || photo.caption || "Family memory"}
                              className="w-full h-auto object-cover cursor-pointer transform group-hover:scale-105 transition-transform duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(index);
                              }}
                              loading="lazy"
                            />
                          </div>

                          {/* Caption Below Photo - Professional Styling */}
                          {(photo.photo_description || photo.caption) && (
                            <div className="px-5 py-4 bg-gradient-to-br from-slate-50 via-gray-50 to-white border-t border-slate-200/60 shadow-sm">
                              <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mt-0.5"></div>
                                <p className="text-slate-700 text-sm font-medium leading-relaxed tracking-wide">
                                  {photo.photo_description || photo.caption}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Delete Button (Family Only) */}
                          {userRole === "family" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this photo?')) handleDeleteFamilyPhoto(photo);
                              }}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              title="Delete photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                      {userRole === "family"
                        ? "No family photos yet. Upload the first one!"
                        : "No family photos available"}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          )
        }


        {/* Tribute Wall (Messages) */}
        {
          tribute.allow_messages && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                  Tribute Wall
                </h2>
                <p className="text-gray-600 mb-8">Share your memories and condolences</p>

                {/* Message Form with Photo Upload - Collapsible */}
                {!showMessageForm && (
                  <button
                    onClick={() => setShowMessageForm(true)}
                    className={`mb-8 w-full px-6 py-4 bg-gradient-to-r ${themeColors.primaryButton} text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    Leave a Tribute
                  </button>
                )}
                {showMessageForm && (
                  <form onSubmit={handleSubmitMessage} className="mb-8 space-y-4">
                    <div className={`bg-gradient-to-br ${themeColors.primaryBg} rounded-xl p-6 border-2 ${themeColors.primaryBorder}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <MessageSquare className="w-6 h-6 text-purple-500" />
                        <p className="text-sm text-gray-700">
                          <strong>Share Your Tribute:</strong> Share a photo and message to honor their memory �
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Your Name *"
                          value={messageForm.name}
                          onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                          required
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none bg-white"
                        />
                        <input
                          type="email"
                          placeholder="Your Email (optional)"
                          value={messageForm.email}
                          onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none bg-white"
                        />
                      </div>

                      <textarea
                        placeholder="Write your message... (e.g. 'To live in the hearts we leave behind is not to die.') *"
                        value={messageForm.message}
                        onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                        rows="4"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none bg-white mt-4"
                      />

                      {/* Photo Upload */}
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-purple-600" />
                          Add a Photo (Optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && file.size <= 5 * 1024 * 1024) {
                              setMessageForm({ ...messageForm, photo: file });
                            } else if (file) {
                              alert("Photo size must be less than 5MB");
                              e.target.value = "";
                            }
                          }}
                          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                        />
                        {messageForm.photo && (
                          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Photo selected: {messageForm.photo.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingMessage}
                      className={`w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 ${submittingMessage ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {submittingMessage ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Posting Message...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5" />
                          Post Tribute Message
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMessageForm(false);
                        setMessageForm({ name: "", email: "", message: "", photo: null });
                      }}
                      className="mt-3 w-full md:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {/* Messages List with Photos - BEAUTIFUL CARD DESIGN */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <motion.div
                        key={msg.message_id || msg.id || `message-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-purple-100/50 overflow-hidden transform hover:-translate-y-1"
                      >
                        {/* Photo if exists - Card header with overlay */}
                        {msg.photo_url && (
                          <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer"
                            onClick={() => {
                              // Find index of this message photo in messages with photos
                              const messagesWithPhotos = messages.filter(m => m.photo_url);
                              const photoIndex = messagesWithPhotos.findIndex(m => (m.message_id || m.id) === (msg.message_id || msg.id));
                              setMessagePhotoLightboxIndex(photoIndex);
                            }}
                          >
                            <img
                              src={getImageUrl(msg.photo_url)}
                              alt="Tribute photo"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                            {/* Decorative overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                          </div>
                        )}

                        {/* No photo - Show decorative header */}
                        {!msg.photo_url && (
                          <div className="relative w-full h-24 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center overflow-hidden">
                            <Heart className="w-12 h-12 text-purple-400 opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                          </div>
                        )}

                        {/* Message content */}
                        <div className="p-5">
                          {/* Author info at top */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white">
                              {(msg.sender_name || msg.guest_name || msg.author_name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-base leading-tight">{msg.sender_name || msg.guest_name || msg.author_name || 'Anonymous'}</p>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span title={msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}>
                                  {msg.created_at ? (() => {
                                    const date = new Date(msg.created_at);
                                    const now = new Date();
                                    const diffMs = now - date;
                                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                                    // Show actual date if more than 24 hours ago, otherwise show relative time
                                    if (diffDays > 0) {
                                      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    } else if (diffHours > 0) {
                                      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
                                    } else {
                                      const diffMins = Math.floor(diffMs / (1000 * 60));
                                      if (diffMins > 0) {
                                        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
                                      }
                                      return 'just now';
                                    }
                                  })() : 'Unknown time'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Message text with decorative quotes */}
                          <div className="relative mb-4">
                            <div className="absolute -top-2 -left-1 text-4xl text-purple-300 font-serif leading-none">"</div>
                            <p className="text-gray-700 text-sm leading-relaxed pl-5 pr-3 italic">
                              {msg.message}
                            </p>
                            <div className="absolute -bottom-4 -right-1 text-4xl text-purple-300 font-serif leading-none">"</div>
                          </div>

                          {/* Bottom decorative line */}
                          <div className="mt-6 pt-3 border-t border-purple-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <MessageSquare className="w-3 h-3" />
                              <span>Tribute Message</span>
                            </div>

                            {/* Delete button for family members */}
                            {userRole === "family" && (
                              <button
                                onClick={() => {
                                  if (confirm('Delete this message?')) handleDeleteMessage(msg.message_id || msg.id);
                                }}
                                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Decorative corner accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-transparent rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform"></div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="col-span-full text-center py-16 px-4"
                    >
                      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-12 max-w-md mx-auto border-2 border-dashed border-purple-200 shadow-lg">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                        >
                          <MessageSquare className="w-20 h-20 mx-auto mb-6 text-purple-400" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Messages Yet</h3>
                        <p className="text-gray-600 mb-4">Be the first to share your memories and tributes</p>
                        <p className="text-sm text-purple-600 font-medium">Scroll up to leave a tribute message</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>
          )
        }

        {/* Donations */}
        {
          (donationItems.length > 0 || tribute.donation_items) && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  Acts of Kindness
                </h2>
                <p className="text-gray-600 mb-8">Honor their memory with these meaningful offerings</p>

                {donationItems.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {donationItems.map((item, index) => (
                      <div key={`donation-${index}`} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">{item.item || item.name || 'Donation Item'}</h4>
                        <p className="text-3xl font-bold text-purple-600 mb-2">RM {item.price || item.amount || '0'}</p>
                        <p className="text-gray-600">{item.description || item.desc || ''}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-8">
                    <p className="text-gray-700 font-medium">
                      ℹ️ No donation items configured yet. Contact the tribute creator to add donation options.
                    </p>
                  </div>
                )}

                <button
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                  onClick={() => setShowBank(!showBank)}
                >
                  <DollarSign className="w-6 h-6" />
                  {showBank ? "Hide Donation Info ❌" : "I Want to Donate 💝"}
                </button>

                <AnimatePresence>
                  {showBank && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8"
                    >
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <DollarSign className="w-7 h-7 text-purple-600" />
                        Donation Bank Information
                      </h3>

                      {tribute.bank_account_number ? (
                        <>
                          <div className="space-y-3 mb-6">
                            {tribute.bank_account_name && (
                              <div className="bg-white rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Account Holder</p>
                                <p className="text-lg font-bold text-gray-800">{tribute.bank_account_name}</p>
                              </div>
                            )}
                            {tribute.bank_name && (
                              <div className="bg-white rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Bank Name</p>
                                <p className="text-lg font-bold text-gray-800">{tribute.bank_name}</p>
                              </div>
                            )}
                            <div className="bg-white rounded-lg p-4">
                              <p className="text-sm text-gray-600 mb-1">Account Number</p>
                              <p className="text-lg font-bold text-gray-800 font-mono">{tribute.bank_account_number}</p>
                            </div>
                          </div>

                          {tribute.donation_qr_code && (
                            <div className="text-center">
                              <img
                                src={getImageUrl(tribute.donation_qr_code)}
                                alt="Donation QR Code"
                                className="max-w-xs mx-auto rounded-xl shadow-lg mb-4"
                              />
                              <p className="text-gray-700 font-medium">📱 Scan to donate</p>
                            </div>
                          )}

                          <p className="mt-6 text-center text-sm text-gray-600 bg-white rounded-lg p-4">
                            💬 Please mention the offering name in your transfer reference
                          </p>
                        </>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                          <p className="text-gray-700 font-medium">
                            ⚠️ Bank information not yet configured. Please contact the tribute creator to add donation details.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )
        }

        {/* RSVP Help Message - Show if RSVP is enabled but section is hidden */}
        {
          tribute.enable_rsvp && (!tribute.grave_location_name && !tribute.grave_address) && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-12"
            >
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">RSVP is Enabled but Not Visible</h3>
                    <p className="text-yellow-700 mb-2">
                      To show the RSVP section, you need to add a <strong>Location Name</strong> or <strong>Address</strong> for the memorial service.
                    </p>
                    <p className="text-sm text-yellow-600">
                      Go to <strong>Edit Tribute</strong> and fill in the "Grave Location Name" or "Grave Address" field in the Memorial Service section.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )
        }

        {/* RSVP Help Message - Show if event date has passed */}
        {
          tribute.enable_rsvp && (tribute.grave_location_name || tribute.grave_address) && isRSVPEventPassed() && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-12"
            >
              <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">RSVP Closed</h3>
                    <p className="text-gray-700">
                      The memorial service date has passed. RSVP is no longer available for this tribute.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )
        }

        {/* RSVP Section - Hide if event date has passed */}
        {
          tribute.enable_rsvp && (tribute.grave_location_name || tribute.grave_address) && !isRSVPEventPassed() && (
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <MapPin className="w-8 h-8 text-blue-600" />
                    Memorial Service & RSVP
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                    Action Required
                  </span>
                </div>

                {tribute.grave_invite_message && (
                  <p className="text-lg italic text-gray-700 bg-purple-50 rounded-xl p-6 mb-8 border-l-4 border-purple-600">
                    "{tribute.grave_invite_message}"
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-6 h-6 text-purple-600" />
                      <strong className="text-lg text-gray-800">Location</strong>
                    </div>
                    <p className="text-gray-700 text-lg">{tribute.grave_location_name}</p>
                  </div>

                  {tribute.grave_address && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-6 h-6 text-purple-600" />
                        <strong className="text-lg text-gray-800">Address</strong>
                      </div>
                      <p className="text-gray-700">{tribute.grave_address}</p>
                    </div>
                  )}

                  {tribute.grave_datetime && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-6 h-6 text-purple-600" />
                        <strong className="text-lg text-gray-800">Date & Time</strong>
                      </div>
                      <p className="text-gray-700">{new Date(tribute.grave_datetime).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                  {tribute.map_link && (
                    <a
                      href={tribute.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      View on Map 🌏
                    </a>
                  )}
                  {tribute.virtual_link && (
                    <a
                      href={tribute.virtual_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Video className="w-5 h-5" />
                      Join Virtually 💻
                    </a>
                  )}
                </div>

                {/* RSVP Form */}
                <div className="bg-white rounded-xl p-8 border-2 border-blue-200 shadow-md">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                    <Users className="w-7 h-7 text-purple-600" />
                    RSVP Your Attendance
                  </h3>
                  <p className="text-gray-600 mb-6">Please let us know if you'll be attending 🙏</p>

                  {(() => {
                    const maxCapacity = tribute.rsvp_max_guests || tribute.max_guests;
                    const isCapacityLimited = maxCapacity && maxCapacity > 0;
                    const remainingSpots = isCapacityLimited 
                      ? Math.max(0, parseInt(maxCapacity) - parseInt(rsvpStats.total_guests || 0))
                      : 9999;
                      
                    if (isCapacityLimited && remainingSpots <= 0) {
                       return (
                          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center mb-6 shadow-sm">
                              <div className="flex justify-center mb-3">
                                <div className="p-3 bg-red-100 rounded-full">
                                  <Users className="w-8 h-8 text-red-600" />
                                </div>
                              </div>
                              <p className="text-red-800 font-bold text-xl mb-1">Event Fully Booked</p>
                              <p className="text-red-600">
                                We have reached the maximum capacity of {maxCapacity} guests. 
                                <br/>RSVP is currently closed.
                              </p>
                          </div>
                       );
                    }
                  
                    return (
                      <form onSubmit={handleSubmitRSVP} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Full Name *"
                            value={rsvpForm.name}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                            required
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none bg-white"
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number *"
                            value={rsvpForm.phone}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                            required
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none bg-white"
                          />
                        </div>
                        <input
                          type="email"
                          placeholder="Email (optional)"
                          value={rsvpForm.email}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none bg-white"
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <input
                              type="number"
                              placeholder="Number of Guests"
                              value={rsvpForm.guests}
                              onChange={(e) => setRsvpForm({ ...rsvpForm, guests: e.target.value })}
                              min="1"
                              max={isCapacityLimited ? remainingSpots : undefined}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none bg-white"
                            />
                            {isCapacityLimited && (
                              <p className="text-xs text-gray-500 mt-1 ml-1">
                                {remainingSpots} spot{remainingSpots !== 1 ? 's' : ''} remaining
                              </p>
                            )}
                          </div>
                          <select
                            value={rsvpForm.type}
                            onChange={(e) => setRsvpForm({ ...rsvpForm, type: e.target.value })}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none bg-white"
                          >
                            <option value="physical">Attending in Person</option>
                            <option value="virtual">Attending Virtually</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={submittingRSVP}
                          className={`w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 text-lg ${submittingRSVP ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                          {submittingRSVP ? (
                            <>
                              <Loader className="w-6 h-6 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-6 h-6" />
                              Submit RSVP 🙏
                            </>
                          )}
                        </button>
                      </form>
                    );
                  })()}

                  {/* RSVP Stats */}
                  {rsvpStats.count > 0 && (
                    <div className="mt-6 bg-white rounded-xl p-4 text-center">
                      <p className="text-gray-700">
                        <strong className="text-2xl text-purple-600">{rsvpStats.count}</strong>{' '}
                        {rsvpStats.count === 1 ? 'person has' : 'people have'} RSVP'd
                        <span className="text-gray-500"> ({rsvpStats.total_guests} total guests)</span>
                      </p>
                      {/* Family-only: View Guest List button */}
                      {userRole === "family" && (
                        <button
                          onClick={() => {
                            console.log("🔘 View Guest List clicked", { userRole, rsvpStats });
                            fetchRSVPList();
                          }}
                          className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                          <Users className="w-5 h-5" />
                          View Guest List
                        </button>
                      )}
                      {/* Debug info logged in development */}
                      {logger.debug('RSVP button visibility check', {
                        userRole,
                        rsvpStatsCount: rsvpStats.count,
                        shouldShowButton: userRole === "family"
                      })}
                    </div>
                  )}

                  {/* Enhanced RSVP Management Section (Family Only) */}
                  {userRole === "family" && rsvpList && rsvpList.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
                      {/* Professional RSVP Header with Enhanced Design */}
                      <div
                        onClick={() => setShowRSVPPreview(!showRSVPPreview)}
                        className="group flex items-center justify-between cursor-pointer bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              Event Attendees
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                <span className="font-semibold text-blue-600">{rsvpList.length || rsvpStats.count || 0}</span> confirmed
                              </span>
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span className="text-gray-600">
                                <span className="font-semibold text-indigo-600">
                                  {rsvpList.length > 0
                                    ? rsvpList.reduce((sum, r) => sum + parseInt(r.number_of_guests || r.guest_count || 1), 0)
                                    : rsvpStats.total_guests || 0
                                  }
                                </span> total guests
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRSVPList(true);
                            }}
                            className="px-5 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 bg-blue-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Manage All
                          </motion.button>
                          <motion.div
                            animate={{ rotate: showRSVPPreview ? 180 : 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="p-2 rounded-full group-hover:bg-white/50 transition-colors"
                          >
                            <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>

                      {/* Collapsible RSVP Content with Enhanced Design */}
                      <AnimatePresence>
                        {showRSVPPreview && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-4 mt-6 px-2">
                              {rsvpList.filter(rsvp => rsvp && rsvp.name).slice(0, 5).map((rsvp, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -30 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1, duration: 0.5 }}
                                  className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="relative">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {rsvp.name ? rsvp.name.charAt(0).toUpperCase() : '?'}
                                      </div>
                                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-700 transition-colors">
                                          {rsvp.name || 'Guest'}
                                        </h4>
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${rsvp.attendance_type === 'physical'
                                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
                                          : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200'
                                          }`}>
                                          {rsvp.attendance_type === 'physical' ? '🏢 In Person' : '💻 Virtual'}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <span className="font-medium">
                                            {rsvp.number_of_guests || 1} {(rsvp.number_of_guests || 1) === 1 ? 'guest' : 'guests'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                          </div>
                                          <span>{new Date(rsvp.created_at).toLocaleDateString()}</span>
                                        </div>
                                      </div>

                                      {rsvp.message && (
                                        <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border-l-4 border-blue-400">
                                          <p className="text-sm text-gray-700 italic leading-relaxed">
                                            "{rsvp.message}"
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}

                              {rsvpList.length > 5 && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                  className="text-center pt-4 pb-2"
                                >
                                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                      <Users className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <p className="text-sm text-gray-700">
                                      Showing <span className="font-semibold text-blue-600">5</span> of <span className="font-semibold text-indigo-600">{rsvpList.length}</span> RSVPs
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>
          )
        }

        {/* Enhanced RSVP Management Modal */}
        <AnimatePresence>
          {showRSVPList && userRole === "family" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setShowRSVPList(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
              >
                {/* Enhanced Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Users className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-1">Event Management</h2>
                        <div className="flex items-center gap-4 text-blue-100">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {rsvpList.length} confirmed
                          </span>
                          <span className="w-1 h-1 bg-blue-200 rounded-full"></span>
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {rsvpStats.total_guests} total guests
                          </span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowRSVPList(false)}
                      className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center backdrop-blur-sm"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Enhanced Modal Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-220px)]">
                  {rsvpList.length > 0 ? (
                    <div className="space-y-6">
                      {rsvpList.map((rsvp, index) => (
                        <motion.div
                          key={rsvp.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {(rsvp.name || rsvp.guest_name || 'G').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                  {rsvp.name || rsvp.guest_name || 'Guest'}
                                </h3>
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${(rsvp.attendance_type === 'physical' || rsvp.attendance_type === 'in-person')
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                                  }`}>
                                  {(rsvp.attendance_type === 'physical' || rsvp.attendance_type === 'in-person')
                                    ? <><MapPin className="w-4 h-4" /> In Person</>
                                    : <><Video className="w-4 h-4" /> Virtual</>
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-lg font-bold text-blue-600 mb-1">
                                <Users className="w-5 h-5" />
                                <span>{rsvp.number_of_guests || rsvp.guest_count || 1}</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {(rsvp.number_of_guests || rsvp.guest_count || 1) === 1 ? 'guest' : 'guests'}
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            {(rsvp.email || rsvp.guest_email) && (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                  <p className="text-sm font-medium text-gray-800">{rsvp.email || rsvp.guest_email}</p>
                                </div>
                              </div>
                            )}
                            {(rsvp.phone || rsvp.guest_phone) && (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                <Phone className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                                  <p className="text-sm font-medium text-gray-800">{rsvp.phone || rsvp.guest_phone}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Submitted</p>
                                <p className="text-sm font-medium text-gray-800">{new Date(rsvp.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>

                          {rsvp.message && (
                            <div className="mt-4 p-4 bg-white rounded-xl border-l-4 border-blue-400">
                              <p className="text-gray-700 italic leading-relaxed">"{rsvp.message}"</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Users className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">No RSVPs Yet</h3>
                      <p className="text-gray-400">Guests can RSVP from the tribute page</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Modal Footer */}
                <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 p-6 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {rsvpList.reduce((sum, r) => sum + parseInt(r.number_of_guests || r.guest_count || 1), 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Attendees</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">{rsvpList.length}</p>
                      <p className="text-sm text-gray-600">Confirmations</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Enhanced CSV export
                      const headers = ['Name', 'Phone', 'Email', 'Relationship', 'Guests', 'Attendance Type', 'Message', 'Submitted Date'];
                      const csvData = [
                        headers,
                        ...rsvpList.map(r => [
                          r.name || r.guest_name || '',
                          r.phone || r.guest_phone || '',
                          r.email || r.guest_email || '',
                          r.relationship || '',
                          r.number_of_guests || r.guest_count || 1,
                          r.attendance_type || '',
                          (r.message || '').replace(/"/g, '""'),
                          new Date(r.created_at).toLocaleDateString()
                        ])
                      ];

                      const csv = csvData.map(row =>
                        row.map(cell => `"${cell}"`).join(',')
                      ).join('\n');

                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `rsvp-list-${(tribute.deceased_name || 'tribute').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-5 h-5" />
                    Export CSV
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Virtual Flower Offering - Removed from main content, now FAB */}
      </div >

      {/* Photo Lightbox for Family Gallery */}
      < AnimatePresence >
        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={familyPhotos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence >

      {/* Photo Lightbox for Tribute Wall Messages */}
      < AnimatePresence >
        {messagePhotoLightboxIndex !== null && (
          <PhotoLightbox
            photos={messages.filter(m => m.photo_url).map(m => ({
              photo_url: getImageUrl(m.photo_url),
              photo_description: m.message,
              guest_name: m.guest_name
            }))}
            initialIndex={messagePhotoLightboxIndex}
            onClose={() => setMessagePhotoLightboxIndex(null)}
          />
        )}
      </AnimatePresence >

      {/* Floating Flowers Animation */}
      < AnimatePresence >
        {
          floatingFlowers.map((flower) => {
            const randomX = (Math.random() - 0.5) * 150; // Random horizontal drift
            const randomDelay = Math.random() * 0.2; // Slight random delay for natural effect
            return (
              <motion.div
                key={flower.id}
                initial={{
                  opacity: 0,
                  scale: 0.3,
                  y: 0,
                  x: 0
                }}
                animate={{
                  opacity: [0, 1, 1, 0.8, 0],
                  scale: [0.3, 1.3, 1.1, 0.9, 0.5],
                  y: -300, // Float up 300px
                  x: randomX,
                  rotate: [0, 90, 180, 270, 360]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 2.8,
                  delay: flower.delay + randomDelay,
                  ease: [0.25, 0.1, 0.25, 1] // Custom easing for smooth float
                }}
                style={{
                  position: 'fixed',
                  left: `calc(100% - 8rem - ${(Math.random() - 0.5) * 40}px)`, // Start near button position
                  bottom: '104px', // Start at flower button position
                  pointerEvents: 'none',
                  zIndex: 10000,
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                }}
              >
                {flower.emoji}
              </motion.div>
            );
          })
        }
      </AnimatePresence >

      {/* Floating Action Buttons - Vertically Aligned */}
      < div className="fixed z-50 flex flex-col gap-4 items-end" style={{ bottom: '104px', right: '24px' }}>
        {/* Virtual Flower FAB - Positioned above AI chat button (80px gap) */}
        < motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="group relative flex items-center"
        >
          <motion.button
            onClick={offerFlower}
            className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 flex items-center justify-center relative"
            style={{ width: '64px', height: '64px' }}
            whileHover={{ scale: 1.1, y: -5, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Flower2 className="w-6 h-6" />
          </motion.button>

          {/* Persistent Label for Flower Button */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute right-full mr-3 pointer-events-none flex items-center h-full"
            style={{ top: '0' }}
          >
            <div className="bg-white text-pink-600 px-3 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap border-2 border-pink-200 flex items-center h-fit">
              Offer a Flower 🌸
            </div>
            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[6px] border-l-white border-b-[6px] border-b-transparent self-center"></div>
          </motion.div>

          {/* Thank you message (overrides label when shown) */}
          {
            flowerMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 z-10"
              >
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap">
                  {flowerMessage}
                </div>
              </motion.div>
            )
          }
        </motion.div >
      </div >
    </div >
  );
}



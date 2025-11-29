'use client';

import { useState, useEffect } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Mail, Phone, Calendar, MapPin, Video, Download, ArrowLeft, User, CheckCircle } from "lucide-react";

export default function TributeRSVPList({ id }) {
  const router = useRouter();
  const [tribute, setTribute] = useState(null);
  const [rsvpList, setRsvpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ physical: 0, virtual: 0, total_guests: 0 });

  useEffect(() => {
    fetchTributeAndRSVP();
  }, [id]);

  const fetchTributeAndRSVP = async () => {
    setLoading(true);
    try {
      // Fetch tribute details
      const tributeRes = await fetch(`/api/backend/getTributeById?id=${id}`);
      const tributeData = await tributeRes.json();
      
      if (tributeData.success) {
        setTribute(tributeData.tribute);
        
        // Check if user is the tribute creator (family member)
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (tributeData.tribute.creator_user_id !== user.id) {
          setError("You don't have permission to view this page");
          return;
        }
        
        // Fetch RSVP list with user_id
        const rsvpRes = await fetch(`/api/backend/getRSVPList?tribute_id=${id}&user_id=${user.id}`);
        const rsvpData = await rsvpRes.json();
        
        if (rsvpData.success) {
          // Handle standardized API response format: data.data.rsvps or fallback to data.rsvps
          const rsvps = rsvpData.data?.rsvps || rsvpData.rsvp_list || rsvpData.rsvps || [];
          
          setRsvpList(rsvps);
          
          // Calculate stats
          const physical = rsvps.filter(r => r.attendance_type === 'physical').length;
          const virtual = rsvps.filter(r => r.attendance_type === 'virtual').length;
          const total_guests = rsvps.reduce((sum, r) => sum + (parseInt(r.number_of_guests) || 0), 0);
          
          setStats({ physical, virtual, total_guests });
        }
      }
    } catch (err) {
      console.error("Error fetching RSVP:", err);
      setError("Failed to load RSVP list");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (rsvpList.length === 0) return;
    
    const headers = ["Name", "Email", "Phone", "Attendance Type", "Number of Guests", "RSVP Date"];
    const rows = rsvpList.map(rsvp => [
      rsvp.guest_name,
      rsvp.guest_email || 'N/A',
      rsvp.guest_phone || 'N/A',
      rsvp.attendance_type,
      rsvp.number_of_guests,
      new Date(rsvp.created_at).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvp_list_${tribute?.deceased_name || 'tribute'}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/tribute/${id}`)}
            className="text-purple-600 hover:underline"
          >
            Back to Tribute
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Soft & Peaceful */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push(`/tribute/${id}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tribute
          </button>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6">
            <h1 className="text-3xl font-serif text-slate-800 mb-2">
              Attendee List for {tribute?.deceased_name}
            </h1>
            <p className="text-slate-600">
              Memorial Service • {new Date(tribute?.grave_datetime).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </motion.div>

        {/* Stats Cards - Soft Colors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Physical Attendance</p>
                <p className="text-3xl font-bold text-slate-700">{stats.physical}</p>
              </div>
              <MapPin className="w-12 h-12 text-slate-300" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Virtual Attendance</p>
                <p className="text-3xl font-bold text-slate-700">{stats.virtual}</p>
              </div>
              <Video className="w-12 h-12 text-blue-300/50" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Guests</p>
                <p className="text-3xl font-bold text-slate-700">{stats.total_guests}</p>
              </div>
              <Users className="w-12 h-12 text-emerald-300/50" />
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex justify-end"
        >
          <button
            onClick={downloadCSV}
            disabled={rsvpList.length === 0}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </motion.div>

        {/* RSVP List - BEAUTIFUL CARD LAYOUT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Guest Attendees</h2>
            <p className="text-gray-600">Total of {rsvpList.length} {rsvpList.length === 1 ? 'person has' : 'people have'} RSVP'd</p>
          </div>
          
          {rsvpList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rsvpList.map((rsvp, index) => (
                <motion.div
                  key={rsvp.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all border border-slate-200 hover:border-slate-300 overflow-hidden group"
                >
                  {/* Header with attendance type badge - Soft Colors */}
                  <div className={`p-4 ${
                    rsvp.attendance_type === 'physical' 
                      ? 'bg-gradient-to-br from-slate-400 to-stone-400' 
                      : 'bg-gradient-to-br from-blue-400 to-sky-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl ring-4 ring-white/30">
                          {rsvp.guest_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-white">
                          <p className="font-bold text-lg leading-tight">{rsvp.guest_name}</p>
                          <div className="flex items-center gap-1.5 mt-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            {rsvp.attendance_type === 'physical' ? (
                              <>
                                <MapPin className="w-3 h-3" />
                                <span className="text-xs font-medium">Physical</span>
                              </>
                            ) : (
                              <>
                                <Video className="w-3 h-3" />
                                <span className="text-xs font-medium">Virtual</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-white/80" />
                    </div>
                  </div>
                  
                  {/* Contact Details */}
                  <div className="p-5 space-y-3">
                    {/* Number of Guests */}
                    <div className="bg-gradient-to-r from-slate-50 to-stone-50 rounded-xl p-3 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">Bringing</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-700">
                          {rsvp.number_of_guests} {rsvp.number_of_guests === 1 ? 'guest' : 'guests'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Email */}
                    {rsvp.guest_email && (
                      <div className="flex items-start gap-3 group/item hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Email</p>
                          <a 
                            href={`mailto:${rsvp.guest_email}`}
                            className="text-sm text-gray-900 hover:text-blue-600 transition-colors break-all"
                          >
                            {rsvp.guest_email}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Phone */}
                    {rsvp.guest_phone && (
                      <div className="flex items-start gap-3 group/item hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Phone</p>
                          <a 
                            href={`tel:${rsvp.guest_phone}`}
                            className="text-sm text-gray-900 hover:text-green-600 transition-colors"
                          >
                            {rsvp.guest_phone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* RSVP Date */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">RSVP'd on</p>
                        <p className="text-sm text-gray-700 font-medium">
                          {new Date(rsvp.created_at).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative bottom accent - Soft Colors */}
                  <div className={`h-1 ${
                    rsvp.attendance_type === 'physical' 
                      ? 'bg-gradient-to-r from-slate-300 to-stone-300' 
                      : 'bg-gradient-to-r from-blue-300 to-sky-300'
                  }`}></div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
              <Users className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No RSVPs Yet</h3>
              <p className="text-gray-600">
                When guests RSVP for the memorial service, they will appear here.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

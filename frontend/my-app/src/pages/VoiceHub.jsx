'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic2, Plus, Calendar, CheckCircle, Clock, Settings, X, User, ArrowLeft, Sparkles, MessageCircle, Upload, Brain, Shield } from "lucide-react";

export default function VoiceHub() {
  const router = useRouter();
  const [voiceMemorials, setVoiceMemorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTributeSelector, setShowTributeSelector] = useState(false);
  const [availableTributes, setAvailableTributes] = useState([]);
  const [loadingTributes, setLoadingTributes] = useState(false);

  useEffect(() => {
    fetchVoiceMemorials();
  }, []);

  const fetchVoiceMemorials = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      const response = await fetch(`/api/backend/getVoiceMemorials?user_id=${userId}`);
      const data = await response.json();

      console.log('API Response:', data);

      // Handle standardized API response format
      const voiceMemorials = data.data?.voice_memorials || data.voice_memorials || [];
      console.log('Voice Memorials:', voiceMemorials);

      if (data.success) {
        setVoiceMemorials(voiceMemorials);
      }
    } catch (error) {
      console.error("Error fetching voice memorials:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTributes = async () => {
    setLoadingTributes(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/backend/getTributes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      // Handle standardized API response format
      const tributes = data.data?.tributes || data.tributes || [];

      if (data.success) {
        const userTributes = tributes.filter(t => t.created_by === user.name);
        const tributeIdsWithVoice = voiceMemorials.map(vm => vm.tribute_id);
        const available = userTributes.filter(t => !tributeIdsWithVoice.includes(t.id));
        setAvailableTributes(available);
      }
    } catch (error) {
      console.error("Error fetching tributes:", error);
    } finally {
      setLoadingTributes(false);
    }
  };

  const handleCreateNew = async () => {
    await fetchAvailableTributes();
    setShowTributeSelector(true);
  };

  const handleTributeSelect = (tributeId) => {
    setShowTributeSelector(false);
    router.push(`/grief-support/voice/${tributeId}/setup`);
  };

  const getSetupProgress = (memorial) => {
    let progress = 0;
    if (memorial.voice_status === 'ready') progress += 50;
    if (memorial.memory_count > 0 || memorial.trait_count > 0) progress += 50;
    return progress;
  };

  const getStatusInfo = (memorial) => {
    if (memorial.voice_status === 'ready' && (memorial.memory_count > 0 || memorial.trait_count > 0)) {
      return { text: 'Complete', color: 'green', icon: CheckCircle };
    } else if (memorial.voice_status === 'ready') {
      return { text: 'Voice Ready', color: 'blue', icon: Mic2 };
    } else {
      return { text: 'In Progress', color: 'yellow', icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading voice memorials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/grief-support')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                  <Mic2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Voice Memorials</h1>
                  <p className="text-sm text-gray-600">Preserve their voice with AI technology</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create New Memorial
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {voiceMemorials.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
              <Mic2 className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Voice Memorials Yet</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Create your first voice memorial to preserve their voice forever.
              Our AI technology captures their unique voice, tone, and personality.
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium"
            >
              <Plus className="w-6 h-6" />
              Create Your First Memorial
            </button>

            {/* How it Works */}
            <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Upload Voice</h3>
                <p className="text-gray-600 text-sm">
                  Upload a short audio sample of your loved one's voice (2-10 minutes recommended)
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Add Memories</h3>
                <p className="text-gray-600 text-sm">
                  Share memories, personality traits, and stories to train the AI on who they were
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Start Chatting</h3>
                <p className="text-gray-600 text-sm">
                  Talk to them through our AI - hear responses in their own voice anytime
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          // Voice Memorials Grid
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voiceMemorials.map((memorial, index) => {
              const progress = getSetupProgress(memorial);
              const status = getStatusInfo(memorial);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={memorial.id || `memorial-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Card Header */}
                  <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 flex items-center gap-3">
                      {memorial.photo ? (
                        <img
                          src={memorial.photo}
                          alt={memorial.name}
                          className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-bold text-lg">{memorial.name}</h3>
                        <p className="text-white/80 text-sm">
                          {memorial.birth_date && memorial.death_date &&
                            `${new Date(memorial.birth_date).getFullYear()} - ${new Date(memorial.death_date).getFullYear()}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${status.color === 'green' ? 'bg-green-100 text-green-700' :
                        status.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.text}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Setup Progress</span>
                        <span className="font-semibold text-gray-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          key={`progress-${memorial.id}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                          <Mic2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Voice Status</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{memorial.voice_status || 'Not set'}</p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                          <Brain className="w-4 h-4" />
                          <span className="text-xs font-medium">Memories</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{memorial.memory_count || 0} added</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {progress === 100 ? (
                        <>
                          <button
                            onClick={() => router.push(`/grief-support/voice/${memorial.tribute_id}/chat`)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Start Chat
                          </button>
                          <button
                            onClick={() => router.push(`/grief-support/voice/${memorial.tribute_id}/setup`)}
                            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            title="Manage Setup"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => router.push(`/grief-support/voice/${memorial.tribute_id}/setup`)}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                          >
                            <Settings className="w-4 h-4" />
                            Continue Setup
                          </button>
                          <button
                            onClick={() => router.push(`/grief-support/voice/${memorial.tribute_id}/settings`)}
                            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                            title="Privacy Settings"
                          >
                            <Shield className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tribute Selector Modal */}
      <AnimatePresence>
        {showTributeSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTributeSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Select a Tribute</h2>
                  <button
                    onClick={() => setShowTributeSelector(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">Choose a tribute to create a voice memorial for</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingTributes ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading tributes...</p>
                  </div>
                ) : availableTributes.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tributes available. Create a tribute first.</p>
                    <button
                      onClick={() => router.push('/tribute/create')}
                      className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Create Tribute
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableTributes.map((tribute) => (
                      <button
                        key={tribute.id}
                        onClick={() => handleTributeSelect(tribute.id)}
                        className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-indigo-500 text-left group"
                      >
                        {tribute.photo ? (
                          <img key={`${tribute.id}-photo`} src={tribute.photo} alt={tribute.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div key={`${tribute.id}-no-photo`} className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{tribute.name}</h3>
                          <p className="text-sm text-gray-600">
                            {tribute.birth_date && tribute.death_date &&
                              `${new Date(tribute.birth_date).getFullYear()} - ${new Date(tribute.death_date).getFullYear()}`
                            }
                          </p>
                        </div>
                        <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-6 h-6" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

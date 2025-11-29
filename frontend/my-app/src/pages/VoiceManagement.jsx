'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mic,
  Brain,
  MessageCircle,
  Settings,
  Upload,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from "lucide-react";

const ACCESS_LABELS = {
  family: "Family only",
  invited: "Logged-in guests",
  all_visitors: "All visitors"
};

const normalizeApiData = (payload) => {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    payload.data &&
    typeof payload.data === "object"
  ) {
    return payload.data;
  }
  return payload;
};

const extractApiErrorMessage = (payload, fallback) => {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  if (typeof payload.error === "string") {
    return payload.error;
  }

  if (payload.error?.message) {
    return payload.error.message;
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
};

const isApiSuccess = (payload) =>
  typeof payload?.success === "boolean" ? payload.success : true;

const fetchVoiceStatus = async (tributeId) => {
  const response = await fetch(`/api/backend/getVoiceStatus?tribute_id=${tributeId}`);
  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      (await response.text().catch(() => null)) ||
      `Failed to load voice status (HTTP ${response.status})`;
    return { success: false, message };
  }

  if (!payload || typeof payload !== "object") {
    return { success: false, message: "Unexpected response while loading voice status." };
  }

  return payload;
};

export default function VoiceManagement({ id }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        setLoading(true);
        const result = await fetchVoiceStatus(id);
        if (isMounted) {
          if (isApiSuccess(result)) {
            setStatus(normalizeApiData(result));
            setError(null);
          } else {
            setStatus(null);
            setError(
              extractApiErrorMessage(
                result,
                "Voice memorial not ready yet. Please finish the setup steps."
              )
            );
          }
        }
      } catch (err) {
        console.error("Voice status error:", err);
        if (isMounted) {
          setError(err.message || "Unable to load voice management data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const flags = status?.flags ?? {};
  const settings = status?.settings ?? {};

  const steps = useMemo(() => {
    const currentAccessLevel = settings?.access_level || 'family';
    const accessLabel = ACCESS_LABELS[currentAccessLevel] || ACCESS_LABELS.family;
    return [
      {
        id: 1,
        title: "Upload Voice Sample",
        description: "Record or upload a clear 2-3 minute audio clip to clone their voice.",
        icon: Upload,
        iconClass: "bg-gradient-to-br from-pink-500 to-rose-500",
        complete: flags.voiceUploaded,
        inProgress: flags.voiceProcessing,
        action: () => router.push(`/grief-support/voice/${id}/upload`),
        cta: flags.voiceUploaded ? "Manage voice sample" : "Upload voice sample",
        status: flags.voiceUploaded
          ? flags.voiceReady
            ? "Voice ready"
            : "Processing sample"
          : "Not started"
      },
      {
        id: 2,
        title: "Add Memories & Traits",
        description: "Share stories, personality details and traits so the AI sounds like them.",
        icon: Brain,
        iconClass: "bg-gradient-to-br from-violet-500 to-indigo-500",
        complete: flags.memoriesAdded,
        action: () => router.push(`/grief-support/voice/${id}/memories`),
        cta: flags.memoriesAdded ? "View memories" : "Add memories",
        status: `${status?.memory_count ?? 0} memories, ${status?.trait_count ?? 0} traits`
      },
      {
        id: 3,
        title: "Configure Chat Settings",
        description: "Control who can access the AI voice and manage conversation preferences.",
        icon: Settings,
        iconClass: "bg-gradient-to-br from-sky-500 to-cyan-500",
        complete: settings.is_enabled ?? false,
        action: () => router.push(`/grief-support/voice/${id}/settings`),
        cta: "Manage settings",
        status: settings.is_enabled ? `Enabled · ${accessLabel}` : "Disabled"
      },
      {
        id: 4,
        title: "Start Talking",
        description: "Have a gentle conversation and listen to their voice anytime you need comfort.",
        icon: MessageCircle,
        iconClass: "bg-gradient-to-br from-emerald-500 to-teal-500",
        complete: flags.chatEnabled,
        disabled: !flags.setupComplete,
        action: () => router.push(`/grief-support/voice/${id}/chat`),
        cta: "Open voice chat",
        status: flags.chatEnabled
          ? `${status?.stats?.total_conversations ?? 0} conversations saved`
          : flags.setupComplete
          ? `Ready for ${accessLabel.toLowerCase()}`
          : "Complete earlier steps first"
      }
    ];
  }, [flags, settings, status, id, router]);

  const completedSteps = steps.filter((step) => step.complete).length;
  const progress = steps.length ? Math.round((completedSteps / steps.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => router.push("/grief-support/voice")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Voice Hub</span>
          </motion.button>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-100 bg-blue-50 text-blue-600 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            AI Voice Memorial
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-3xl space-y-3"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Guided setup for {status?.tribute?.name || "your loved one"}
            </h1>
            <p className="text-slate-600 leading-relaxed">
              Complete each step to recreate their voice, capture treasured memories, and decide who can access
              the memorial. Everything saves automatically, so you can pause and return anytime.
            </p>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="inline-block w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-600">Loading voice memorial details…</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-10 text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-slate-900">Unable to load this voice memorial</h2>
              <p className="text-slate-600 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => router.push("/grief-support/voice")}
                className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Return to voice memorial hub
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6"
              >
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                        Setup Progress
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-bold text-slate-900">{progress}</span>
                        <span className="text-lg font-semibold text-slate-500">%</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {completedSteps} of {steps.length} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Voice status</p>
                        <p className="text-lg font-semibold text-slate-900 capitalize">
                          {status?.voice_status?.replace("_", " ") ?? "Not started"}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mt-3">
                      {flags.voiceReady
                        ? "Their voice is ready. You can start a conversation whenever you're ready."
                        : flags.voiceProcessing
                        ? "We’re processing the uploaded voice sample. This usually takes a few minutes."
                        : "Upload a clear voice clip so we can recreate their voice."}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Memories & traits</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {status?.memory_count ?? 0} memories · {status?.trait_count ?? 0} traits
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mt-3">
                      Detailed stories and personality notes help the AI respond with Jacky’s warmth and tone.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Setup checklist</h2>
                    <p className="text-slate-600 mt-1">
                      Work through each task. We’ll unlock the voice chat once the essentials are done.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl border p-5 md:p-6 transition-colors ${
                          step.complete
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-slate-200 bg-white hover:border-blue-200"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${step.iconClass}`}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                                {step.complete && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide">
                                    <CheckCircle className="w-4 h-4" />
                                    Completed
                                  </span>
                                )}
                                {!step.complete && step.inProgress && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold uppercase tracking-wide">
                                    Processing
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                              <p className="text-sm font-medium text-slate-700">
                                Status: <span className="text-slate-900">{step.status}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={step.action}
                            disabled={step.disabled}
                            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-colors ${
                              step.disabled
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : step.complete
                                ? "border border-blue-200 text-blue-600 bg-white hover:bg-blue-50"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md"
                            }`}
                          >
                            {step.complete ? "Review" : step.cta}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-start gap-5"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">Tips for a meaningful memorial</h3>
                  <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                    <li>Choose the clearest voice recording you have—even phone audio works if background noise is low.</li>
                    <li>Describe Jacky’s phrases, routines, and values in detail so the AI mirrors his personality.</li>
                    <li>Toggle access in settings when you feel ready to let family members hear the memorial.</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

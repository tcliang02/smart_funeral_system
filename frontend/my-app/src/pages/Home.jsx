'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "../AuthContext";
import {
  Calendar, Flower2, Radio, CreditCard, MapPin, Mic,
  MessageSquare, Heart, Users, UserCheck, Building2,
  ArrowRight, Star, Shield, Clock, Play, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/shadcn/card";
import { Badge } from "../components/ui/shadcn/badge";

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role?.toLowerCase();
      if (userRole === "provider" || userRole === "service_provider") {
        router.replace("/service-provider-dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <main className="min-h-screen bg-transparent font-sans text-slate-900 relative selection:bg-blue-100">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 z-10 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-bg.jpg"
            alt="Hero background"
            fill
            priority
            className="object-cover"
            quality={90}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="container relative mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium bg-white/90 backdrop-blur-sm border-white/30 text-slate-700 rounded-full shadow-lg">
                ✨ The Future of Funeral Services
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-lg"
            >
              Honoring Lives with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                Compassion & Dignity
              </span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
            >
              A comprehensive platform connecting families, attendees, and service providers.
              Create lasting memorials, manage services, and find support during difficult times.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all bg-slate-900 text-white hover:bg-slate-800">
                  Get Started
                </Button>
              </Link>
              <Link href="/tribute">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all text-slate-900 border-slate-200">
                  Find a Memorial
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={fadeIn}
              className="pt-12 flex items-center justify-center gap-8 text-white/90"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-300" />
                <span className="text-sm font-medium drop-shadow-md">Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-300" />
                <span className="text-sm font-medium drop-shadow-md">Compassionate Care</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-300" />
                <span className="text-sm font-medium drop-shadow-md">24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 bg-white/60 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Everything You Need</h2>
              <p className="text-lg text-slate-600">
                Our platform provides comprehensive tools for every step of the journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Large Card */}
              <motion.div variants={fadeIn} className="md:col-span-2 row-span-2">
                <Card className="h-full bg-gradient-to-br from-blue-50 to-white border-blue-100 overflow-hidden group shadow-sm hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Flower2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Digital Memorials</CardTitle>
                    <CardDescription className="text-base">
                      Create beautiful, lasting tribute pages with photos, stories, and condolences.
                      Share memories that will last forever in a dedicated digital space.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative h-64 mt-4 overflow-hidden">
                    {/* High-Fidelity Memorial Mockup */}
                    <div className="absolute inset-x-8 top-0 bottom-0 bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] border border-slate-200/80 p-6 space-y-4 translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                      {/* Memorial Header */}
                      <div className="flex flex-col items-center space-y-3 pt-2">
                        {/* Portrait Photo */}
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center">
                              <Heart className="w-10 h-10 text-rose-400 fill-rose-300" />
                            </div>
                          </div>
                          {/* Memorial Badge */}
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-400" />
                          </div>
                        </div>
                        
                        {/* "In Loving Memory" Text */}
                        <div className="text-center space-y-1">
                          <h3 className="text-lg font-serif font-semibold text-slate-800 tracking-wide">
                            In Loving Memory
                          </h3>
                          <p className="text-sm font-medium text-slate-600">
                            Forever in Our Hearts
                          </p>
                        </div>
                      </div>

                      {/* Memory Photos Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="aspect-square bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg border-2 border-blue-100 shadow-sm flex items-center justify-center">
                          <Flower2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="aspect-square bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg border-2 border-purple-100 shadow-sm flex items-center justify-center">
                          <Heart className="w-6 h-6 text-purple-600 fill-purple-400" />
                        </div>
                        <div className="aspect-square bg-gradient-to-br from-rose-200 to-rose-300 rounded-lg border-2 border-rose-100 shadow-sm flex items-center justify-center">
                          <Star className="w-6 h-6 text-rose-600 fill-rose-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Small Cards */}
              <motion.div variants={fadeIn}>
                <Card className="h-full hover:shadow-md transition-shadow border-slate-200 bg-white/80 backdrop-blur-sm group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Mic className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Play className="w-4 h-4 text-indigo-600 ml-0.5" />
                      </div>
                    </div>
                    <CardTitle>AI Voice Memorial</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Preserve their stories forever with gentle, AI-powered voice tributes that honor their memory with warmth and care.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card className="h-full hover:shadow-md transition-shadow border-slate-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center mb-3">
                      <Radio className="w-5 h-5 text-rose-600" />
                    </div>
                    <CardTitle>Live Streaming</CardTitle>
                    <CardDescription>
                      Connect with loved ones remotely through high-quality service broadcasts.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Medium Cards Row */}
              <motion.div variants={fadeIn}>
                <Card className="h-full hover:shadow-md transition-shadow border-slate-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <CardTitle>Easy Scheduling</CardTitle>
                    <CardDescription>
                      Plan and manage funeral services across multiple locations with ease.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn} className="md:col-span-2">
                <Card className="h-full bg-slate-900 text-white border-slate-800 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <CardTitle className="text-white">AI Support Assistant</CardTitle>
                    </div>
                    <CardDescription className="text-slate-300">
                      Get instant answers, guidance on funeral etiquette, and grief support resources 24/7 through our advanced AI chatbot.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Types / Navigation */}
      <section className="py-24 bg-slate-50/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Who We Serve</h2>
              <p className="mt-4 text-lg text-slate-600">
                Tailored experiences for every role in the journey.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "For Families",
                  desc: "Create memorial pages, manage service details, and receive support.",
                  link: "/register",
                  action: "Create Account",
                  color: "text-blue-600",
                  bg: "bg-blue-50"
                },
                {
                  icon: UserCheck,
                  title: "For Attendees",
                  desc: "View memorials, leave condolences, and find service locations.",
                  link: "/tribute",
                  action: "Browse Memorials",
                  color: "text-purple-600",
                  bg: "bg-purple-50"
                },
                {
                  icon: Building2,
                  title: "For Providers",
                  desc: "Manage locations, schedule services, and streamline operations.",
                  link: "/service-provider",
                  action: "Provider Access",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50"
                }
              ].map((item, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white">
                    <CardHeader>
                      <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-4`}>
                        <item.icon className={`w-7 h-7 ${item.color}`} />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed text-slate-700 font-medium">
                        {item.desc}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={item.link}>
                        <Button variant="ghost" className="group p-0 hover:bg-transparent hover:text-blue-600 font-semibold text-slate-900">
                          {item.action}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { number: "500+", label: "Families Served", icon: Users },
              { number: "1,200+", label: "Memorials Created", icon: Flower2 },
              { number: "50+", label: "Service Providers", icon: Building2 },
              { number: "24/7", label: "Support Available", icon: Clock }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
              <p className="text-lg text-slate-600">
                Simple steps to honor and remember your loved ones
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Create an Account",
                  description: "Sign up as a family member, attendee, or service provider to get started.",
                  icon: UserCheck
                },
                {
                  step: "02",
                  title: "Choose Your Services",
                  description: "Browse providers, select packages, and schedule services that fit your needs.",
                  icon: Calendar
                },
                {
                  step: "03",
                  title: "Honor & Remember",
                  description: "Create beautiful memorials, share memories, and connect with loved ones.",
                  icon: Heart
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="relative"
                >
                  <Card className="h-full border-slate-200 bg-white hover:shadow-lg transition-all">
                    <CardHeader className="text-center">
                      <div className="text-6xl font-bold text-blue-100 mb-4">
                        {item.step}
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <item.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription className="text-base mt-2">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl"
          >
            {/* Background Image */}
            <div className="absolute inset-0 -z-10">
              <Image
                src="/images/beginjourneyherobg.png"
                alt="Begin Your Journey Background"
                fill
                className="object-cover"
                quality={90}
                priority
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
                Begin Your Journey
              </h2>
              <p className="text-lg text-white/90 drop-shadow-md">
                Whether you're planning ahead, honoring a loved one, or providing services,
                we're here to support you every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <button className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 rounded-full font-semibold shadow-lg transition-all transform hover:scale-105">
                    Get Started Now
                  </button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-white text-black hover:text-slate-900 hover:bg-white rounded-full bg-white/90 backdrop-blur-sm transition-all transform hover:scale-105">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
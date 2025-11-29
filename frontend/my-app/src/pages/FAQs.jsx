'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  Users, 
  Building2, 
  UserCheck, 
  Heart, 
  CreditCard, 
  Calendar,
  Flower2,
  Mic,
  MessageSquare,
  Shield,
  HelpCircle
} from "lucide-react";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      title: "General Questions",
      icon: HelpCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      faqs: [
        {
          question: "What is ZENLINK?",
          answer: "ZENLINK is a comprehensive digital platform that connects families, funeral attendees, and service providers. We offer memorial page creation, service booking, live streaming, AI-powered grief support, voice memorials, and much more—all in one place to help you honor your loved ones with dignity and ease."
        },
        {
          question: "Who can use this platform?",
          answer: "Our platform serves three user groups: (1) Family Members who can create memorials, book services, and manage tributes; (2) Funeral Attendees who can view memorials, leave condolences, and access grief resources as guests; (3) Service Providers who can list their services, manage bookings, and coordinate with families."
        },
        {
          question: "Is the platform free to use?",
          answer: "Browsing memorials and viewing tribute pages is completely free for everyone. Family members can create basic memorial pages at no cost. Premium features like AI voice memorials, extended grief counseling, and advanced service bookings may require payment. Service providers pay a subscription fee to list their services."
        },
        {
          question: "How do I get started?",
          answer: "For families and service providers, click 'Register' and choose your account type. Funeral attendees don't need to register—simply visit the login page and click 'Continue as Guest' to browse memorials and leave condolences."
        }
      ]
    },
    {
      title: "For Families",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      faqs: [
        {
          question: "How do I create a memorial page?",
          answer: "After registering as a Family Member and logging in, navigate to 'Tributes' → 'Create New Tribute'. Fill in your loved one's details, upload photos, write their story, and customize the page. You can add photos, biographical information, service details, and enable features like condolence messages and RSVP."
        },
        {
          question: "Can I edit a memorial page after creating it?",
          answer: "Yes! You have full control over your memorial pages. Click on the memorial, then select 'Edit Tribute' to update information, add more photos, change privacy settings, or modify service details anytime."
        },
        {
          question: "How do I book funeral services?",
          answer: "Go to 'Order Services', browse available service providers by location and services offered. View their packages, check availability on their calendar, select your preferred date and time, customize with add-ons, and proceed to checkout. You'll receive instant confirmation."
        },
        {
          question: "What is the AI Voice Memorial feature?",
          answer: "Our AI Voice Memorial allows you to preserve your loved one's voice and personality. Upload voice samples, add memories and stories, then engage in comforting conversations with an AI that speaks in their voice. It's a unique way to keep their presence alive during the grieving process. Access this feature under 'Grief Support' → 'Voice Memorials'."
        },
        {
          question: "How do I manage RSVPs for a funeral service?",
          answer: "When creating or editing a memorial, enable the RSVP feature. Attendees can then RSVP directly from the tribute page. You can view all RSVPs, attendee names, and guest counts by going to your memorial page and clicking 'View RSVP List'."
        },
        {
          question: "Can I accept donations through memorial pages?",
          answer: "Yes! When creating a memorial, you can enable the donation feature and set up payment details. Visitors can make secure donations directly through the memorial page. You'll receive notifications of all donations received."
        }
      ]
    },
    {
      title: "For Funeral Attendees",
      icon: UserCheck,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      faqs: [
        {
          question: "Do I need to register to view memorials?",
          answer: "No registration required! You can browse memorials, view tribute pages, leave condolence messages, and RSVP to services as a guest. Simply go to the login page and click 'Continue as Guest to View Tributes'."
        },
        {
          question: "How do I find a specific memorial page?",
          answer: "Visit the 'Tributes' section and use the search bar to find memorials by name, location, or date. You can also browse recent memorials or filter by various criteria."
        },
        {
          question: "Can I leave a condolence message?",
          answer: "Absolutely! Visit any memorial page and scroll to the 'Messages & Tributes' section. Enter your name, message, and optionally upload a photo or memory to share. Your heartfelt message will be displayed on the memorial page for the family to read."
        },
        {
          question: "How do I RSVP to a funeral service?",
          answer: "On the memorial page, if RSVP is enabled, you'll see an 'RSVP' button or section. Click it, enter your name, number of guests attending, and any special notes. The family will receive your RSVP confirmation."
        },
        {
          question: "Can I make a donation to a memorial?",
          answer: "Yes, if the family has enabled donations on the memorial page, you'll see a 'Make a Donation' button. Click it to proceed with a secure payment. You can choose the donation amount and add a message of support."
        }
      ]
    },
    {
      title: "For Service Providers",
      icon: Building2,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      faqs: [
        {
          question: "How do I register as a service provider?",
          answer: "Click 'Register' and select 'Service Provider'. Fill in your business details including business name, location, contact information, services offered, and working hours. After registration, you'll access your provider dashboard to manage packages, availability, and bookings."
        },
        {
          question: "How do I create service packages?",
          answer: "From your Service Provider Dashboard, go to 'Manage Packages'. Click 'Add New Package', enter package details (name, description, price, services included), upload photos, and save. You can create multiple packages at different price points."
        },
        {
          question: "How do I manage my availability calendar?",
          answer: "In your dashboard, access 'Manage Availability'. Set your working hours, block unavailable dates, mark special dates, and set service duration. Families can only book dates you've marked as available."
        },
        {
          question: "What are add-ons and how do I create them?",
          answer: "Add-ons are optional services families can purchase in addition to packages (e.g., flower arrangements, catering, memorial books). Go to 'Manage Add-ons' in your dashboard, click 'Add New Add-on', specify the name, description, price, and category. Families will see these options during checkout."
        },
        {
          question: "How do I receive and manage bookings?",
          answer: "All bookings appear in your 'Provider Bookings' dashboard. You'll see booking details, customer information, selected packages, add-ons, dates, and payment status. You can confirm bookings, communicate with families, and update booking status."
        },
        {
          question: "How do payments work?",
          answer: "When families book your services, payments are processed securely through our platform. You'll receive payment confirmations and can track all transactions in your dashboard. Payment settlements are processed according to our provider agreement terms."
        },
        {
          question: "Can customers rate my services?",
          answer: "Yes, after a service is completed, families can leave ratings and reviews. You can view all your ratings in 'Provider Ratings'. Positive reviews help build trust and attract more customers."
        }
      ]
    },
    {
      title: "AI Grief Support",
      icon: Heart,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      faqs: [
        {
          question: "What is the AI Grief Counselor?",
          answer: "Our AI Grief Counselor is a compassionate chatbot trained to provide emotional support during difficult times. It's available 24/7 to listen, offer coping strategies, provide resources, and help you process your grief. Access it under 'Grief Support' → 'Chat with Counselor'."
        },
        {
          question: "Is the AI counselor a replacement for professional therapy?",
          answer: "No. While our AI provides supportive conversation and resources, it's not a substitute for professional mental health care. If you're experiencing severe grief, depression, or crisis, we strongly recommend contacting a licensed therapist or crisis hotline. Our platform provides crisis resources for Malaysia (Befrienders, TBAN)."
        },
        {
          question: "How does the AI Voice Memorial work?",
          answer: "Upload 3-5 voice samples of your loved one (total 10+ minutes). Our AI analyzes their voice patterns, speech style, and personality. You can then have conversations where the AI responds in their voice, sharing memories and providing comfort. It's like having one more conversation with them."
        },
        {
          question: "Is my conversation with the AI private?",
          answer: "Yes! All conversations are encrypted and saved only for your current session. We don't store long-term conversation history in our database. Your privacy and emotional safety are our priorities."
        },
        {
          question: "What Buddhist grief resources are available?",
          answer: "We offer Buddhist-specific grief support including meditation guides, breathing exercises, connections to Malaysian Buddhist centers, teachings on impermanence (Anicca), loving-kindness (Metta), and merit-making (Dana). Access these under 'Grief Support' → 'Resources'."
        }
      ]
    },
    {
      title: "Features & Services",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      faqs: [
        {
          question: "What is live streaming for funerals?",
          answer: "Live streaming allows remote attendees to participate in funeral services virtually. Family members can enable live streaming when booking services. A unique link is generated that can be shared with relatives and friends worldwide who cannot attend in person."
        },
        {
          question: "How do I use the meditation and breathing exercises?",
          answer: "Visit 'Grief Support' → 'Meditation & Calm'. You'll find guided breathing exercises with a beautiful lotus-inspired animation. Follow the visual prompts for a 4-4-6 breathing pattern (inhale 4 seconds, hold 4 seconds, exhale 6 seconds) to help manage anxiety and find peace."
        },
        {
          question: "Can I create multiple memorial pages?",
          answer: "Yes, family members can create multiple memorial pages for different loved ones. Each memorial is managed independently with its own settings, photos, messages, and features."
        },
        {
          question: "How do I share a memorial page?",
          answer: "Every memorial page has a unique URL that you can share via social media, email, or messaging apps. There's a 'Share' button on each memorial page that provides easy sharing options."
        },
        {
          question: "What photo formats are supported?",
          answer: "We accept JPEG, PNG, GIF, and WebP formats. Photos should be under 5MB each for optimal loading. You can upload multiple photos to create beautiful photo galleries on memorial pages."
        }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      faqs: [
        {
          question: "How is my personal information protected?",
          answer: "We use industry-standard encryption (SSL/TLS) for all data transmission. Passwords are securely hashed, and we never store payment card details directly. Our servers are protected with multiple security layers, and we comply with data protection regulations."
        },
        {
          question: "Can I control who sees my memorial page?",
          answer: "Yes! When creating a memorial, you can set privacy levels: Public (anyone can view), Private (only people with the link), or Restricted (requires approval to view). You can change these settings anytime."
        },
        {
          question: "How long will memorial pages remain online?",
          answer: "Memorial pages remain online indefinitely as lasting tributes. We're committed to preserving these memories for future generations. If you ever need to remove a memorial, you can do so from your account dashboard."
        },
        {
          question: "What happens to my data if I delete my account?",
          answer: "If you delete your account, all personal information is permanently removed. However, memorial pages you created may remain online (as they honor deceased loved ones) unless you specifically request their removal before account deletion."
        },
        {
          question: "Do you share my data with third parties?",
          answer: "We never sell your personal data. We only share necessary information with payment processors for transactions and service providers you book (so they can fulfill services). All third parties are bound by strict confidentiality agreements."
        }
      ]
    },
    {
      title: "Payments & Billing",
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards (Visa, Mastercard), debit cards, and online banking transfers. All payments are processed through secure, PCI-compliant payment gateways to protect your financial information."
        },
        {
          question: "Can I get a refund if I cancel a booking?",
          answer: "Refund policies depend on the service provider and timing of cancellation. Generally, cancellations made 7+ days before the service date are eligible for full refunds. Check the specific provider's cancellation policy before booking."
        },
        {
          question: "How do I track my payments and orders?",
          answer: "All your orders and payment history are available in your account dashboard under 'Orders'. You can view order details, payment status, receipts, and upcoming services."
        },
        {
          question: "Are donations secure?",
          answer: "Yes! All donation transactions are encrypted and processed through secure payment gateways. Donors receive email confirmations, and families can track all donations received through their dashboard."
        },
        {
          question: "Is there a service fee for booking?",
          answer: "Service prices are set by providers and include all platform fees. The price you see is the final price you pay—no hidden charges. Families only pay for the packages and add-ons they select."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: MessageSquare,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      faqs: [
        {
          question: "I'm having trouble logging in. What should I do?",
          answer: "First, verify you're using the correct username and password. If you forgot your password, use the 'Forgot Password' link on the login page. If issues persist, ensure your browser cookies are enabled and try clearing your browser cache. Contact our support team if problems continue."
        },
        {
          question: "The website isn't loading properly. How can I fix this?",
          answer: "Try these steps: (1) Refresh the page (Ctrl+R or Cmd+R), (2) Clear your browser cache and cookies, (3) Try a different browser (Chrome, Firefox, Safari), (4) Check your internet connection, (5) Disable browser extensions temporarily. If issues persist, contact support with details about your browser and device."
        },
        {
          question: "How do I upload voice samples for AI Voice Memorial?",
          answer: "Go to 'Grief Support' → 'Voice Memorials' → Select your tribute → 'Upload Voice Samples'. You can upload MP3, WAV, or M4A files. We recommend 3-5 recordings of at least 2 minutes each for best AI training results. The recordings should capture natural conversation or storytelling."
        },
        {
          question: "Can I use the platform on my mobile phone?",
          answer: "Absolutely! Our platform is fully responsive and works on smartphones, tablets, and desktop computers. You can access all features from any device with a modern web browser and internet connection."
        },
        {
          question: "How do I contact customer support?",
          answer: "Visit the 'Contact' page to send us a message directly. You can also email support@zenlink.com (example). For urgent issues, service providers have priority support through their dashboard. We aim to respond within 24 hours."
        },
        {
          question: "Is there a user guide or tutorial?",
          answer: "Yes! Each major feature has built-in tooltips and help buttons. For comprehensive guides, visit our Help Center (accessible from the footer). We also have video tutorials for complex features like AI Voice Memorial setup and service booking."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-geist py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our ZENLINK platform. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Category Header */}
                <div className={`${category.bgColor} px-6 py-4 border-b border-gray-200`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <IconComponent className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {category.title}
                    </h2>
                    <span className="ml-auto text-sm text-gray-500">
                      {category.faqs.length} questions
                    </span>
                  </div>
                </div>

                {/* Category FAQs */}
                <div className="divide-y divide-gray-100">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = `${categoryIndex}-${faqIndex}`;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div key={faqIndex} className="bg-white">
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isOpen 
                                  ? `${category.bgColor} ${category.color}` 
                                  : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                              }`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-medium ${isOpen ? category.color : 'text-gray-900'} transition-colors`}>
                              {faq.question}
                            </h3>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-4 pl-16">
                                <p className="text-gray-600 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Still Have Questions? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-gradient-to-br from-primary/5 via-purple-50 to-pink-50 rounded-2xl p-8 text-center border border-primary/10"
        >
          <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our support team is here to help. Reach out to us and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Support
            </a>
            <a
              href="/grief-support/chat"
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Chat with AI Counselor
            </a>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <motion.a
            href="/register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
          >
            <Users className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1">Get Started</h3>
            <p className="text-sm text-gray-600">Create your account today</p>
          </motion.a>

          <motion.a
            href="/tribute"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
          >
            <Flower2 className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1">Browse Memorials</h3>
            <p className="text-sm text-gray-600">View tribute pages</p>
          </motion.a>

          <motion.a
            href="/grief-support"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
          >
            <Heart className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1">Grief Support</h3>
            <p className="text-sm text-gray-600">Access AI counseling</p>
          </motion.a>
        </div>
      </div>
    </div>
  );
}

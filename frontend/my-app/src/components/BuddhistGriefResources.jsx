import { motion } from 'framer-motion';
import { Phone, MessageCircle, MapPin, Book, Users, Heart, ExternalLink } from 'lucide-react';

export default function BuddhistGriefResources() {
    const resources = {
        malaysiaSupport: [
            {
                name: "Buddhist Gem Fellowship (BGF)",
                location: "Kuala Lumpur",
                phone: "03-9222 5669",
                services: "Grief counseling, dharma talks, meditation classes",
                website: "http://www.bgf.org.my",
                icon: Users
            },
            {
                name: "Nalanda Buddhist Society",
                location: "Petaling Jaya, Selangor",
                phone: "03-7803 3908",
                services: "Buddhist counseling, meditation, grief support groups",
                website: "http://www.nalanda.org.my",
                icon: Heart
            },
            {
                name: "Ti-Ratana Welfare Society",
                location: "Kelana Jaya, Selangor",
                phone: "03-7880 5009",
                services: "Grief support, dharma classes, community care",
                website: "http://www.tiratana.org.my",
                icon: Users
            },
            {
                name: "Sunlight Meditation Centre",
                location: "Cheras, KL",
                phone: "03-9173 8122",
                services: "Meditation retreats, grief workshops",
                website: "http://www.sunlightmeditation.org",
                icon: Heart
            }
        ],
        crisisHotlines: [
            {
                name: "Befrienders KL",
                number: "03-7627 2929",
                availability: "24/7",
                description: "Free, confidential emotional support",
                type: "call"
            },
            {
                name: "TBAN WhatsApp",
                number: "018-988 8058",
                availability: "Daily 9am-9pm",
                description: "Text-based crisis support",
                type: "whatsapp"
            },
            {
                name: "Talian Kasih",
                number: "15999",
                availability: "24/7",
                description: "Government welfare hotline",
                type: "call"
            }
        ],
        buddhistTeachings: [
            {
                title: "Understanding Impermanence (Anicca)",
                description: "Everything changes - grief reminds us that all things are temporary, including our pain.",
                quote: "All conditioned things are impermanent. When one sees this with wisdom, one turns away from suffering."
            },
            {
                title: "The Nature of Attachment",
                description: "Our grief reflects the depth of our love. Buddhism teaches us to honor this love while gently releasing attachment.",
                quote: "The root of suffering is attachment. But remember - love and attachment are different. Love with an open hand."
            },
            {
                title: "Merit-Making for the Deceased",
                description: "Dedicate good deeds, meditation, and prayers to your loved one's journey. This helps both them and you.",
                quote: "Dana (generosity), Sila (virtue), and Bhavana (meditation) create merit that benefits all beings."
            },
            {
                title: "Metta (Loving-Kindness) for Yourself",
                description: "Be as compassionate to yourself as you would to others. Grief is exhausting - be gentle with yourself.",
                quote: "May I be happy. May I be peaceful. May I be free from suffering."
            }
        ],
        books: [
            {
                title: "The Heart of the Buddha's Teaching",
                author: "Thích Nhất Hạnh",
                description: "Accessible guide to core Buddhist principles including impermanence and suffering"
            },
            {
                title: "When Things Fall Apart",
                author: "Pema Chödrön",
                description: "Buddhist wisdom for difficult times and profound loss"
            },
            {
                title: "No Death, No Fear",
                author: "Thích Nhất Hạnh",
                description: "Buddhist perspective on death, grief, and continuation"
            }
        ]
    };
    
    return (
        <div className="space-y-8">
            {/* Crisis Hotlines - Most Important */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200 shadow-lg"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500 rounded-lg">
                        <Phone className="text-white" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-red-900">Crisis Support - Available Now</h2>
                </div>
                <p className="text-red-800 mb-6">If you're in crisis or need immediate emotional support:</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                    {resources.crisisHotlines.map((hotline, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-red-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-900">{hotline.name}</h3>
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                                    {hotline.availability}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-red-600 mb-2">{hotline.number}</p>
                            <p className="text-sm text-gray-600 mb-3">{hotline.description}</p>
                            {hotline.type === 'call' ? (
                                <a 
                                    href={`tel:${hotline.number.replace(/\s/g, '')}`}
                                    className="inline-block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                                >
                                    Call Now
                                </a>
                            ) : (
                                <a 
                                    href={`https://wa.me/60${hotline.number.replace(/\D/g, '').slice(-9)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                >
                                    WhatsApp
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Buddhist Centers in Malaysia */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <MapPin className="text-amber-600" size={28} />
                    Buddhist Support Centers in Malaysia
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {resources.malaysiaSupport.map((center, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border border-amber-100 hover:shadow-xl transition-all">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl text-white">
                                    <center.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{center.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                                        <MapPin size={14} />
                                        {center.location}
                                    </p>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-amber-600" />
                                            <a href={`tel:${center.phone.replace(/\s/g, '')}`} 
                                               className="text-sm font-semibold text-amber-700 hover:underline">
                                                {center.phone}
                                            </a>
                                        </div>
                                        <p className="text-sm text-gray-700">{center.services}</p>
                                    </div>
                                    <a 
                                        href={center.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-semibold"
                                    >
                                        Visit Website <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Buddhist Teachings on Grief */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Heart className="text-purple-600" size={28} />
                    Buddhist Wisdom for Grief
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {resources.buddhistTeachings.map((teaching, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                            <h3 className="font-bold text-lg text-purple-900 mb-3">{teaching.title}</h3>
                            <p className="text-gray-700 mb-4 leading-relaxed">{teaching.description}</p>
                            <blockquote className="border-l-4 border-purple-400 pl-4 italic text-sm text-purple-800">
                                "{teaching.quote}"
                            </blockquote>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Recommended Books */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Book className="text-blue-600" size={28} />
                    Recommended Reading
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {resources.books.map((book, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all">
                            <Book className="text-blue-600 mb-4" size={32} />
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{book.title}</h3>
                            <p className="text-sm text-blue-600 mb-3">by {book.author}</p>
                            <p className="text-sm text-gray-700">{book.description}</p>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Additional Note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200"
            >
                <p className="text-gray-700 leading-relaxed">
                    <strong className="text-amber-900">Remember:</strong> These resources complement but don't replace 
                    professional mental health care. If you're experiencing severe depression, anxiety, or thoughts of 
                    self-harm, please seek help from a licensed therapist or counselor immediately. 🙏
                </p>
            </motion.div>
        </div>
    );
}

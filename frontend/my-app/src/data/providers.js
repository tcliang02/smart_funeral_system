// src/data/providers.js
export const providers = [
  {
    id: 1,
    name: "Peaceful Rest Funeral Services",
    logo: "/images/logo1.png",
    location: "Kuala Lumpur",
    rating: 4.8,
    reviews: 127,
    workingHours: "24/7 Service Available",
    availableDates: ["2024-12-15", "2024-12-16", "2024-12-17", "2024-12-18", "2024-12-19", "2024-12-20"],
    packages: [
      { 
        name: "Basic Package", 
        price: 2000, 
        capacity: "50 people",
        desc: "Essential funeral arrangements with basic support.",
        features: ["Casket and transportation", "Basic ceremony setup", "Limited flower arrangement", "Basic sound system", "Memorial guest book"]
      },
      { 
        name: "Standard Package", 
        price: 3000, 
        capacity: "100 people",
        desc: "Includes hall rental, flowers, and memorial setup.",
        features: ["Casket and transportation", "Hall rental with chairs & tables", "Flower arrangements and music", "Memorial book for guests", "Professional photography", "Catering for 50 people"]
      },
      { 
        name: "Premium Package", 
        price: 5000, 
        capacity: "200 people",
        desc: "Complete premium service with catering and live streaming.",
        features: ["All features of Standard Package", "Professional catering service", "Live streaming for remote attendees", "Video tribute preparation", "Premium flower arrangements", "Professional videography", "Memorial website creation"]
      }
    ]
  },
  {
    id: 2,
    name: "Harmony Memorial",
    logo: "/images/logo2.png",
    location: "Selangor",
    rating: 4.6,
    reviews: 89,
    workingHours: "8:00 AM - 8:00 PM",
    availableDates: ["2024-12-15", "2024-12-17", "2024-12-19", "2024-12-21", "2024-12-22"],
    packages: [
      { 
        name: "Essential Plan", 
        price: 1800, 
        capacity: "30 people",
        desc: "Casket, cremation/burial, and basic transport.",
        features: ["Casket and transport", "Cremation or burial arrangement", "Basic ceremony setup", "Guest registration"]
      },
      { 
        name: "Comfort Plan", 
        price: 2800, 
        capacity: "75 people",
        desc: "Essential Plan plus wake ceremony and flowers.",
        features: ["All Essential Plan features", "Wake ceremony hall", "Flower arrangements", "Basic catering", "Sound system"]
      },
      { 
        name: "Complete Plan", 
        price: 4200, 
        capacity: "150 people",
        desc: "Full service including catering and memorial videos.",
        features: ["All Comfort Plan features", "Full catering service", "Memorial video creation", "Professional photography", "Premium flowers", "Transportation for family"]
      }
    ]
  },
  {
    id: 3,
    name: "Serenity Funeral Care",
    logo: "/images/logo3.png",
    location: "Penang",
    rating: 4.9,
    reviews: 156,
    workingHours: "24/7 Service Available",
    availableDates: ["2024-12-16", "2024-12-18", "2024-12-20", "2024-12-22", "2024-12-23"],
    packages: [
      { 
        name: "Simple Farewell", 
        price: 2200, 
        capacity: "40 people",
        desc: "Dignified and simple funeral arrangements.",
        features: ["Quality casket", "Transportation services", "Basic memorial setup", "Family support coordinator"]
      },
      { 
        name: "Graceful Tribute", 
        price: 3500, 
        capacity: "80 people",
        desc: "Comprehensive service with personalized touches.",
        features: ["All Simple Farewell features", "Personalized memorial displays", "Musical arrangements", "Refreshment service", "Professional guidance"]
      },
      { 
        name: "Eternal Memory", 
        price: 5500, 
        capacity: "200 people",
        desc: "Premium service with full memorial experience.",
        features: ["All Graceful Tribute features", "Live streaming service", "Memorial website", "Professional videography", "Luxury transportation", "Extended family support"]
      }
    ]
  },
  {
    id: 4,
    name: "Compassionate Care Services",
    logo: "/images/logo4.png",
    location: "Johor",
    rating: 4.4,
    reviews: 73,
    workingHours: "9:00 AM - 6:00 PM",
    availableDates: ["2024-12-15", "2024-12-16", "2024-12-18", "2024-12-20", "2024-12-21"],
    packages: [
      { 
        name: "Budget Package", 
        price: 1500, 
        capacity: "25 people",
        desc: "Affordable funeral arrangements with essential services.",
        features: ["Basic casket", "Transportation", "Simple ceremony", "Documentation assistance"]
      },
      { 
        name: "Value Package", 
        price: 2500, 
        capacity: "60 people",
        desc: "Good value with additional comfort features.",
        features: ["All Budget Package features", "Enhanced casket", "Flower arrangements", "Light refreshments", "Extended ceremony time"]
      },
      { 
        name: "Premium Care", 
        price: 4000, 
        capacity: "120 people",
        desc: "Full service with premium amenities.",
        features: ["All Value Package features", "Premium casket options", "Full catering service", "Photography service", "Memorial keepsakes", "Family liaison service"]
      }
    ]
  }
];

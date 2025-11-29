import { motion } from "framer-motion";

export default function Hero({ title, subtitle, actions, backgroundImage }) {
  return (
    <div className="relative text-white rounded-2xl overflow-hidden font-geist">
      {backgroundImage ? (
        <img 
          src={backgroundImage} 
          alt="Hero background" 
          className="w-full h-[70vh] object-cover transition-transform duration-700 hover:scale-105" 
        />
      ) : (
        <div className="w-full h-[70vh] bg-gradient-to-br from-primary/90 to-indigo-600" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent"></div>

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
          >
            {title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-white/95"
          >
            {subtitle}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex justify-center gap-4"
          >
            {actions}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

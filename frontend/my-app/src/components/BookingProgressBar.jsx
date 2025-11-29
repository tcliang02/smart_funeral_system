import { motion } from "framer-motion";

export default function BookingProgressBar({ currentStep, steps }) {
  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                index < currentStep
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                  : index === currentStep
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white ring-4 ring-indigo-200'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStep ? (
                <span className="text-xl">✓</span>
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>
            <span className={`mt-2 text-xs font-medium transition-colors ${
              index <= currentStep ? 'text-indigo-600' : 'text-gray-500'
            }`}>
              {step}
            </span>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 rounded-full bg-gray-200 relative overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: index < currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

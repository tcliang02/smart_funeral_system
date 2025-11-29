import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, Sparkles } from 'lucide-react';

export default function BreathingMeditation() {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
    const [count, setCount] = useState(4);
    const [cycles, setCycles] = useState(0);
    
    useEffect(() => {
        if (!isActive) return;
        
        const timer = setInterval(() => {
            setCount(prev => {
                if (prev === 1) {
                    // Switch phases
                    if (phase === 'inhale') {
                        setPhase('hold');
                        return 4;
                    } else if (phase === 'hold') {
                        setPhase('exhale');
                        return 6;
                    } else {
                        setPhase('inhale');
                        setCycles(c => c + 1); // Complete one cycle
                        return 4;
                    }
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [isActive, phase]);
    
    const phaseText = {
        inhale: 'Breathe In',
        hold: 'Hold',
        exhale: 'Breathe Out'
    };
    
    const phaseSubtext = {
        inhale: 'Fill your lungs gently',
        hold: 'Find stillness',
        exhale: 'Release tension slowly'
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl shadow-lg p-8 border border-amber-200"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
                    <Sparkles className="text-amber-600" size={18} />
                    <span className="text-sm font-semibold text-amber-800">Buddhist Mindfulness Practice</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Calming Meditation</h2>
                <p className="text-gray-600">Traditional 4-4-6 breathing technique to find inner peace</p>
            </div>
            
            {/* Breathing Animation */}
            <div className="flex flex-col items-center">
                {/* Lotus-inspired animated circle */}
                <div className="relative mb-8">
                    {/* Outer glow rings */}
                    <motion.div
                        animate={{
                            scale: phase === 'inhale' ? [1, 1.2] : phase === 'hold' ? 1.2 : [1.2, 1],
                            opacity: [0.3, 0.1, 0.3]
                        }}
                        transition={{ duration: phase === 'hold' ? 4 : phase === 'exhale' ? 6 : 4 }}
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 blur-xl"
                        style={{ width: '240px', height: '240px', margin: '-24px' }}
                    />
                    
                    {/* Main breathing circle */}
                    <motion.div
                        animate={{
                            scale: phase === 'inhale' ? [1, 1.4] : phase === 'hold' ? 1.4 : [1.4, 1],
                            rotate: phase === 'hold' ? 0 : 360
                        }}
                        transition={{ 
                            scale: { 
                                duration: phase === 'hold' ? 0 : phase === 'exhale' ? 6 : 4,
                                ease: "easeInOut"
                            },
                            rotate: {
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }
                        }}
                        className="relative w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 
                                   flex items-center justify-center shadow-2xl"
                    >
                        {/* Inner light */}
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 to-transparent opacity-50"
                        />
                        
                        {/* Count and phase text */}
                        <div className="relative text-center z-10">
                            <motion.p 
                                key={count}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="text-6xl font-bold text-white drop-shadow-lg"
                            >
                                {count}
                            </motion.p>
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={phase}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-sm uppercase mt-2 font-semibold text-white drop-shadow tracking-wider"
                                >
                                    {phaseText[phase]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
                
                {/* Phase instruction */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={phase}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-600 mb-6 text-center italic"
                    >
                        {phaseSubtext[phase]}
                    </motion.p>
                </AnimatePresence>
                
                {/* Cycles counter */}
                {cycles > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 px-4 py-2 bg-white rounded-full shadow-sm border border-amber-200"
                    >
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold text-amber-600">{cycles}</span> {cycles === 1 ? 'cycle' : 'cycles'} completed 🪷
                        </p>
                    </motion.div>
                )}
                
                {/* Control Button */}
                <button
                    onClick={() => {
                        setIsActive(!isActive);
                        if (!isActive) {
                            setPhase('inhale');
                            setCount(4);
                        }
                    }}
                    className={`px-8 py-4 rounded-xl font-semibold text-white transition-all transform hover:scale-105 
                               shadow-lg flex items-center gap-2 ${
                        isActive 
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    }`}
                >
                    {isActive ? (
                        <>
                            <Pause size={20} />
                            <span>Pause</span>
                        </>
                    ) : (
                        <>
                            <Play size={20} />
                            <span>{cycles > 0 ? 'Resume' : 'Begin Practice'}</span>
                        </>
                    )}
                </button>
                
                {/* Reset button when paused */}
                {!isActive && cycles > 0 && (
                    <button
                        onClick={() => {
                            setCycles(0);
                            setPhase('inhale');
                            setCount(4);
                        }}
                        className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Reset meditation
                    </button>
                )}
                
                {/* Instructions */}
                <div className="mt-8 max-w-md">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Wind size={18} className="text-amber-600" />
                            How This Helps
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            This breathing pattern activates your body's natural relaxation response, 
                            helping to reduce anxiety and bring mindful awareness to the present moment.
                        </p>
                        <p className="text-sm text-amber-800 italic">
                            "Breathing in, I calm my body. Breathing out, I smile." - Thích Nhất Hạnh 🙏
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

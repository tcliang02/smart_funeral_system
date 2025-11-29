import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function VirtualCandle({ onLight, totalCandles = 0 }) {
  const [isLit, setIsLit] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLight = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await onLight({ name, message });
      setIsLit(true);
      setShowForm(false);
      setMessage('');
      setName('');
      
      // Reset after animation
      setTimeout(() => setIsLit(false), 3000);
    } catch (error) {
      console.error('Error lighting candle:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="virtual-candle-container" style={{
      textAlign: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background stars */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent)',
        backgroundSize: '200px 200px'
      }} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', fontWeight: '700' }}>
          🕯️ Light a Virtual Candle
        </h2>
        <p style={{ opacity: 0.9, marginBottom: '30px' }}>
          {totalCandles} candles lit in memory
        </p>

        {/* Animated Candle */}
        <div style={{ margin: '30px auto', position: 'relative', width: '100px', height: '150px' }}>
          <motion.div
            animate={isLit ? {
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            } : {}}
            transition={{ duration: 0.5, repeat: isLit ? Infinity : 0 }}
            style={{
              width: '40px',
              height: '100px',
              background: 'linear-gradient(to bottom, #f5f5dc, #daa520)',
              borderRadius: '20px 20px 5px 5px',
              margin: '0 auto',
              position: 'relative',
              boxShadow: isLit ? '0 0 30px rgba(255, 200, 0, 0.8)' : 'none'
            }}
          >
            {/* Flame */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                y: [0, -5, 0]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '30px',
                height: '40px',
                background: 'radial-gradient(ellipse at center, #fff 0%, #ffeb3b 30%, #ff9800 60%, transparent 100%)',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                filter: 'blur(2px)',
                opacity: isLit ? 1 : 0,
                transition: 'opacity 0.3s'
              }}
            />
            
            {/* Inner flame glow */}
            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '30px',
                background: 'radial-gradient(ellipse at center, #fff 0%, #ffeb3b 50%, transparent 100%)',
                borderRadius: '50%',
                opacity: isLit ? 1 : 0,
                transition: 'opacity 0.3s'
              }}
            />
          </motion.div>
        </div>

        {!showForm ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            style={{
              padding: '15px 40px',
              fontSize: '1.1rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s'
            }}
          >
            🕯️ Light a Candle
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '30px',
              borderRadius: '15px',
              backdropFilter: 'blur(10px)',
              maxWidth: '400px',
              margin: '0 auto'
            }}
          >
            <input
              type="text"
              placeholder="Your Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                color: '#333',
                backgroundColor: 'white'
              }}
            />
            
            <textarea
              placeholder="Optional message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                color: '#333',
                backgroundColor: 'white'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleLight}
                disabled={loading || !name.trim()}
                style={{
                  padding: '12px 30px',
                  background: loading ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                {loading ? 'Lighting...' : '🕯️ Light Candle'}
              </button>
              
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: '12px 30px',
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {isLit && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: '20px',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
          >
            ✨ Thank you for lighting a candle in memory
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

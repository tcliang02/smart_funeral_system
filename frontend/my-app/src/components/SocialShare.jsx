import { motion } from 'framer-motion';
import { useState } from 'react';

export default function SocialShare({ tributeId, deceasedName, url }) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || window.location.href;
  const shareText = `In loving memory of ${deceasedName}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareButtons = [
    {
      name: 'Facebook',
      icon: '📘',
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      gradient: 'linear-gradient(135deg, #1877F2 0%, #1558b0 100%)'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      gradient: 'linear-gradient(135deg, #1DA1F2 0%, #0c85d0 100%)'
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      gradient: 'linear-gradient(135deg, #25D366 0%, #1da851 100%)'
    },
    {
      name: 'Email',
      icon: '✉️',
      color: '#EA4335',
      url: `mailto:?subject=${encodedText}&body=View%20this%20tribute%3A%20${encodedUrl}`,
      gradient: 'linear-gradient(135deg, #EA4335 0%, #c5341d 100%)'
    }
  ];

  return (
    <div style={{
      padding: '30px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '20px',
      marginTop: '30px'
    }}>
      <h3 style={{
        textAlign: 'center',
        fontSize: '1.8rem',
        marginBottom: '10px',
        color: '#333',
        fontWeight: '700'
      }}>
        Share This Tribute
      </h3>
      <p style={{
        textAlign: 'center',
        color: '#666',
        marginBottom: '25px',
        fontSize: '1rem'
      }}>
        Help others pay their respects and honor {deceasedName}'s memory
      </p>

      {/* Social Media Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {shareButtons.map((btn) => (
          <motion.a
            key={btn.name}
            href={btn.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '15px 20px',
              background: btn.gradient,
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{btn.icon}</span>
            <span>{btn.name}</span>
          </motion.a>
        ))}
      </div>

      {/* Copy Link Button */}
      <div style={{
        marginTop: '20px',
        padding: '20px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        <p style={{
          margin: '0 0 10px 0',
          fontSize: '0.9rem',
          color: '#666',
          fontWeight: '600'
        }}>
          Or copy link:
        </p>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'stretch'
        }}>
          <input
            type="text"
            value={shareUrl}
            readOnly
            style={{
              flex: 1,
              padding: '12px 15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '0.95rem',
              color: '#333',
              background: '#f9f9f9'
            }}
            onClick={(e) => e.target.select()}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            style={{
              padding: '12px 25px',
              background: copied ? '#4CAF50' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s'
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </motion.button>
        </div>
      </div>

      {/* QR Code Option */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          marginTop: '20px',
          textAlign: 'center',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '10px',
          border: '2px dashed rgba(0, 0, 0, 0.1)'
        }}
      >
        <p style={{
          margin: 0,
          fontSize: '0.9rem',
          color: '#666'
        }}>
          💡 <strong>Tip:</strong> Share this link at the memorial service so guests can view and contribute to the tribute
        </p>
      </motion.div>
    </div>
  );
}

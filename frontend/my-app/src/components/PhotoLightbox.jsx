import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhotoLightbox({ photos, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos.length]);

  const next = () => {
    setCurrentIndex((i) => (i + 1) % photos.length);
    setIsZoomed(false);
  };

  const prev = () => {
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
    setIsZoomed(false);
  };

  const currentPhoto = photos[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            fontSize: '2rem',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            zIndex: 10001
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          ✕
        </button>

        {/* Counter */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '1.1rem',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '10px 20px',
          borderRadius: '20px',
          zIndex: 10001
        }}>
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            style={{
              position: 'absolute',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '3rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              zIndex: 10001
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ‹
          </button>
        )}

        {/* Image Container */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
          style={{
            maxWidth: '90%',
            maxHeight: '90%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: isZoomed ? 'zoom-out' : 'zoom-in'
          }}
        >
          <img
            src={currentPhoto.photo_url || currentPhoto.url}
            alt={currentPhoto.photo_description || currentPhoto.description || `Photo ${currentIndex + 1}`}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '10px',
              boxShadow: '0 10px 50px rgba(0, 0, 0, 0.5)'
            }}
          />

          {/* Description - Professional Styling */}
          {(currentPhoto.photo_description || currentPhoto.description || currentPhoto.caption) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                marginTop: '24px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                padding: '20px 32px',
                borderRadius: '12px',
                color: 'white',
                maxWidth: '700px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '3px',
                  height: '20px',
                  background: 'linear-gradient(to bottom, #a855f7, #ec4899)',
                  borderRadius: '2px'
                }}></div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '1.1rem', 
                  lineHeight: '1.6',
                  fontWeight: '500',
                  letterSpacing: '0.3px'
                }}>
                  {currentPhoto.photo_description || currentPhoto.description || currentPhoto.caption}
                </p>
              </div>
              {(currentPhoto.uploader_name || currentPhoto.uploader) && (
                <p style={{ 
                  margin: '12px 0 0 0', 
                  fontSize: '0.9rem', 
                  opacity: 0.75,
                  fontStyle: 'italic'
                }}>
                  Uploaded by {currentPhoto.uploader_name || currentPhoto.uploader}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            style={{
              position: 'absolute',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '3rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              zIndex: 10001
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ›
          </button>
        )}

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            maxWidth: '90%',
            overflowX: 'auto',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '10px',
            zIndex: 10001
          }}>
            {photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo.photo_url || photo.url}
                alt={`Thumbnail ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setIsZoomed(false);
                }}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  opacity: idx === currentIndex ? 1 : 0.5,
                  border: idx === currentIndex ? '3px solid white' : '3px solid transparent',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        )}

        {/* Instructions */}
        <div style={{
          position: 'absolute',
          bottom: photos.length > 1 ? '100px' : '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem',
          textAlign: 'center',
          zIndex: 10000
        }}>
          {photos.length > 1 && 'Use ← → arrows or click buttons to navigate • '}
          Click image to zoom • Press ESC to close
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

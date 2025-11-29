'use client';

import { useState } from 'react';
import { migrateAllTributeImages } from '../utils/migrateImagesToSupabase';
import { BACKEND_URL } from '../config';
import './MigrationPage.css';

export default function MigrationPage() {
  const [status, setStatus] = useState('idle'); // idle, running, complete, error
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState(null);

  const startMigration = async () => {
    setStatus('running');
    setProgress([]);
    setError(null);

    try {
      const results = await migrateAllTributeImages(BACKEND_URL);
      setProgress(results);
      setStatus('complete');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="migration-container">
      <div className="migration-card">
        <h1>🚀 Image Migration to Supabase</h1>
        <p className="migration-description">
          This tool will migrate all tribute images from your local storage to Supabase Cloud Storage.
          This is a one-time operation that will make your images accessible from anywhere.
        </p>

        <div className="migration-steps">
          <h3>What this does:</h3>
          <ol>
            <li>Fetches all tributes from database</li>
            <li>Downloads images from localhost via ngrok</li>
            <li>Uploads images to Supabase Storage</li>
            <li>Updates database with new Supabase URLs</li>
          </ol>
        </div>

        <div className="migration-requirements">
          <h3>⚠️ Requirements:</h3>
          <ul>
            <li>✅ Ngrok tunnel must be running</li>
            <li>✅ XAMPP Apache must be running</li>
            <li>✅ Supabase bucket 'tribute-images' must exist</li>
          </ul>
        </div>

        {status === 'idle' && (
          <button 
            className="migration-button start" 
            onClick={startMigration}
          >
            Start Migration
          </button>
        )}

        {status === 'running' && (
          <div className="migration-status running">
            <div className="spinner"></div>
            <p>Migrating images... Please wait</p>
          </div>
        )}

        {status === 'complete' && (
          <div className="migration-status complete">
            <h2>✅ Migration Complete!</h2>
            <p>Successfully migrated {progress.length} images</p>
            <div className="migration-results">
              {progress.map((item, index) => (
                <div key={index} className="migration-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-status">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="migration-status error">
            <h2>❌ Migration Failed</h2>
            <p>{error}</p>
            <button 
              className="migration-button retry" 
              onClick={startMigration}
            >
              Retry Migration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

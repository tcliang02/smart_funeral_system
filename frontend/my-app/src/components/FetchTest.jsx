'use client';

// REACT FETCH TEST - Save as fetch-test.jsx in your src folder
// This shows EXACTLY what's happening in your frontend vs API
import React, { useEffect, useState } from 'react';

export default function FetchTest() {
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const testFetch = async () => {
      try {
        // This is EXACTLY what your TributePage component does
        console.log('🚀 STARTING API TEST')
        const response = await fetch(`${BACKEND_URL}/getTribute.php?id=1`);
        const rawText = await response.text(); // Get raw text first
        
        console.log('📊 RAW API RESPONSE:', rawText);
        
        try {
          // Then parse as JSON
          const data = JSON.parse(rawText);
          console.log('✅ PARSED JSON:', data);
          
          if (data.success && data.tribute) {
            console.log('🔍 TRIBUTE DATA CHECK:');
            console.log('- portrait_photo:', data.tribute.portrait_photo);
            console.log('- bank_account_number:', data.tribute.bank_account_number);
            console.log('- bank_account_name:', data.tribute.bank_account_name);
            console.log('- donation_qr_code:', data.tribute.donation_qr_code);
            console.log('- bank_name:', data.tribute.bank_name);
            setApiData(data);
          } else {
            console.error('❌ API ERROR:', data.message || 'Unknown error');
            setError(data.message || 'Unknown error');
          }
        } catch (jsonError) {
          console.error('❌ JSON PARSE ERROR:', jsonError);
          setError('Failed to parse API response as JSON');
        }
      } catch (fetchError) {
        console.error('❌ FETCH ERROR:', fetchError);
        setError('Failed to fetch API data');
      } finally {
        setLoading(false);
      }
    };
    
    testFetch();
  }, []);
  
  return (
    <div style={{ fontFamily: 'monospace', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>⚙️ Tribute API Test</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', backgroundColor: 'rgba(255,0,0,0.1)' }}>
          <h3>❌ ERROR</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ padding: '10px', border: '1px solid green', backgroundColor: 'rgba(0,255,0,0.1)' }}>
          <h3>✅ SUCCESS</h3>
          <h4>Portrait Photo:</h4>
          <p><code>{apiData.tribute.portrait_photo || 'NULL/MISSING'}</code></p>
          
          <h4>Bank Account Number:</h4>
          <p><code>{apiData.tribute.bank_account_number || 'NULL/MISSING'}</code></p>
          
          <h4>Bank Account Name:</h4>
          <p><code>{apiData.tribute.bank_account_name || 'NULL/MISSING'}</code></p>
          
          <h4>Bank Name:</h4>
          <p><code>{apiData.tribute.bank_name || 'NULL/MISSING'}</code></p>
          
          <h4>QR Code:</h4>
          <p><code>{apiData.tribute.donation_qr_code || 'NULL/MISSING'}</code></p>
          
          {apiData.tribute.portrait_photo && (
            <div>
              <h4>Portrait Image:</h4>
              <img 
                src={`http://localhost/smart_funeral_system/${apiData.tribute.portrait_photo}`}
                alt="Portrait" 
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

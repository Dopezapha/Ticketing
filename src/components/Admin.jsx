import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, List, Key, ChevronLeft, Camera, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase, sendWeddingEmail } from '../lib/supabase';

function Admin({ db, updateDbSettings }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('guests');
  const [newCat, setNewCat] = useState({ name: '', startTable: 1 });
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'wedding2024';
    if (password === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const [scannerError, setScannerError] = useState(null);

  useEffect(() => {
    let scanner = null;
    
    if (activeTab === 'scanner') {
      // Clear any previous error when switching to scanner tab
      setScannerError(null);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.warn("Scanner cleanup:", e));
      }
    };
  }, [activeTab]);

  const startScannerManually = async () => {
    setScannerError(null);
    try {
      // Configuration for the scanner
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        // Request the back camera by default
        videoConstraints: {
          facingMode: "environment"
        }
      };

      const scanner = new Html5QrcodeScanner("reader", config, false);

      scanner.render(async (decodedText) => {
        try {
          const guestData = JSON.parse(decodedText);
          if (guestData.id) {
            await handleCheckIn(guestData.id);
          }
        } catch (err) {
          console.error("Invalid QR Format:", decodedText);
        }
      }, (error) => {
        if (error?.includes("permission") || error?.includes("NotFound")) {
          setScannerError("Camera access denied or not found. Please check your browser permissions.");
        }
      });
    } catch (err) {
      setScannerError("Failed to start scanner. Ensure you are on a secure (HTTPS) connection.");
      console.error("Scanner startup error:", err);
    }
  };

  const handleCheckIn = async (guestId) => {
    if (!supabase) return;
    const { data: guest } = await supabase
      .from('guests')
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq('id', guestId)
      .select().single();

    if (guest) {
      alert(`Guest Checked In: ${guest.name}`);
      await sendWeddingEmail(
        guest.email,
        `Welcome to the Wedding Celebration, ${guest.name}!`,
        `<div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #d4af37; background: #fdfbf7; text-align: center;">
          <h1 style="color: #996515; font-size: 2.5rem; margin-bottom: 20px;">Welcome!</h1>
          <p style="font-size: 1.2rem; color: #2c2c2c;">We are so delighted to have you join us on this special day.</p>
          <div style="margin: 30px 0; padding: 20px; background: white; border: 1px solid #eee;">
            <p style="text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 5px;">Your Assigned Seat</p>
            <p style="font-size: 2rem; color: #d4af37; font-weight: bold; margin: 0;">Table ${guest.table_number}</p>
            <p style="font-size: 1.1rem; color: #666; margin-top: 5px;">Seat ${guest.seat_number}</p>
          </div>
          <p style="color: #666; font-style: italic;">Enjoy the celebration.</p>
        </div>`
      );
    }
  };

  const addCategory = () => {
    if (!newCat.name) return;
    const id = newCat.name.toLowerCase().replace(/\s+/g, '_');
    updateDbSettings({
      ...db.settings,
      categories: [...db.settings.categories, { ...newCat, id }]
    });
    setNewCat({ name: '', startTable: 1 });
  };

  const generateCodes = async () => {
    if (!supabase) return;
    try {
      const newCodes = Array.from({ length: 250 }, () => ({
        code: `WED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        is_used: false
      }));
      const { error } = await supabase.from('invite_codes').insert(newCodes);
      if (error) {
        alert("Failed to generate codes: " + error.message);
      } else {
        alert('250 Codes Generated! Refreshing page...');
        window.location.reload();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ background: 'white', maxWidth: '400px', width: '100%' }}>
          <h2 className="serif" style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Enter Admin Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em' }} />
            </div>
            <button className="btn btn-gold" style={{ width: '100%' }}>Access Dashboard</button>
          </form>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#999', width: '100%', marginTop: '1.5rem', cursor: 'pointer' }}>Back to Site</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-page" style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate('/')} className="btn-outline" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#996515' }}><ChevronLeft /></button>
            <h1 className="serif">Admin Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('guests')} className={`btn ${activeTab === 'guests' ? 'btn-gold' : 'btn-outline'}`}><List size={18} /> Guests</button>
            <button onClick={() => setActiveTab('scanner')} className={`btn ${activeTab === 'scanner' ? 'btn-gold' : 'btn-outline'}`}><Camera size={18} /> Scanner</button>
            <button onClick={() => setActiveTab('analytics')} className={`btn ${activeTab === 'analytics' ? 'btn-gold' : 'btn-outline'}`}><Sparkles size={18} /> Analytics</button>
            <button onClick={() => setActiveTab('settings')} className={`btn ${activeTab === 'settings' ? 'btn-gold' : 'btn-outline'}`}><Settings size={18} /> Settings</button>
            <button onClick={() => setActiveTab('codes')} className={`btn ${activeTab === 'codes' ? 'btn-gold' : 'btn-outline'}`}><Key size={18} /> Codes</button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'scanner' && (
            <motion.div key="scanner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card" style={{ background: 'white', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Entry Scanner</h3>
              
              {scannerError && (
                <div style={{ padding: '1rem', background: '#fff5f5', color: '#c53030', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #feb2b2' }}>
                  {scannerError}
                </div>
              )}

              <div id="reader" style={{ maxWidth: '500px', margin: '0 auto' }}></div>
              
              <div style={{ marginTop: '2rem' }}>
                <button className="btn btn-gold" onClick={startScannerManually}>
                  <Camera size={18} style={{ marginRight: '0.5rem' }} /> Start Camera
                </button>
                <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '1rem' }}>
                  Ensure you are using a secure (HTTPS) connection.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'guests' && (
            <motion.div key="guests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card" style={{ background: 'white' }}>
              <h3>Guest List ({db.guests.length})</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Table</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {db.guests.map(guest => (
                    <tr key={guest.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem' }}>{guest.name}</td>
                      <td style={{ padding: '1rem' }}>T-{guest.table_number}</td>
                      <td style={{ padding: '1rem' }}>{guest.checked_in ? '✅' : '⏳'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card" style={{ background: 'white' }}>
              <h3>Seating Intelligence</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                 <div style={{ padding: '1.5rem', background: '#fdfbf7', border: '1px solid #d4af37', borderRadius: '8px' }}>
                    <p>Arrival Rate</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{Math.round((db.guests.filter(g => g.checked_in).length / (db.guests.length || 1)) * 100)}%</p>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card" style={{ background: 'white' }}>
              <h3>Settings</h3>
              <div style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
                <input placeholder="Name" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} />
                <input type="number" value={newCat.startTable} onChange={e => setNewCat({...newCat, startTable: parseInt(e.target.value)})} style={{ width: '80px' }} />
                <button className="btn btn-gold" onClick={addCategory}><Plus /></button>
              </div>
            </motion.div>
          )}

          {activeTab === 'codes' && (
            <motion.div key="codes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card" style={{ background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>Invite Codes</h3>
                <button className="btn btn-gold" onClick={generateCodes}>Generate 250</button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                {db.inviteCodes.map((c, i) => <div key={i} style={{ fontSize: '0.8rem', color: c.is_used ? '#ccc' : '#d4af37' }}>{c.code}</div>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Admin;

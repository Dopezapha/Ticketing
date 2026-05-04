import React, { useState, useEffect } from 'react';
import { Heart, Lock, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Landing({ db }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(true);
  const navigate = useNavigate();

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    const formattedCode = code.trim().toUpperCase();

    if (supabase) {
      const { data, error: fetchError } = await supabase
        .from('invite_codes')
        .select('*')
        .eq('code', formattedCode)
        .single();

      if (fetchError || !data) {
        setError('Invalid invitation code. Please check and try again.');
      } else if (data.is_used) {
        setError('This code has already been used to register.');
      } else {
        navigate(`/register/${formattedCode}`);
      }
    } else {
      if (db.inviteCodes.includes(formattedCode)) {
        navigate(`/register/${formattedCode}`);
      } else {
        setError('Invalid code (Local Mode).');
      }
    }
    setVerifying(false);
  };

  return (
    <div className="landing-container" style={{ minHeight: '100vh', background: '#fdfbf7', overflow: 'hidden', position: 'relative' }}>
      
      {/* 2026 Background Particles (Gold Dust) */}
      <div className="gold-dust-container">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="dust-particle"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: '#d4af37',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {showEnvelope ? (
          <motion.div 
            key="envelope"
            exit={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1 }}
            style={{ 
              height: '100vh', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 50
            }}
            onClick={() => setShowEnvelope(false)}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ position: 'relative', width: '200px', height: '150px', background: '#f5f1e8', border: '1px solid #d4af37', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                 <div style={{ position: 'absolute', top: 0, width: 0, height: 0, borderLeft: '100px solid transparent', borderRight: '100px solid transparent', borderTop: '75px solid #d4af37', transformOrigin: 'top' }}></div>
                 <Heart size={40} color="#d4af37" fill="#d4af37" style={{ opacity: 0.5 }} />
              </div>
              <p className="serif" style={{ marginTop: '2rem', fontSize: '1.2rem', letterSpacing: '0.3em', color: '#996515', textTransform: 'uppercase' }}>Click to Open</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          >
            <motion.div className="glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px' }}>
                <Sparkles size={40} color="#d4af37" />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', lineHeight: '1.1' }}>The Royal Wedding</h1>
                <p className="serif" style={{ fontStyle: 'italic', color: '#996515', fontSize: '1.4rem' }}>
                  Honoring the union of Amarachi & Kingsley
                </p>
              </div>

              <div className="input-group">
                <label style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 'bold' }}>Invitation Verification</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Enter Private Code" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    style={{ padding: '1.2rem 1.2rem 1.2rem 3.5rem', fontSize: '1.2rem', letterSpacing: '0.15em', background: '#fdfbf7', border: '1px solid #d4af37' }}
                  />
                  <Lock size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#d4af37' }} />
                </div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#d32f2f', fontSize: '0.8rem', marginTop: '0.8rem' }}>{error}</motion.p>}
              </div>

              <button 
                className="btn btn-gold" 
                onClick={handleVerify} 
                style={{ width: '100%', height: '4rem', fontSize: '1.2rem', borderRadius: '0' }}
                disabled={verifying || !code}
              >
                {verifying ? 'Consulting Guest List...' : 'Reveal Invitation'}
              </button>

              <div style={{ marginTop: '2rem' }}>
                <p style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Strictly by Invitation
                </p>
              </div>
            </motion.div>

            {/* AI Assistant Bubble (2026 Trend) */}
            <motion.div 
              whileHover={{ scale: 1.1 }}
              style={{ position: 'fixed', bottom: '2rem', right: '2rem', width: '60px', height: '60px', background: '#d4af37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(212,175,55,0.3)', cursor: 'pointer', zIndex: 100 }}
              onClick={() => alert("Wedding Assistant: 'Hello! I'm Amarachi's AI helper. Ask me about the venue, dress code, or gift registry!'")}
            >
              <MessageSquare size={24} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Landing;

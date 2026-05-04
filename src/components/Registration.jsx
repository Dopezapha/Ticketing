import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Users, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, sendWeddingEmail } from '../lib/supabase';

function Registration({ db }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: db.settings.categories[0].id,
    customCategory: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistering(true);

    try {
      // 1. Calculate Seating
      const categorySettings = db.settings.categories.find(c => c.id === form.category);
      
      let guestsInCategory = 0;
      if (supabase) {
        const { count, error } = await supabase
          .from('guests')
          .select('*', { count: 'exact', head: true })
          .eq('category', form.category);
        if (!error && count !== null) guestsInCategory = count;
      } else {
        guestsInCategory = db.guests.filter(g => g.category === form.category).length;
      }
      
      let tableNumber = categorySettings.startTable;
      let seatNumber = (guestsInCategory % db.settings.seatsPerBlock) + 1;
      const fullBlocksUsed = Math.floor(guestsInCategory / db.settings.seatsPerBlock);
      
      if (fullBlocksUsed > 0) {
        let blocksFound = 0;
        let currentTable = categorySettings.startTable + 1;
        const reservedStartTables = db.settings.categories.map(c => c.startTable);
        while (blocksFound < fullBlocksUsed) {
          if (!reservedStartTables.includes(currentTable) || currentTable === categorySettings.startTable) {
            blocksFound++;
            if (blocksFound === fullBlocksUsed) tableNumber = currentTable;
          }
          currentTable++;
        }
      }

      let finalCategoryName = categorySettings.name;
      if (form.category === 'others' && form.customCategory) {
        let s = form.customCategory.toLowerCase().trim();
        s = s.replace(/[^a-z0-9\s]/g, ''); // Remove punctuation
        s = s.replace(/\bagc\b/g, 'ag');   // Standardize AGC to AG
        s = s.split(/\s+/).sort().join(' '); // Sort words (youth ag -> ag youth)
        
        // Capitalize each word for a clean database entry
        finalCategoryName = s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }

      const guestId = crypto.randomUUID();
      const guestData = {
        id: guestId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        category: form.category,
        category_name: finalCategoryName,
        table_number: tableNumber,
        seat_number: seatNumber
      };

      if (supabase) {
        // 2. Insert Guest
        const { error: guestError } = await supabase.from('guests').insert([guestData]);
        if (guestError) throw guestError;

        // 3. Mark Code as Used
        const { error: codeError } = await supabase
          .from('invite_codes')
          .update({ 
            is_used: true, 
            used_by_email: form.email, 
            used_at: new Date().toISOString(),
            guest_id: guestId
          })
          .eq('code', code.toUpperCase());
        if (codeError) throw codeError;

        // 4. Send Confirmation Email
        await sendWeddingEmail(
          form.email,
          `Registration Confirmed: Wedding of Amarachi & Kingsley`,
          `<div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #d4af37; background: #fdfbf7; text-align: center;">
            <div style="margin-bottom: 30px;">
              <span style="font-size: 3rem; color: #d4af37;">♥</span>
            </div>
            <h1 style="color: #996515; font-size: 2.2rem; margin-bottom: 10px;">Invitation Confirmed</h1>
            <p style="font-size: 1.1rem; color: #2c2c2c; margin-bottom: 30px;">Dear ${form.name}, your presence is requested at our royal celebration.</p>
            
            <div style="background: white; padding: 30px; border: 1px solid #eee; border-radius: 4px; margin-bottom: 30px;">
              <h3 style="text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.8rem; color: #999; margin-bottom: 20px;">Your Seating Arrangement</h3>
              <p style="font-size: 0.7rem; color: #999; margin: 0;">TABLE</p>
              <p style="font-size: 2rem; color: #d4af37; font-weight: bold; margin: 0;">${tableNumber}</p>
              <p style="font-size: 0.7rem; color: #999; margin: 0; margin-top: 10px;">SEAT</p>
              <p style="font-size: 2rem; color: #d4af37; font-weight: bold; margin: 0;">${seatNumber}</p>
              <p style="margin-top: 20px; font-size: 0.9rem; color: #666;">Category: ${categorySettings.name}</p>
            </div>

            <p style="font-size: 1rem; color: #2c2c2c; margin-bottom: 20px;">Please present your digital QR code at the venue entrance for seamless entry.</p>
            
            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
              <p style="font-size: 0.8rem; color: #999;">This invitation is unique to you and cannot be reused.</p>
            </div>
          </div>`
        );
      }

      navigate(`/ticket/${guestId}`);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="registration-page" style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      background: '#fdfbf7'
    }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <button onClick={() => navigate('/')} className="btn-outline" style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', cursor: 'pointer', color: '#996515' }}>
          <ChevronLeft size={16} /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card"
        >
          <div style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
            <p style={{ color: '#d4af37', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Invite Code: {code}</p>
            <h2 style={{ fontSize: '2rem' }}>Guest Registration</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  required
                  type="text" 
                  placeholder="Enter your full name" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  style={{ paddingLeft: '3rem' }}
                />
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  required
                  type="email" 
                  placeholder="your@email.com" 
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  style={{ paddingLeft: '3rem' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
              </div>
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input 
                  required
                  type="tel" 
                  placeholder="+234 ..." 
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  style={{ paddingLeft: '3rem' }}
                />
                <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
              </div>
            </div>

            <div className="input-group">
              <label>Guest Category</label>
              <div style={{ position: 'relative' }}>
                <select 
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  style={{ paddingLeft: '3rem' }}
                >
                  {db.settings.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <Users size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
              </div>
            </div>

            <AnimatePresence>
              {form.category === 'others' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="input-group"
                  style={{ overflow: 'hidden' }}
                >
                  <label>Please Specify Your Category</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Co-workers" 
                      value={form.customCategory}
                      onChange={(e) => setForm({...form, customCategory: e.target.value})}
                      style={{ paddingLeft: '3rem' }}
                    />
                    <Users size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              className="btn btn-gold" 
              style={{ width: '100%', marginTop: '1rem', height: '3.5rem', fontSize: '1.1rem' }}
              disabled={registering}
            >
              {registering ? 'Confirming...' : 'Confirm Attendance'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Registration;

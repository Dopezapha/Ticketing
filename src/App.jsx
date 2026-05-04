import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Registration from './components/Registration';
import Ticket from './components/Ticket';
import Admin from './components/Admin';
import { supabase } from './lib/supabase';
import './index.css';

function App() {
  const [db, setDb] = useState({
    settings: {
      seatsPerBlock: 10,
      categories: [
        { id: 'fgc', name: 'FGC Classmates', startTable: 1 },
        { id: 'chukwudi', name: "Chukwudi's Friends", startTable: 2 },
        { id: 'agc_groom', name: 'AGC Groom', startTable: 3 },
        { id: 'agc_bride', name: 'AGC Bride', startTable: 4 },
        { id: 'vicky', name: "Vicky's Friends", startTable: 5 },
        { id: 'asoebi', name: 'Asoebi', startTable: 6 },
        { id: 'kingsley', name: "Kingsley's Friends", startTable: 7 },
        { id: 'men_suit', name: 'Men on Suit', startTable: 8 },
        { id: 'friends', name: 'Friends and Wellwishers', startTable: 9 },
        { id: 'others', name: 'Others', startTable: 10 }
      ]
    },
    inviteCodes: [],
    guests: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (!supabase) {
        const saved = localStorage.getItem('wedding_ticketing_db');
        if (saved && mounted) setDb(JSON.parse(saved));
        setLoading(false);
        return;
      }

      // Load initial data from Supabase
      const { data: guests } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
      const { data: codes } = await supabase.from('invite_codes').select('*');
      const { data: settings } = await supabase.from('settings').select('*').single();

      if (!mounted) return;

      const defaultSettings = {
        seatsPerBlock: 10,
        categories: [
          { id: 'fgc', name: 'FGC Classmates', startTable: 1 },
          { id: 'chukwudi', name: "Chukwudi's Friends", startTable: 2 },
          { id: 'agc_groom', name: 'AGC Groom', startTable: 3 },
          { id: 'agc_bride', name: 'AGC Bride', startTable: 4 },
          { id: 'vicky', name: "Vicky's Friends", startTable: 5 },
          { id: 'asoebi', name: 'Asoebi', startTable: 6 },
          { id: 'kingsley', name: "Kingsley's Friends", startTable: 7 },
          { id: 'men_suit', name: 'Men on Suit', startTable: 8 },
          { id: 'friends', name: 'Friends and Wellwishers', startTable: 9 },
          { id: 'others', name: 'Others', startTable: 10 }
        ]
      };

      // Force update Supabase to ensure the new categories take effect
      await supabase.from('settings').upsert({ id: 'main', data: defaultSettings });

      setDb({
        settings: defaultSettings,
        inviteCodes: codes || [],
        guests: guests || []
      });
      setLoading(false);

      // Subscribe to Realtime
      const guestsChannel = supabase
        .channel('guests-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, () => refreshGuests())
        .subscribe();

      const codesChannel = supabase
        .channel('codes-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invite_codes' }, () => refreshCodes())
        .subscribe();

      return () => {
        mounted = false;
        supabase.removeChannel(guestsChannel);
        supabase.removeChannel(codesChannel);
      };
    };

    const refreshGuests = async () => {
      const { data } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
      setDb(prev => ({ ...prev, guests: data || [] }));
    };

    const refreshCodes = async () => {
      const { data } = await supabase.from('invite_codes').select('*');
      setDb(prev => ({ ...prev, inviteCodes: data || [] }));
    };

    fetchData();
  }, []);

  const updateDbSettings = async (newSettings) => {
    setDb(prev => ({ ...prev, settings: newSettings }));
    if (supabase) {
      await supabase.from('settings').upsert({ id: 'main', data: newSettings });
    } else {
      localStorage.setItem('wedding_ticketing_db', JSON.stringify({ ...db, settings: newSettings }));
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfbf7' }}>
      <div className="serif" style={{ fontSize: '1.5rem', color: '#d4af37' }}>Preparing the Royal Celebration...</div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing db={db} />} />
        <Route path="/register/:code" element={<Registration db={db} />} />
        <Route path="/ticket/:id" element={<Ticket db={db} />} />
        <Route path="/admin" element={<Admin db={db} updateDbSettings={updateDbSettings} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

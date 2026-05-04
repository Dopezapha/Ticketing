import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, CheckCircle, Share2, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';

function Ticket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuest = async () => {
      if (supabase) {
        const { data: guest } = await supabase
          .from('guests')
          .select('*')
          .eq('id', id)
          .single();
        if (guest) {
          setData({
            id: guest.id,
            name: guest.name,
            table: guest.table_number,
            seat: guest.seat_number,
            categoryName: guest.category_name
          });
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#d4af37', '#fdfbf7', '#996515']
          });
        }
      }
      setLoading(false);
    };

    fetchGuest();
  }, [id]);

  if (loading) return <div>Loading Ticket...</div>;
  if (!data) return <div>Ticket not found.</div>;

  const ticketValue = JSON.stringify({
    id: data.id,
    name: data.name
  });

  return (
    <div className="ticket-page" style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      background: '#fdfbf7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/')} className="btn-outline" style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#996515' }}>
          <ChevronLeft size={16} /> Home
        </button>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ textAlign: 'center', marginBottom: '2rem' }}
      >
        <CheckCircle size={48} color="#4caf50" style={{ marginBottom: '1rem' }} />
        <h2 className="serif" style={{ fontSize: '2.5rem' }}>Registration Successful!</h2>
        <p style={{ color: '#6b6b6b' }}>Your invitation is ready. Please save this ticket.</p>
      </motion.div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="ticket gold-shimmer"
      >
        <div style={{ textAlign: 'center', borderBottom: '1px dashed #d4af37', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 className="serif" style={{ fontSize: '1.5rem', color: '#996515' }}>Official Wedding Entry</h3>
          <p style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.2em', marginTop: '0.5rem' }}>Digital Permit</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase' }}>Guest</p>
          <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>{data.name}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase' }}>Table</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d4af37' }}>{data.table}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: '#999', textTransform: 'uppercase' }}>Seat</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d4af37' }}>{data.seat}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', background: '#fdfbf7', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
          <QRCodeSVG value={ticketValue} size={150} />
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6rem', color: '#999' }}>UNIQUE ID: {data.id}</p>
          <p style={{ fontSize: '0.7rem', color: '#999', fontStyle: 'italic' }}>{data.categoryName}</p>
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button className="btn btn-gold" onClick={() => window.print()}>
          <Download size={18} style={{ marginRight: '0.5rem' }} /> Print Ticket
        </button>
      </div>
    </div>
  );
}

export default Ticket;

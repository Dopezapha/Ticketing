import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const resendKey = import.meta.env.VITE_RESEND_API_KEY;

// Secure initialization: Ensure the URL is valid and not a placeholder
const isConfigured = supabaseUrl && 
                   supabaseUrl.startsWith('http') && 
                   !supabaseUrl.includes('your_supabase_url');

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseKey) : null;

// Email Sending Function (via Resend)
export const sendWeddingEmail = async (to, subject, html, qrData = null) => {
  if (!resendKey || resendKey.includes('your_resend_api_key')) {
    console.log('--- EMAIL MOCK (No Resend Key) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: to,
        subject: subject,
        html: html,
        qrData: qrData
      })
    });
    const result = await response.json();
    if (!response.ok || result.error) {
      console.error('Email API Error:', result);
      alert(`Email Failed to Send: ${result.error?.message || result.message || 'Server error'}`);
    }
    return result;
  } catch (error) {
    console.error('Email failed:', error);
    alert('Email Failed: Network error or Backend unreachable.');
    return { error };
  }
};

export const subscribeToTable = (table, callback) => {
  if (!supabase) return null;
  return supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table: table }, callback)
    .subscribe();
};

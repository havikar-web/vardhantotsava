import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Key,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Server,
  Lock,
  MessageSquare,
  CreditCard,
  CheckCheck
} from 'lucide-react';
import {
  getWhatsAppCredentials,
  saveWhatsAppCredentials,
  WhatsAppCredentials,
  registerPhoneNumberPin,
  fetchMetaPhoneNumberStatus
} from '../../lib/whatsapp';
import {
  getNeonConnectionString,
  setNeonConnectionString,
  checkNeonConnection,
  NeonConnectionStatus
} from '../../lib/db';

export const CredentialsTab: React.FC = () => {
  // WhatsApp Credentials State
  const [waCreds, setWaCreds] = useState<WhatsAppCredentials>(() => getWhatsAppCredentials());
  const [showToken, setShowToken] = useState(false);
  const [waTesting, setWaTesting] = useState(false);
  const [waStatus, setWaStatus] = useState<{ tested: boolean; ok: boolean; message?: string } | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinStatus, setPinStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [metaPhoneDetails, setMetaPhoneDetails] = useState<any>(null);

  // Neon DB Credentials State
  const [neonUrl, setNeonUrl] = useState(() => getNeonConnectionString());
  const [neonTesting, setNeonTesting] = useState(false);
  const [neonStatus, setNeonStatus] = useState<NeonConnectionStatus | null>(null);

  // Razorpay Credentials State
  const [razorpayKeyId, setRazorpayKeyId] = useState(
    () => localStorage.getItem('mantrakshata_razorpay_key_id') || 'rzp_test_TM656gFCGoH0nD'
  );
  const [razorpaySecret, setRazorpaySecret] = useState(
    () => localStorage.getItem('mantrakshata_razorpay_secret') || ''
  );
  const [showRzpSecret, setShowRzpSecret] = useState(false);

  // General Notification
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Test WhatsApp Connection Live via Meta Graph API
  const handleTestWhatsApp = async () => {
    setWaTesting(true);
    setWaStatus(null);
    try {
      const details = await fetchMetaPhoneNumberStatus();
      if (details.ok) {
        setMetaPhoneDetails(details);
        setWaStatus({
          tested: true,
          ok: true,
          message: `${details.verifiedName || 'Havikar'} (${details.displayPhoneNumber || '+91 73537 50705'}) · Quality: ${details.qualityRating || 'GREEN'} · PIN Status: ${details.codeVerificationStatus || 'UNKNOWN'}`
        });
      } else {
        setWaStatus({
          tested: true,
          ok: false,
          message: details.error || 'Meta Cloud API returned an error'
        });
      }
    } catch (e: any) {
      setWaStatus({
        tested: true,
        ok: false,
        message: e?.message || 'Network error reaching Meta API'
      });
    } finally {
      setWaTesting(false);
    }
  };

  // Submit 6-digit Two-Step Verification PIN to Meta /register endpoint
  const handleRegisterPin = async () => {
    const clean = pinInput.replace(/\D/g, '');
    if (clean.length !== 6) {
      setPinStatus({ ok: false, message: 'Please enter the exact 6-digit registration PIN.' });
      return;
    }
    setPinLoading(true);
    setPinStatus(null);
    try {
      const res = await registerPhoneNumberPin(clean);
      if (res.ok) {
        setPinStatus({
          ok: true,
          message: 'Two-step verification PIN registered successfully with Meta! Handset delivery is now enabled.'
        });
        handleTestWhatsApp();
      } else {
        setPinStatus({
          ok: false,
          message: res.error || 'Meta rejected the PIN. Please verify your 6-digit PIN in Meta Business Manager.'
        });
      }
    } catch (e: any) {
      setPinStatus({ ok: false, message: e?.message || 'Error communicating with Meta' });
    } finally {
      setPinLoading(false);
    }
  };

  // Test Neon Cloud Database Connection
  const handleTestNeon = async () => {
    setNeonTesting(true);
    setNeonStatus(null);
    try {
      const res = await checkNeonConnection();
      setNeonStatus(res);
    } catch (e: any) {
      setNeonStatus({ ok: false, error: e?.message || 'Failed to ping Neon database' });
    } finally {
      setNeonTesting(false);
    }
  };

  // Save All Credentials
  const handleSaveAll = () => {
    saveWhatsAppCredentials(waCreds);
    setNeonConnectionString(neonUrl);
    localStorage.setItem('mantrakshata_razorpay_key_id', razorpayKeyId.trim());
    localStorage.setItem('mantrakshata_razorpay_secret', razorpaySecret.trim());

    setSaveNotice('All cloud credentials and integration secrets saved successfully.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gold/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gold-dark" />
            <h2 className="font-serif text-lg font-bold text-charcoal">
              Cloud Credentials & API Integrations
            </h2>
          </div>
          <p className="text-xs text-charcoal/70">
            Configure production credentials for Meta WhatsApp Cloud API, Neon PostgreSQL, and Razorpay payment gateway.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-gold hover:bg-gold-hover text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <Check className="w-4 h-4" />
          <span>Save All Credentials</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* SECTION 1: META WHATSAPP CLOUD API */}
      <div className="bg-white p-6 rounded-2xl border border-gold/30 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gold/15">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-[#25D366]" />
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal">
                Meta WhatsApp Cloud API Configuration
              </h3>
              <span className="text-[11px] text-charcoal/60">
                Direct integration with Meta Graph API v19.0 for templated notifications
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestWhatsApp}
              disabled={waTesting}
              className="px-3 py-1.5 bg-cream hover:bg-gold/15 border border-gold/30 rounded-lg text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {waTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Verify Meta Token</span>
                </>
              )}
            </button>
          </div>
        </div>

        {waStatus && (
          <div
            className={`p-3 rounded-xl border text-xs ${
              waStatus.ok
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                : 'bg-red-50 border-red-300 text-red-950 font-medium'
            }`}
          >
            {waStatus.ok ? (
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Meta API Connection Active: {waStatus.message}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Verification Error: {waStatus.message}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-charcoal/70 font-semibold mb-1">
              WhatsApp Phone Number ID:
            </label>
            <input
              type="text"
              value={waCreds.phoneNumberId}
              onChange={(e) => setWaCreds({ ...waCreds, phoneNumberId: e.target.value.trim() })}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-gold/30 rounded-xl font-mono text-charcoal focus:outline-none focus:border-gold"
            />
            <span className="text-[10px] text-charcoal/50 mt-1 block">
              Sender Number: +91 73537 50705 (Havikar / Mantrakshata)
            </span>
          </div>

          <div>
            <label className="block text-charcoal/70 font-semibold mb-1">
              WhatsApp Business Account ID (WABA ID):
            </label>
            <input
              type="text"
              value={waCreds.wabaId}
              onChange={(e) => setWaCreds({ ...waCreds, wabaId: e.target.value.trim() })}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-gold/30 rounded-xl font-mono text-charcoal focus:outline-none focus:border-gold"
            />
            <span className="text-[10px] text-charcoal/50 mt-1 block">
              Owner Account ID for approved message templates
            </span>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-charcoal/70 font-semibold">
                Permanent System User Access Token:
              </label>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-gold-dark hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {showToken ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Hide Token</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Show Token</span>
                  </>
                )}
              </button>
            </div>
            <input
              type={showToken ? 'text' : 'password'}
              value={waCreds.token}
              onChange={(e) => setWaCreds({ ...waCreds, token: e.target.value.trim() })}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-gold/30 rounded-xl font-mono text-charcoal text-xs focus:outline-none focus:border-gold"
            />
            <span className="text-[10px] text-charcoal/50 mt-1 block">
              Permanent System User Token from Meta Business Suite (Never expires).
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-charcoal/70 font-semibold mb-1">
              Admin Notification Phone Numbers (Comma-separated):
            </label>
            <input
              type="text"
              value={waCreds.adminPhones.join(', ')}
              onChange={(e) =>
                setWaCreds({
                  ...waCreds,
                  adminPhones: e.target.value.split(',').map((p) => p.trim())
                })
              }
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-gold/30 rounded-xl font-mono text-charcoal focus:outline-none focus:border-gold"
            />
            <span className="text-[10px] text-charcoal/50 mt-1 block">
              Chief Acharya and Operations coordinators receiving instant alerts (Currently configured for 919902045009)
            </span>
          </div>
        </div>

        {/* Two-Step Verification PIN Registration Card */}
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-gold/30 space-y-3 mt-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-gold-dark" />
              <strong className="text-xs text-charcoal font-semibold">
                Meta Phone 2-Step Verification Registration PIN
              </strong>
            </div>
            {metaPhoneDetails?.codeVerificationStatus && (
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  metaPhoneDetails.codeVerificationStatus === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                Verification: {metaPhoneDetails.codeVerificationStatus}
              </span>
            )}
          </div>

          <p className="text-[11px] text-charcoal/70 leading-relaxed">
            Meta Cloud API requires registering the 6-digit PIN for phone number +91 73537 50705. When the status is EXPIRED, Meta accepts API template calls (wamid generated) but holds delivery to physical handsets until the 6-digit registration PIN is submitted to Meta.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              maxLength={6}
              placeholder="6-digit PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-36 px-3 py-2 bg-white border border-gold/30 rounded-lg font-mono text-center tracking-widest text-xs focus:outline-none focus:border-gold"
            />
            <button
              onClick={handleRegisterPin}
              disabled={pinLoading || pinInput.length !== 6}
              className="px-4 py-2 bg-gold hover:bg-gold-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
            >
              {pinLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Register PIN with Meta</span>
            </button>
          </div>

          {pinStatus && (
            <div
              className={`p-2.5 rounded-lg text-xs font-medium border ${
                pinStatus.ok ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
              }`}
            >
              {pinStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: NEON POSTGRESQL DATABASE */}
      <div className="bg-white p-6 rounded-2xl border border-gold/30 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gold/15">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-gold-dark" />
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal">
                Neon Serverless PostgreSQL Database
              </h3>
              <span className="text-[11px] text-charcoal/60">
                AWS ap-southeast-1 (Singapore) serverless database with real-time browser queries
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestNeon}
              disabled={neonTesting}
              className="px-3 py-1.5 bg-cream hover:bg-gold/15 border border-gold/30 rounded-lg text-xs font-semibold text-charcoal flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {neonTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Pinging...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Test Neon Connection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {neonStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              neonStatus.ok
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                : 'bg-red-50 border-red-300 text-red-950 font-medium'
            }`}
          >
            {neonStatus.ok ? (
              <>
                <div className="flex items-center gap-2 font-bold">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span>Neon Database Connected Successfully</span>
                </div>
                <p className="font-mono text-[11px] text-emerald-800">
                  {neonStatus.version}
                </p>
                {neonStatus.counts && (
                  <div className="pt-1 flex flex-wrap gap-3 text-[11px] font-semibold text-emerald-900">
                    <span>Ceremony Bookings: {neonStatus.counts.bookings}</span>
                    <span>·</span>
                    <span>Gift Store Orders: {neonStatus.counts.gifts}</span>
                    <span>·</span>
                    <span>WhatsApp Dispatches Logged: {neonStatus.counts.logs}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Connection Failed: {neonStatus.error}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1 text-xs">
          <label className="block text-charcoal/70 font-semibold mb-1">
            PostgreSQL Connection URI (with sslmode=require):
          </label>
          <input
            type="text"
            value={neonUrl}
            onChange={(e) => setNeonUrl(e.target.value.trim())}
            className="w-full px-3 py-2 bg-[#FAF8F5] border border-gold/30 rounded-xl font-mono text-charcoal focus:outline-none focus:border-gold"
          />
          <span className="text-[10px] text-charcoal/50 mt-1 block">
            Used directly by @neondatabase/serverless over HTTPS. Tables: bookings, gift_orders, users, whatsapp_logs.
          </span>
        </div>
      </div>

      {/* SECTION 3: RAZORPAY PAYMENT GATEWAY */}
      <div className="bg-white p-6 rounded-2xl border border-gold/30 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gold/15">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal">
                Razorpay Payment Gateway Credentials
              </h3>
              <span className="text-[11px] text-charcoal/60">
                Checkout modal credentials for ceremony reservations and Havikar store purchases
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full text-[10px] font-bold uppercase">
            Sandbox Test Mode Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-charcoal/70 font-semibold mb-1">
              Razorpay Key ID:
            </label>
            <input
              type="text"
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value.trim())}
              placeholder="rzp_test_... or rzp_live_..."
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-gold/30 rounded-xl font-mono text-charcoal focus:outline-none focus:border-gold"
            />
            <span className="text-[10px] text-charcoal/50 mt-1 block">
              Public Key loaded by checkout.js in the browser
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-charcoal/70 font-semibold">
                Razorpay Key Secret:
              </label>
              <button
                type="button"
                onClick={() => setShowRzpSecret(!showRzpSecret)}
                className="text-gold-dark hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {showRzpSecret ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Hide Secret</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Show Secret</span>
                  </>
                )}
              </button>
            </div>
            <input
              type={showRzpSecret ? 'text' : 'password'}
              value={razorpaySecret}
              onChange={(e) => setRazorpaySecret(e.target.value.trim())}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-gold/30 rounded-xl font-mono text-charcoal focus:outline-none focus:border-gold"
            />
            <span className="text-[10px] text-charcoal/50 mt-1 block">
              Secret for server-side payment signature verification
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

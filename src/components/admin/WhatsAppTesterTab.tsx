import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Check,
  AlertCircle,
  Phone,
  ExternalLink,
  RefreshCw,
  Copy,
  Clock,
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import {
  META_WHATSAPP_TEMPLATES,
  META_APPROVED_SCHEMAS,
  MetaTemplateSpec,
  dispatchMetaCloudTemplate,
  getWhatsAppCredentials,
  getWhatsAppShareLink,
  bold
} from '../../lib/whatsapp';
import { getAllBookings, BookingPlan } from '../../lib/store';
import { fetchWhatsAppLogsFromNeon, logWhatsAppToNeon } from '../../lib/db';

export const WhatsAppTesterTab: React.FC = () => {
  const [testPhone, setTestPhone] = useState('919902045009');
  const [selectedTemplateName, setSelectedTemplateName] = useState('mantrakshata_booking_confirmed');
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [buttonParam, setButtonParam] = useState('BK-108');
  const [dispatching, setDispatching] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; messageId?: string; error?: string; raw?: any } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [bookings] = useState<BookingPlan[]>(() => getAllBookings());

  const selectedTemplate =
    META_WHATSAPP_TEMPLATES.find((t) => t.name === selectedTemplateName) || META_WHATSAPP_TEMPLATES[0];

  // Refresh recent logs from Neon
  const refreshLogs = async () => {
    try {
      const logs = await fetchWhatsAppLogsFromNeon();
      setRecentLogs(logs);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  // Update default parameters whenever template changes
  useEffect(() => {
    if (!selectedTemplate) return;
    const initialParams: Record<string, string> = {};
    selectedTemplate.variables.forEach((v, idx) => {
      const sample = v.sample || '';
      if (selectedTemplate.name === 'hav_otp1') {
        initialParams[String(idx + 1)] = sample;
      } else if (sample.startsWith('http://') || sample.startsWith('https://')) {
        initialParams[String(idx + 1)] = sample;
      } else if (sample.includes('Maps:')) {
        const parts = sample.split(' | Maps: ');
        initialParams[String(idx + 1)] = parts.length === 2 ? `*${parts[0]}* | Maps: ${parts[1]}` : sample;
      } else {
        initialParams[String(idx + 1)] = bold(sample);
      }
    });
    setParamValues(initialParams);

    // If template has dynamic URL button, set default button param
    const schema = META_APPROVED_SCHEMAS[selectedTemplateName];
    const hasDynamicButton = schema
      ? schema.hasDynamicButton
      : (selectedTemplate.buttons?.some((b) => b.type === 'URL' && b.url?.includes('{{1}}')) || false);

    if (hasDynamicButton) {
      setButtonParam('BK-108');
    } else {
      setButtonParam('');
    }
    setResult(null);
  }, [selectedTemplateName]);

  // Autofill variables from a real saved booking
  const handleAutofillFromBooking = (bookingId: string) => {
    const b = bookings.find((item) => item.id === bookingId);
    if (!b || !selectedTemplate) return;

    setButtonParam(b.id);
    const mapsText = b.mapsLink ? ` | Maps: ${b.mapsLink}` : '';
    const fullVenue = `*${b.address}, Bengaluru - ${b.pincode}*${mapsText}`;

    const newParams: Record<string, string> = {};

    selectedTemplate.variables.forEach((v, idx) => {
      const pos = String(idx + 1);
      const name = v.name.toLowerCase();

      if (name.includes('celebrant') || name.includes('host') || (name.includes('name') && !name.includes('package') && !name.includes('pandit') && !name.includes('acharya'))) {
        newParams[pos] = `*${b.name}*`;
      } else if (name.includes('id') || name.includes('booking')) {
        newParams[pos] = `*${b.id}*`;
      } else if (name.includes('date')) {
        newParams[pos] = `*${b.celebrationDate}*`;
      } else if (name.includes('time') || name.includes('muhurta')) {
        newParams[pos] = `*${b.timeSlot}*`;
      } else if (name.includes('star') || name.includes('nakshatra')) {
        newParams[pos] = `*${b.nakshatra || 'Ashwini'} (Pada ${b.pada || 1})*`;
      } else if (name.includes('venue') || name.includes('address')) {
        newParams[pos] = fullVenue;
      } else if (name.includes('package')) {
        newParams[pos] = `*${b.packageName}*`;
      } else if (name.includes('acharya') || name.includes('pandit')) {
        newParams[pos] = '*Vedamurthy Sri Narayan Bhat*';
      } else if (name.includes('phone') || name.includes('contact')) {
        newParams[pos] = '*+91 94481 23456*';
      } else if (name.includes('url') || (v.sample && v.sample.startsWith('http'))) {
        newParams[pos] = v.sample || '';
      } else {
        newParams[pos] = bold(v.sample);
      }
    });

    setParamValues(newParams);
  };

  // Build rendered body preview
  const getRenderedBody = () => {
    if (!selectedTemplate) return '';
    let text = selectedTemplate.body;
    selectedTemplate.variables.forEach((_, idx) => {
      const key = `{{${idx + 1}}}`;
      const val = paramValues[String(idx + 1)] || key;
      text = text.split(key).join(val);
    });
    return text;
  };

  // Handle Meta Cloud API Dispatch
  const handleSendLiveTest = async () => {
    if (!selectedTemplate) return;
    setDispatching(true);
    setResult(null);

    const schema = META_APPROVED_SCHEMAS[selectedTemplate.name];
    const hasDynamicButton = schema
      ? schema.hasDynamicButton
      : (selectedTemplate.buttons?.some((b) => b.type === 'URL' && b.url?.includes('{{1}}')) || false);

    const orderedParams = selectedTemplate.variables.map((_, idx) => paramValues[String(idx + 1)] || '');

    const res = await dispatchMetaCloudTemplate(
      testPhone,
      selectedTemplate.name,
      orderedParams,
      hasDynamicButton ? (buttonParam || undefined) : undefined
    );

    setResult(res);
    setDispatching(false);
    refreshLogs();
  };

  // Direct WhatsApp Web link
  const renderedText = getRenderedBody();
  const directWhatsAppUrl = getWhatsAppShareLink(testPhone, renderedText);

  // Status badge helper
  const getApprovalBadge = (templateName: string) => {
    const schema = META_APPROVED_SCHEMAS[templateName];
    if (schema?.status === 'APPROVED') {
      return (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          Meta Approved
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
        Review Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gold/30 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold-dark" />
            <h2 className="font-serif text-lg font-bold text-charcoal">
              WhatsApp Template Delivery Tester
            </h2>
          </div>
          <span className="text-xs text-charcoal/60">
            Sender Number: <strong>+91 73537 50705</strong> (Verified Havikar / Mantrakshata)
          </span>
        </div>
        <p className="text-xs text-charcoal/70 leading-relaxed">
          Test any registered WhatsApp template by entering a recipient phone number, customizing variables, and dispatching live messages through the Meta WhatsApp Cloud API.
        </p>
      </div>

      {/* Main Tester Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Variable Inputs */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gold/30 shadow-xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block border-b border-gold/15 pb-2">
            Configuration & Template Parameters
          </span>

          {/* Test Phone Number Input */}
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Recipient WhatsApp Mobile Number:
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="e.g. 919845024156 or 9845024156"
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-gold/40 rounded-xl text-xs text-charcoal font-mono font-semibold focus:outline-none focus:border-gold"
              />
            </div>
            <span className="text-[10px] text-charcoal/50 mt-1 block">
              Enter phone with country code (e.g. 919845024156). For 10-digit numbers, 91 is automatically added.
            </span>
          </div>

          {/* Template Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-charcoal">
                Select WhatsApp Template:
              </label>
              {getApprovalBadge(selectedTemplate.name)}
            </div>
            <select
              value={selectedTemplateName}
              onChange={(e) => setSelectedTemplateName(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-gold/40 rounded-xl px-3 py-2 text-xs text-charcoal font-semibold focus:outline-none focus:border-gold"
            >
              {META_WHATSAPP_TEMPLATES.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.category} · {t.language})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-charcoal/60 mt-1 block">
              Purpose: {selectedTemplate.purpose}
            </span>
          </div>

          {/* Autofill from Saved Booking */}
          {bookings.length > 0 && (
            <div className="p-3 bg-cream/40 rounded-xl border border-gold/20 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-charcoal">
                Autofill parameters from real booking:
              </span>
              <select
                onChange={(e) => handleAutofillFromBooking(e.target.value)}
                defaultValue=""
                className="bg-white border border-gold/30 rounded-lg px-2.5 py-1 text-xs text-charcoal font-medium"
              >
                <option value="" disabled>
                  Select a booking...
                </option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.name} ({b.celebrationDate})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dynamic Variable Inputs */}
          {selectedTemplate.variables.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-gold/15">
              <span className="text-[11px] uppercase font-bold text-charcoal/70 block">
                Template Body Variables ({selectedTemplate.variables.length})
              </span>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {selectedTemplate.variables.map((v, idx) => {
                  const key = String(idx + 1);
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-charcoal">
                          {'{{' + key + '}}'} · {v.name}
                        </span>
                        <span className="text-charcoal/50 text-[10px]">{v.description}</span>
                      </div>
                      <input
                        type="text"
                        value={paramValues[key] || ''}
                        onChange={(e) => setParamValues({ ...paramValues, [key]: e.target.value })}
                        placeholder={v.sample || `Value for {{${key}}}`}
                        className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-gold/30 rounded-lg text-xs text-charcoal focus:outline-none focus:border-gold"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Button Parameter if present */}
          {(META_APPROVED_SCHEMAS[selectedTemplate.name]?.hasDynamicButton ?? selectedTemplate.buttons?.some((b) => b.type === 'URL' && b.url?.includes('{{1}}'))) && (
            <div className="pt-2 border-t border-gold/15 space-y-1">
              <span className="text-[11px] uppercase font-bold text-gold-dark block">
                Action Button Dynamic Suffix ({'{{1}}'})
              </span>
              <input
                type="text"
                value={buttonParam}
                onChange={(e) => setButtonParam(e.target.value)}
                placeholder="e.g. BK-108"
                className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-gold/30 rounded-lg text-xs text-charcoal font-mono focus:outline-none focus:border-gold"
              />
              <span className="text-[10px] text-charcoal/50 block">
                Appends to button URL: https://www.mantrakshata.com/acharya/assign?bookingId={buttonParam || '{{1}}'}
              </span>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="pt-3 border-t border-gold/20 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSendLiveTest}
              disabled={dispatching || !testPhone}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {dispatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calling Meta Cloud API...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Live Test Message via Meta Cloud API</span>
                </>
              )}
            </button>

            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-cream hover:bg-gold/15 border border-gold/30 text-charcoal rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-gold-dark" />
              <span>Open in WhatsApp Web / App</span>
            </a>
          </div>

          {/* Dispatch Result Banner */}
          {result && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                result.ok
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {result.ok ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Message Successfully Dispatched by Meta Cloud API</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>Meta Cloud API Returned an Error</span>
                  </>
                )}
              </div>

              {result.ok && result.messageId && (
                <p className="font-mono text-[11px] text-emerald-800">
                  Meta Message ID (wamid): <strong>{result.messageId}</strong>
                </p>
              )}

              {!result.ok && result.error && (
                <div className="space-y-1">
                  <p className="font-semibold text-red-800">{result.error}</p>
                  <p className="text-[10px] text-red-700/80">
                    Note: If a template is still pending approval in Meta Business Manager, Meta will reject live sends until the status turns to APPROVED. You can also use "Open in WhatsApp Web / App" for immediate manual testing.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Message Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#ECE5DD] p-4 rounded-3xl border border-[#D5C2A4] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5C2A4]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                  M
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Mantrakshata</h4>
                  <span className="text-[10px] text-charcoal/60 block">Official Business Account</span>
                </div>
              </div>
              <span className="text-[10px] text-charcoal/50">WhatsApp Preview</span>
            </div>

            {/* Bubble */}
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-xs border border-black/5 space-y-2.5">
              <p className="text-xs text-charcoal whitespace-pre-wrap leading-relaxed font-sans">
                {renderedText.split(/(\*[^*\n]+\*)/g).map((part, index) => {
                  if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                    return (
                      <strong key={index} className="font-bold text-charcoal">
                        {part.slice(1, -1)}
                      </strong>
                    );
                  }
                  return part;
                })}
              </p>

              <div className="text-[9px] text-charcoal/40 text-right">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Action Buttons */}
              {selectedTemplate.buttons && selectedTemplate.buttons.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-1.5">
                  {selectedTemplate.buttons.map((b, idx) => (
                    <div
                      key={idx}
                      className="w-full py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-xs font-semibold text-blue-600 flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[10px] text-charcoal/60 text-center italic">
              Exact layout as rendered on recipient handset
            </div>
          </div>

          {/* Quick Copy Message Body */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(renderedText);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="w-full py-2 bg-white hover:bg-cream border border-gold/30 rounded-xl text-xs font-semibold text-charcoal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Message Body</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gold-dark" />
                <span>Copy Rendered Message Text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Dispatches Audit Trail */}
      <div className="bg-white p-5 rounded-2xl border border-gold/30 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gold/15 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-dark" />
            <h3 className="font-serif text-sm font-bold text-charcoal">
              Recent WhatsApp Cloud API Dispatches (Live Neon Audit Trail)
            </h3>
          </div>
          <button
            onClick={refreshLogs}
            className="text-xs text-gold-dark hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-charcoal/60 italic py-3 text-center">
            No WhatsApp dispatches recorded in Neon yet. Trigger a live test message above to see audit entries appear.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gold/20 text-[10px] uppercase text-charcoal/60">
                  <th className="py-2 font-bold">Recipient</th>
                  <th className="py-2 font-bold">Template</th>
                  <th className="py-2 font-bold">Meta WAMID</th>
                  <th className="py-2 font-bold">Status</th>
                  <th className="py-2 font-bold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {recentLogs.map((log: any, idx: number) => (
                  <tr key={idx} className="hover:bg-cream/20">
                    <td className="py-2 font-mono">{log.recipient_phone}</td>
                    <td className="py-2 font-semibold text-charcoal">{log.template_name}</td>
                    <td className="py-2 font-mono text-[10px] text-charcoal/60 max-w-xs truncate">
                      {log.wamid || log.id}
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {log.status || 'sent'}
                      </span>
                    </td>
                    <td className="py-2 text-[10px] text-charcoal/60">
                      {log.dispatched_at ? new Date(log.dispatched_at).toLocaleTimeString() : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

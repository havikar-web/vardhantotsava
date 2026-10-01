import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Check, 
  CheckCheck, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Phone, 
  Clock, 
  User, 
  ArrowRight,
  Copy,
  Code
} from 'lucide-react';
import { 
  getWhatsAppMessages, 
  WhatsAppMessage, 
  clearWhatsAppMessages,
  sendOneDayReminderMessage,
  sendMorningStreamMessage,
  sendCompletionThankYouMessage,
  getWhatsAppShareLink,
  META_WHATSAPP_TEMPLATES,
  MetaTemplateSpec
} from '../lib/whatsapp';
import { getSavedBooking, BookingPlan } from '../lib/store';
import { ACHARYA_SCHOLARS } from '../lib/content';
import { WhatsAppTesterTab } from '../components/admin/WhatsAppTesterTab';

interface Props {
  navigate: (path: string) => void;
}

export const WhatsAppAdminPage: React.FC<Props> = ({ navigate }) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>(() => getWhatsAppMessages());
  const [booking, setBooking] = useState<BookingPlan | null>(() => getSavedBooking());
  const [activeTab, setActiveTab] = useState<'tester' | 'all' | 'customer' | 'acharya' | 'templates'>('tester');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const refreshMessages = () => {
    setMessages(getWhatsAppMessages());
    setBooking(getSavedBooking());
  };

  useEffect(() => {
    refreshMessages();
  }, []);

  const assignedAcharya = ACHARYA_SCHOLARS.find((a) => a.id === booking?.assignedPanditId) || ACHARYA_SCHOLARS[0];

  const handleTriggerReminder = () => {
    if (booking) {
      sendOneDayReminderMessage(booking, assignedAcharya);
      refreshMessages();
    }
  };

  const handleTriggerMorningStream = () => {
    if (booking) {
      sendMorningStreamMessage(booking, assignedAcharya);
      refreshMessages();
    }
  };

  const handleTriggerCompletion = () => {
    if (booking) {
      sendCompletionThankYouMessage(booking);
      refreshMessages();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all WhatsApp message logs?')) {
      clearWhatsAppMessages();
      refreshMessages();
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'customer') return m.recipientRole === 'customer';
    if (activeTab === 'acharya') return m.recipientRole === 'acharya' || m.recipientRole === 'admin';
    return true;
  });

  return (
    <div className="py-12 bg-ivory min-h-screen text-charcoal">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-6">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-[0.24em] font-semibold text-gold-dark block">
              AUTOMATION & NOTIFICATION DESK
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal">
              WhatsApp Drafts & Templates
            </h1>
            <p className="text-xs text-charcoal/70">
              Draft preview log only. No WhatsApp messages have been sent from this console.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshMessages}
              className="p-2.5 rounded-xl border border-gold/30 hover:bg-cream text-charcoal text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleClearAll}
              className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Clear Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <a className="inline-flex p-3 rounded-xl border border-gold/30 text-sm hover:bg-cream transition-colors" href="/admin/templates" onClick={e=>{e.preventDefault();navigate('/admin/templates');}}>Open Official 9 Lifecycle Templates (View & Copy Messages) →</a>
        {/* Pipeline Controls & Fast Actions */}
        {booking && (
          <div className="bg-white p-5 rounded-2xl border border-gold/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gold/15 pb-2">
              <span className="text-xs uppercase font-bold text-gold-dark tracking-wider">
                Simulate Next Lifecycle Triggers for {booking.name} ({booking.id})
              </span>
              <span className="text-xs text-charcoal/60">
                {booking.packageName}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleTriggerReminder}
                className="bg-cream hover:bg-gold/10 border border-gold/30 text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                1. Trigger 1-Day Before Reminder
              </button>

              <button
                onClick={handleTriggerMorningStream}
                className="bg-cream hover:bg-gold/10 border border-gold/30 text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                2. Trigger Morning Live Stream Link
              </button>

              <button
                onClick={handleTriggerCompletion}
                className="bg-gold hover:bg-gold-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                3. Trigger Ceremony Completion & Ashirvada
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-gold/20 pb-3 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'tester' ? 'bg-gold text-white shadow-xs' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Live Delivery Tester</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'all' ? 'bg-gold text-white shadow-xs' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'customer' ? 'bg-gold text-white shadow-xs' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Customer Messages
          </button>
          <button
            onClick={() => setActiveTab('acharya')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'acharya' ? 'bg-gold text-white shadow-xs' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            Acharya & Admin Alerts
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'templates' ? 'bg-gold text-white shadow-xs' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Meta Official Templates ({META_WHATSAPP_TEMPLATES.length})</span>
          </button>
        </div>

        {activeTab === 'tester' ? (
          <WhatsAppTesterTab />
        ) : activeTab === 'templates' ? (
          <div className="space-y-4 text-left">
            <div className="p-4 bg-[#FAF5ED] rounded-xl border border-[#B37418]/40">
              <span className="text-xs uppercase font-bold text-[#8C5D0D] block mb-1">
                Meta Business Cloud API Template Specifications
              </span>
              <p className="text-xs text-[#5C5147]">
                These 8 message templates are formatted with standard numbered positional variables ({`{{1}}, {{2}}`}) for Meta Business Manager approval. Click "Copy Body" to paste directly into your Meta developer console.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {META_WHATSAPP_TEMPLATES.map((tmpl, idx) => (
                <div key={tmpl.name} className="bg-white p-5 rounded-2xl border border-gold/30 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gold/15">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#B37418]">#{idx + 1}</span>
                      <strong className="font-mono text-sm text-[#1F1914]">{tmpl.name}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        tmpl.category === 'AUTHENTICATION' 
                          ? 'bg-[#F4ECE0] text-[#8C5D0D]' 
                          : tmpl.category === 'MARKETING'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-[#FAF5ED] border border-[#D5C2A4] text-[#5C5147]'
                      }`}>
                        {tmpl.category}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tmpl.body);
                          setCopiedTemplate(tmpl.name);
                          setTimeout(() => setCopiedTemplate(null), 2000);
                        }}
                        className="px-3 py-1 bg-[#FAF5ED] hover:bg-[#F4EADA] border border-[#D5C2A4] rounded-lg text-xs font-semibold text-[#8C5D0D] flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedTemplate === tmpl.name ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Body</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#5C5147]">
                    <strong>Purpose:</strong> {tmpl.purpose}
                  </p>

                  {/* Template Body */}
                  <div>
                    <span className="text-[10.5px] uppercase font-bold text-[#8C5D0D] block mb-1">
                      Template Message Body:
                    </span>
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5D7C3] font-mono text-xs text-[#2A1E14] leading-relaxed whitespace-pre-wrap">
                      {tmpl.body}
                    </div>
                  </div>

                  {/* Template Buttons (If Defined) */}
                  {tmpl.buttons && tmpl.buttons.length > 0 && (
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                      <span className="text-[10.5px] uppercase font-bold text-[#8C5D0D] block mb-1.5">
                        Interactive Action Buttons:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tmpl.buttons.map((btn, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-300 text-xs">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                              {btn.type === 'URL' ? 'Link Button' : btn.type}
                            </span>
                            <span className="font-semibold text-charcoal">{btn.text}</span>
                            {btn.url && (
                              <span className="text-[11px] text-charcoal/60 font-mono">({btn.url})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Numbered Parameters & Sample Data Table */}
                  <div className="pt-1">
                    <span className="text-[10.5px] uppercase font-bold text-[#8C5D0D] block mb-2">
                      Positional Variables ({tmpl.variables?.length || tmpl.variableKeys.length} Variables) & Meta Sample Data:
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-[#E5D7C3] rounded-lg overflow-hidden">
                        <thead className="bg-[#FAF5ED] text-[#8C5D0D] font-bold text-[11px] border-b border-[#E5D7C3]">
                          <tr>
                            <th className="py-1.5 px-3 w-16">Token</th>
                            <th className="py-1.5 px-3 w-40">Variable Name</th>
                            <th className="py-1.5 px-3">What This Variable Is</th>
                            <th className="py-1.5 px-3 w-48">Meta Sample Data</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5D7C3]/60 bg-white">
                          {tmpl.variables && tmpl.variables.length > 0 ? (
                            tmpl.variables.map((v) => (
                              <tr key={v.position} className="hover:bg-[#FAF8F5]/60">
                                <td className="py-2 px-3 font-mono font-bold text-[#B37418]">{v.position}</td>
                                <td className="py-2 px-3 font-semibold text-charcoal">{v.name}</td>
                                <td className="py-2 px-3 text-[#5C5147]">{v.description}</td>
                                <td className="py-2 px-3 font-mono text-[11px] bg-amber-50/30 text-[#8C5D0D]">{v.sample}</td>
                              </tr>
                            ))
                          ) : (
                            tmpl.variableKeys.map((key, i) => (
                              <tr key={key} className="hover:bg-[#FAF8F5]/60">
                                <td className="py-2 px-3 font-mono font-bold text-[#B37418]">{`{{${i + 1}}}`}</td>
                                <td className="py-2 px-3 font-semibold text-charcoal">{key}</td>
                                <td className="py-2 px-3 text-[#5C5147]">Dynamic parameter {key}</td>
                                <td className="py-2 px-3 font-mono text-[11px] bg-amber-50/30 text-[#8C5D0D]">{tmpl.sampleVariables[i] || '-'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div 
                key={msg.id}
                className="bg-white rounded-2xl border border-gold/30 shadow-xs overflow-hidden"
              >
                {/* Message Header Bar */}
                <div className="bg-[#F8F5EE] px-5 py-3 border-b border-gold/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
                    <strong className="text-charcoal font-semibold">{msg.title}</strong>
                    <span className="text-[10px] text-charcoal/50 uppercase tracking-wider font-mono">
                      ({msg.type})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-charcoal/70">
                    <span>To: <strong>{msg.recipientName}</strong> ({msg.recipientPhone})</span>
                    <span>·</span>
                    <span>{new Date(msg.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* WhatsApp Chat Bubble Body */}
                <div className="p-5 bg-[#ECE5DD]/25">
                  <div className="max-w-2xl bg-white p-4 rounded-2xl shadow-xs border border-gold/20 text-xs sm:text-sm text-charcoal/90 whitespace-pre-line leading-relaxed font-sans relative">
                    {msg.body}

                    <div className="flex items-center justify-end gap-1.5 pt-2 text-[10px] text-charcoal/50">
                      <span>{new Date(msg.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{msg.status === 'draft' ? 'Draft — not sent' : msg.status}</span>
                    </div>
                  </div>

                  {/* Dynamic Action Link Button (For Acharya Alert or Welcome Catalog CTA) */}
                  {msg.dynamicLink && (
                    <div className="mt-3 p-3 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-between max-w-2xl">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-gold-dark block">
                          {msg.type === 'welcome_catalog' ? 'Interactive Link Button (CTA)' : 'One-Tap Dynamic Action Link'}
                        </span>
                        <p className="text-xs text-charcoal/80">
                          {msg.type === 'welcome_catalog'
                            ? 'Interactive CTA button linking directly to the Havikar gifts and keepsakes collection.'
                            : msg.actionCompleted 
                              ? 'Acharya has already accepted and confirmed.' 
                              : 'Main Acharya taps to accept and auto-assign scholar.'}
                        </p>
                      </div>

                      <button
                        onClick={() => navigate(msg.dynamicLink!)}
                        className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                          msg.type === 'welcome_catalog'
                            ? 'bg-gold hover:bg-gold-hover text-white shadow-xs'
                            : msg.actionCompleted 
                              ? 'bg-emerald-700 text-white' 
                              : 'bg-gold hover:bg-gold-hover text-white shadow-xs'
                        }`}
                      >
                        <span>
                          {msg.type === 'welcome_catalog' 
                            ? 'Explore Sacred Gifts' 
                            : msg.actionCompleted 
                              ? 'View Assignment' 
                              : 'Open Assignment Link'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Real WhatsApp Test Link */}
                  <div className="mt-3 flex items-center justify-end">
                    <a
                      href={getWhatsAppShareLink(msg.recipientPhone, msg.body)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-800 hover:text-emerald-900 font-semibold flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>Test in Real WhatsApp Web / App</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#FDFBF7] rounded-md p-10 border border-gold/20 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-cream border border-gold/30 flex items-center justify-center text-gold-dark">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-normal text-charcoal">No WhatsApp messages dispatched yet</h3>
              <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
                Messages will automatically appear here when customers verify their phone, reserve a Vardhantotsava, or when Acharyas are assigned.
              </p>
            </div>
            <button
              onClick={() => navigate('/book')}
              className="bg-gold hover:bg-gold-hover text-white text-xs uppercase font-semibold px-6 py-3 rounded-xl shadow-xs"
            >
              Start a Booking to Test Flow
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

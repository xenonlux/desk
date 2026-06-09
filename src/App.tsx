/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { Resource, Client, Booking, BookingStatus } from './types';
import { INITIAL_RESOURCES, INITIAL_CLIENTS, getInitialBookings } from './data/mockData';
import { CalendarTab } from './components/CalendarTab';
import { ClientsTab } from './components/ClientsTab';
import { ResourcesTab } from './components/ResourcesTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { TerminalTab } from './components/TerminalTab';
import { 
  Calendar, Users, Layers, TrendingUp, Scan, 
  Clock, ShieldAlert, CheckCircle, Smartphone, LogOut, Laptop, Monitor,
  Lock, Unlock, Globe, RefreshCw, Copy, Check, Key, Search, DollarSign, AlertTriangle, Ban
} from 'lucide-react';
import { translations, generateOfflineKeyForId, validateOfflineKey } from './utils/translations';

export default function App() {
  // 1. Language state: Locked permanently to Arabic ('ar') as requested by user
  const language = 'ar' as const;

  // 2. Hardware signature ID
  const [deviceId, setDeviceId] = useState<string>(() => {
    const cached = localStorage.getItem('nexus_device_id');
    if (cached) return cached;
    const newId = `NX-2026-FLEX-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    localStorage.setItem('nexus_device_id', newId);
    return newId;
  });

  // 3. Activation offline unlock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('nexus_is_activated') === 'true';
  });

  // Save language to storage
  useEffect(() => {
    localStorage.setItem('nexus_language', language);
  }, [language]);

  // Save activation to storage
  useEffect(() => {
    localStorage.setItem('nexus_is_activated', isUnlocked ? 'true' : 'false');
  }, [isUnlocked]);

  // Unlock state fields
  const [activationInput, setActivationInput] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [showAdminHelper, setShowAdminHelper] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Load language translation subset
  const t = translations[language];

  // Navigation View selection
  const [activeTab, setActiveTab] = useState<'calendar' | 'clients' | 'analytics' | 'resources' | 'terminal'>('calendar');

  // Core state arrays synced directly to Local Storage
  const [resources, setResources] = useState<Resource[]>(() => {
    const cached = localStorage.getItem('nexus_resources');
    return cached ? JSON.parse(cached) : INITIAL_RESOURCES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const cached = localStorage.getItem('nexus_clients');
    return cached ? JSON.parse(cached) : INITIAL_CLIENTS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const cached = localStorage.getItem('nexus_bookings');
    return cached ? JSON.parse(cached) : getInitialBookings();
  });

  const [starredClientIds, setStarredClientIds] = useState<string[]>(() => {
    const cached = localStorage.getItem('nexus_starred_client_ids');
    return cached ? JSON.parse(cached) : [];
  });

  // Global search and navigation control states
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState('2026-05-31');

  // Last update time tracking (tracks whenever a write to localStorage happens!)
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(() => {
    return localStorage.getItem('nexus_last_update_time') || new Date().toLocaleString('ar-EG');
  });

  // Last backup time tracking (for 7-day warning system)
  const [lastBackupTime, setLastBackupTime] = useState<number>(() => {
    const cached = localStorage.getItem('nexus_last_backup_time');
    if (cached) return parseInt(cached, 10);
    // Standard initialization: set to 10 days ago so the notification fires nicely
    const initialTime = Date.now() - 10 * 24 * 3600 * 1000;
    localStorage.setItem('nexus_last_backup_time', initialTime.toString());
    return initialTime;
  });

  useEffect(() => {
    const timeStr = new Date().toLocaleString('ar-EG');
    localStorage.setItem('nexus_last_update_time', timeStr);
    setLastUpdateTime(timeStr);
  }, [resources, clients, bookings, starredClientIds]);

  const daysSinceBackup = Math.floor((Date.now() - lastBackupTime) / (1000 * 60 * 60 * 24));

  const handleExportData2 = () => {
    const dataToExport = {
      version: "3.5-LTM",
      exportDate: new Date().toISOString(),
      timestamp: Date.now(),
      clients,
      bookings,
      resources,
      starredClientIds
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_all_data_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    const now = Date.now();
    setLastBackupTime(now);
    localStorage.setItem('nexus_last_backup_time', now.toString());
  };

  // Clock dynamic display
  const [currentClientTime, setCurrentClientTime] = useState<string>('2026-05-31 20:27:14 ت ع م');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // Emulate specified 2026 environment timeframe
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCurrentClientTime(`2026-05-31 ${timeStr} ت ع م`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save changes to localStorage whenever states mutate
  useEffect(() => {
    localStorage.setItem('nexus_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('nexus_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('nexus_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('nexus_starred_client_ids', JSON.stringify(starredClientIds));
  }, [starredClientIds]);

  // Callbacks for mutating states (bookings, assets, clients)
  const handleToggleStarClient = (clientId: string) => {
    setStarredClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  // Callbacks for mutating states (bookings, assets, clients)
  const handleAddBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const handleSettlePayment = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, paymentStatus: 'paid' } : b))
    );
  };

  const handleAddClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
  };

  const handleUpdateClientNotes = (clientId: string, notes: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, notes } : c))
    );
  };

  const handleAddResource = (newResource: Resource) => {
    setResources((prev) => [newResource, ...prev]);
  };

  const handleToggleResourceStatus = (resourceId: string) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId
          ? { ...r, status: r.status === 'available' ? 'maintenance' : 'available' }
          : r
      )
    );
  };

  const handleDeleteResource = (resourceId: string) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
    // Cancel future active bookings for this resource automatically to maintain state sanity
    setBookings((prev) =>
      prev.map((b) =>
        b.resourceId === resourceId && b.status === 'confirmed'
          ? { ...b, status: 'cancelled' }
          : b
      )
    );
  };

  // Quick system indicator calculations
  const pendingInvoicesCount = bookings.filter(
    (b) => b.status !== 'cancelled' && b.paymentStatus === 'unpaid'
  ).length;

  const liveOccupantsCount = bookings.filter(
    (b) => b.date === '2026-05-31' && b.status === 'checked-in'
  ).length;

  // Offline cryptographic license signature validator
  const handleVerifyActivation = (e: FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    if (!activationInput.trim()) {
      setSecurityError(t.activationCodeRequired);
      return;
    }
    const isValid = validateOfflineKey(deviceId, activationInput);
    if (isValid) {
      setIsUnlocked(true);
      setSecurityError('');
    } else {
      setSecurityError(t.incorrectCode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebdcc9] via-[#f4f6f0] to-[#decbaf] flex items-center justify-center p-3 sm:p-6 text-slate-100 selection:bg-indigo-500/30 selection:text-white" id="desktop-host-canvas">
      
      {/* Simulation Master Laptop Mock Window Frame Wrapper */}
      <div className="w-full max-w-[1300px] h-[780px] bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden" id="nexus-desktop-window">
        
        {/* Title Bar - System Chromes (macOS inspired control dots) */}
        <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between font-mono" id="desktop-window-titlebar">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/50" />
            <span className="text-[11px] text-slate-500 pl-2 pr-2 font-bold select-none hidden sm:inline">
              مصفوفة نكسيس الأمنية الموحدة - الإصدار v3.5 • مؤمن أوفلاين
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[10px] sm:text-xs">
            {/* Live GMT indicator */}
            <span className="text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {currentClientTime}
            </span>
          </div>
        </div>

        {/* Global RTL or LTR helper container based on translated language state */}
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="flex-1 flex flex-col overflow-hidden">
          
          {!isUnlocked ? (
            /* HIGH SECURITY ENCRYPTED LOCK SCREEN FOR OFFLINE ACCESS */
            <div className="flex-1 bg-slate-950/95 flex flex-col justify-center items-center p-6 overflow-y-auto" id="activation-lock-portal">
              <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl relative">
                {/* Red warning border */}
                <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 rounded-t-xl" />
                
                <div className="flex items-center space-x-3 space-x-reverse mb-4 pt-2">
                  <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-rose-500">
                    <ShieldAlert className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-mono tracking-wide">
                      {t.securityLockTitle}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {t.securityLockSub}
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-305 bg-slate-950/80 p-3 rounded-lg border border-slate-850 mb-6">
                  {t.securityLockDesc}
                </p>

                {/* Lock input field */}
                <form onSubmit={handleVerifyActivation} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                      {t.installationIdLabel}
                    </label>
                    <div className="bg-slate-950 text-slate-100 font-mono text-xs p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                      <span className="font-semibold tracking-wider text-amber-100">{deviceId}</span>
                      <span className="text-[9px] text-emerald-400 uppercase font-bold border border-emerald-800/40 bg-emerald-950/20 px-2 py-0.5 rounded font-mono select-none">
                        {t.offlineStatus}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                      <span>{t.licenseKeyLabel}</span>
                      <span className="text-slate-500 font-normal">({t.enterLicenseKey})</span>
                    </label>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={activationInput}
                        onChange={(e) => {
                          setActivationInput(e.target.value);
                          setSecurityError('');
                        }}
                        placeholder="NX-XXXX-XXXXX-AR-XXX"
                        className="w-full bg-slate-950/80 border border-slate-800 text-amber-200 placeholder-slate-700 font-mono text-center tracking-widest text-sm rounded-lg py-3 px-4 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 text-right"
                      />
                    </div>
                  </div>

                  {securityError && (
                    <div className="p-3 text-xs bg-rose-950/60 border border-rose-900/50 rounded-lg text-rose-300 font-medium font-mono text-right">
                      {securityError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer"
                  >
                    <Key className="w-4 h-4 mr-1.5 ml-1.5" />
                    <span>{t.activateButton}</span>
                  </button>
                </form>

                {/* Activation assistance message */}
                <div className="mt-8 pt-4 border-t border-slate-800/80 text-center text-slate-505 text-slate-500 text-[11px] font-sans">
                  منصة نكسيس تدار بشكل أوفلاين معزول وثابت لضمان جودة الأمان الفائق.
                </div>
              </div>
            </div>
          ) : (
            /* SECURE FULL-FEATURED APP SYSTEM INTERFACE (DEFAULTS TO ARABIC RTL) */
            <div className="flex-1 flex overflow-hidden bg-slate-950">
              
              {/* Main system menu sidebar */}
              <aside className="w-16 sm:w-56 bg-slate-900 border-r border-slate-800/60 flex flex-col justify-between py-4" id="main-navigation-sidebar">
                <div className="space-y-6">
                  {/* Internal brand header */}
                  <div className="px-5 hidden sm:block">
                    <span className="block text-[8px] tracking-widest text-slate-500 uppercase font-bold font-mono">{t.operations}</span>
                    <h1 className="text-sm font-serif font-medium text-slate-100 flex items-center">
                      <Monitor className="w-4.5 h-4.5 mr-2 ml-2 text-indigo-400" />
                      <span className="mx-1">{t.appName}</span>
                    </h1>
                  </div>

                  {/* Global Search Input Trigger */}
                  <div className="px-3 hidden sm:block font-sans" id="sidebar-global-search-container">
                    <button
                      type="button"
                      onClick={() => setIsGlobalSearchOpen(true)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-lg px-3 py-2 text-right text-slate-500 hover:text-slate-300 text-xs flex items-center justify-between transition-all cursor-pointer font-sans"
                    >
                      <span className="text-[10px]">ابحث عن عميل أو حجز...</span>
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>

                  {/* Functional Tab Buttons */}
                  <nav className="space-y-1.5 px-2" id="sidebar-tabs">
                    {/* Small mobile search icon button */}
                    <button
                      type="button"
                      onClick={() => setIsGlobalSearchOpen(true)}
                      className="w-full p-2.5 rounded-xl flex sm:hidden items-center justify-center text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 transition-all cursor-pointer border border-transparent"
                      title="البحث الذكي الشامل"
                    >
                      <Search className="w-4 h-4 text-slate-300" />
                    </button>
                    <button
                      onClick={() => setActiveTab('calendar')}
                      className={`w-full p-2.5 sm:px-4 sm:py-3 rounded-xl flex items-center justify-center sm:justify-start text-xs border transition-all cursor-pointer ${
                        activeTab === 'calendar'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm font-bold'
                          : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                      }`}
                      title={t.timetableMatrix}
                    >
                      <Calendar className="w-4 h-4 sm:mr-3 text-slate-300" />
                      <span className="select-none hidden sm:inline font-mono mx-1">{t.timetableMatrix}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('clients')}
                      className={`w-full p-2.5 sm:px-4 sm:py-3 rounded-xl flex items-center justify-center sm:justify-start text-xs border transition-all cursor-pointer ${
                        activeTab === 'clients'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm font-bold'
                          : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                      }`}
                      title={t.crmSuite}
                    >
                      <Users className="w-4 h-4 sm:mr-3 text-slate-300" />
                      <span className="select-none hidden sm:inline font-mono mx-1">{t.crmSuite}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('terminal')}
                      className={`w-full p-2.5 sm:px-4 sm:py-3 rounded-xl flex items-center justify-center sm:justify-start text-xs border transition-all cursor-pointer ${
                        activeTab === 'terminal'
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm font-bold'
                          : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                      }`}
                      title={t.officeTerminal}
                    >
                      <Scan className="w-4 h-4 sm:mr-3 text-slate-300" />
                      <span className="select-none hidden sm:inline font-mono mx-1">{t.officeTerminal}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('resources')}
                      className={`w-full p-2.5 sm:px-4 sm:py-3 rounded-xl flex items-center justify-center sm:justify-start text-xs border transition-all cursor-pointer ${
                        activeTab === 'resources'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm font-bold'
                          : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                      }`}
                      title={t.facilityAssets}
                    >
                      <Layers className="w-4 h-4 sm:mr-3 text-slate-300" />
                      <span className="select-none hidden sm:inline font-mono mx-1">{t.facilityAssets}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={`w-full p-2.5 sm:px-4 sm:py-3 rounded-xl flex items-center justify-center sm:justify-start text-xs border transition-all cursor-pointer ${
                        activeTab === 'analytics'
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm font-bold'
                          : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                      }`}
                      title={t.analyticsSuite}
                    >
                      <TrendingUp className="w-4 h-4 sm:mr-3 text-slate-300" />
                      <span className="select-none hidden sm:inline font-mono mx-1">{t.analyticsSuite}</span>
                    </button>
                  </nav>
                </div>

                {/* Quick Metrics Alerts in Sidebar (visible on desktop) */}
                <div className="px-4 space-y-2 hidden sm:block text-right" id="sidebar-quick-alerts">
                  <span className="block text-[8px] tracking-widest text-slate-500 uppercase font-mono font-bold px-1">{t.alertMonitor}</span>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/60 font-mono text-[10px]">
                    <span className="text-slate-500">{t.guestsLive}:</span>
                    <span className="text-emerald-400 font-bold mx-1">{liveOccupantsCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/60 font-mono text-[10px]">
                    <span className="text-slate-500">{t.billsPending}:</span>
                    <span className={`${pendingInvoicesCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'} mx-1`}>
                      {pendingInvoicesCount}
                    </span>
                  </div>
                </div>
              </aside>

              {/* Core dynamic content viewer */}
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/20" id="main-content-canvas">
                {activeTab === 'calendar' && (
                  <CalendarTab
                    bookings={bookings}
                    resources={resources}
                    clients={clients}
                    onAddBooking={handleAddBooking}
                    onCancelBooking={handleCancelBooking}
                    onUpdateBookingStatus={handleUpdateBookingStatus}
                    onSettlePayment={handleSettlePayment}
                    language={language}
                    starredClientIds={starredClientIds}
                    selectedDate={calendarSelectedDate}
                    onSelectDate={setCalendarSelectedDate}
                    selectedBookingId={selectedBookingId}
                    onSelectBookingId={setSelectedBookingId}
                  />
                )}
                {activeTab === 'clients' && (
                  <ClientsTab
                    clients={clients}
                    bookings={bookings}
                    resources={resources}
                    onAddClient={handleAddClient}
                    onUpdateClientNotes={handleUpdateClientNotes}
                    language={language}
                    starredClientIds={starredClientIds}
                    onToggleStarClient={handleToggleStarClient}
                    selectedClientId={selectedClientId}
                    onSelectClient={setSelectedClientId}
                  />
                )}
                {activeTab === 'resources' && (
                  <ResourcesTab
                    resources={resources}
                    onAddResource={handleAddResource}
                    onToggleStatus={handleToggleResourceStatus}
                    onDeleteResource={handleDeleteResource}
                    language={language}
                  />
                )}
                {activeTab === 'analytics' && (
                  <AnalyticsTab
                    bookings={bookings}
                    resources={resources}
                    clients={clients}
                    language={language}
                  />
                )}
                {activeTab === 'terminal' && (
                  <TerminalTab
                    bookings={bookings}
                    resources={resources}
                    clients={clients}
                    onCheckIn={(id) => handleUpdateBookingStatus(id, 'checked-in')}
                    onCheckOut={(id) => handleUpdateBookingStatus(id, 'completed')}
                    onSettlePayment={handleSettlePayment}
                    language={language}
                    currentClientTime={currentClientTime}
                    onExportBackup={handleExportData2}
                  />
                )}
              </main>
            </div>
          )}

          {/* Subtle Notification & Backup Action Banner */}
          {daysSinceBackup >= 7 && (
            <div className="bg-amber-950/40 border-t border-b border-amber-500/20 px-4 py-2.5 text-[10.5px] font-sans text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in" id="last-backup-warning-notif">
              <div className="flex items-center space-x-2 space-x-reverse text-right">
                <span className="p-1 bg-amber-500/10 rounded border border-amber-500/20">⚠️</span>
                <span>تنبيه أمني: لم تقم بتصدير نسخة احتياطية للبيانات والأعضاء منذ <strong>{daysSinceBackup} أيام</strong>. يرجى التصدير لحفظ بياناتك. (آخر تحديث محلي للمخزن: {lastUpdateTime})</span>
              </div>
              <button
                type="button"
                onClick={handleExportData2}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1 rounded text-[10px] transition-all cursor-pointer font-sans whitespace-nowrap"
              >
                📦 تصدير أرشيف فوري (JSON)
              </button>
            </div>
          )}

          {/* Operating System Status Shelf Footer */}
          <footer className="bg-slate-900 border-t border-slate-800/80 px-4 py-2 text-[10px] font-mono text-slate-400 flex items-center justify-between select-none animate-fade-in" id="desktop-window-footer">
            <div className="flex items-center space-x-3.5 space-x-reverse">
              <span className="flex items-center text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 ml-2 animate-pulse" />
                {t.serverOnline}
              </span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <span className="hidden md:inline">
                {t.lockStatusLabel} <strong className={`${isUnlocked ? 'text-emerald-400' : 'text-rose-500'}`}>{isUnlocked ? t.statusUnlocked : t.statusLocked}</strong>
              </span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <span className="hidden md:inline"> {resources.length} {t.indexSpaces}, {clients.length} {t.indexMembers}</span>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              {isUnlocked && (
                <button
                  onClick={() => setIsUnlocked(false)}
                  className="bg-rose-950/40 text-rose-300 hover:bg-rose-900 font-bold border border-rose-800/60 px-3 py-1 rounded flex items-center transition-all cursor-pointer font-mono text-[9px]"
                  title="قفل المحطة / Lock screen"
                >
                  <Lock className="w-3 h-3 ml-1 mr-1" />
                  <span>{t.manualLockButton}</span>
                </button>
              )}
              <span>{t.databaseStatus}: <strong className="text-indigo-400">{t.databaseActive}</strong></span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Search Popup Modal Backdrop */}
      {isGlobalSearchOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-4 z-50 animate-fade-in" id="global-search-overlay-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-xl w-full shadow-2xl relative mt-20 space-y-4 text-right">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 flex-row-reverse" dir="rtl">
              <span className="text-xs font-sans text-indigo-400 font-bold">بوابة البحث الذكية الشاملة للنظام</span>
              <button
                type="button"
                onClick={() => {
                  setIsGlobalSearchOpen(false);
                  setGlobalSearchQuery('');
                }}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative font-sans text-right" dir="rtl">
              <input
                type="text"
                autoFocus
                placeholder="ابحث بكتابة اسم العميل، بريده الإلكتروني، أو رقم الحجز بـ (BK-)..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pr-10 pl-3 py-2.5 text-white text-xs placeholder-slate-600 focus:outline-none text-right font-sans"
              />
              <Search className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1 text-right" id="global-search-results">
              {globalSearchQuery ? (
                <>
                  {/* Matching Clients Section */}
                  <div className="space-y-1.5 font-sans" dir="rtl">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider text-right">العملاء المشتركين والمطابقين ({
                      clients.filter(c => 
                        c.name.toLowerCase().includes(globalSearchQuery.toLowerCase().trim()) || 
                        c.email.toLowerCase().includes(globalSearchQuery.toLowerCase().trim()) || 
                        c.phone.includes(globalSearchQuery.toLowerCase().trim())
                      ).length
                    })</span>
                    {clients.filter(c => 
                      c.name.toLowerCase().includes(globalSearchQuery.toLowerCase().trim()) || 
                      c.email.toLowerCase().includes(globalSearchQuery.toLowerCase().trim()) || 
                      c.phone.includes(globalSearchQuery.toLowerCase().trim())
                    ).length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {clients.filter(c => 
                          c.name.toLowerCase().includes(globalSearchQuery.toLowerCase().trim()) || 
                          c.email.toLowerCase().includes(globalSearchQuery.toLowerCase().trim()) || 
                          c.phone.includes(globalSearchQuery.toLowerCase().trim())
                        ).map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedClientId(c.id);
                              setActiveTab('clients');
                              setIsGlobalSearchOpen(false);
                              setGlobalSearchQuery('');
                            }}
                            className="bg-slate-950 border border-slate-850 hover:border-indigo-505 hover:bg-slate-905 p-3 rounded-lg flex justify-between items-center cursor-pointer transition flex-row-reverse"
                          >
                            <div className="text-right">
                              <span className="text-white text-xs font-bold block">{c.name}</span>
                              <span className="text-[10px] text-slate-500 block font-mono">{c.email} &bull; {c.phone}</span>
                            </div>
                            <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-sans">استعراض الملف</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600 block text-right">لا يوجد عملاء يطابقون مدخلات هذه الكلمة.</span>
                    )}
                  </div>

                  {/* Matching Bookings Section */}
                  <div className="space-y-1.5 font-sans pt-2 border-t border-slate-800" dir="rtl">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider text-right">حجوزات المساحات المطابقة ({
                      bookings.filter(b => 
                        b.id.toLowerCase().includes(globalSearchQuery.toLowerCase().trim())
                      ).length
                    })</span>
                    {bookings.filter(b => 
                      b.id.toLowerCase().includes(globalSearchQuery.toLowerCase().trim())
                    ).length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 font-mono font-bold">
                        {bookings.filter(b => 
                          b.id.toLowerCase().includes(globalSearchQuery.toLowerCase().trim())
                        ).map((b) => {
                          const client = clients.find(c => c.id === b.clientId);
                          const resource = resources.find(r => r.id === b.resourceId);
                          
                          return (
                            <div
                              key={b.id}
                              onClick={() => {
                                setCalendarSelectedDate(b.date);
                                setSelectedBookingId(b.id);
                                setActiveTab('calendar');
                                setIsGlobalSearchOpen(false);
                                setGlobalSearchQuery('');
                              }}
                              className="bg-slate-950 border border-slate-850 hover:border-indigo-505 hover:bg-slate-905 p-3 rounded-lg flex justify-between items-center cursor-pointer transition flex-row-reverse text-right"
                            >
                              <div className="text-right">
                                <span className="text-white text-xs font-bold font-mono block">رقم الحجز: {b.id}</span>
                                <span className="text-[10px] text-slate-500 block font-sans font-medium">تاريخ الحجز: {b.date} &bull; المرفق: {resource?.name || b.resourceId} &bull; العميل: {client?.name || 'غير معروف'}</span>
                              </div>
                              <span className="text-[9px] bg-indigo-550/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-sans font-bold text-center">انتقال سريع</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600 block text-right font-sans">لا توجد حجوزات تطابق المعرف المدخل.</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-slate-500 font-sans text-xs">
                  كابينة الاستقصاء الشامل: ابحث فوراً عن أي عميل عن طريق تهجئة اسمه أو البريد، أو استعلم عن كود الفاتورة.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

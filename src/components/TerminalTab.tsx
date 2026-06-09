/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Booking, Resource, Client } from '../types';
import { Search, MapPin, Scan, UserCheck, ShieldAlert, CreditCard, DollarSign, Clock, CheckCircle, Bell, AlertTriangle } from 'lucide-react';
import { translations } from '../utils/translations';

interface TerminalTabProps {
  bookings: Booking[];
  resources: Resource[];
  clients: Client[];
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onSettlePayment: (bookingId: string) => void;
  language?: 'ar' | 'en';
  currentClientTime: string;
  onExportBackup?: () => void;
}

export const TerminalTab: React.FC<TerminalTabProps> = ({
  bookings,
  resources,
  clients,
  onCheckIn,
  onCheckOut,
  onSettlePayment,
  language = 'ar',
  currentClientTime,
  onExportBackup,
}) => {
  const t = translations[language];
  const [terminalSearch, setTerminalSearch] = useState('');
  const [lastActionLog, setLastActionLog] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [autoEvacuate, setAutoEvacuate] = useState(true);

  // Determine today's date dynamically from the active simulation/client clock
  const todayDate = useMemo(() => {
    return currentClientTime.split(' ')[0] || '2026-05-31';
  }, [currentClientTime]);

  const todayBookings = useMemo(() => {
    return bookings.filter((b) => b.date === todayDate);
  }, [bookings, todayDate]);

  // Handle active check-ins auto-evacuation when simulation time exceeds reservation end time
  useEffect(() => {
    if (!autoEvacuate) return;

    const match = currentClientTime.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return;

    const currentHour = parseInt(match[1], 10);
    const currentMinute = parseInt(match[2], 10);
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // Find bookings that have exceeded their endTime and are currently 'checked-in'
    const expiredBookings = todayBookings.filter((b) => {
      if (b.status !== 'checked-in') return false;
      const [endHour, endMin] = b.endTime.split(':').map(Number);
      const endTotalMinutes = endHour * 60 + endMin;
      return currentTotalMinutes >= endTotalMinutes;
    });

    if (expiredBookings.length > 0) {
      expiredBookings.forEach((b) => {
        onCheckOut(b.id);
        const clientName = clients.find((c) => c.id === b.clientId)?.name || b.clientId;
        setLastActionLog(`🚨 [نظام الإخلاء التلقائي] العميل: "${clientName}" - تم إنهاء الجلسة تلقائياً لتجاوز وقت المغادرة المحدد (${b.endTime})`);
      });
    }
  }, [currentClientTime, todayBookings, autoEvacuate, onCheckOut, clients]);

  // Compute Near End-Time warnings & Pending check-in alerts
  const activeAlerts = useMemo(() => {
    const alerts: { id: string; type: 'warning' | 'info'; title: string; desc: string; time: string }[] = [];

    const match = currentClientTime.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return [];

    const currentHour = parseInt(match[1], 10);
    const currentMinute = parseInt(match[2], 10);
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    todayBookings.forEach((b) => {
      const client = clients.find((c) => c.id === b.clientId);
      const resource = resources.find((r) => r.id === b.resourceId);
      const clientName = client?.name || 'عميل مستقل';
      const resourceName = resource?.name || 'مكتب / قاعة';

      // 1. Pending check-in for too long (start time passed by 30 mins, still 'confirmed')
      if (b.status === 'confirmed') {
        const [startHour, startMin] = b.startTime.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMin;
        const delay = currentTotalMinutes - startTotalMinutes;
        if (delay >= 30) {
          alerts.push({
            id: `pending-${b.id}`,
            type: 'warning',
            title: 'حجز معلق لفترة طويلة جداً',
            desc: `العميل "${clientName}" لم يقم بتسجيل دخوله بعد إلى "${resourceName}". (الموعد المجدول: ${b.startTime} - متأخر بـ ${delay} دقيقة).`,
            time: b.startTime,
          });
        }
      }

      // 2. Near end time (currently checked-in, ends within 15 minutes)
      if (b.status === 'checked-in') {
        const [endHour, endMin] = b.endTime.split(':').map(Number);
        const endTotalMinutes = endHour * 60 + endMin;
        const minutesLeft = endTotalMinutes - currentTotalMinutes;
        if (minutesLeft > 0 && minutesLeft <= 15) {
          alerts.push({
            id: `ending-${b.id}`,
            type: 'info',
            title: 'اقتراب نهاية فترة الحجز المخصصة',
            desc: `جلسة العميل "${clientName}" في "${resourceName}" ستنتهي قريباً خلال ${minutesLeft} دقيقة (عند الساعة ${b.endTime}). يرجى التحضير للإخلاء.`,
            time: b.endTime,
          });
        }
      }
    });

    return alerts;
  }, [currentClientTime, todayBookings, clients, resources]);

  // Clients currently Checked-In
  const liveGuests = useMemo(() => {
    return todayBookings
      .filter((b) => b.status === 'checked-in')
      .map((b) => {
        const client = clients.find((c) => c.id === b.clientId);
        const resource = resources.find((r) => r.id === b.resourceId);
        return {
          booking: b,
          client,
          resource,
        };
      });
  }, [todayBookings, clients, resources]);

  // Booking details from code input (simulate scanning a booking ID like bk-2, bk-3...)
  const searchedBooking = useMemo(() => {
    if (!terminalSearch.trim()) return null;
    const cleanSearch = terminalSearch.toLowerCase();
    const bk = bookings.find(
      (b) =>
        b.id.toLowerCase() === cleanSearch ||
        b.clientId.toLowerCase() === cleanSearch ||
        clients.find((c) => c.id === b.clientId)?.name.toLowerCase().includes(cleanSearch)
    );
    if (!bk) return null;

    const client = clients.find((c) => c.id === bk.clientId);
    const resource = resources.find((r) => r.id === bk.resourceId);

    return { booking: bk, client, resource };
  }, [terminalSearch, bookings, clients, resources]);

  // Handle Scanning Demo Simulation
  const triggerScanDemo = () => {
    setIsScanning(true);
    setTerminalSearch('');
    setLastActionLog('Scanning device activated...');

    setTimeout(() => {
      setIsScanning(false);
      // Randomly pick a pending/confirmed booking from today to check in during the scan!
      const prospectiveBooking = todayBookings.find((b) => b.status === 'confirmed');
      if (prospectiveBooking) {
        setTerminalSearch(prospectiveBooking.id);
        setLastActionLog(`Scanner detected RFID Key Fob corresponding to ${prospectiveBooking.id}.`);
      } else {
        setLastActionLog('Scan failed. No scheduled confirmed bookings detected for RFID scan.');
      }
    }, 1200);
  };

  const handleActionCheckIn = (id: string, name: string) => {
    onCheckIn(id);
    setLastActionLog(`Success: Checked-In guest "${name}" for scheduled space residency.`);
  };

  const handleActionCheckout = (id: string, name: string) => {
    onCheckOut(id);
    setLastActionLog(`Success: Checked-Out guest "${name}" and archived logs.`);
  };

  const handleActionSettlePrivilege = (id: string, name: string) => {
    onSettlePayment(id);
    setLastActionLog(`Invoice Settled: Surcharges paid. Cleared "${name}" accounts.`);
  };

  return (
    <div className="space-y-6" id="terminal-tab-root">
      
      {/* Dynamic Alerts and System Command Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 text-right transform transition font-mono text-xs" id="alerts-hub-panel">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5 space-x-reverse justify-end w-full sm:w-auto">
            <div className="relative">
              <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ${activeAlerts.length > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              <div className={`p-2 rounded-lg border text-white ${activeAlerts.length > 0 ? 'bg-rose-950/30 border-rose-800/50 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                <Bell className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-sans">مركز التنبيهات وإدارة الإخلاء والتسجيل الحية</h3>
              <p className="text-[10px] text-slate-400 font-sans">المراقبة المستمرة للحيازة والوقت لعام 2026</p>
            </div>
          </div>

          {/* Auto evacuation toggle */}
          <div className="flex items-center space-x-3 space-x-reverse bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 font-sans">
            <label className="text-[11px] font-semibold text-slate-300 cursor-pointer select-none" htmlFor="auto-evacuate-toggle">
              نظام الإخلاء التلقائي الذكي نشط :
            </label>
            <input
              type="checkbox"
              id="auto-evacuate-toggle"
              checked={autoEvacuate}
              onChange={(e) => setAutoEvacuate(e.target.checked)}
              className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-slate-900"
            />
            <span className={`text-[10px] font-bold ${autoEvacuate ? 'text-emerald-400' : 'text-slate-500'}`}>
              ({autoEvacuate ? 'مفعّل' : 'ملغى'})
            </span>
          </div>
        </div>

        {/* Real-time calculated notification cards */}
        {activeAlerts.length > 0 ? (
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start p-3 rounded-lg border text-[11px] gap-3 leading-relaxed transition ${
                  alert.type === 'warning'
                    ? 'bg-amber-950/20 border-amber-800/40 text-amber-200 text-right'
                    : 'bg-blue-950/20 border-blue-800/40 text-blue-200 text-right'
                }`}
                dir="rtl"
              >
                <div className="p-1 rounded-md bg-slate-950 flex-shrink-0 mt-0.5">
                  <AlertTriangle className={`w-3.5 h-3.5 ${alert.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                </div>
                <div className="flex-1 text-right">
                  <span className="font-bold block text-slate-100 mb-0.5 font-sans">{alert.title}</span>
                  <p className="text-slate-300 font-sans">{alert.desc}</p>
                </div>
                <span className="text-[9px] bg-slate-950/60 font-semibold text-slate-400 px-2 py-0.5 rounded font-mono self-center">
                  {alert.time}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 bg-slate-950 border border-slate-850 border-dashed rounded-lg text-center text-slate-400 font-sans text-xs">
            ✨ حفرة العمليات آمنة بالكامل ومستقرة: لا توجد تنبيهات تأخير أو إخلاء قريبة حالياً.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Front-desk Quick Console */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4" id="reception-console-container">
          <div>
            <h3 className="text-sm font-semibold text-white">منصة التحقق والمسح الضوئي</h3>
            <p className="text-xs text-slate-400">ابحث عن رمز الحجز أو محاكاة تمرير بطاقة العميل الذكية</p>
          </div>

          {/* Input Scanner bar */}
          <div className="space-y-3" id="rfid-scan-controls">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="أدخل اسم العميل أو معرف الحجز (مثل bk-1)..."
                value={terminalSearch}
                onChange={(e) => setTerminalSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg pr-9 pl-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-right"
              />
            </div>

            <button
              onClick={triggerScanDemo}
              disabled={isScanning}
              className={`w-full py-2.5 rounded-lg border text-xs font-semibold font-mono flex items-center justify-center transition-all cursor-pointer ${
                isScanning
                  ? 'bg-slate-950 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-sm'
              }`}
              id="btn-scandemo"
            >
              <Scan className={`w-4 h-4 ml-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'مزامنة قارئ البطاقات اللاسلكي...' : 'محاكاة تمرير بطاقة تعريف ذكية للهوية RFID'}
            </button>
          </div>

          {/* Console Action Logs */}
          {lastActionLog && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1 text-right" id="system-event-logger">
              <span className="text-[8px] uppercase font-mono tracking-wider text-slate-500 block">سجل مراقبة العمليات اللحظية</span>
              <p className="text-[10px] text-emerald-400 font-mono leading-relaxed" dir="rtl">{lastActionLog}</p>
            </div>
          )}

          {/* Matched Booking Detail view */}
          {searchedBooking ? (
            <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 space-y-4 font-mono text-[11px] text-right" id="scanned-booking-plate">
              <div className="flex justify-between items-start border-b border-slate-800/80 pb-2">
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded ${
                    searchedBooking.booking.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : searchedBooking.booking.status === 'checked-in'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-400/20'
                      : searchedBooking.booking.status === 'confirmed'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {searchedBooking.booking.status === 'completed' ? 'تم الخروج' : searchedBooking.booking.status === 'checked-in' ? 'جلسة نشطة' : searchedBooking.booking.status === 'confirmed' ? 'محجوز' : 'ملغي'}
                </span>

                <div>
                  <span className="text-[9px] text-slate-500">معرف الحجز</span>
                  <div className="text-white font-bold">{searchedBooking.booking.id}</div>
                </div>
              </div>

              <div className="space-y-2 text-right">
                <div>
                  <span className="text-[9px] text-slate-500 block">تفاصيل العميل</span>
                  <span className="text-slate-200 font-semibold font-sans">{searchedBooking.client?.name}</span>
                  <span className="text-[9px] text-slate-400 block">{searchedBooking.client?.email}</span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 block">المرفق أو المساحة</span>
                  <span className="text-slate-200 font-sans">{searchedBooking.resource?.name}</span>
                  <span className="text-[9px] text-indigo-400 block font-sans">
                    {searchedBooking.resource?.location} &bull; {searchedBooking.resource?.hourlyRate} ر.س / ساعة
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-2 text-[10px] text-right">
                  <div className="text-left">
                    <span className="text-[8px] text-slate-500 block text-left">التسعيرة والرسوم</span>
                    <span className="text-white font-bold text-xs">{searchedBooking.booking.totalPrice} ر.س</span>
                    <span
                      className={`block font-semibold text-[9px] ${
                        searchedBooking.booking.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {searchedBooking.booking.paymentStatus === 'paid' ? 'مسدد بالكامل' : 'معلق لم يسدد'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[8px] text-slate-500 block">الجدولة والزمن</span>
                    <span className="text-slate-200 block">{searchedBooking.booking.date}</span>
                    <span className="text-slate-300 font-semibold block">
                      {searchedBooking.booking.startTime} - {searchedBooking.booking.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick action buttons for searched booking */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                {searchedBooking.booking.status === 'confirmed' && (
                  <button
                    onClick={() => handleActionCheckIn(searchedBooking.booking.id, searchedBooking.client?.name || '')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center justify-center transition cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 ml-1" /> تسجيل دخول العميل للموقع
                  </button>
                )}

                {searchedBooking.booking.status === 'checked-in' && (
                  <button
                    onClick={() => handleActionCheckout(searchedBooking.booking.id, searchedBooking.client?.name || '')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center justify-center transition cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5 ml-1" /> مغادرة العميل وإخلاء المساحة
                  </button>
                )}

                {searchedBooking.booking.paymentStatus === 'unpaid' && (
                  <button
                    onClick={() => handleActionSettlePrivilege(searchedBooking.booking.id, searchedBooking.client?.name || '')}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center justify-center transition cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 ml-1" /> سداد الفاتورة والمستحقات فوراً
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 border border-slate-800 border-dashed rounded-lg text-center text-slate-500 text-[11px] font-sans">
              يرجى كتابة اسم العميل، معرف الحجز، أو محاكاة تمرير بطاقة الهوية الذكية RFID للتفاعل السريع والمسح.
            </div>
          )}

          {/* DATABASE LOCAL COLD BACKUP MODULE */}
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4.5 space-y-3 text-right font-sans" id="cold-storage-backup-terminal-card">
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase block">SECURE COLD BACKUP & LOCAL ARCHIVAL</span>
            <div className="space-y-1">
              <h4 className="text-white text-xs font-semibold">تصدير أرشيف قاعدة البيانات المتكاملة (JSON)</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">تحميل وحفظ نسخة ممتلئة تشمل سجلات العملاء المشتركين، الحجوزات المتفاوتة، وتفاصيل الأصول التشغيلية لضمان الاستمرارية والعمل التام دون اتصال إنترنت.</p>
            </div>
            {onExportBackup && (
              <button
                type="button"
                onClick={onExportBackup}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-505 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer shadow-md shadow-indigo-950"
              >
                📦 حفظ والتقاط النسخة الاحتياطية الفورية للبيانات
              </button>
            )}
          </div>
        </div>

        {/* Live Occupants Roster of checked-in people */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="occupants-roster-glass">
          <div className="text-right">
            <h3 className="text-sm font-semibold text-white">العملاء بداخل المساحات حالياً</h3>
            <p className="text-xs text-slate-400">قائمة الشركاء المتواجدين بصفة نشطة وحيازة مستمرة (اليوم: 31 مايو)</p>
          </div>

          <div className="flex-1 mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1 font-mono text-[11px] text-right" id="terminal-occupant-listings">
            {liveGuests.length > 0 ? (
              liveGuests.map(({ booking, client, resource }) => (
                <div
                  key={booking.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 flex flex-col sm:flex-row-reverse justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1.5 text-right w-full sm:w-auto">
                    <div className="flex items-center justify-start sm:justify-end space-x-2 space-x-reverse">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse mt-0.5" />
                      <span className="font-bold text-slate-100 font-sans">{client?.name}</span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-sans font-semibold">
                        {client?.membership === 'enterprise' ? 'مؤسسي' : client?.membership === 'pro' ? 'متقدم' : 'عادي'}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-start sm:justify-end font-sans">
                      <span className="text-indigo-400 font-bold ml-1">{resource?.location}</span> &bull; <span className="mx-1">{resource?.name}</span>
                      <MapPin className="w-3.5 h-3.5 ml-1 text-slate-500 self-center" />
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-start sm:justify-end font-sans">
                      <span className="font-mono text-slate-200">{booking.startTime} - {booking.endTime}</span>
                      <span className="mx-1">:الجدولة الزمنية</span>
                      <Clock className="w-3.5 h-3.5 ml-1 text-slate-500 self-center" />
                    </div>
                  </div>

                  <div className="flex flex-row justify-between sm:justify-center items-center w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleActionCheckout(booking.id, client?.name || '')}
                      className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] transition-colors cursor-pointer font-sans"
                    >
                      تسجيل مغادرة وإخلاء
                    </button>
                    <span className="text-slate-500 text-[9px] block sm:hidden font-sans">العمليات السريعة</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-500 font-sans">
                <UserCheck className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-xs">لا يوجد عملاء حاليين مسجل حضوهم بداخل المرفق في الوقت الحالي.</p>
              </div>
            )}
          </div>
          
          {/* Footnote statistics */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between text-[10px] font-mono text-slate-400" dir="rtl">
            <span>العملاء النشطين بالموقع: {liveGuests.length} شريك</span>
            <span>إجمالي حجوزات اليوم: {todayBookings.length} عملية حجز</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Resource, Client, Booking, BookingStatus, PaymentStatus, AddOnOption } from '../types';
import { ADD_ONS } from '../data/mockData';
import { Calendar, Plus, Clock, Users, ArrowRight, ShieldAlert, DollarSign, Eye, Trash, Ban, CheckCircle, UserPlus, Star } from 'lucide-react';
import { translations } from '../utils/translations';

interface CalendarTabProps {
  bookings: Booking[];
  resources: Resource[];
  clients: Client[];
  onAddBooking: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  onSettlePayment: (bookingId: string) => void;
  language?: 'ar' | 'en';
  starredClientIds: string[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  selectedBookingId?: string | null;
  onSelectBookingId?: (id: string | null) => void;
}

const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const CalendarTab: React.FC<CalendarTabProps> = ({
  bookings,
  resources,
  clients,
  onAddBooking,
  onCancelBooking,
  onUpdateBookingStatus,
  onSettlePayment,
  language = 'ar',
  starredClientIds,
  selectedDate: propSelectedDate,
  onSelectDate: propOnSelectDate,
  selectedBookingId: propSelectedBookingId,
  onSelectBookingId: propOnSelectBookingId,
}) => {
  const t = translations[language];
  
  // Controlled selectedDate helper
  const [localSelectedDate, setLocalSelectedDate] = useState('2026-05-31');
  const selectedDate = propSelectedDate !== undefined ? propSelectedDate : localSelectedDate;
  const setSelectedDate = (d: string) => {
    if (propOnSelectDate) propOnSelectDate(d);
    setLocalSelectedDate(d);
  };

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  // Focus and details retrieval trigger when an external selection occurs
  React.useEffect(() => {
    if (propSelectedBookingId) {
      const match = bookings.find((b) => b.id === propSelectedBookingId);
      if (match) {
        setSelectedBookingDetails(match);
        if (match.date !== selectedDate) {
          setSelectedDate(match.date);
        }
      }
    }
  }, [propSelectedBookingId, bookings]);

  // Bulk Multi-Select state trackers and routines
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

  const dayBookingsList = useMemo(() => {
    return bookings.filter((b) => b.date === selectedDate);
  }, [bookings, selectedDate]);

  const toggleSelectAll = () => {
    if (bulkSelectedIds.length === dayBookingsList.length) {
      setBulkSelectedIds([]);
    } else {
      setBulkSelectedIds(dayBookingsList.map((b) => b.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (bulkSelectedIds.includes(id)) {
      setBulkSelectedIds(bulkSelectedIds.filter((x) => x !== id));
    } else {
      setBulkSelectedIds([...bulkSelectedIds, id]);
    }
  };

  const handleBulkStatusChange = (status: BookingStatus) => {
    bulkSelectedIds.forEach((id) => {
      onUpdateBookingStatus(id, status);
    });
    setBulkSelectedIds([]);
  };

  const handleBulkCancelAll = () => {
    bulkSelectedIds.forEach((id) => {
      onCancelBooking(id);
    });
    setBulkSelectedIds([]);
  };

  const handleBulkSettleAll = () => {
    bulkSelectedIds.forEach((id) => {
      onSettlePayment(id);
    });
    setBulkSelectedIds([]);
  };

  // New Booking Wizard Form State
  const [wizClientId, setWizClientId] = useState(clients[0]?.id || '');
  const [wizResourceId, setWizResourceId] = useState(resources[0]?.id || '');
  const [wizStartTime, setWizStartTime] = useState('09:00');
  const [wizEndTime, setWizEndTime] = useState('11:00');
  const [wizNotes, setWizNotes] = useState('');
  const [wizAddOns, setWizAddOns] = useState<string[]>([]);
  const [wizError, setWizError] = useState('');

  // Date selectors helper
  const dateOptions = [
    { label: t.todayLabel, date: '2026-05-31' },
    { label: t.tomorrowLabel, date: '2026-06-01' },
    { label: t.nextDayLabel, date: '2026-06-02' },
  ];

  // Days of the week in Arabic
  const AR_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  // Sunday to Saturday of selectedDate's week
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const dayOfWeek = current.getDay(); // 0 is Sunday, 1 is Monday ...
    const temp = new Date(current);
    temp.setDate(current.getDate() - dayOfWeek); // Go back to Sunday

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(temp);
      nextDate.setDate(temp.getDate() + i);
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      days.push({
        date: `${yyyy}-${mm}-${dd}`,
        dayName: AR_WEEKDAYS[i],
        dayNum: nextDate.getDate()
      });
    }
    return days;
  }, [selectedDate]);

  // Dynamic Month days layout builder (handles padding starting and ending blocks beautifully)
  const monthDaysGrid = useMemo(() => {
    const current = new Date(selectedDate);
    const year = current.getFullYear();
    const month = current.getMonth(); // 0-indexed

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // Sunday is 0, Monday is 1, etc.

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];

    // Pad previous month days
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const totalDaysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = totalDaysInPrevMonth - i;
      const dateStr = `${prevMonthYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push({ date: dateStr, dayNum: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      grid.push({ date: dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Pad next month days to complete grid multiplier of 7
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    const remainingCells = (7 - (grid.length % 7)) % 7;
    const targetLength = grid.length <= 35 ? (grid.length + remainingCells <= 35 ? 35 : 42) : 42;

    let nextD = 1;
    while (grid.length < targetLength) {
      const dateStr = `${nextMonthYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextD).padStart(2, '0')}`;
      grid.push({ date: dateStr, dayNum: nextD, isCurrentMonth: false });
      nextD++;
    }

    return grid;
  }, [selectedDate]);

  // Sort starred clients to top of wizard dropdown list
  const sortedClientsForWiz = useMemo(() => {
    return [...clients].sort((a, b) => {
      const aStarred = starredClientIds.includes(a.id) ? 1 : 0;
      const bStarred = starredClientIds.includes(b.id) ? 1 : 0;
      return bStarred - aStarred;
    });
  }, [clients, starredClientIds]);

  // Helper check if hour is covered
  const isHourCovered = (start: string, end: string, checkHour: string) => {
    const parseTime = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h + m / 60;
    };
    const s = parseTime(start);
    const e = parseTime(end);
    const c = parseTime(checkHour);
    return c >= s && c < e;
  };

  // Helper to find a booking for a resource at a given hour on a given date
  const getBookingForSlot = (resourceId: string, hour: string, date: string) => {
    return bookings.find(
      (b) =>
        b.resourceId === resourceId &&
        b.date === date &&
        b.status !== 'cancelled' &&
        isHourCovered(b.startTime, b.endTime, hour)
    );
  };

  // Calculate wizard price summary in real-time
  const wizardPriceCalculation = useMemo(() => {
    const resource = resources.find((r) => r.id === wizResourceId);
    if (!resource) return 0;

    const [sh, sm] = wizStartTime.split(':').map(Number);
    const [eh, em] = wizEndTime.split(':').map(Number);
    const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;

    if (isNaN(hours) || hours <= 0) return 0;

    const baseCost = hours * resource.hourlyRate;
    const addOnCost = wizAddOns.reduce((sum, id) => {
      const option = ADD_ONS.find((opt) => opt.id === id);
      return sum + (option ? option.price : 0);
    }, 0);

    return Math.round(baseCost + addOnCost);
  }, [wizResourceId, wizStartTime, wizEndTime, wizAddOns, resources]);

  // Handle cell click (either opens wizard preselected or opens selected booking details)
  const handleCellClick = (resourceId: string, hour: string) => {
    const resource = resources.find((r) => r.id === resourceId);
    if (resource && resource.status === 'maintenance') return; // Cannot book maintenance assets

    const activeBooking = getBookingForSlot(resourceId, hour, selectedDate);
    if (activeBooking) {
      setSelectedBookingDetails(activeBooking);
    } else {
      setWizResourceId(resourceId);
      setWizStartTime(hour);
      // Pre-select end time to cover 1 hour later
      const [h] = hour.split(':').map(Number);
      const endH = h + 1;
      setWizEndTime(`${endH < 10 ? '0' : ''}${endH}:00`);
      setWizError('');
      setWizAddOns([]);
      setIsWizardOpen(true);
    }
  };

  // Save the booking from form wizard
  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setWizError('');

    const [sh, sm] = wizStartTime.split(':').map(Number);
    const [eh, em] = wizEndTime.split(':').map(Number);
    const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;

    if (hours <= 0) {
      setWizError('Exit/End time must follow entrance/start schedule.');
      return;
    }

    // Double Booking Overlap Conflict Checks
    const conflictExists = bookings.some((b) => {
      if (b.status === 'cancelled' || b.resourceId !== wizResourceId || b.date !== selectedDate) {
        return false;
      }
      const bsh = Number(b.startTime.split(':')[0]);
      const bem = Number(b.startTime.split(':')[1]);
      const bStartFloat = bsh + bem / 60;

      const beh = Number(b.endTime.split(':')[0]);
      const bee = Number(b.endTime.split(':')[1]);
      const bEndFloat = beh + bee / 60;

      const wizStartFloat = sh + sm / 60;
      const wizEndFloat = eh + em / 60;

      // Overlap conditions rule
      return wizStartFloat < bEndFloat && wizEndFloat > bStartFloat;
    });

    if (conflictExists) {
      setWizError(t.bookingGridConflict);
      return;
    }

    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-4)}`,
      resourceId: wizResourceId,
      clientId: wizClientId,
      date: selectedDate,
      startTime: wizStartTime,
      endTime: wizEndTime,
      totalHours: hours,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      totalPrice: wizardPriceCalculation,
      notes: wizNotes,
      addOns: wizAddOns,
    };

    onAddBooking(newBooking);
    setIsWizardOpen(false);

    // Reset Fields
    setWizNotes('');
    setWizAddOns([]);
  };

  // Status trigger shortcuts
  const triggerCheckIn = (id: string) => {
    onUpdateBookingStatus(id, 'checked-in');
    setSelectedBookingDetails(prev => prev ? { ...prev, status: 'checked-in' } : null);
  };

  const triggerCheckOut = (id: string) => {
    onUpdateBookingStatus(id, 'completed');
    setSelectedBookingDetails(prev => prev ? { ...prev, status: 'completed' } : null);
  };

  const triggerCancel = (id: string) => {
    onCancelBooking(id);
    setSelectedBookingDetails(null);
  };

  const triggerSettle = (id: string) => {
    onSettlePayment(id);
    setSelectedBookingDetails(prev => prev ? { ...prev, paymentStatus: 'paid' } : null);
  };

  return (
    <div className="space-y-6" id="calendar-tab-root">
      {/* Date header and Wizard launch triggers */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm" id="calendar-header-panel">
        
        {/* Date Selector controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono w-full lg:w-auto">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/80 text-[10px] justify-center">
            {dateOptions.map((opt) => (
              <button
                key={opt.date}
                onClick={() => setSelectedDate(opt.date)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors uppercase font-sans cursor-pointer ${
                  selectedDate === opt.date ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 space-x-reverse text-xs justify-center font-sans">
            <span className="text-slate-500 whitespace-nowrap">البحث بالتاريخ:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1 text-xs outline-none focus:border-indigo-500 font-mono text-center"
            />
          </div>
        </div>

        {/* View Mode controls & Wizard trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Calendar view mode segments */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/80 text-[11px] justify-center font-sans">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'daily' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              يومي
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'weekly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              أسبوعي
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                viewMode === 'monthly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              شهري
            </button>
          </div>

          <button
            onClick={() => {
              setWizError('');
              setIsWizardOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3.5 py-2 text-xs font-semibold font-sans flex items-center transition-colors shadow-sm justify-center cursor-pointer whitespace-nowrap animate-fade-in"
            id="btn-calendar-add-booking"
          >
            <Plus className="w-3.5 h-3.5 ml-1" />
            جدولة حجز جديد +
          </button>
        </div>
      </div>

      {/* Grid view of Daily Calendar matrix */}
      {viewMode === 'daily' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm overflow-x-auto" id="schedule-matrix-container">
          <div style={{ minWidth: '780px' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-right w-20">النطاق الزمني</th>
                  {resources.map((res) => (
                    <th key={res.id} className="py-2.5 px-2 text-center font-semibold text-xs">
                      <div className="truncate max-w-45 mx-auto font-sans text-xs text-white" title={res.name}>{res.name}</div>
                      <span className="text-[9px] text-indigo-400 font-sans tracking-wide">
                        السعة {res.capacity} أفراد &bull; {res.hourlyRate} ر.س / ساعة
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {HOURS.map((hour) => (
                  <tr key={hour} className="hover:bg-slate-800/20 group animate-fade-in">
                    <td className="py-3 px-3 text-slate-400 font-semibold border-r border-slate-800/60 text-[10px]">
                      {hour}
                    </td>

                    {resources.map((res) => {
                      const booking = getBookingForSlot(res.id, hour, selectedDate);
                      const isMaint = res.status === 'maintenance';

                      if (isMaint) {
                        return (
                          <td key={res.id} className="py-1 px-1 bg-rose-950/25 border-r border-slate-800/40 text-center">
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block select-none">
                              صيانة وقائية
                            </span>
                          </td>
                        );
                      }

                      if (booking) {
                        const client = clients.find((c) => c.id === booking.clientId);
                        const isStartHour = booking.startTime === hour;
                        const isStarred = starredClientIds.includes(booking.clientId);

                        // Only draw cell label details if it is the starting block of the booking
                        return (
                          <td
                            key={res.id}
                            onClick={() => handleCellClick(res.id, hour)}
                            className={`py-1.5 px-2 cursor-pointer border-r border-slate-800/40 text-center transition-all ${
                              booking.status === 'completed'
                                ? 'bg-slate-950/80 text-slate-400'
                                : booking.status === 'checked-in'
                                ? 'bg-indigo-500/15 border-indigo-500/10 text-white'
                                : 'bg-blue-500/15 border-blue-500/10 text-white'
                            }`}
                          >
                            {isStartHour ? (
                              <div className="space-y-0.5 max-w-40 mx-auto">
                                <span className="font-semibold block truncate font-sans text-xs" title={client?.name}>
                                  {isStarred ? '⭐ ' : ''}{client ? client.name : 'عميل غير معروف'}
                                </span>
                                <span className="text-[8px] uppercase tracking-widest px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-sans font-bold">
                                  {booking.status === 'completed'
                                    ? 'مكتمل'
                                    : booking.status === 'checked-in'
                                    ? 'مسجل دخول'
                                    : 'مؤكد'}
                                </span>
                              </div>
                            ) : (
                              <div className="h-4 w-full bg-transparent" />
                            )}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={res.id}
                          onClick={() => handleCellClick(res.id, hour)}
                          className="py-3 px-2 text-center text-slate-700 hover:text-indigo-400 border-r border-slate-800/40 cursor-pointer text-[10px] uppercase font-bold"
                        >
                          <span className="opacity-0 group-hover:opacity-40 transition-opacity font-sans text-[11px]">
                            + حجز جديد
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly View Grid */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 animate-fade-in animate-duration-300" id="weekly-view-grid">
          {weekDays.map((wd) => {
            const dayBookings = bookings.filter((b) => b.date === wd.date && b.status !== 'cancelled');
            const isSelected = selectedDate === wd.date;
            return (
              <div
                key={wd.date}
                className={`bg-slate-900 border rounded-xl p-4 space-y-3 flex flex-col justify-between transition min-h-[300px] text-right cursor-pointer ${
                  isSelected ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => setSelectedDate(wd.date)}
              >
                <div>
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-[9px] text-slate-500 font-mono font-bold">{wd.date.slice(5)}</span>
                    <h4 className={`text-xs font-bold font-sans ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                      {wd.dayName} {wd.dayNum}
                    </h4>
                  </div>

                  <div className="space-y-2 mt-3 flex-1 overflow-y-auto max-h-[220px] pr-0.5">
                    {dayBookings.length > 0 ? (
                      dayBookings.map((b) => {
                        const client = clients.find((c) => c.id === b.clientId);
                        const resource = resources.find((r) => r.id === b.resourceId);
                        const isStarred = starredClientIds.includes(b.clientId);
                        return (
                          <div
                            key={b.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBookingDetails(b);
                            }}
                            className={`p-2 rounded-lg border text-right cursor-pointer hover:border-slate-600 transition text-[10px] space-y-1 block ${
                              b.status === 'completed'
                                ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                                : b.status === 'checked-in'
                                ? 'bg-indigo-950/20 border-indigo-900/60 text-indigo-200'
                                : 'bg-blue-950/20 border-blue-900/60 text-blue-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] bg-slate-950 px-1 rounded font-bold text-slate-400 font-mono text-left">
                                {b.startTime}
                              </span>
                              <span className="font-semibold truncate font-sans text-slate-100 max-w-[80px]" dir="rtl">
                                {isStarred ? '⭐ ' : ''}{client?.name || 'عميل'}
                              </span>
                            </div>
                            <div className="text-slate-400 font-sans truncate text-[9px]">{resource?.name}</div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[10px] text-slate-500 text-center font-sans py-12">لا توجد حجوزات</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate(wd.date);
                    setWizError('');
                    setIsWizardOpen(true);
                  }}
                  className="w-full py-1.5 mt-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-indigo-400 text-[10px] font-bold rounded-lg transition cursor-pointer text-center font-sans"
                >
                  + حجز سريع
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly View Grid */}
      {viewMode === 'monthly' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-right animate-fade-in" id="monthly-view-wrapper">
          {/* Days of week headers */}
          <div className="grid grid-cols-7 gap-2 border-b border-slate-850 pb-2.5 mb-2 text-slate-400 text-[11px] font-bold">
            {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
              <div key={day} className="text-center font-sans">{day}</div>
            ))}
          </div>

          {/* Monthly grid cells */}
          <div className="grid grid-cols-7 gap-2 shadow-inner">
            {monthDaysGrid.map((cell, idx) => {
              const cellBookings = bookings.filter((b) => b.date === cell.date && b.status !== 'cancelled');
              const isSelected = selectedDate === cell.date;

              return (
                <div
                  key={`${cell.date}-${idx}`}
                  onDoubleClick={() => {
                    setSelectedDate(cell.date);
                    setViewMode('daily');
                  }}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`min-h-[105px] bg-slate-950 rounded-lg p-2.5 flex flex-col justify-between border transition cursor-pointer select-none group text-right ${
                    isSelected
                      ? 'border-indigo-500 bg-slate-950/95 shadow-md'
                      : !cell.isCurrentMonth
                      ? 'border-slate-950 opacity-25 bg-slate-950/20 shadow-none'
                      : 'border-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] text-slate-500 group-hover:text-slate-400 font-sans hidden sm:inline">
                      {cellBookings.length > 0 ? `${cellBookings.length} حجز` : ''}
                    </span>
                    <span className={`text-xs font-bold font-mono ${isSelected ? 'text-indigo-400 font-extrabold' : 'text-slate-400'}`}>
                      {cell.dayNum}
                    </span>
                  </div>

                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[60px] pr-0.5">
                    {cellBookings.slice(0, 3).map((b) => {
                      const client = clients.find((c) => c.id === b.clientId);
                      const isStarred = starredClientIds.includes(b.clientId);
                      return (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBookingDetails(b);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-sans truncate ${
                            b.status === 'completed'
                              ? 'bg-slate-900 border border-slate-950 text-slate-520 text-slate-500'
                              : b.status === 'checked-in'
                              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-900/30'
                              : 'bg-blue-950/80 text-blue-300 border border-blue-900/30'
                          }`}
                          title={`${client?.name}: ${b.startTime}`}
                        >
                          {isStarred ? '⭐ ' : ''}{client?.name || 'عميل'}
                        </div>
                      );
                    })}
                    {cellBookings.length > 3 && (
                      <div className="text-[7.5px] text-indigo-400 font-extrabold font-sans text-center">
                        + {cellBookings.length - 3} أخرى
                      </div>
                    )}
                  </div>

                  <div className="text-left mt-1">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(cell.date);
                        setWizError('');
                        setIsWizardOpen(true);
                      }}
                      className="text-[8px] font-sans text-slate-500 hover:text-indigo-400 transition font-bold cursor-pointer"
                    >
                      + حجز
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-slate-500 font-semibold font-sans mt-3 text-right">
            💡 نصيحة: انقر نقرًا مزدوجًا على أي خلية تاريخ للدخول فوراً في "العرض اليومي تفصيلياً" للتحكم بالساعات والمساحات بمرونة.
          </p>
        </div>
      )}

      {/* Booking Wizard Modal Drawer Overlay */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="modal-booking-wizard">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-sans">
                تفاصيل إعداد وجدولة حجز جديد
              </h3>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4 font-mono text-xs text-right">
              {wizError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[10px] flex items-center justify-start space-x-1.5 space-x-reverse">
                  <ShieldAlert className="w-4 h-4 ml-1.5 flex-shrink-0" />
                  <span className="font-sans">{wizError === 'Conflicting booking time slot. Resource already busy during these hours.' || wizError === 'Conflicts with another booking' ? '🚨 خطأ زمني: المرفق مستغل مسبقاً في نفس الفترة الزمنية من عميل آخر.' : wizError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase text-right font-sans">العميل المستفيد *</label>
                  <select
                    value={wizClientId}
                    onChange={(e) => setWizClientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-right cursor-pointer font-sans"
                  >
                    {sortedClientsForWiz.map((c) => {
                      const isStarred = starredClientIds.includes(c.id);
                      return (
                        <option key={c.id} value={c.id}>
                          {isStarred ? '⭐ ' : ''}{c.name} ({c.membership === 'VIP' ? 'كبار الشخصيات' : c.membership === 'Corporate' ? 'مؤسسي' : 'عادي'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase text-right font-sans">المرفق أو المساحة *</label>
                  <select
                    value={wizResourceId}
                    onChange={(e) => setWizResourceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-right cursor-pointer font-sans"
                  >
                    {resources.map((res) => (
                      <option key={res.id} value={res.id} disabled={res.status === 'maintenance'}>
                        {res.name} {res.status === 'maintenance' ? '(صيانة)' : `(${res.hourlyRate} ر.س/ساعة)`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase text-right font-sans">من الساعة *</label>
                  <select
                    value={wizStartTime}
                    onChange={(e) => setWizStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-right cursor-pointer font-mono"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase text-right font-sans">إلى الساعة *</label>
                  <select
                    value={wizEndTime}
                    onChange={(e) => setWizEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-right cursor-pointer font-mono"
                  >
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Extras List of checkboxes */}
              <div className="space-y-1.5 text-right font-sans">
                <label className="block text-slate-400 text-[10px] uppercase">إقران التجهيزات والخدمات المطلوبة:</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto bg-slate-950 p-2 border border-slate-800 rounded-lg pr-1 text-right">
                  {ADD_ONS.map((opt) => {
                    const isChecked = wizAddOns.includes(opt.id);
                    return (
                      <label key={opt.id} className="flex justify-between items-start text-[10px] cursor-pointer hover:bg-slate-900 p-1.5 rounded space-x-2 space-x-reverse">
                        <div className="flex items-start space-x-2 space-x-reverse text-right">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setWizAddOns(wizAddOns.filter((id) => id !== opt.id));
                              } else {
                                setWizAddOns([...wizAddOns, opt.id]);
                              }
                            }}
                            className="mt-0.5 rounded border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer bg-slate-900"
                          />
                          <div>
                            <span className="text-slate-200 block font-semibold">
                              {opt.id === 'add-coffee' ? 'ركن الضيافة والمشروبات الحارة' : opt.id === 'add-projector' ? 'شاشة عرض ليزر وحزمة اتصالات' : 'أجهزة صوتية وحزمة ميكروفونات لاسلكية'}
                            </span>
                            <span className="text-slate-500 text-[9px] block leading-snug">
                              {opt.id === 'add-coffee' ? 'إمداد مفتوح للقهوة الفاخرة لجميع الحاضرين' : opt.id === 'add-projector' ? 'معدات اتصالات ومؤتمرات بجودة عالية' : 'أنظمة عزل واستديو صوتي مهيأ بالكامل'}
                            </span>
                          </div>
                        </div>
                        <span className="text-emerald-400 font-bold ml-2">+{opt.price} ر.س</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1 text-right font-sans">
                <label className="block text-slate-400 text-[10px] uppercase">مذكرة توضيحية / غرض الاستغلال</label>
                <input
                  type="text"
                  placeholder="مثال: ورشة عمل أو جلسة تشغيل وتصوير بودكاست"
                  value={wizNotes}
                  onChange={(e) => setWizNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 text-right font-sans"
                />
              </div>

              {/* Price estimation indicator */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex justify-between items-center text-[11px] font-bold font-sans">
                <span className="text-slate-400">حساب التسعيرة الإجمالية للحجز:</span>
                <span className="text-base text-emerald-400">{wizardPriceCalculation} ر.س</span>
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse pt-3 border-t border-slate-800 font-sans">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-3 py-2 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                >
                  إلغاء التبويب
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center transition-colors font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 ml-1" />
                  حفظ وتأكيد حجز المرفق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Detail Popover Overlay */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="modal-booking-details">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="font-mono text-right w-full">
                <span className="text-[10px] text-slate-400 block font-sans">بطاقة تفاصيل الحجز النشط</span>
                <span className="text-xs text-indigo-400 font-bold font-mono">{selectedBookingDetails.id}</span>
              </div>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="text-slate-400 hover:text-white font-mono text-xs ml-3 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Popover detail field lists */}
            <div className="space-y-3 font-mono text-[11px] text-right" id="booking-details-content">
              <div className="flex justify-between flex-row-reverse">
                <span className="text-slate-500 font-semibold uppercase font-sans">العميل المستفيد</span>
                <span className="text-white font-semibold font-sans">
                  {clients.find((c) => c.id === selectedBookingDetails.clientId)?.name || 'غير معروف'}
                </span>
              </div>

              <div className="flex justify-between flex-row-reverse">
                <span className="text-slate-500 font-semibold uppercase font-sans">المرفق المحجوز</span>
                <span className="text-white font-sans">
                  {resources.find((r) => r.id === selectedBookingDetails.resourceId)?.name || 'غير معروف'}
                </span>
              </div>

              <div className="flex justify-between flex-row-reverse">
                <span className="text-slate-500 font-semibold uppercase font-sans">الوقت والجدولة</span>
                <span className="text-white font-mono">
                  {selectedBookingDetails.date} &bull; {selectedBookingDetails.startTime} - {selectedBookingDetails.endTime}
                </span>
              </div>

              <div className="flex justify-between flex-row-reverse">
                <span className="text-slate-500 font-semibold uppercase font-sans">المدة الزمنية</span>
                <span className="text-white font-sans">{selectedBookingDetails.totalHours || 2} ساعات حجز</span>
              </div>

              <div className="flex justify-between flex-row-reverse">
                <span className="text-slate-500 font-semibold uppercase font-sans">التكلفة والرسوم</span>
                <span className="text-emerald-400 font-bold font-mono">{selectedBookingDetails.totalPrice} ر.س</span>
              </div>

              <div className="flex justify-between flex-row-reverse">
                <span className="text-slate-500 font-semibold uppercase font-sans">الحالة التشغيلية</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-bold ${
                    selectedBookingDetails.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : selectedBookingDetails.status === 'checked-in'
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {selectedBookingDetails.status === 'completed'
                    ? 'مكتمل'
                    : selectedBookingDetails.status === 'checked-in'
                    ? 'مسجل دخول'
                    : 'مؤكد'}
                </span>
              </div>

              <div className="flex justify-between flex-row-reverse">
                <span className="text-slate-500 font-semibold uppercase font-sans">وضعية السداد</span>
                <span
                  className={`font-semibold font-sans ${
                    selectedBookingDetails.paymentStatus === 'paid' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'
                  }`}
                >
                  {selectedBookingDetails.paymentStatus === 'paid' ? 'مسدد ومستقر' : 'بانتظار السداد'}
                </span>
              </div>

              {selectedBookingDetails.addOns && selectedBookingDetails.addOns.length > 0 && (
                <div className="pt-2 border-t border-slate-800 text-right font-sans">
                  <span className="text-slate-500 font-semibold uppercase block mb-1">الخدمات الإضافية المرفقة:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {selectedBookingDetails.addOns.map((id) => (
                      <span key={id} className="text-[9px] bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300">
                        {id === 'add-coffee' ? 'ركن الضيافة' : id === 'add-projector' ? 'شاشة عرض ليزر' : 'أجهزة صوتية'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBookingDetails.notes && (
                <div className="pt-2 border-t border-slate-800 text-slate-400 italic text-[10px] text-right font-sans">
                  ملاحظة الحجز: &ldquo;{selectedBookingDetails.notes}&rdquo;
                </div>
              )}
            </div>

            {/* Administrative Action triggers */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-[10px] font-sans">
              {selectedBookingDetails.paymentStatus === 'unpaid' && (
                <button
                  onClick={() => triggerSettle(selectedBookingDetails.id)}
                  className="col-span-2 py-2 bg-amber-650 hover:bg-amber-600 bg-amber-600 text-white rounded font-bold flex items-center justify-center transition cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 ml-1" /> تسوية ومطالبة فواتير العميل
                </button>
              )}

              {selectedBookingDetails.status === 'confirmed' && (
                <button
                  onClick={() => triggerCheckIn(selectedBookingDetails.id)}
                  className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center justify-center transition cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5 ml-1" /> تسجيل حضور العميل
                </button>
              )}

              {selectedBookingDetails.status === 'checked-in' && (
                <button
                  onClick={() => triggerCheckOut(selectedBookingDetails.id)}
                  className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold flex items-center justify-center transition cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 ml-1" /> إتمام وإنهاء حجز المرفق
                </button>
              )}

              <button
                onClick={() => triggerCancel(selectedBookingDetails.id)}
                className="py-2 bg-rose-950 border border-rose-800 hover:bg-rose-905 hover:bg-rose-900 text-rose-300 rounded font-bold flex items-center justify-center transition cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5 ml-1" /> إلغاء تفاصيل الحجز نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking List with Multi-Select Actions (Bulk status updates & bulk cancel) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-right" id="bulk-booking-operations-section">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">إجراء العمليات الجماعية وتدبير الحجوزات</h3>
            <p className="text-xs text-slate-400">تطبيق التعديلات السريعة والإلغاء وتغيير الحالة لعدة حجوزات دفعة واحدة (تاريخ اليوم المحدد: {selectedDate})</p>
          </div>
          
          {bulkSelectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-start font-sans">
              <button
                onClick={handleBulkCancelAll}
                className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded px-2.5 py-1 text-[10px] font-bold flex items-center transition-all cursor-pointer"
              >
                <Ban className="w-3 h-3 ml-1" /> إلغاء جماعي ({bulkSelectedIds.length})
              </button>
              
              <button
                onClick={handleBulkSettleAll}
                className="bg-amber-650/40 hover:bg-amber-600/30 text-amber-350 border border-amber-500/30 rounded px-2.5 py-1 text-[10px] font-bold flex items-center transition-all cursor-pointer"
              >
                <DollarSign className="w-3 h-3 ml-1" /> تسوية وسداد ({bulkSelectedIds.length})
              </button>

              <button
                onClick={() => handleBulkStatusChange('checked-in')}
                className="bg-emerald-655 bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2.5 py-1 text-[10px] font-bold flex items-center transition-all cursor-pointer"
              >
                <CheckCircle className="w-3 h-3 ml-1" /> حضور جماعي ({bulkSelectedIds.length})
              </button>

              <button
                onClick={() => handleBulkStatusChange('completed')}
                className="bg-indigo-650 bg-indigo-600 hover:bg-indigo-505 text-white rounded px-2.5 py-1 text-[10px] font-bold flex items-center transition-all cursor-pointer"
              >
                <Clock className="w-3 h-3 ml-1" /> إتمام جماعي ({bulkSelectedIds.length})
              </button>
              
              <button
                onClick={() => setBulkSelectedIds([])}
                className="bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 rounded px-2 py-1 text-[9px] cursor-pointer"
              >
                إلغاء التحديد
              </button>
            </div>
          )}
        </div>

        {dayBookingsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right divide-y divide-slate-850 font-mono text-xs">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3 text-center w-12">
                    <input
                      type="checkbox"
                      checked={dayBookingsList.length > 0 && bulkSelectedIds.length === dayBookingsList.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer bg-slate-950"
                    />
                  </th>
                  <th className="py-2.5 px-2">معرف الحجز</th>
                  <th className="py-2.5 px-2">العميل</th>
                  <th className="py-2.5 px-2">الأصل والمرفق</th>
                  <th className="py-2.5 px-2">فترة الجدولة</th>
                  <th className="py-2.5 px-2">سعر الحجز</th>
                  <th className="py-2.5 px-2 text-center">الحالة التشغيلية</th>
                  <th className="py-2.5 px-2 text-center">وضعية السداد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-305 text-slate-300">
                {dayBookingsList.map((b) => {
                  const client = clients.find(c => c.id === b.clientId);
                  const resource = resources.find(r => r.id === b.resourceId);
                  const isChecked = bulkSelectedIds.includes(b.id);
                  
                  return (
                    <tr key={b.id} className={`hover:bg-slate-950/60 transition ${isChecked ? 'bg-indigo-950/20' : ''}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(b.id)}
                          className="rounded border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer bg-slate-950"
                        />
                      </td>
                      <td className="py-3 px-2 font-bold text-white">{b.id}</td>
                      <td className="py-3 px-2 font-sans">{client?.name || 'عميل'}</td>
                      <td className="py-3 px-2 font-sans">{resource?.name || 'مساحة عمل'}</td>
                      <td className="py-3 px-2 font-mono">{b.startTime} - {b.endTime} ({b.totalHours}س)</td>
                      <td className="py-3 px-2 text-emerald-400 font-bold">{b.totalPrice} ر.س</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-bold ${
                          b.status === 'completed'
                            ? 'bg-slate-950 text-slate-500'
                            : b.status === 'checked-in'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : b.status === 'confirmed'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {b.status === 'completed' ? 'تم الخروج' : b.status === 'checked-in' ? 'جلسة نشطة' : b.status === 'confirmed' ? 'مؤكد' : 'ملغي'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-bold ${
                          b.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {b.paymentStatus === 'paid' ? 'مستقر ومسدد' : 'بانتظار السداد'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 border border-slate-850 border-dashed rounded-lg text-center text-slate-500 text-[11.5px] font-sans">
            لا توجد جدولة حجوزات مدرجة لليوم المحدد لتطبيق العمليات الجماعية.
          </div>
        )}
      </div>
    </div>
  );
};

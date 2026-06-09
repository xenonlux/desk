/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Client, Booking, Resource, MembershipType } from '../types';
import { Search, UserPlus, Mail, Phone, Calendar, Dumbbell, Shield, Award, Sparkles, FileText, Check, Plus, Star } from 'lucide-react';
import { translations } from '../utils/translations';

interface ClientsTabProps {
  clients: Client[];
  bookings: Booking[];
  resources: Resource[];
  onAddClient: (client: Client) => void;
  onUpdateClientNotes: (clientId: string, notes: string) => void;
  language?: 'ar' | 'en';
  starredClientIds: string[];
  onToggleStarClient: (clientId: string) => void;
  selectedClientId?: string | null;
  onSelectClient?: (clientId: string | null) => void;
}

export const ClientsTab: React.FC<ClientsTabProps> = ({
  clients,
  bookings,
  resources,
  onAddClient,
  onUpdateClientNotes,
  language = 'ar',
  starredClientIds,
  onToggleStarClient,
  selectedClientId: propSelectedClientId,
  onSelectClient: propOnSelectClient,
}) => {
  const t = translations[language];
  const [localSelectedClientId, setLocalSelectedClientId] = useState<string | null>(clients[0]?.id || null);
  
  const selectedClientId = propSelectedClientId !== undefined && propSelectedClientId !== null ? propSelectedClientId : localSelectedClientId;
  const setSelectedClientId = (id: string | null) => {
    if (propOnSelectClient) {
      propOnSelectClient(id);
    }
    setLocalSelectedClientId(id);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);

  // New Client Form Fields State
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientMembership, setNewClientMembership] = useState<MembershipType>('regular');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Selected client detail object
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Selected client bookings
  const clientBookings = useMemo(() => {
    if (!selectedClientId) return [];
    return bookings
      .filter((b) => b.clientId === selectedClientId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [bookings, selectedClientId]);

  // Total Lifetime spend for selected client
  const lifetimeSpend = useMemo(() => {
    return clientBookings
      .filter((b) => b.paymentStatus === 'paid' && b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0);
  }, [clientBookings]);

  // Search filtering & Star sort optimization
  const filteredClients = useMemo(() => {
    const list = clients.filter((c) => {
      const matchQuery = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(matchQuery) ||
        c.email.toLowerCase().includes(matchQuery) ||
        c.phone.includes(matchQuery)
      );
    });

    // Dynamic sort: Favorited (starred) items always appear first
    return [...list].sort((a, b) => {
      const aStarred = starredClientIds.includes(a.id) ? 1 : 0;
      const bStarred = starredClientIds.includes(b.id) ? 1 : 0;
      return bStarred - aStarred;
    });
  }, [clients, searchQuery, starredClientIds]);

  // Notes editing state
  const [editedNotes, setEditedNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const startEditingNotes = () => {
    if (selectedClient) {
      setEditedNotes(selectedClient.notes);
      setIsEditingNotes(true);
    }
  };

  const saveEditedNotes = () => {
    if (selectedClient) {
      onUpdateClientNotes(selectedClient.id, editedNotes);
      setIsEditingNotes(false);
    }
  };

  const handleSubmitClient = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newClientName.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!newClientEmail.trim() || !newClientEmail.includes('@')) {
      setFormError('Provide a valid email address.');
      return;
    }

    const newClient: Client = {
      id: `c-${Date.now()}`,
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone || 'N/A',
      notes: newClientNotes,
      membership: newClientMembership,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    onAddClient(newClient);
    setSelectedClientId(newClient.id);
    setIsAddingClient(false);

    // Reset Form
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientMembership('regular');
    setNewClientNotes('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" id="clients-tab-root">
      
      {/* Search and CRM Directory List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-4 h-[600px] flex flex-col justify-between animate-fade-in" id="crm-directory-card">
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 p-1 rounded-lg">
            <div>
              <h3 className="text-sm font-semibold text-white font-sans">حقيبة وملفات العملاء</h3>
              <p className="text-xs text-slate-400 font-sans">{clients.length} أعضاء نشطين</p>
            </div>
            <button
              onClick={() => setIsAddingClient(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium flex items-center transition-colors cursor-pointer"
              id="btn-register-client"
            >
              <UserPlus className="w-3.5 h-3.5 ml-1 mr-1 text-slate-100" />
              تسجيل عميل جديد
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="البحث في سجل العملاء بالاسم، الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs rounded-lg pr-9 pl-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-right"
            />
          </div>
        </div>

        {/* Directory List Container */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-1.5 font-mono" id="crm-directory-list">
          {filteredClients.length > 0 ? (
            filteredClients.map((c) => {
              const isSelected = c.id === selectedClientId;
              const hasActiveBooking = bookings.some(
                (b) => b.clientId === c.id && (b.status === 'checked-in' || b.status === 'confirmed')
              );
              const isStarred = starredClientIds.includes(c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setIsEditingNotes(false);
                  }}
                  className={`w-full p-3 rounded-lg text-left flex items-center justify-between border transition-all text-xs cursor-pointer select-none ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                      : 'bg-slate-950 hover:bg-slate-800/50 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStarClient(c.id);
                      }}
                      className="p-1 px-1.5 rounded bg-slate-900 border border-slate-850 hover:border-slate-700 transition cursor-pointer"
                      title={isStarred ? 'إزالة من المفضلة' : 'تمييز كعميل متكرر'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    </button>

                    <div className="space-y-1 max-w-40 text-right pr-1">
                      <div className="font-semibold text-slate-100 truncate flex items-center justify-end space-x-1 space-x-reverse font-sans">
                        <span>{c.name}</span>
                        {isStarred && <span className="text-amber-400 font-bold text-[10px]">⭐</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{c.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1 text-right">
                    <span
                      className={`text-[8px] tracking-widest px-1.5 py-0.5 rounded-full font-sans font-semibold ${
                        c.membership === 'enterprise' || c.membership === 'VIP' || c.membership === 'Corporate'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/20'
                          : c.membership === 'pro'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {c.membership === 'enterprise' || c.membership === 'Corporate' || c.membership === 'VIP' ? 'مؤسسي VIP' : c.membership === 'pro' ? 'متقدم' : 'عادي'}
                    </span>
                    {hasActiveBooking && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="يوجد حجز نشط حالياً" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Search className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs font-sans">لم يتم العثور على نتائج مطابقة لاستعلامك.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel of the selected client */}
      <div className="lg:col-span-2 space-y-6 animate-fade-in" id="client-detailed-panel">
        {selectedClient ? (
          <>
            {/* Header Profiler card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm" id="client-badge-card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="h-14 w-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    {/* Membership Badge Icon */}
                    {selectedClient.membership === 'enterprise' || selectedClient.membership === 'VIP' || selectedClient.membership === 'Corporate' ? (
                      <Sparkles className="w-7 h-7" />
                    ) : selectedClient.membership === 'pro' ? (
                      <Award className="w-7 h-7" />
                    ) : (
                      <Shield className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-start mb-0.5">
                      <h2 className="text-lg font-semibold text-white tracking-tight font-sans">{selectedClient.name}</h2>
                      <button
                        onClick={() => onToggleStarClient(selectedClient.id)}
                        className="text-slate-400 hover:text-amber-400 transition cursor-pointer p-0.5"
                        title={starredClientIds.includes(selectedClient.id) ? 'إزالة من المفضلة' : 'تمييز كعميل كبار الشخصيات المفضلة'}
                      >
                        <Star className={`w-4 h-4 ${starredClientIds.includes(selectedClient.id) ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans text-right">
                      تاريخ الانضمام للشبكة &bull; {selectedClient.joinedDate}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-6 space-x-reverse text-right font-mono self-stretch md:self-auto justify-between md:justify-end border-t border-slate-800 md:border-0 pt-3 md:pt-0">
                  <div className="mx-2">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-sans">إجمالي المبيعات</span>
                    <span className="text-base font-semibold text-emerald-450 text-emerald-400 font-mono">{lifetimeSpend} ر.س</span>
                  </div>
                  <div className="mx-2">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-sans">العمليات والطلبات</span>
                    <span className="text-base font-semibold text-slate-200">
                      {clientBookings.filter((b) => b.status !== 'cancelled').length} حجوزات
                    </span>
                  </div>
                </div>
              </div>

              {/* General details lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-slate-850 pt-4 text-xs font-mono">
                <div className="flex items-center justify-end md:justify-start space-x-2 space-x-reverse text-slate-350 bg-slate-950 p-2 border border-slate-850 rounded">
                  <Mail className="w-4 h-4 text-slate-450" />
                  <span>{selectedClient.email}</span>
                </div>
                <div className="flex items-center justify-end md:justify-start space-x-2 space-x-reverse text-slate-350 bg-slate-950 p-2 border border-slate-850 rounded">
                  <Phone className="w-4 h-4 text-slate-450" />
                  <span className="font-mono">{selectedClient.phone}</span>
                </div>
              </div>
            </div>

            {/* Custom Notes Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="customer-notes-card">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center font-sans">
                  <FileText className="w-4 h-4 ml-1.5 text-indigo-400" />
                  الأفضليات الإدارية وتفضيلات الخدمة المقررة
                </h4>
                {!isEditingNotes ? (
                  <button
                    onClick={startEditingNotes}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-sans cursor-pointer"
                  >
                    تعديل الملاحظة
                  </button>
                ) : (
                  <div className="flex space-x-3 space-x-reverse text-xs font-mono">
                    <button onClick={saveEditedNotes} className="text-emerald-400 hover:text-emerald-300 flex items-center font-sans">
                      <Check className="w-3.5 h-3.5 ml-1" />
                      حفظ
                    </button>
                    <button onClick={() => setIsEditingNotes(false)} className="text-slate-400 hover:text-slate-300 font-sans">
                      إلغاء
                    </button>
                  </div>
                )}
              </div>

              {isEditingNotes ? (
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono h-24 text-right"
                  placeholder="أدخل التفضيلات والملاحظات الفردية..."
                />
              ) : (
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono italic text-right font-sans leading-relaxed">
                  {selectedClient.notes || 'لا توجد مذكرات أو تعليمات إدارية مسجلة لهذا العميل النشط. تفضل بالنقر على زر التعديل لتسجيل إحداها.'}
                </p>
              )}
            </div>

            {/* Client Booking History table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-right" id="client-history-list">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center justify-end font-sans">
                <Calendar className="w-4 h-4 ml-1.5 text-indigo-400" />
                آخر الإيصالات وعمليات حجز المرفق للعميل
              </h3>

              <div className="overflow-x-auto" id="client-history-table">
                <table className="w-full text-right font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-805 border-slate-800 text-slate-400 text-right">
                      <th className="pb-3 font-medium text-right font-sans">المرفق المحجوز</th>
                      <th className="pb-3 font-medium text-right font-sans">سجل الجدولة</th>
                      <th className="pb-3 font-medium text-right font-sans">الرسوم المطلوبة</th>
                      <th className="pb-3 font-medium text-left font-sans">حالة العملية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {clientBookings.length > 0 ? (
                      clientBookings.map((bk) => {
                        const resource = resources.find((r) => r.id === bk.resourceId);
                        return (
                          <tr key={bk.id} className="text-slate-350 hover:bg-slate-950/20">
                            <td className="py-3 text-right">
                              <span className="font-semibold text-slate-100 block font-sans">
                                {resource ? resource.name : 'مرفق غير معروف'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-sans">
                                {resource ? (resource.type === 'room' ? 'قاعة اجتماعات مجهزة' : resource.type === 'studio' ? 'استوديو تصوير وبودكاست' : resource.type === 'booth' ? 'كابينة عزل وتركيز' : 'مكتب عمل مرن') : 'غير متوفر'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="text-slate-200">{bk.date}</div>
                              <div className="text-[10px] text-slate-400 font-sans">
                                {bk.startTime} - {bk.endTime} ({bk.totalHours || 2} ساعات حجز)
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <span className="font-medium text-slate-200">{bk.totalPrice} ر.س</span>
                              <span
                                className={`block text-[9px] font-sans font-bold ${
                                  bk.paymentStatus === 'paid'
                                    ? 'text-emerald-400'
                                    : bk.paymentStatus === 'unpaid'
                                    ? 'text-amber-500'
                                    : 'text-slate-500'
                                }`}
                              >
                                {bk.paymentStatus === 'paid' ? 'مسدد ومستقر مالياً' : 'معلق وبانتظار التحصيل'}
                              </span>
                            </td>
                            <td className="py-3 text-left">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[8px] font-sans font-bold ${
                                  bk.status === 'completed'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : bk.status === 'checked-in'
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-400/20'
                                    : bk.status === 'confirmed'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-400/20'
                                    : 'bg-rose-500/10 text-rose-450 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {bk.status === 'completed' ? 'مكتمل ومغادر' : bk.status === 'checked-in' ? 'نشط/داخلي' : bk.status === 'confirmed' ? 'محجوز ومعتمد' : 'ملغي'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500 font-sans">
                          لم يسجل هذا العميل الشريك أي حجوزات أو زيارات سابقة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 shadow-sm h-full flex flex-col justify-center items-center">
            <Mail className="w-12 h-12 text-slate-650 text-slate-650 text-slate-650 text-slate-600 mb-2" />
            <h3 className="text-white text-sm font-semibold font-sans">لم يتم تصفير واختيار أي عميل</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm font-sans leading-relaxed">
              يرجى تحديد ونقر أحد الشركاء أو العملاء من القائمة الجانبية المتاحة لعرض البيانات الإدارية، تاريخ الفواتير، وسجل حجز المساحات كلياً وبشكل منسق.
            </p>
          </div>
        )}
      </div>

      {/* Register Client Dialog / Form Modal Overlay */}
      {isAddingClient && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="modal-register-client">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                تسجيل عميل وشريك مؤسسي جديد
              </h3>
              <button
                onClick={() => setIsAddingClient(false)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitClient} className="space-y-4 font-mono text-xs text-right">
              {formError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[10px] text-right font-sans animate-fade-in">
                  {formError === 'Name is required.' ? 'الاسم بالكامل هو حقل إلزامي لإتمام تفعيل الملف.' : formError === 'Provide a valid email address.' ? 'يرجى تدوين عنوان بريد إلكتروني منسق وصحيح.' : formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-slate-400 text-[10px] uppercase text-right font-sans animate-fade-in">الاسم الثلاثي بالكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سارة العتيبي"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-right font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase text-right font-sans">البريد الإلكتروني المعتمد *</label>
                  <input
                    type="email"
                    required
                    placeholder="example@domain.sa"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase text-right font-sans">رقم الهاتف الجوال</label>
                  <input
                    type="text"
                    placeholder="+966 50 000 0000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-right font-mono text-left"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 text-[10px] uppercase text-right font-sans">فئة ونوع العضوية والاشتراك</label>
                <select
                  value={newClientMembership}
                  onChange={(e) => setNewClientMembership(e.target.value as MembershipType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-right font-sans cursor-pointer"
                >
                  <option value="regular">عضوية قياسية (الوصول للمكاتب المشتركة)</option>
                  <option value="pro">عضوية بريميوم متقدمة (قاعات مخصصة)</option>
                  <option value="enterprise">عضوية مؤسسات وشركات شريكة (مفتوحة كليًا)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 text-[10px] uppercase text-right font-sans">ملاحظات أو متمتطلبات العمل الفردية</label>
                <textarea
                  placeholder="مثال: يفضل المقاعد بالقرب من منافذ شاشات الليزر، يمتلك كود Fob أمني رقم 45..."
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 h-20 text-right font-sans"
                />
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse pt-3 border-t border-slate-800 font-sans">
                <button
                  type="button"
                  onClick={() => setIsAddingClient(false)}
                  className="px-3 py-2 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors font-sans cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center transition-colors font-semibold font-sans cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 ml-1 text-slate-100" />
                  حفظ وتوثيق الشريك الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

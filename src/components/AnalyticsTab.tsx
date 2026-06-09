/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Resource, Booking, Client } from '../types';
import { TrendingUp, Users, DollarSign, Activity, Percent, Layers, ShieldAlert, CheckCircle } from 'lucide-react';
import { translations } from '../utils/translations';

interface AnalyticsTabProps {
  bookings: Booking[];
  resources: Resource[];
  clients: Client[];
  language?: 'ar' | 'en';
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ bookings, resources, clients, language = 'ar' }) => {
  const t = translations[language];
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);

  // General KPIs
  const kpis = useMemo(() => {
    const totalRevenue = bookings
      .filter((b) => b.status !== 'cancelled' && b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const outstandingRevenue = bookings
      .filter((b) => b.status !== 'cancelled' && b.paymentStatus === 'unpaid')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const activeClients = clients.length;

    // Today is 2026-05-31
    const todayBookings = bookings.filter((b) => b.date === '2026-05-31' && b.status !== 'cancelled');
    const utilizationRate = Math.round(
      (new Set(todayBookings.map((b) => b.resourceId)).size / resources.length) * 100
    );

    return {
      totalRevenue,
      outstandingRevenue,
      activeClients,
      utilizationRate: isNaN(utilizationRate) ? 0 : utilizationRate,
    };
  }, [bookings, clients, resources]);

  // Compute detailed resource utilization rates (occupied time vs available time)
  const resourceUtilization = useMemo(() => {
    return resources.map((res) => {
      const occupied = bookings
        .filter((b) => b.resourceId === res.id && b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.totalHours || 2), 0);

      // Assume a dynamic weekly budget of 60 operational hours
      const available = 60;
      const rate = Math.min(100, Math.round((occupied / available) * 100));

      return {
        id: res.id,
        name: res.name,
        type: res.type,
        occupied: Math.round(occupied * 10) / 10,
        available,
        rate,
      };
    });
  }, [bookings, resources]);

  // Daily Revenue Data for the last 7 days (including May 31, 2026 and prior)
  const chartDays = useMemo(() => {
    const dates = [
      '2026-05-25',
      '2026-05-26',
      '2026-05-27',
      '2026-05-28',
      '2026-05-29',
      '2026-05-30',
      '2026-05-31',
    ];

    return dates.map((dateString) => {
      const dayBookings = bookings.filter(
        (b) => b.date === dateString && b.status !== 'cancelled'
      );
      const revenue = dayBookings
        .filter((b) => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0);
      const count = dayBookings.length;

      const formattedLabel = new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC', // Ensure consistent date formatting without timezone shifts
      });

      return {
        date: dateString,
        label: formattedLabel,
        revenue,
        count,
      };
    });
  }, [bookings]);

  // Resource Type Distribution (desks, rooms, studios, booths)
  const resourceTypeStats = useMemo(() => {
    const counts = { desk: 0, room: 0, studio: 0, booth: 0 };
    bookings
      .filter((b) => b.status !== 'cancelled')
      .forEach((b) => {
        const res = resources.find((r) => r.id === b.resourceId);
        if (res) {
          counts[res.type] = (counts[res.type] || 0) + b.totalPrice;
        }
      });

    const totalVal = Object.values(counts).reduce((a, b) => a + b, 0);

    return Object.entries(counts).map(([type, value]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value,
      percentage: totalVal ? Math.round((value / totalVal) * 100) : 0,
      color:
        type === 'desk'
          ? '#3b82f6' // Blue
          : type === 'room'
          ? '#10b981' // Emerald
          : type === 'studio'
          ? '#8b5cf6' // Violet
          : '#f59e0b', // Amber
    }));
  }, [bookings, resources]);

  // Booking Status Breakdown
  const statusStats = useMemo(() => {
    const stats = { confirmed: 0, 'checked-in': 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => {
      stats[b.status] = (stats[b.status] || 0) + 1;
    });

    return Object.entries(stats).map(([status, count]) => {
      let color = 'bg-blue-500';
      if (status === 'checked-in') color = 'bg-indigo-500';
      if (status === 'completed') color = 'bg-emerald-500';
      if (status === 'cancelled') color = 'bg-rose-500';

      return {
        name: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        color,
      };
    });
  }, [bookings]);

  // Custom SVG Chart calculations
  const maxRevenue = Math.max(...chartDays.map((d) => d.revenue), 100);
  const chartHeight = 180;
  const chartWidth = 500;
  const padding = 35;

  const points = chartDays.map((d, i) => {
    const x = padding + (i / (chartDays.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (d.revenue / maxRevenue) * (chartHeight - padding * 2);
    return { x, y, ...d };
  });

  const pathString = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  const areaString = points.length
    ? `${pathString} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${
        chartHeight - padding
      } Z`
    : '';

  return (
    <div className="space-y-6" id="analytics-tab-root">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="analytics-kpis">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between" id="kpi-revenue">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Total Income</span>
            <div className="text-2xl font-semibold tracking-tight text-white">${kpis.totalRevenue}</div>
            <p className="text-[10px] text-emerald-400 flex items-center font-mono">
              <TrendingUp className="w-3 h-3 mr-1" />
              Settle/Paid State
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between" id="kpi-outstanding">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Unpaid Outstanding</span>
            <div className="text-2xl font-semibold tracking-tight text-white">${kpis.outstandingRevenue}</div>
            <p className="text-[10px] text-amber-400 flex items-center font-mono">
              <ShieldAlert className="w-3 h-3 mr-1" />
              Pending Settlement
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between" id="kpi-clients">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Total Members</span>
            <div className="text-2xl font-semibold tracking-tight text-white">{kpis.activeClients}</div>
            <p className="text-[10px] text-slate-400 flex items-center font-mono">
              <CheckCircle className="w-3 h-3 mr-1" />
              Registered Accounts
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex items-center justify-between" id="kpi-utilization">
          <div className="space-y-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Capacity Utilization</span>
            <div className="text-2xl font-semibold tracking-tight text-white">{kpis.utilizationRate}%</div>
            <p className="text-[10px] text-indigo-400 flex items-center font-mono">
              <Activity className="w-3 h-3 mr-1" />
              Booked Today
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Resource Utilization Detail Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md space-y-4" id="utilization-rate-breakdown-panel">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div className="text-right">
            <h3 className="text-sm font-semibold text-white">معدل استغلال الموازنة الزمنية للأصول والمكاتب</h3>
            <p className="text-xs text-slate-400 font-sans">توزيع الوقت المستغل فعلياً من الحجوزات النشطة مقابل الميزانية المتاحة (60 ساعة أسبوعياً لكل أصل)</p>
          </div>
          <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
            متوسط معدل الاستغلال الكلي للأصول المتاحة: {Math.round(resourceUtilization.reduce((sum, r) => sum + r.rate, 0) / Math.max(1, resourceUtilization.length))}%
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="utilization-metrics-grid">
          {resourceUtilization.map((res) => {
            // Determine colors dynamically of horizontal progress bars
            let barColor = 'bg-blue-500';
            if (res.type === 'room') barColor = 'bg-emerald-500';
            if (res.type === 'studio') barColor = 'bg-purple-500';
            if (res.type === 'booth') barColor = 'bg-amber-500';
            
            return (
              <div key={res.id} className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col justify-between space-y-3 font-sans">
                <div className="flex justify-between items-start flex-row-reverse">
                  <div className="text-right">
                    <span className="text-white text-xs font-bold block">{res.name}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {res.type === 'desk' ? 'مكتب مرن' : res.type === 'room' ? 'قاعة اجتماعات' : res.type === 'studio' ? 'استوديو بودكاست' : 'كابينة عزل'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">{res.rate}%</span>
                </div>
                
                {/* Progress bar sparkline */}
                <div className="space-y-1">
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${res.rate}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono" dir="rtl">
                    <span>حيازة فعالة: {res.occupied} س</span>
                    <span>سقف الإتاحة: {res.available} س</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="analytics-charts-grid">
        {/* Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 shadow-sm flex flex-col justify-between" id="revenue-trend-box">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Revenue Flow</h3>
              <p className="text-xs text-slate-400">Last 7 calendar days of settled payments</p>
            </div>
            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              Active Range: May 25 - May 31
            </div>
          </div>

          <div 
            className="w-full relative flex justify-center" 
            onMouseLeave={() => {
              setHoveredDataIndex(null);
              setHoveredChart(null);
            }}
          >
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none max-w-2xl"
              style={{ maxHeight: '200px' }}
            >
              {/* Grids / Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = padding + ratio * (chartHeight - padding * 2);
                const val = Math.round(maxRevenue - ratio * maxRevenue);
                return (
                  <g key={index} className="opacity-30">
                    <line
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="#475569"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding - 6}
                      y={y + 3}
                      fill="#94a3b8"
                      fontSize={8}
                      className="font-mono text-right"
                      textAnchor="end"
                    >
                      ${val}
                    </text>
                  </g>
                );
              })}

              {/* Area path */}
              {areaString && (
                <path
                  d={areaString}
                  fill="url(#area-gradient)"
                  className="transition-all duration-300 pointer-events-none"
                />
              )}

              {/* Line path */}
              {pathString && (
                <path
                  d={pathString}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className="transition-all duration-300 pointer-events-none"
                />
              )}

              {/* Interactive columns & dots */}
              {points.map((p, i) => {
                const isHovered = hoveredDataIndex === i && hoveredChart === 'revenue';
                return (
                  <g key={i}>
                    {/* Invisible trigger bar */}
                    <rect
                      x={p.x - 18}
                      y={padding}
                      width={36}
                      height={chartHeight - padding * 2}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => {
                        setHoveredDataIndex(i);
                        setHoveredChart('revenue');
                      }}
                    />

                    {/* Dot on line */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#10b981' : '#1e293b'}
                      stroke="#10b981"
                      strokeWidth={2}
                      className="transition-all duration-150 pointer-events-none"
                    />

                    {/* Date X Label */}
                    <text
                      x={p.x}
                      y={chartHeight - 8}
                      fill={isHovered ? '#ffffff' : '#64748b'}
                      fontSize={8}
                      textAnchor="middle"
                      className="font-mono transition-colors duration-150 pointer-events-none"
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Custom Floating Tooltip */}
            {hoveredDataIndex !== null && hoveredChart === 'revenue' && (
              <div 
                className="absolute bg-slate-950 border border-slate-800 p-2.5 rounded-lg shadow-xl text-[11px] font-mono pointers-events-none"
                style={{
                  left: `${((points[hoveredDataIndex].x - padding) / (chartWidth - padding * 2)) * 80 + 10}%`,
                  bottom: '68px',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="text-slate-400 mb-0.5">{chartDays[hoveredDataIndex].date}</div>
                <div className="text-white font-medium">Income: <span className="text-emerald-400">${chartDays[hoveredDataIndex].revenue}</span></div>
                <div className="text-slate-400">Bookings: {chartDays[hoveredDataIndex].count} active</div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Distribution By Type (Donut styled chart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="revenue-by-type-box">
          <div>
            <h3 className="text-sm font-semibold text-white">Share of Revenue</h3>
            <p className="text-xs text-slate-400">Income broken down by space categorizations</p>
          </div>

          <div className="my-4 flex justify-center items-center relative">
            {/* Custom SVG Donut Component */}
            <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
              {resourceTypeStats.map((item, index) => {
                // Calculate cumulative percentages for clean segmented display
                const previousStats = resourceTypeStats.slice(0, index);
                const previousTotalPercentage = previousStats.reduce((sum, s) => sum + s.percentage, 0);
                const strokeDashValue = `${item.percentage} ${100 - item.percentage}`;
                const strokeOffsetValue = 100 - previousTotalPercentage;

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="12"
                    strokeDasharray={strokeDashValue}
                    strokeDashoffset={strokeOffsetValue}
                    className="hover:opacity-90 transition-opacity duration-150 cursor-pointer"
                  />
                );
              })}
              {/* Inner Circle cutout */}
              <circle cx="50" cy="50" r="28" fill="#0f172a" />
            </svg>

            {/* Total Indicator in absolute center */}
            <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Capital</span>
              <span className="text-lg font-bold text-white">${kpis.totalRevenue}</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-2 mt-2" id="donut-legend">
            {resourceTypeStats.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <div className="space-x-2 text-right">
                  <span className="text-white">${item.value}</span>
                  <span className="text-slate-500 text-[10px]">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking State Counter Grid and Top Performing Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="analytics-extra-row">
        {/* State Counters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="booking-stats-breakdown">
          <h3 className="text-sm font-semibold text-white mb-2">Booking Lifecycles</h3>
          <p className="text-xs text-slate-400 mb-4">Total bookings indexed across the database</p>

          <div className="space-y-4" id="lifecycle-bars">
            {statusStats.map((stat, i) => {
              const maxCount = Math.max(...statusStats.map((s) => s.count), 1);
              const percentageOfMax = (stat.count / maxCount) * 100;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">{stat.name}</span>
                    <span className="text-white font-medium">{stat.count} orders</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentageOfMax}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Assets */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="resource-occupancy-dashboard">
          <h3 className="text-sm font-semibold text-white mb-2">Workspace Popularity</h3>
          <p className="text-xs text-slate-400 mb-4">Top-booked workspace assets sorted by frequency</p>

          <div className="divide-y divide-slate-800/60 font-mono" id="top-resource-table">
            {resources.map((res, index) => {
              const count = bookings.filter((b) => b.resourceId === res.id && b.status !== 'cancelled').length;
              const revenue = bookings
                .filter((b) => b.resourceId === res.id && b.status !== 'cancelled' && b.paymentStatus === 'paid')
                .reduce((sum, b) => sum + b.totalPrice, 0);

              return (
                <div key={res.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-500 text-[10px]">#0{index + 1}</span>
                    <div>
                      <div className="text-slate-200 font-medium truncate max-w-44">{res.name}</div>
                      <div className="text-[10px] text-slate-400">{res.type} &bull; ${res.hourlyRate}/hr</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{count} bookings</div>
                    <div className="text-[10px] text-emerald-400">${revenue} revenue</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

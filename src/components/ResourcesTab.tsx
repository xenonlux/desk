/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Resource } from '../types';
import { Layers, HardDrive, Monitor, HelpCircle, ToggleLeft, ToggleRight, Check, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { translations } from '../utils/translations';

interface ResourcesTabProps {
  resources: Resource[];
  onAddResource: (resource: Resource) => void;
  onToggleStatus: (resourceId: string) => void;
  onDeleteResource: (resourceId: string) => void;
  language?: 'ar' | 'en';
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  resources,
  onAddResource,
  onToggleStatus,
  onDeleteResource,
  language = 'ar',
}) => {
  const t = translations[language];
  const [activeFilter, setActiveFilter] = useState<'all' | 'desk' | 'room' | 'studio' | 'booth'>('all');
  const [isAddingResource, setIsAddingResource] = useState(false);

  // Form Fields
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'desk' | 'room' | 'studio' | 'booth'>('desk');
  const [newCapacity, setNewCapacity] = useState(1);
  const [newRate, setNewRate] = useState(10);
  const [newLocation, setNewLocation] = useState('');
  const [newAmenitiesString, setNewAmenitiesString] = useState('');
  const [errorLine, setErrorLine] = useState('');

  const filteredResources = useMemo(() => {
    if (activeFilter === 'all') return resources;
    return resources.filter((r) => r.type === activeFilter);
  }, [resources, activeFilter]);

  const handleSubmitResource = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLine('');

    if (!newName.trim()) {
      setErrorLine('Resource name is required.');
      return;
    }
    if (newRate <= 0) {
      setErrorLine('Rate must be greater than $0.');
      return;
    }
    if (newCapacity <= 0) {
      setErrorLine('Capacity must be at least 1 client.');
      return;
    }

    const amenities = newAmenitiesString
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const newResource: Resource = {
      id: `res-${newType}-${Date.now()}`,
      name: newName,
      type: newType,
      capacity: newCapacity,
      hourlyRate: newRate,
      amenities: amenities.length > 0 ? amenities : ['Standard Desk Set', 'Wi-Fi Access', 'Power Outlets'],
      status: 'available',
      location: newLocation || 'Floor 1, West Wing',
    };

    onAddResource(newResource);
    setIsAddingResource(false);

    // Reset Form
    setNewName('');
    setNewType('desk');
    setNewCapacity(1);
    setNewRate(10);
    setNewLocation('');
    setNewAmenitiesString('');
  };

  return (
    <div className="space-y-6" id="resources-tab-root">
      {/* Filtering Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl" id="resources-controls">
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]" id="asset-filter-buttons">
          {(['all', 'desk', 'room', 'studio', 'booth'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg border transition-all uppercase tracking-wider font-semibold ${
                activeFilter === filter
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}s ({filter === 'all' ? resources.length : resources.filter((r) => r.type === filter).length})
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddingResource(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-1.5 text-xs font-semibold font-mono flex items-center transition-colors shadow-sm self-stretch sm:self-auto justify-center"
          id="btn-trigger-add-resource"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Provision Asset
        </button>
      </div>

      {/* Grid of Resources Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="assets-grid-container">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className={`border rounded-xl p-5 flex flex-col justify-between space-y-4 bg-slate-900 shadow-sm transition-all relative ${
              res.status === 'available' ? 'border-slate-800/80' : 'border-rose-950 opacity-75'
            }`}
          >
            {/* Upper details */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span
                  className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded font-bold ${
                    res.type === 'room'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : res.type === 'studio'
                      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      : res.type === 'desk'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {res.type}
                </span>

                <div className="flex items-center space-x-2 font-mono text-[10px]">
                  <span
                    className={res.status === 'available' ? 'text-emerald-400' : 'text-rose-400'}
                  >
                    {res.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => onToggleStatus(res.id)}
                    className="text-slate-400 hover:text-white transition-opacity"
                    title="Toggle asset maintenance mode"
                  >
                    {res.status === 'available' ? (
                      <ToggleLeft className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <ToggleRight className="w-6 h-6 text-rose-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight truncate" title={res.name}>{res.name}</h3>
                <p className="text-[10px] font-mono text-slate-400">{res.location}</p>
              </div>

              {/* Specification stats */}
              <div className="grid grid-cols-2 gap-2 border-y border-slate-800/60 py-2 text-[10px] font-mono text-slate-400">
                <div>
                  Capacity: <strong className="text-white">{res.capacity} pax</strong>
                </div>
                <div className="text-right">
                  Fee: <strong className="text-white">${res.hourlyRate}/hr</strong>
                </div>
              </div>

              {/* Amenities list */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block">Equipped Assets:</span>
                <div className="flex flex-wrap gap-1">
                  {res.amenities.map((am, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono bg-slate-950 border border-slate-800/60 rounded px-1.5 py-0.5 text-slate-300"
                    >
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions delete/maintenance warning */}
            <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-800/40">
              {res.status === 'maintenance' ? (
                <span className="text-[10px] flex items-center text-rose-400 font-mono">
                  <AlertCircle className="w-3 h-3 mr-1" /> Blocked for bookings
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center">
                  <Check className="w-3.5 h-3.5 mr-0.5" /> Normal Occupancy
                </span>
              )}

              {/* Delete button (prevent deleting seed static indices where possible or allow with caution) */}
              <button
                onClick={() => onDeleteResource(res.id)}
                className="text-slate-400 hover:text-rose-400 transition-colors"
                title="Deprovision and delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Provision Asset Dialog Modal Overlay */}
      {isAddingResource && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="modal-provision-asset">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Provision Workspace Asset
              </h3>
              <button
                onClick={() => setIsAddingResource(false)}
                className="text-slate-400 hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitResource} className="space-y-4 font-mono text-xs">
              {errorLine && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[10px]">
                  {errorLine}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-slate-400 text-[10px] uppercase">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Creative Corner Room C"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase">Space Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="desk">Hot/Dedicated Desk</option>
                    <option value="room">Conference/Meeting Room</option>
                    <option value="studio">Production/Media Studio</option>
                    <option value="booth">Silent Phone Booth</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase">Hub Location</label>
                  <input
                    type="text"
                    placeholder="Floor 2, Pod Block"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase">Max Seating (Pax) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 text-[10px] uppercase">Rate ($ / Hour) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newRate}
                    onChange={(e) => setNewRate(parseInt(e.target.value) || 5)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-400 text-[10px] uppercase">Amenities (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Whiteboard, 4K TV, Charging Station, Acoustic Walls"
                  value={newAmenitiesString}
                  onChange={(e) => setNewAmenitiesString(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingResource(false)}
                  className="px-3 py-2 border border-slate-800 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center transition-colors font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

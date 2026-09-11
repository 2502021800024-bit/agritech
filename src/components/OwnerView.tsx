import { useState, useEffect, useCallback } from 'react';
import { Check, X, Snowflake, Package, Clock } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import type { Booking } from '@/types';

interface OwnerViewProps {
  role: 'owner' | 'fpo';
}

export default function OwnerView({ role }: OwnerViewProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to load bookings:', error.message);
    }
    setBookings(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id: string, status: 'accepted' | 'declined') => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    if (error) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'pending' } : b)));
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const totalCapacity = 1000;
  const filledCapacity = 580;
  const fillPercent = Math.round((filledCapacity / totalCapacity) * 100);

  const title =
    role === 'owner' ? '🏭 Cold Storage Management Portal' : '👥 FPO Bulk Capacity Aggregator';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">
            Live IoT telemetry & instant farmer booking acceptance dashboard.
          </p>
        </div>
        <span className="bg-farm-100 text-farm-800 font-bold text-xs px-3 py-1 rounded-full">
          Status: Active Online
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" /> Total Capacity
          </span>
          <h3 className="text-2xl font-black text-slate-900">{totalCapacity} Tonnes</h3>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-farm-600 h-full transition-all" style={{ width: `${fillPercent}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 font-bold mt-1 block">
            {filledCapacity} Tonnes Filled ({fillPercent}%)
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Snowflake className="w-3.5 h-3.5" /> IoT Sensor Status
          </span>
          <h3 className="text-2xl font-black text-chilly-600">3.2°C | 88% RH</h3>
          <p className="text-xs text-emerald-600 font-bold mt-1">
            ✓ Temperature optimal for Potato / Apple
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Requests
          </span>
          <h3 className="text-2xl font-black text-amber-600">
            {pendingCount} New Request{pendingCount !== 1 ? 's' : ''}
          </h3>
          <p className="text-xs text-slate-500 mt-1">From local farmer groups</p>
        </div>
      </div>

      {/* Bookings List */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
          Incoming Farmer Booking Requests
        </h3>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm font-bold">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm font-bold">
            No booking requests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition ${
                  booking.status === 'accepted'
                    ? 'bg-farm-50 border-farm-300'
                    : booking.status === 'declined'
                      ? 'bg-red-50 border-red-300 opacity-60'
                      : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-center sm:text-left">
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {booking.farmer_name ?? 'Unknown Farmer'}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Crop: {booking.crop_icon} {booking.crop_name} • Quantity: {booking.bags} Bags (
                    {((booking.bags * 50) / 1000).toFixed(1)} Tonnes) • {booking.duration_months}{' '}
                    Months
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Token: {booking.token} • Est. Cost: ₹{booking.total_cost.toLocaleString('en-IN')}
                  </p>
                </div>
                {booking.status === 'pending' ? (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => updateStatus(booking.id, 'accepted')}
                      className="flex-1 sm:flex-initial bg-farm-600 hover:bg-farm-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, 'declined')}
                      className="flex-1 sm:flex-initial bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-lg ${
                      booking.status === 'accepted'
                        ? 'bg-farm-100 text-farm-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {booking.status === 'accepted' ? '✓ Accepted' : '✕ Declined'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

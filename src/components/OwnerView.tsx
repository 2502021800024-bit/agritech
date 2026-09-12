import { useState, useEffect, useCallback } from 'react';
import { Check, X, Snowflake, Package, Clock, Truck, Calendar, User } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import type { Booking, ColdStorage, Lang, TranslationDict } from '@/types';

interface OwnerViewProps {
  t: TranslationDict;
  lang: Lang;
}

export default function OwnerView({ t }: OwnerViewProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState<'pending' | 'accepted' | 'all'>('pending');

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
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'pending' } : b)));
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const acceptedCount = bookings.filter((b) => b.status === 'accepted').length;
  const totalBookings = bookings.length;

  const totalCapacity = 1000;
  const filledCapacity = 580;
  const fillPercent = Math.round((filledCapacity / totalCapacity) * 100);

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  const filterTabs: { key: 'pending' | 'accepted' | 'all'; label: string; count: number }[] = [
    { key: 'pending', label: t.pendingRequests, count: pendingCount },
    { key: 'accepted', label: t.accepted, count: acceptedCount },
    { key: 'all', label: t.allBookings, count: totalBookings },
  ];

  return (
    <div className="space-y-5">
      {/* Dashboard Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.ownerDashboard}</h2>
            <p className="text-xs text-slate-500">{t.ownerDashboardDesc}</p>
          </div>
          <span className="bg-farm-100 text-farm-800 font-bold text-xs px-3 py-1 rounded-full">
            {t.statusActive}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> {t.totalCapacity}
            </span>
            <h3 className="text-2xl font-black text-slate-900">{totalCapacity} Tonnes</h3>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-farm-600 h-full transition-all"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-bold mt-1 block">
              {filledCapacity} {t.capacityFilled} ({fillPercent}%)
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Snowflake className="w-3.5 h-3.5" /> {t.iotStatus}
            </span>
            <h3 className="text-2xl font-black text-chilly-600">3.2°C | 88% RH</h3>
            <p className="text-xs text-emerald-600 font-bold mt-1">✓ {t.tempOptimal}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {t.pendingRequests}
            </span>
            <h3 className="text-2xl font-black text-amber-600">
              {pendingCount} {pendingCount !== 1 ? '' : ''}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{t.fromFarmerGroups}</p>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
          {t.incomingBookings}
        </h3>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setBookingFilter(tab.key)}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
                bookingFilter === tab.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  bookingFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Booking List */}
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm font-bold">{t.loadingBookings}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm font-bold">{t.noBookings}</div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                  booking.status === 'accepted'
                    ? 'bg-farm-50 border-farm-300'
                    : booking.status === 'declined'
                      ? 'bg-red-50 border-red-300 opacity-60'
                      : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {booking.farmer_name ?? 'Unknown Farmer'}
                    </h4>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        booking.status === 'accepted'
                          ? 'bg-farm-200 text-farm-800'
                          : booking.status === 'declined'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      {booking.status === 'accepted'
                        ? t.accepted
                        : booking.status === 'declined'
                          ? t.declined
                          : t.pendingRequests}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span>{booking.crop_icon} {booking.crop_name}</span>
                    <span>•</span>
                    <span>{booking.bags} Bags ({((booking.bags * 50) / 1000).toFixed(1)} Tonnes)</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {booking.duration_months} Month{booking.duration_months > 1 ? 's' : ''}
                    </span>
                    {booking.transport_included && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-farm-700 font-bold">
                          <Truck className="w-3 h-3" /> Transport
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {t.token}: {booking.token} • {t.estCost}: ₹{booking.total_cost.toLocaleString('en-IN')}
                  </p>
                </div>

                {booking.status === 'pending' ? (
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => updateStatus(booking.id, 'accepted')}
                      className="flex-1 sm:flex-initial bg-farm-600 hover:bg-farm-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> {t.accept}
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, 'declined')}
                      className="flex-1 sm:flex-initial bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" /> {t.decline}
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-lg shrink-0 ${
                      booking.status === 'accepted'
                        ? 'bg-farm-100 text-farm-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {booking.status === 'accepted' ? `✓ ${t.accepted}` : `✕ ${t.declined}`}
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

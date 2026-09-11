import { useState, useEffect, useCallback } from 'react';
import { Wifi } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { TRANSLATIONS } from '@/translations';
import { CROPS, LOCATIONS } from '@/data';
import type { ColdStorage, Crop, Lang, Location, ReceiptData, UserRole } from '@/types';
import { useVoiceCommand } from '@/useVoiceCommand';

import Header from '@/components/Header';
import VoiceBanner from '@/components/VoiceBanner';
import CropQuantityStep from '@/components/CropQuantityStep';
import StorageList from '@/components/StorageList';
import OwnerView from '@/components/OwnerView';
import BookingModal from '@/components/BookingModal';
import ReceiptModal from '@/components/ReceiptModal';
import VoiceOverlay from '@/components/VoiceOverlay';
import Footer from '@/components/Footer';

export default function App() {
  const [lang, setLang] = useState<Lang>('hi');
  const [userRole, setUserRole] = useState<UserRole>('farmer');

  const [selectedCrop, setSelectedCrop] = useState<Crop>(CROPS[0]);
  const [bagQuantity, setBagQuantity] = useState(100);
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0]);
  const [durationMonths, setDurationMonths] = useState(2);
  const [needTransport, setNeedTransport] = useState(true);

  const [activeModalBooking, setActiveModalBooking] = useState<ColdStorage | null>(null);
  const [confirmedReceipt, setConfirmedReceipt] = useState<ReceiptData | null>(null);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [filterTab, setFilterTab] = useState('all');

  const [storages, setStorages] = useState<ColdStorage[]>([]);
  const [storagesLoading, setStoragesLoading] = useState(true);

  const t = TRANSLATIONS[lang];

  const fetchStorages = useCallback(async () => {
    setStoragesLoading(true);
    const { data, error } = await supabase.from('cold_storages').select('*');
    if (error) {
      console.error('Failed to load cold storages:', error.message);
    }
    setStorages(data ?? []);
    setStoragesLoading(false);
  }, []);

  useEffect(() => {
    fetchStorages();
  }, [fetchStorages]);

  const {
    isVoiceActive,
    voiceMessage,
    startListening,
    closeOverlay,
    applyTextCommand,
  } = useVoiceCommand(lang, bagQuantity);

  const handleVoiceCommand = () => {
    startListening((match) => {
      setSelectedCrop(match.crop);
      setBagQuantity(match.quantity);
    });
  };

  const handleTextCommand = (text: string) => {
    applyTextCommand(text, (match) => {
      setSelectedCrop(match.crop);
      setBagQuantity(match.quantity);
    });
  };

  const handleConfirmBooking = async () => {
    if (!activeModalBooking) return;

    const token = 'AGRI-' + Math.floor(100000 + Math.random() * 900000);
    const totalCost =
      activeModalBooking.price_per_bag * bagQuantity * durationMonths +
      (needTransport ? 1200 : 0);

    const receiptData: ReceiptData = {
      token,
      storage: activeModalBooking,
      crop: selectedCrop,
      bags: bagQuantity,
      duration: durationMonths,
      totalEstimatedCost: totalCost,
      transportIncluded: needTransport,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    await supabase.from('bookings').insert({
      token,
      storage_id: activeModalBooking.id,
      storage_name: activeModalBooking.name,
      crop_id: selectedCrop.id,
      crop_name: selectedCrop.name.en,
      crop_icon: selectedCrop.icon,
      bags: bagQuantity,
      duration_months: durationMonths,
      transport_included: needTransport,
      total_cost: totalCost,
      status: 'pending',
    });

    setConfirmedReceipt(receiptData);
    setActiveModalBooking(null);
  };

  // Sort storages based on filter
  const sortedStorages = [...storages].sort((a, b) => {
    if (filterTab === 'cheapest') return a.price_per_bag - b.price_per_bag;
    if (filterTab === 'closest') {
      const distA = parseFloat(a.location.match(/([\d.]+)\s*km/)?.[1] ?? '999');
      const distB = parseFloat(b.location.match(/([\d.]+)\s*km/)?.[1] ?? '999');
      return distA - distB;
    }
    return b.rating - a.rating;
  });

  return (
    <div className="max-w-4xl mx-auto pb-24 px-3 sm:px-6 pt-4">
      <Header
        t={t}
        lang={lang}
        setLang={setLang}
        userRole={userRole}
        setUserRole={setUserRole}
        lowBandwidthMode={lowBandwidthMode}
        setLowBandwidthMode={setLowBandwidthMode}
      />

      {lowBandwidthMode && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2 rounded-xl mb-4 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-amber-600" />
            {t.lowBandwidth} - Images simplified for fast load on weak farm networks.
          </span>
          <button
            onClick={() => setLowBandwidthMode(false)}
            className="underline text-amber-800"
          >
            Switch to Standard
          </button>
        </div>
      )}

      {userRole === 'farmer' && (
        <main className="space-y-5">
          <VoiceBanner lang={lang} onVoiceCommand={handleVoiceCommand} />

          <CropQuantityStep
            t={t}
            lang={lang}
            selectedCrop={selectedCrop}
            setSelectedCrop={setSelectedCrop}
            bagQuantity={bagQuantity}
            setBagQuantity={setBagQuantity}
            durationMonths={durationMonths}
            setDurationMonths={setDurationMonths}
            needTransport={needTransport}
            setNeedTransport={setNeedTransport}
          />

          {storagesLoading ? (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-200 text-center text-slate-400 font-bold text-sm">
              Loading cold storage facilities...
            </div>
          ) : (
            <StorageList
              t={t}
              lang={lang}
              storages={sortedStorages}
              selectedCrop={selectedCrop}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              locations={LOCATIONS}
              bagQuantity={bagQuantity}
              durationMonths={durationMonths}
              needTransport={needTransport}
              filterTab={filterTab}
              setFilterTab={setFilterTab}
              onBook={setActiveModalBooking}
            />
          )}
        </main>
      )}

      {userRole !== 'farmer' && <OwnerView role={userRole} />}

      {activeModalBooking && (
        <BookingModal
          storage={activeModalBooking}
          t={t}
          lang={lang}
          selectedCrop={selectedCrop}
          bagQuantity={bagQuantity}
          durationMonths={durationMonths}
          needTransport={needTransport}
          onConfirm={handleConfirmBooking}
          onClose={() => setActiveModalBooking(null)}
        />
      )}

      {confirmedReceipt && (
        <ReceiptModal
          receipt={confirmedReceipt}
          t={t}
          lang={lang}
          onDone={() => setConfirmedReceipt(null)}
        />
      )}

      {isVoiceActive && (
        <VoiceOverlay
          t={t}
          voiceMessage={voiceMessage}
          onTextSubmit={handleTextCommand}
          onClose={closeOverlay}
        />
      )}

      <Footer />
    </div>
  );
}

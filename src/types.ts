export type Lang = 'en' | 'hi' | 'gu';
export type UserRole = 'farmer' | 'owner' | 'fpo';

export interface Crop {
  id: string;
  name: Record<Lang, string>;
  icon: string;
  temp: string;
}

export interface Location {
  id: string;
  name: string;
  state: string;
}

export interface ColdStorage {
  id: string;
  name: string;
  location: string;
  district: string;
  phone: string;
  owner_name: string;
  capacity_total: number;
  capacity_free: number;
  price_per_bag: number;
  temp_current: string;
  humidity_current: string;
  rating: number;
  supported_crops: string[];
  has_transport: boolean;
  iot_verified: boolean;
}

export interface Booking {
  id: string;
  token: string;
  storage_id: string;
  storage_name: string;
  crop_id: string;
  crop_name: string;
  crop_icon: string;
  bags: number;
  duration_months: number;
  transport_included: boolean;
  total_cost: number;
  farmer_name: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface ReceiptData {
  token: string;
  storage: ColdStorage;
  crop: Crop;
  bags: number;
  duration: number;
  totalEstimatedCost: number;
  transportIncluded: boolean;
  date: string;
  time: string;
}

export interface TranslationDict {
  appName: string;
  appTagline: string;
  selectCrop: string;
  selectQty: string;
  selectLoc: string;
  voiceBtn: string;
  voiceTitle: string;
  bags: string;
  trucksNeeded: string;
  findStorage: string;
  callOwner: string;
  whatsapp: string;
  bookNow: string;
  temp: string;
  humidity: string;
  freeSpace: string;
  dist: string;
  pricePerBag: string;
  transportNeeded: string;
  yesTransport: string;
  noTransport: string;
  bookingSuccess: string;
  tokenNo: string;
  payAtFacility: string;
  ownerMode: string;
  farmerMode: string;
  fpoMode: string;
  liveSensors: string;
  lowBandwidth: string;
}

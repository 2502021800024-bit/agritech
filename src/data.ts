import type { Crop, Location } from './types';

export const CROPS: Crop[] = [
  { id: 'potato', name: { en: 'Potato', hi: 'आलू', gu: 'બટાટા' }, icon: '🥔', temp: '2°C - 4°C' },
  { id: 'tomato', name: { en: 'Tomato', hi: 'टमाटर', gu: 'ટમેટા' }, icon: '🍅', temp: '8°C - 12°C' },
  { id: 'apple', name: { en: 'Apple', hi: 'सेब', gu: 'સફરજન' }, icon: '🍎', temp: '0°C - 2°C' },
  { id: 'onion', name: { en: 'Onion / Garlic', hi: 'प्याज / लहसुन', gu: 'ડુંગળી / લસણ' }, icon: '🧅', temp: '0°C - 2°C' },
  { id: 'chili', name: { en: 'Green Chili', hi: 'हरी मिर्च', gu: 'લીલા મરચા' }, icon: '🌶️', temp: '6°C - 10°C' },
  { id: 'fruits', name: { en: 'Banana / Mango', hi: 'केला / आम / फल', gu: 'કેળા / કેરી / ફળો' }, icon: '🥭', temp: '10°C - 13°C' },
  { id: 'carrot', name: { en: 'Carrot', hi: 'गाजर', gu: 'ગાજર' }, icon: '🥕', temp: '0°C - 4°C' },
  { id: 'cabbage', name: { en: 'Cabbage', hi: 'पत्तागोभी', gu: 'કોબી' }, icon: '🥬', temp: '0°C - 4°C' },
  { id: 'cauliflower', name: { en: 'Cauliflower', hi: 'फूलगोभी', gu: 'ફૂલકોબી' }, icon: '🥦', temp: '0°C - 4°C' },
  { id: 'peas', name: { en: 'Green Peas', hi: 'मटर', gu: 'વટાણા' }, icon: '🫛', temp: '0°C - 2°C' },
  { id: 'cucumber', name: { en: 'Cucumber', hi: 'खीरा', gu: 'કાકડી' }, icon: '🥒', temp: '7°C - 10°C' },
  { id: 'eggplant', name: { en: 'Eggplant', hi: 'बैंगन', gu: 'રીંગણ' }, icon: '🍆', temp: '8°C - 12°C' },
  { id: 'okra', name: { en: 'Okra', hi: 'भिंडी', gu: 'ભીંડા' }, icon: '🌱', temp: '8°C - 10°C' },
  { id: 'grapes', name: { en: 'Grapes', hi: 'अंगूर', gu: 'દ્રાક્ષ' }, icon: '🍇', temp: '0°C - 2°C' },
  { id: 'orange', name: { en: 'Orange', hi: 'संतरा', gu: 'સંતરા' }, icon: '🍊', temp: '3°C - 8°C' },
  { id: 'papaya', name: { en: 'Papaya', hi: 'पपीता', gu: 'પપૈયું' }, icon: '🍈', temp: '7°C - 13°C' },
  { id: 'pomegranate', name: { en: 'Pomegranate', hi: 'अनार', gu: 'દાડમ' }, icon: '🍎', temp: '5°C - 7°C' },
];

export const VOICE_ALIASES: Record<string, string[]> = {
  potato: ['potato', 'आलू', 'आलू की बोरी', 'બટાટા', 'bateta'],
  tomato: ['tomato', 'टमाटर', 'ટમેટા'],
  apple: ['apple', 'सेब', 'સફરજન'],
  onion: ['onion', 'garlic', 'प्याज', 'लहसुन', 'ડુંગળી', 'લસણ'],
  chili: ['chili', 'chilli', 'green chili', 'हरी मिर्च', 'લીલા મરચા'],
  fruits: ['banana', 'mango', 'केला', 'आम', 'કેળા', 'કેરી', 'fruit', 'fruits', 'फल'],
  carrot: ['carrot', 'गाजर', 'ગાજર'],
  cabbage: ['cabbage', 'पत्तागोभी', 'કોબી'],
  cauliflower: ['cauliflower', 'फूलगोभी', 'ફૂલકોબી'],
  peas: ['peas', 'green peas', 'मटर', 'વટાણા'],
  cucumber: ['cucumber', 'खीरा', 'કાકડી'],
  eggplant: ['eggplant', 'brinjal', 'बैंगन', 'રીંગણ'],
  okra: ['okra', 'lady finger', 'भिंडी', 'ભીંડા'],
  grapes: ['grapes', 'अंगूर', 'દ્રાક્ષ'],
  orange: ['orange', 'संतरा', 'નારંગી', 'સંતરા'],
  papaya: ['papaya', 'पपीता', 'પપૈયું'],
  pomegranate: ['pomegranate', 'अनार', 'દાડમ'],
};

export const LOCATIONS: Location[] = [
  { id: 'ahmedabad', name: 'Ahmedabad / Gandhinagar', state: 'Gujarat' },
  { id: 'rajkot', name: 'Rajkot / Saurashtra Hub', state: 'Gujarat' },
  { id: 'nashik', name: 'Nashik / Pimpalgaon', state: 'Maharashtra' },
  { id: 'agra', name: 'Agra / Sadabad Belt', state: 'Uttar Pradesh' },
  { id: 'ludhiana', name: 'Ludhiana / Jalandhar', state: 'Punjab' },
  { id: 'indore', name: 'Indore / Malwa Region', state: 'Madhya Pradesh' },
];

export function getVehicleSuggestion(bags: number): { name: string; icon: string } {
  if (bags <= 60) return { name: 'Chota Hathi / Pickup Truck', icon: '🛻' };
  if (bags <= 200) return { name: '6-Wheeler Medium Truck', icon: '🚛' };
  return { name: '10-Wheeler Heavy Commercial Truck', icon: '🚛' };
}

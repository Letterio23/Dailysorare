
import { Rarity } from './types';

export const SORARE_API_URL = "https://api.sorare.com/graphql";
export const ALLOWED_RARITIES: Rarity[] = ["limited", "rare", "super_rare", "unique"];
export const SORARE_API_KEY = "be8913e8f7ebd4225a5a48cee860dc8997d2dd88b1c4260beef68bc60c6484981e4357f0f274b3013ad5228e5b82cf36ab293411a39a9b5c9305f61da71sr128";

// Hardcoded exchange rates as a fallback, since we can't call GOOGLEFINANCE client-side.
// These should be updated periodically or replaced with a live API.
export const STATIC_EXCHANGE_RATES = {
    ETH_TO_EUR: 3200, // Example value
};

export const RARITY_COLORS: Record<Rarity, { bg: string; text: string; border: string }> = {
    common: { bg: 'bg-gray-400', text: 'text-black', border: 'border-gray-400' },
    limited: { bg: 'bg-sorare-yellow/10', text: 'text-sorare-yellow', border: 'border-sorare-yellow' },
    rare: { bg: 'bg-sorare-red/10', text: 'text-sorare-red', border: 'border-sorare-red' },
    'super_rare': { bg: 'bg-sorare-super-rare/10', text: 'text-sorare-super-rare', border: 'border-sorare-super-rare' },
    unique: { bg: 'bg-sorare-unique/10', text: 'text-sorare-unique', border: 'border-sorare-unique' },
};
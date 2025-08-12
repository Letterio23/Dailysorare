import React from 'react';
import { CardData } from '../types';
import { RARITY_COLORS } from '../constants';
import Spinner from './Spinner';

interface CardItemProps {
    card: CardData;
}

const Stat: React.FC<{ label: string; value: React.ReactNode; valueClassName?: string }> = ({ label, value, valueClassName }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-light-text-secondary">{label}</span>
        <span className={`text-sm font-semibold text-light-text-primary ${valueClassName}`}>{value ?? 'N/A'}</span>
    </div>
);

const CardItem: React.FC<CardItemProps> = ({ card }) => {
    const rarityStyles = RARITY_COLORS[card.rarity] || RARITY_COLORS.common;

    if (card.loading) {
        return (
            <div className="bg-light-surface rounded-2xl p-4 shadow-md h-[480px] flex items-center justify-center animate-pulse border border-light-border">
                <Spinner />
            </div>
        );
    }
    
    if (card.error) {
        return (
             <div className="bg-red-50 rounded-2xl p-4 shadow-lg border border-sorare-red/50">
                <h3 className="font-bold text-sorare-red">Error Loading Card</h3>
                <p className="text-xs text-red-800 break-words font-mono mt-1">{card.slug}</p>
                <p className="text-xs text-red-600 break-words mt-2">{card.error}</p>
             </div>
        )
    }

    const xpProgress = (() => {
        if (typeof card.xp !== 'number' || typeof card.xpNeededForNextGrade !== 'number' || typeof card.grade !== 'number') {
            return 0;
        }
        const xpForCurrentLevelStart = card.grade * 1000;
        const totalXpNeededForThisLevel = card.xpNeededForNextGrade - xpForCurrentLevelStart;
        
        if (totalXpNeededForThisLevel <= 0) {
            return 100; // Max level or data issue
        }

        const currentXpProgressInLevel = card.xp - xpForCurrentLevelStart;
        const progressPercentage = (currentXpProgressInLevel / totalXpNeededForThisLevel) * 100;
        
        return Math.max(0, Math.min(progressPercentage, 100)); // Clamp between 0 and 100
    })();
        
    const getFloorPrices = (card: CardData) => {
        switch (card.rarity) {
            case 'limited': return { classic: card.floorClassicLimited, inSeason: card.floorInSeasonLimited };
            case 'rare': return { classic: card.floorClassicRare, inSeason: card.floorInSeasonRare };
            case 'super_rare': return { classic: card.floorClassicSr, inSeason: card.floorInSeasonSr };
            default: return { classic: null, inSeason: null };
        }
    }
    const floors = getFloorPrices(card);
    
    const isInjured = card.injuryInfo !== 'None';

    return (
        <div className="bg-light-surface rounded-2xl overflow-hidden shadow-md border border-light-border transition-all duration-300 hover:shadow-lg hover:border-sorare-blue/50 transform hover:-translate-y-1">
            <div className="relative">
                <img src={card.pictureUrl} alt={card.playerName || 'Player'} className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold border ${rarityStyles.border}/50 ${rarityStyles.bg} ${rarityStyles.text}`}>
                    {card.rarity.replace('_', ' ').toUpperCase()}
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                     <h3 className="font-bold text-xl text-white shadow-black/50 [text-shadow:_0_1px_3px_var(--tw-shadow-color)]">{card.playerName}</h3>
                     <p className="text-sm text-gray-200 shadow-black/50 [text-shadow:_0_1px_3px_var(--tw-shadow-color)]">{card.position}</p>
                </div>
            </div>
            
            <div className="p-4 flex flex-col space-y-3">
                <Stat label="Sale Price" value={card.salePriceEur ? `€${card.salePriceEur.toFixed(2)}` : 'Not Listed'} valueClassName={card.salePriceEur ? "text-sorare-green" : "text-light-text-secondary"} />
                <div className="w-full h-px bg-light-border" />
                <Stat label="Floor (In Season)" value={floors.inSeason ? `€${floors.inSeason.toFixed(2)}` : 'N/A'} />
                <Stat label="Floor (Classic)" value={floors.classic ? `€${floors.classic.toFixed(2)}` : 'N/A'} />
                <div className="w-full h-px bg-light-border" />
                <div>
                    <Stat label="XP Level" value={card.grade ?? 'N/A'} />
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5">
                        <div className="bg-sorare-green h-1 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                    </div>
                </div>
                <div className="w-full h-px bg-light-border" />
                <Stat label="L5 / L15 Avg" value={`${card.avgSo5Score5 ?? '–'}/${card.avgSo5Score15 ?? '–'}`} />
                 <div className="w-full h-px bg-light-border" />
                <Stat label="Next Game" value={card.nextGameDate ? new Date(card.nextGameDate).toLocaleDateString() : 'N/A'}/>
                <Stat label="Status" value={isInjured ? card.injuryInfo : card.suspensionInfo} valueClassName={isInjured ? 'text-sorare-red' : ''} />
            </div>
        </div>
    );
};

export default CardItem;

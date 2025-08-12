import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchGraphQL } from '../services/api';
import { AllCardsResponse, CardData, CardDetailsGQLResponse, PlayerFloorPricesGQLResponse, Rarity, SortOption } from '../types';
import { STATIC_EXCHANGE_RATES, ALLOWED_RARITIES } from '../constants';
import CardItem from './CardItem';
import Spinner from './Spinner';
import LogoutIcon from './icons/LogoutIcon';
import SorareIcon from './icons/SorareIcon';
import BugIcon from './icons/BugIcon';
import LogPanel from './LogPanel';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { logger } from '../services/logger';

const BATCH_SIZE = 10; // Process 10 cards in parallel

const cardDetailsQuery_V3 = `query GetCardDetails($cardSlug: String!) { anyCard(slug: $cardSlug) { rarityTyped grade xp xpNeededForNextGrade liveSingleSaleOffer { receiverSide { amounts { eurCents, usdCents, gbpCents, wei, referenceCurrency} } } ... on Card { pictureUrl season { startYear } inSeasonEligible player { slug displayName position lastFiveSo5Appearances lastFifteenSo5Appearances playerGameScores(last: 15, lowCoverage: true) { score } activeInjuries { status expectedEndDate } activeSuspensions { reason matches endDate competition { displayName }} activeClub { name upcomingGames(first: 1) { id date competition { displayName } homeTeam { ... on TeamInterface { name } } awayTeam { ... on TeamInterface { name } } } } u23Eligible } } } }`;
const playerFloorsQuery_V3 = (playerSlug: string) => {
    const priceFields = `liveSingleSaleOffer { receiverSide { amounts { eurCents, usdCents, gbpCents, wei, referenceCurrency } } }`;
    return `query GetSinglePlayerFloorPrices { football { player(slug: "${playerSlug}") {
        L_IN: lowestPriceAnyCard(rarity: limited, inSeason: true) { ${priceFields} } L_ANY: lowestPriceAnyCard(rarity: limited, inSeason: false) { ${priceFields} }
        R_IN: lowestPriceAnyCard(rarity: rare, inSeason: true) { ${priceFields} } R_ANY: lowestPriceAnyCard(rarity: rare, inSeason: false) { ${priceFields} }
        SR_IN: lowestPriceAnyCard(rarity: super_rare, inSeason: true) { ${priceFields} } SR_ANY: lowestPriceAnyCard(rarity: super_rare, inSeason: false) { ${priceFields} }
    } } }`;
};

const calculateEurPrice = (offer: CardDetailsGQLResponse['anyCard']['liveSingleSaleOffer']): number | null => {
    if (!offer?.receiverSide?.amounts) return null;
    const { amounts } = offer.receiverSide;
    try {
        if (amounts.eurCents) return parseFloat(amounts.eurCents) / 100;
        if (amounts.wei) {
            const ethValue = parseFloat(amounts.wei) / 1e18;
            return parseFloat((ethValue * STATIC_EXCHANGE_RATES.ETH_TO_EUR).toFixed(2));
        }
    } catch (e) {
        return null;
    }
    return null;
};

const Dashboard: React.FC = () => {
    const { userSlug, logout } = useAuth();
    const [cards, setCards] = useState<CardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Initializing...');
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState({ loaded: 0, total: 0 });
    const [showLogs, setShowLogs] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('ownerSince');

    const fetchCardDetails = useCallback(async (cardSlug: string) => {
        const cardDetailsResp = await fetchGraphQL<CardDetailsGQLResponse, {cardSlug: string}>(cardDetailsQuery_V3, { cardSlug });
        
        if (cardDetailsResp.errors || !cardDetailsResp.data?.anyCard) {
            throw new Error(cardDetailsResp.errors?.[0].message || `Failed to fetch details for ${cardSlug}`);
        }
        
        const c = cardDetailsResp.data.anyCard;
        const p = c.player;

        let floors = {} as Partial<CardData>;
        if (p?.slug) {
            const floorsResp = await fetchGraphQL<PlayerFloorPricesGQLResponse, {}>(playerFloorsQuery_V3(p.slug));
            const playerFloors = floorsResp.data?.football?.player;
            if (playerFloors) {
                floors = {
                    floorInSeasonLimited: calculateEurPrice(playerFloors.L_IN?.liveSingleSaleOffer),
                    floorClassicLimited: calculateEurPrice(playerFloors.L_ANY?.liveSingleSaleOffer),
                    floorInSeasonRare: calculateEurPrice(playerFloors.R_IN?.liveSingleSaleOffer),
                    floorClassicRare: calculateEurPrice(playerFloors.R_ANY?.liveSingleSaleOffer),
                    floorInSeasonSr: calculateEurPrice(playerFloors.SR_IN?.liveSingleSaleOffer),
                    floorClassicSr: calculateEurPrice(playerFloors.SR_ANY?.liveSingleSaleOffer),
                }
            }
        }
        
        const scoresNum = (p?.playerGameScores || []).map(gs => gs.score).filter(s => typeof s === 'number');
        const avgFn = (arr: number[], cnt: number) => {
            const items = arr.slice(0, cnt);
            return items.length > 0 ? parseFloat((items.reduce((a, b) => a + b, 0) / items.length).toFixed(2)) : null;
        };

        const nextGame = p?.activeClub?.upcomingGames?.[0];

        const details: Partial<CardData> = {
            rarity: c.rarityTyped,
            grade: c.grade,
            pictureUrl: c.pictureUrl,
            xp: c.xp,
            xpNeededForNextGrade: c.xpNeededForNextGrade,
            inSeason: c.inSeasonEligible,
            salePriceEur: calculateEurPrice(c.liveSingleSaleOffer),
            playerName: p?.displayName,
            position: p?.position,
            playerApiSlug: p?.slug,
            l5So5: p?.lastFiveSo5Appearances,
            l15So5: p?.lastFifteenSo5Appearances,
            u23Eligible: p?.u23Eligible,
            injuryInfo: (p?.activeInjuries || []).map(item => `${item.status} until ${new Date(item.expectedEndDate).toLocaleDateString()}`).join(', ') || 'None',
            suspensionInfo: (p?.activeSuspensions || []).map(item => `${item.reason}`).join(', ') || 'None',
            avgSo5Score3: avgFn(scoresNum, 3),
            avgSo5Score5: avgFn(scoresNum, 5),
            avgSo5Score15: avgFn(scoresNum, 15),
            last5Scores: scoresNum.slice(0, 5).join(', '),
            nextGame: nextGame ? `${nextGame.homeTeam?.name} vs ${nextGame.awayTeam?.name}` : 'No upcoming game',
            nextGameDate: nextGame ? new Date(nextGame.date).toLocaleString() : null,
            ...floors,
        };
        return details;
    }, []);
    
    useEffect(() => {
        const fetchAllData = async () => {
            if (!userSlug) return;

            logger.log("Starting data fetch process.");
            setLoading(true);
            setError(null);
            setCards([]);
            setLoadingMessage('Discovering your cards...');
            setProgress({ loaded: 0, total: 0 });
            
            try {
                // Phase 1: Discover all card slugs
                logger.log("Phase 1: Starting card discovery.");
                let allCardSlugs: { slug: string; ownerSince: string | null; }[] = [];
                let cursor: string | null = null;
                let hasNextPage = true;
                let pageNum = 1;

                while (hasNextPage) {
                    logger.log(`Fetching page ${pageNum} of cards...`, { cursor });
                    const query = `query AllCardsFromUser($userSlug: String!, $rarities: [Rarity!], $cursor: String) { user(slug: $userSlug) { cards(rarities: $rarities, after: $cursor) { nodes { slug, ownerSince } pageInfo { endCursor, hasNextPage } } } }`;
                    const variables = { userSlug, cursor, rarities: ALLOWED_RARITIES as Rarity[] };
                    const response = await fetchGraphQL<AllCardsResponse, typeof variables>(query, variables);

                    if (response.errors || !response.data?.user?.cards) {
                        throw new Error(response.errors?.[0].message || 'Failed to fetch user cards.');
                    }
                    
                    const newCards = response.data.user.cards.nodes;
                    allCardSlugs.push(...newCards);
                    setLoadingMessage(`Discovering cards... Found ${allCardSlugs.length}`);
                    
                    hasNextPage = response.data.user.cards.pageInfo.hasNextPage;
                    cursor = response.data.user.cards.pageInfo.endCursor;
                    pageNum++;
                }
                
                logger.log(`Phase 1: Discovery complete. Found ${allCardSlugs.length} cards.`);

                // Phase 2: Batch process all discovered cards
                setLoadingMessage(`Discovery complete! Now loading details for ${allCardSlugs.length} cards...`);
                const initialCardData = allCardSlugs.map(c => ({
                    slug: c.slug,
                    ownerSince: c.ownerSince,
                    loading: true
                } as CardData));
                setCards(initialCardData);
                setProgress({ loaded: 0, total: allCardSlugs.length });
                
                const batches = [];
                for (let i = 0; i < allCardSlugs.length; i += BATCH_SIZE) {
                    batches.push(allCardSlugs.slice(i, i + BATCH_SIZE));
                }
                logger.log(`Phase 2: Starting detail fetching for ${allCardSlugs.length} cards in ${batches.length} batches.`);


                for (let i = 0; i < batches.length; i++) {
                    const batch = batches[i];
                    setLoadingMessage(`Processing batch ${i + 1} of ${batches.length}...`);
                    logger.log(`Processing batch ${i + 1}/${batches.length}`);

                    await Promise.all(batch.map(async (card) => {
                        try {
                            const details = await fetchCardDetails(card.slug);
                            setCards(prev => prev.map(c => c.slug === card.slug ? { ...c, ...details, ownerSince: card.ownerSince, loading: false } : c));
                        } catch (e) {
                             setCards(prev => prev.map(c => c.slug === card.slug ? { ...c, loading: false, error: (e as Error).message } : c));
                        }
                        setProgress(p => ({ ...p, loaded: p.loaded + 1 }));
                    }));
                }

            } catch (e) {
                logger.error("A critical error occurred in fetchAllData", e);
                setError((e as Error).message);
            } finally {
                logger.log("Data fetch process finished.");
                setLoading(false);
            }
        };

        fetchAllData();
    }, [userSlug, fetchCardDetails]);

    const sortedCards = useMemo(() => {
        return [...cards].sort((a, b) => {
            // Put loading cards at the top
            if (a.loading && !b.loading) return -1;
            if (!a.loading && b.loading) return 1;

            switch (sortBy) {
                case 'ownerSince':
                    return new Date(b.ownerSince || 0).getTime() - new Date(a.ownerSince || 0).getTime();
                case 'salePriceEur':
                    return (b.salePriceEur || 0) - (a.salePriceEur || 0);
                case 'avgSo5Score15':
                    return (b.avgSo5Score15 || 0) - (a.avgSo5Score15 || 0);
                case 'playerName':
                    return (a.playerName || '').localeCompare(b.playerName || '');
                default:
                    return 0;
            }
        });
    }, [cards, sortBy]);

    const sortOptions: { value: SortOption, label: string }[] = [
        { value: 'ownerSince', label: 'Date Acquired' },
        { value: 'salePriceEur', label: 'Sale Price' },
        { value: 'avgSo5Score15', label: 'L15 Average' },
        { value: 'playerName', label: 'Player Name' },
    ];

    return (
        <div className="min-h-screen bg-light-bg text-light-text-primary p-4 sm:p-6 lg:p-8">
            <header className="flex flex-wrap gap-4 justify-between items-center mb-8 pb-4 border-b border-light-border">
                <div className="flex items-center space-x-4">
                    <SorareIcon className="h-10 w-10 text-sorare-blue" />
                    <div>
                        <h1 className="text-2xl font-bold text-light-text-primary tracking-tight">{userSlug}'s Gallery</h1>
                        <p className="text-sm text-light-text-secondary">Card manager dashboard</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                     <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="appearance-none cursor-pointer bg-white border border-light-border rounded-full py-2 pl-4 pr-10 text-sm font-medium text-light-text-secondary hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-sorare-blue transition-colors"
                            disabled={loading}
                        >
                            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <button onClick={() => setShowLogs(!showLogs)} className="p-2 bg-white hover:bg-gray-100 rounded-full border border-light-border transition-colors duration-200">
                        <BugIcon className="h-5 w-5 text-light-text-secondary"/>
                    </button>
                    <button onClick={logout} className="p-2 bg-white hover:bg-gray-100 rounded-full border border-light-border transition-colors duration-200">
                        <LogoutIcon className="h-5 w-5 text-light-text-secondary" />
                    </button>
                </div>
            </header>

            <main>
                {loading && (
                    <div className="flex flex-col items-center justify-center text-center py-20">
                        <div className="w-full max-w-md bg-light-surface p-8 rounded-2xl shadow-lg border border-light-border">
                            <Spinner />
                            <h2 className="mt-6 text-xl font-bold text-light-text-primary">{loadingMessage}</h2>
                            
                            {progress.total > 0 && (
                                <div className="mt-4">
                                    <div className="flex justify-between items-center text-sm text-light-text-secondary mb-2">
                                        <span>Progress</span>
                                        <span className="font-semibold">{Math.round((progress.loaded / progress.total) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-light-border rounded-full h-3 overflow-hidden">
                                        <div 
                                            className="bg-sorare-blue h-3 rounded-full transition-all duration-300 ease-in-out" 
                                            style={{ width: `${(progress.loaded / progress.total) * 100}%`}}
                                        ></div>
                                    </div>
                                    <p className="mt-3 text-sm text-light-text-secondary">
                                        {`Loaded ${progress.loaded} of ${progress.total} cards`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {error && <div className="text-center text-sorare-red bg-red-100 p-4 rounded-lg border border-red-200">{error}</div>}
                
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {sortedCards.map(card => (
                            <CardItem key={card.slug} card={card} />
                        ))}
                    </div>
                )}
            </main>
            <LogPanel isVisible={showLogs} onClose={() => setShowLogs(false)} />
        </div>
    );
};

export default Dashboard;
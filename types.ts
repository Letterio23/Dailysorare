export type Rarity = "limited" | "rare" | "super_rare" | "unique" | "common";
export type SortOption = 'ownerSince' | 'salePriceEur' | 'avgSo5Score15' | 'playerName';


export interface CardData {
    // Core Card Info
    slug: string;
    rarity: Rarity;
    ownerSince: string | null;
    pictureUrl: string;
    grade: number | null;
    xp: number | null;
    xpNeededForNextGrade: number | null;
    inSeason: boolean;
    salePriceEur: number | null;

    // Player Info
    playerName: string | null;
    playerApiSlug: string | null;
    position: string | null;
    u23Eligible: boolean;
    
    // Stats
    l5So5: number | null;
    l15So5: number | null;
    avgSo5Score3: number | null;
    avgSo5Score5: number | null;
    avgSo5Score15: number | null;
    last5Scores: string;

    // Next Game
    nextGame: string | null;
    nextGameDate: string | null;
    
    // Status
    injuryInfo: string;
    suspensionInfo: string;
    
    // Prices
    floorClassicLimited: number | null;
    floorClassicRare: number | null;
    floorClassicSr: number | null;
    floorInSeasonLimited: number | null;
    floorInSeasonRare: number | null;
    floorInSeasonSr: number | null;

    // State
    loading: boolean;
    error?: string;
}

export interface SorareGraphQLResponse<T> {
    data?: T;
    errors?: { message: string }[];
}

export interface AllCardsResponse {
    user: {
        cards: {
            nodes: {
                slug: string;
                ownerSince: string | null;
            }[];
            pageInfo: {
                endCursor: string | null;
                hasNextPage: boolean;
            };
        };
    };
}

export interface CardDetailsGQLResponse {
    anyCard: {
        rarityTyped: Rarity;
        grade: number;
        xp: number;
        xpNeededForNextGrade: number;
        liveSingleSaleOffer: {
            receiverSide: {
                amounts: {
                    eurCents: string | null;
                    usdCents: string | null;
                    gbpCents: string | null;
                    wei: string | null;
                    referenceCurrency: string;
                }
            }
        } | null;
        pictureUrl: string;
        season: { startYear: number };
        inSeasonEligible: boolean;
        player: {
            slug: string;
            displayName: string;
            position: string;
            lastFiveSo5Appearances: number;
            lastFifteenSo5Appearances: number;
            playerGameScores: { score: number }[];
            activeInjuries: { status: string; expectedEndDate: string }[];
            activeSuspensions: { reason: string; endDate: string; competition: { displayName: string } }[];
            activeClub: {
                name: string;
                upcomingGames: {
                    id: string;
                    date: string;
                    competition: { displayName: string };
                    homeTeam: { name: string };
                    awayTeam: { name: string };
                }[];
            };
            u23Eligible: boolean;
        };
    };
}

export interface PlayerFloorPricesGQLResponse {
    football: {
        player: {
            [key: string]: {
                liveSingleSaleOffer: CardDetailsGQLResponse['anyCard']['liveSingleSaleOffer'];
            } | null;
        }
    }
}

export interface LogEntry {
    timestamp: Date;
    level: 'info' | 'error' | 'warn';
    message: string;
    data?: any;
}
// Cache service to reduce API calls and improve performance
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  
  // Cache duration in milliseconds
  private readonly CRICKET_MATCHES_TTL = 2 * 60 * 1000; // 2 minutes
  private readonly PLAYER_DATA_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly FANTASY_DATA_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const defaultTTL = this.getDefaultTTL(key);
    const expiryTime = Date.now() + (ttl || defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiryTime
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiryTime) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    return item !== undefined && Date.now() <= item.expiryTime;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const items = Array.from(this.cache.values());
    const activeItems = items.filter(item => now <= item.expiryTime);
    
    return {
      totalItems: this.cache.size,
      activeItems: activeItems.length,
      expiredItems: items.length - activeItems.length,
      cacheHitRate: this.getCacheHitRate()
    };
  }

  private getDefaultTTL(key: string): number {
    if (key.startsWith('matches_')) return this.CRICKET_MATCHES_TTL;
    if (key.startsWith('players_')) return this.PLAYER_DATA_TTL;
    if (key.startsWith('fantasy_')) return this.FANTASY_DATA_TTL;
    return 5 * 60 * 1000; // Default 5 minutes
  }

  private cacheHits = 0;
  private cacheMisses = 0;

  recordHit(): void {
    this.cacheHits++;
  }

  recordMiss(): void {
    this.cacheMisses++;
  }

  private getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? (this.cacheHits / total) * 100 : 0;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiryTime) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Auto cleanup every 5 minutes
setInterval(() => {
  cacheService.cleanup();
}, 5 * 60 * 1000);

// Cache key generators
export const CacheKeys = {
  liveMatches: () => 'matches_live',
  liveScores: () => 'matches_scores',
  matchDetails: (matchId: string) => `matches_details_${matchId}`,
  fantasySquad: (matchId: string) => `fantasy_squad_${matchId}`,
  fantasyPoints: (matchId: string) => `fantasy_points_${matchId}`,
  playersList: () => 'players_all',
  playerStats: (playerId: string) => `players_stats_${playerId}`,
  contestsList: () => 'contests_list',
  userTeams: (userId: string) => `user_teams_${userId}`,
  leaderboard: (contestId: string) => `leaderboard_${contestId}`
};
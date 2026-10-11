// 游戏数据存储管理

// 关卡进度数据
interface LevelProgress {
  id: number;
  completed: boolean;
  stars: number;
  bestTime: number;
  attempts: number;
  unlocked: boolean;
  difficulty: number; // 难度等级 1-5
}

// 成就数据
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

// 玩家统计数据
export interface PlayerStats {
  totalCoins: number;
  totalStars: number;
  totalPlayTime: number; // 秒
  levelsCompleted: number;
  perfectScores: number;
  currentStreak: number;
  bestStreak: number;
}

// 商城道具
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  type: 'skin' | 'badge' | 'title';
}

// 本地账号资料（未登录，仅本地）
export interface LocalProfile {
  displayName: string;
  avatarSeed: string;
}

// 家长控制设置
export interface ParentControlSettings {
  dailyGoal: number;
  isRestricted: boolean;
}

// 游戏数据
interface GameData {
  levels: LevelProgress[];
  achievements: Achievement[];
  stats: PlayerStats;
  shop: {
    inventory: string[];
    equipped: { skin: string; badge: string | null; title: string | null };
  };
  settings: {
    soundEnabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  lastPlayed: Date;
}

class GameStorage {
  private static readonly STORAGE_KEY = 'math_game_data';
  private static readonly VERSION = '1.0';
  private static achievementCallbacks: ((achievement: Achievement) => void)[] = [];

  // 获取默认游戏数据
  private static getDefaultData(): GameData {
    return {
      levels: [
        { id: 1, completed: false, stars: 0, bestTime: 0, attempts: 0, unlocked: true, difficulty: 1 },
        { id: 2, completed: false, stars: 0, bestTime: 0, attempts: 0, unlocked: false, difficulty: 1 },
        { id: 3, completed: false, stars: 0, bestTime: 0, attempts: 0, unlocked: false, difficulty: 1 },
        { id: 4, completed: false, stars: 0, bestTime: 0, attempts: 0, unlocked: false, difficulty: 2 },
        { id: 5, completed: false, stars: 0, bestTime: 0, attempts: 0, unlocked: false, difficulty: 2 },
        { id: 6, completed: false, stars: 0, bestTime: 0, attempts: 0, unlocked: false, difficulty: 2 },
      ],
      achievements: [
        { id: 'first_win', name: '初次胜利', description: '完成第一个关卡', icon: 'trophy', unlocked: false },
        { id: 'perfect_score', name: '完美得分', description: '获得满星评价', icon: 'star', unlocked: false },
        { id: 'speed_demon', name: '速度恶魔', description: '在30秒内完成关卡', icon: 'lightning', unlocked: false },
        { id: 'difficulty_2', name: '进阶挑战', description: '完成难度2的关卡', icon: 'fire', unlocked: false },
        { id: 'difficulty_3', name: '高级挑战', description: '完成难度3的关卡', icon: 'muscle', unlocked: false },
        { id: 'difficulty_4', name: '专家挑战', description: '完成难度4的关卡', icon: 'brain', unlocked: false },
        { id: 'difficulty_5', name: '大师挑战', description: '完成难度5的关卡', icon: 'medal', unlocked: false },
        { id: 'math_master', name: '数学大师', description: '完成所有关卡', icon: 'grad', unlocked: false },
        { id: 'coin_collector', name: '金币收集者', description: '累计获得1000金币', icon: 'coin', unlocked: false },
        { id: 'streak_master', name: '连击大师', description: '达到10连击', icon: 'streak', unlocked: false },
      ],
      stats: {
        totalCoins: 0,
        totalStars: 0,
        totalPlayTime: 0,
        levelsCompleted: 0,
        perfectScores: 0,
        currentStreak: 0,
        bestStreak: 0,
      },
      shop: {
        inventory: [],
        equipped: { skin: 'default', badge: null, title: null }
      },
      settings: {
        soundEnabled: true,
        difficulty: 'easy',
      },
      lastPlayed: new Date(),
    };
  }

  // 加载游戏数据
  static loadGameData(): GameData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultData();
      }

      const data = JSON.parse(stored);

      // 数据版本检查和迁移
      if (!data.version || data.version !== this.VERSION) {
        return this.migrateData(data);
      }

      // 确保数据结构完整
      return {
        ...this.getDefaultData(),
        ...data,
        lastPlayed: new Date(data.lastPlayed),
      };
    } catch (error) {
      console.error('加载游戏数据失败:', error);
      return this.getDefaultData();
    }
  }

  // 保存游戏数据
  static saveGameData(data: GameData): void {
    try {
      const dataToSave = {
        ...data,
        version: this.VERSION,
        lastPlayed: new Date(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('保存游戏数据失败:', error);
    }
  }

  // 数据迁移
  private static migrateData(oldData: unknown): GameData {
    const defaultData = this.getDefaultData();
    const source =
      oldData && typeof oldData === 'object' ? (oldData as Partial<GameData>) : {};

    // 简单的数据迁移逻辑
    return {
      ...defaultData,
      levels: source.levels || defaultData.levels,
      achievements: source.achievements || defaultData.achievements,
      stats: { ...defaultData.stats, ...(source.stats || {}) },
      shop: { ...defaultData.shop, ...(source.shop || {}) },
      settings: { ...defaultData.settings, ...(source.settings || {}) },
    };
  }

  // 获取玩家统计
  static getPlayerStats(): PlayerStats {
    return this.loadGameData().stats;
  }

  // 获取背包
  static getInventory(): string[] {
    return this.loadGameData().shop.inventory;
  }

  // 获取已装备
  static getEquippedItems(): { skin: string; badge: string | null; title: string | null } {
    return this.loadGameData().shop.equipped;
  }

  // 购买道具
  static buyItem(item: ShopItem): { success: boolean; message: string } {
    const data = this.loadGameData();

    if (data.shop.inventory.includes(item.id)) {
      return { success: false, message: '已拥有该道具' };
    }

    if (data.stats.totalCoins < item.price) {
      return { success: false, message: '金币不足' };
    }

    data.stats.totalCoins -= item.price;
    data.shop.inventory.push(item.id);
    this.saveGameData(data);
    return { success: true, message: `购买成功：${item.name}` };
  }

  // 装备道具
  static equipItem(item: ShopItem): void {
    const data = this.loadGameData();
    if (!data.shop.inventory.includes(item.id)) {
      return;
    }

    if (item.type === 'skin') {
      data.shop.equipped.skin = item.id;
    } else if (item.type === 'badge') {
      data.shop.equipped.badge = item.id;
    } else if (item.type === 'title') {
      data.shop.equipped.title = item.id;
    }

    this.saveGameData(data);
  }

  // 更新关卡进度
  static updateLevelProgress(
    levelId: number,
    completed: boolean,
    stars: number,
    timeUsed: number,
    coinsEarned: number
  ): void {
    const data = this.loadGameData();
    const levelIndex = data.levels.findIndex(l => l.id === levelId);

    if (levelIndex === -1) return;

    const level = data.levels[levelIndex];
    const wasCompleted = level.completed;
    const previousStars = level.stars;

    level.attempts += 1;

    if (completed) {
      level.completed = true;
      level.stars = Math.max(previousStars, stars);

      if (level.bestTime === 0 || timeUsed < level.bestTime) {
        level.bestTime = timeUsed;
      }

      // 解锁下一关
      if (levelIndex + 1 < data.levels.length) {
        data.levels[levelIndex + 1].unlocked = true;
      }

      // 更新统计数据
      data.stats.totalCoins += coinsEarned;

      if (!wasCompleted) {
        data.stats.levelsCompleted += 1;
      }

      if (stars > previousStars) {
        data.stats.totalStars += (stars - previousStars);
      }

      if (stars === 3 && previousStars < 3) {
        data.stats.perfectScores += 1;
      }

      // 检查并解锁成就
      this.checkAchievements(data, levelId, stars, timeUsed);
    }

    this.saveGameData(data);
  }

  // 检查成就解锁
  private static checkAchievements(
    data: GameData,
    levelId: number,
    stars: number,
    timeUsed: number
  ): void {
    const achievements = data.achievements;

    // 初次胜利
    if (levelId === 1 && !achievements.find(a => a.id === 'first_win')?.unlocked) {
      this.unlockAchievement(data, 'first_win');
    }

    // 完美得分
    if (stars === 3 && !achievements.find(a => a.id === 'perfect_score')?.unlocked) {
      this.unlockAchievement(data, 'perfect_score');
    }

    // 速度恶魔
    if (timeUsed <= 30 && !achievements.find(a => a.id === 'speed_demon')?.unlocked) {
      this.unlockAchievement(data, 'speed_demon');
    }

    // 数学大师
    const allCompleted = data.levels.every(l => l.completed);
    if (allCompleted && !achievements.find(a => a.id === 'math_master')?.unlocked) {
      this.unlockAchievement(data, 'math_master');
    }

    // 金币收集者
    if (data.stats.totalCoins >= 1000 && !achievements.find(a => a.id === 'coin_collector')?.unlocked) {
      this.unlockAchievement(data, 'coin_collector');
    }

    // 难度挑战成就
    const level = data.levels.find(l => l.id === levelId);
    if (level && level.completed) {
      const difficultyAchievements = [
        { difficulty: 2, id: 'difficulty_2' },
        { difficulty: 3, id: 'difficulty_3' },
        { difficulty: 4, id: 'difficulty_4' },
        { difficulty: 5, id: 'difficulty_5' }
      ];

      difficultyAchievements.forEach(({ difficulty, id }) => {
        if (level.difficulty >= difficulty && !achievements.find(a => a.id === id)?.unlocked) {
          this.unlockAchievement(data, id);
        }
      });
    }
  }

  // 解锁成就
  private static unlockAchievement(data: GameData, achievementId: string): void {
    const achievement = data.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date();

      console.log(`[成就解锁]: ${achievement.name}`);

      // 触发成就解锁回调
      this.achievementCallbacks.forEach(callback => {
        try {
          callback(achievement);
        } catch (error) {
          console.error('成就回调执行失败:', error);
        }
      });
    }
  }

  // 注册成就解锁回调
  static onAchievementUnlocked(callback: (achievement: Achievement) => void): () => void {
    this.achievementCallbacks.push(callback);

    // 返回取消注册的函数
    return () => {
      const index = this.achievementCallbacks.indexOf(callback);
      if (index > -1) {
        this.achievementCallbacks.splice(index, 1);
      }
    };
  }

  // 获取关卡进度
  static getLevelProgress(levelId: number): LevelProgress | null {
    const data = this.loadGameData();
    return data.levels.find(l => l.id === levelId) || null;
  }

  // 获取所有关卡进度
  static getAllLevels(): LevelProgress[] {
    const data = this.loadGameData();
    return data.levels;
  }

  // 获取成就列表
  static getAchievements(): Achievement[] {
    const data = this.loadGameData();
    return data.achievements;
  }

  // 更新设置
  static updateSettings(settings: Partial<GameData['settings']>): void {
    const data = this.loadGameData();
    data.settings = { ...data.settings, ...settings };
    this.saveGameData(data);
  }

  private static readonly PROFILE_KEY = 'math_local_profile';
  private static readonly PARENT_SETTINGS_KEY = 'math_parent_control_settings';

  private static createProfileSeed(): string {
    return `kid-${Math.floor(Math.random() * 1000000)}`;
  }

  static createDefaultLocalProfile(): LocalProfile {
    return {
      displayName: '学习伙伴',
      avatarSeed: this.createProfileSeed(),
    };
  }

  static getLocalProfile(): LocalProfile | null {
    try {
      const raw = localStorage.getItem(this.PROFILE_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw) as Partial<LocalProfile> & Record<string, unknown>;
      if (!p || typeof p.displayName !== 'string') return null;
      const displayName = p.displayName.trim();
      if (!displayName) return null;

      const avatarSeed =
        typeof p.avatarSeed === 'string' && p.avatarSeed.trim()
          ? p.avatarSeed
          : this.createProfileSeed();

      return { displayName, avatarSeed };
    } catch {
      return null;
    }
  }

  static setLocalProfile(profile: LocalProfile): void {
    localStorage.setItem(
      this.PROFILE_KEY,
      JSON.stringify({
        displayName: profile.displayName,
        avatarSeed: profile.avatarSeed,
      })
    );
  }

  static getOrCreateLocalProfile(): LocalProfile {
    const profile = this.getLocalProfile();
    if (profile) {
      if (profile.displayName === '小朋友') {
        const migrated = { ...profile, displayName: '学习伙伴' };
        this.setLocalProfile(migrated);
        return migrated;
      }
      return profile;
    }
    const created = this.createDefaultLocalProfile();
    this.setLocalProfile(created);
    return created;
  }

  static clearLocalProfile(): void {
    localStorage.removeItem(this.PROFILE_KEY);
  }

  static getParentControlSettings(): ParentControlSettings {
    try {
      const raw = localStorage.getItem(this.PARENT_SETTINGS_KEY);
      if (!raw) {
        return { dailyGoal: 30, isRestricted: false };
      }
      const parsed = JSON.parse(raw) as ParentControlSettings;
      return {
        dailyGoal: typeof parsed.dailyGoal === 'number' ? parsed.dailyGoal : 30,
        isRestricted: Boolean(parsed.isRestricted),
      };
    } catch {
      return { dailyGoal: 30, isRestricted: false };
    }
  }

  static setParentControlSettings(settings: ParentControlSettings): void {
    localStorage.setItem(this.PARENT_SETTINGS_KEY, JSON.stringify(settings));
  }

  // 增加金币
  static addCoins(amount: number): void {
    const data = this.loadGameData();
    data.stats.totalCoins += amount;
    this.saveGameData(data);
  }

  // 重置游戏数据
  static resetGameData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // 导出游戏数据
  static exportGameData(): string {
    const data = this.loadGameData();
    return JSON.stringify(data, null, 2);
  }

  // 导入游戏数据
  static importGameData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveGameData(data);
      return true;
    } catch (error) {
      console.error('导入游戏数据失败:', error);
      return false;
    }
  }
}

export default GameStorage;
export type { GameData, LevelProgress, Achievement };

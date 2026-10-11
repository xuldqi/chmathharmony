// 学习数据存储管理系统

// 答题记录
interface AnswerRecord {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  timeSpent: number; // 毫秒
  timestamp: Date;
  source: 'calculator' | 'practice' | 'game';
}

// 学习会话记录
interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // 毫秒
  questionsAnswered: number;
  correctAnswers: number;
  source: 'calculator' | 'practice' | 'game';
  answers: AnswerRecord[];
}

// 每日学习进度
interface DailyProgress {
  date: string; // YYYY-MM-DD
  questionsAnswered: number;
  correctRate: number;
  timeSpent: number; // 分钟
  sessions: number;
  achievements: string[];
}

// 错题记录
interface WrongQuestion {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
  date: string;
  reviewCount: number;
  lastReviewDate?: string;
  mastered: boolean;
}

// 成就记录
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: 'basic' | 'advanced' | 'special' | 'streak';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// 学习统计数据
interface StudyStats {
  totalTime: number; // 分钟
  totalQuestions: number;
  correctAnswers: number;
  correctRate: number;
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string;
  studyDays: number;
  averageSessionTime: number;
  favoriteType: string;
  improvementRate: number;
}

// 完整的学习数据
interface StudyData {
  stats: StudyStats;
  sessions: StudySession[];
  dailyProgress: DailyProgress[];
  wrongQuestions: WrongQuestion[];
  achievements: Achievement[];
  settings: {
    reminderEnabled: boolean;
    targetDailyTime: number; // 分钟
    difficultyPreference: 'easy' | 'medium' | 'hard';
  };
  version: string;
  lastUpdated: Date;
}

class StudyDataStorage {
  private static readonly STORAGE_KEY = 'study_data';
  private static readonly VERSION = '1.0';
  private static currentSession: StudySession | null = null;
  private static sessionStartTime: Date | null = null;

  /**
   * 获取本地时区的日期字符串 YYYY-MM-DD
   */
  public static getLocalDateStr(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 获取默认数据
  private static getDefaultData(): StudyData {
    return {
      stats: {
        totalTime: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        correctRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastStudyDate: '',
        studyDays: 0,
        averageSessionTime: 0,
        favoriteType: 'addition',
        improvementRate: 0,
      },
      sessions: [],
      dailyProgress: [],
      wrongQuestions: [],
      achievements: [
        { id: 'first_answer', name: '初次尝试', description: '完成第一道题目', icon: 'target', earned: false, category: 'basic', rarity: 'common' },
        { id: 'ten_correct', name: '十题达人', description: '连续答对10题', icon: 'trophy', earned: false, category: 'basic', rarity: 'common' },
        { id: 'perfect_session', name: '完美表现', description: '单次学习正确率100%', icon: 'star', earned: false, category: 'special', rarity: 'rare' },
        { id: 'speed_master', name: '速算高手', description: '平均每题用时少于5秒', icon: 'lightning', earned: false, category: 'advanced', rarity: 'epic' },
        { id: 'daily_learner', name: '每日学习', description: '连续学习7天', icon: 'book', earned: false, category: 'streak', rarity: 'rare' },
        { id: 'math_genius', name: '数学天才', description: '总正确率达到95%', icon: 'brain', earned: false, category: 'advanced', rarity: 'legendary' },
      ],
      settings: {
        reminderEnabled: true,
        targetDailyTime: 30,
        difficultyPreference: 'medium',
      },
      version: this.VERSION,
      lastUpdated: new Date(),
    };
  }

  // 加载学习数据
  static loadStudyData(): StudyData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultData();
      }

      const data = JSON.parse(stored);
      
      // 数据版本检查
      if (!data.version || data.version !== this.VERSION) {
        return this.migrateData(data);
      }

      // 确保数据结构完整
      const defaultData = this.getDefaultData();
      const sessions = Array.isArray(data.sessions)
        ? data.sessions.map((sessionItem: unknown) => {
          const session = (sessionItem && typeof sessionItem === 'object'
            ? sessionItem
            : {}) as Partial<StudySession> & {
              startTime?: string | Date;
              endTime?: string | Date;
              answers?: unknown[];
            };
          const answers = Array.isArray(session.answers)
            ? session.answers.map((answerItem: unknown) => {
              const answer = (answerItem && typeof answerItem === 'object'
                ? answerItem
                : {}) as Partial<AnswerRecord> & { timestamp?: string | Date };
              return {
                ...answer,
                timestamp: answer.timestamp ? new Date(answer.timestamp) : new Date(),
              } as AnswerRecord;
            })
            : [];
          return {
            ...session,
            startTime: session.startTime ? new Date(session.startTime) : new Date(),
            endTime: session.endTime ? new Date(session.endTime) : undefined,
            answers,
          } as StudySession;
        })
        : [];
      return {
        ...defaultData,
        ...data,
        lastUpdated: new Date(data.lastUpdated),
        sessions,
      };
    } catch (error) {
      console.error('加载学习数据失败:', error);
      return this.getDefaultData();
    }
  }

  // 保存学习数据
  static saveStudyData(data: StudyData): void {
    try {
      const dataToSave = {
        ...data,
        version: this.VERSION,
        lastUpdated: new Date(),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('保存学习数据失败:', error);
    }
  }

  // 数据迁移
  private static migrateData(oldData: unknown): StudyData {
    const defaultData = this.getDefaultData();
    const source =
      oldData && typeof oldData === 'object' ? (oldData as Partial<StudyData>) : {};
    
    return {
      ...defaultData,
      stats: { ...defaultData.stats, ...(source.stats || {}) },
      sessions: source.sessions || [],
      dailyProgress: source.dailyProgress || [],
      wrongQuestions: source.wrongQuestions || [],
      achievements: source.achievements || defaultData.achievements,
      settings: { ...defaultData.settings, ...(source.settings || {}) },
    };
  }

  // 开始学习会话
  static startSession(source: 'calculator' | 'practice' | 'game'): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      startTime: new Date(),
      duration: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      source,
      answers: [],
    };
    
    this.sessionStartTime = new Date();
    return sessionId;
  }

  // 结束学习会话
  static endSession(): void {
    if (!this.currentSession || !this.sessionStartTime) return;

    const endTime = new Date();
    this.currentSession.endTime = endTime;
    this.currentSession.duration = endTime.getTime() - this.sessionStartTime.getTime();

    // 保存会话数据
    const data = this.loadStudyData();
    data.sessions.push(this.currentSession);
    
    // 更新统计数据
    this.updateStats(data, this.currentSession);
    
    // 更新每日进度
    this.updateDailyProgress(data, this.currentSession);
    
    // 检查成就
    this.checkAchievements(data);
    
    this.saveStudyData(data);
    
    this.currentSession = null;
    this.sessionStartTime = null;
  }

  // 记录答题
  static recordAnswer(
    question: string,
    userAnswer: string,
    correctAnswer: string,
    type: AnswerRecord['type'],
    difficulty: AnswerRecord['difficulty'] = 'medium',
    timeSpent: number = 0
  ): void {
    if (!this.currentSession) {
      // 如果没有活动会话，自动开始一个
      this.startSession('calculator');
    }

    const isCorrect = userAnswer.toString() === correctAnswer.toString();
    const answerId = `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const answerRecord: AnswerRecord = {
      id: answerId,
      question,
      userAnswer,
      correctAnswer,
      isCorrect,
      type,
      difficulty,
      timeSpent,
      timestamp: new Date(),
      source: this.currentSession!.source,
    };

    this.currentSession!.answers.push(answerRecord);
    this.currentSession!.questionsAnswered += 1;
    
    if (isCorrect) {
      this.currentSession!.correctAnswers += 1;
    } else {
      // 记录错题
      this.recordWrongQuestion(answerRecord);
    }
  }

  // 记录错题
  private static recordWrongQuestion(answerRecord: AnswerRecord): void {
    const data = this.loadStudyData();
    
    const wrongQuestion: WrongQuestion = {
      id: answerRecord.id,
      question: answerRecord.question,
      userAnswer: answerRecord.userAnswer,
      correctAnswer: answerRecord.correctAnswer,
      type: answerRecord.type,
      date: this.getLocalDateStr(answerRecord.timestamp),
      reviewCount: 0,
      mastered: false,
    };
    
    data.wrongQuestions.push(wrongQuestion);
    this.saveStudyData(data);
  }

  // 更新统计数据
  private static updateStats(data: StudyData, session: StudySession): void {
    const stats = data.stats;
    
    stats.totalTime = Number((stats.totalTime + session.duration / 60000).toFixed(2)); // 转换为分钟并保留2位小数
    stats.totalQuestions += session.questionsAnswered;
    stats.correctAnswers += session.correctAnswers;
    stats.correctRate = stats.totalQuestions > 0 ? (stats.correctAnswers / stats.totalQuestions) * 100 : 0;
    
    // 更新连击记录
    if (session.correctAnswers === session.questionsAnswered && session.questionsAnswered > 0) {
      stats.currentStreak += session.questionsAnswered;
      stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
    } else {
      stats.currentStreak = 0;
    }
    
    // 更新学习日期
    const today = this.getLocalDateStr();
    if (stats.lastStudyDate !== today) {
      stats.studyDays += 1;
      stats.lastStudyDate = today;
    }
    
    // 计算平均会话时间
    const totalSessions = data.sessions.length + 1;
    stats.averageSessionTime = stats.totalTime / totalSessions;
    
    // 计算最喜欢的题型
    const typeCount: Record<string, number> = {};
    [...data.sessions, session].forEach(s => {
      s.answers.forEach(a => {
        typeCount[a.type] = (typeCount[a.type] || 0) + 1;
      });
    });
    
    stats.favoriteType = Object.keys(typeCount).reduce((a, b) => 
      typeCount[a] > typeCount[b] ? a : b, 'addition'
    );
  }

  // 更新每日进度
  private static updateDailyProgress(data: StudyData, session: StudySession): void {
    const today = this.getLocalDateStr();
    let dailyProgress = data.dailyProgress.find(dp => dp.date === today);
    
    if (!dailyProgress) {
      dailyProgress = {
        date: today,
        questionsAnswered: 0,
        correctRate: 0,
        timeSpent: 0,
        sessions: 0,
        achievements: [],
      };
      data.dailyProgress.push(dailyProgress);
    }
    
    dailyProgress.questionsAnswered += session.questionsAnswered;
    dailyProgress.timeSpent = Number((dailyProgress.timeSpent + session.duration / 60000).toFixed(2));
    dailyProgress.sessions += 1;
    
    // 计算当日正确率
    const todaySessions = data.sessions.filter(s => 
      this.getLocalDateStr(s.startTime) === today
    ).concat([session]);
    
    const totalQuestions = todaySessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const totalCorrect = todaySessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    
    dailyProgress.correctRate = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  }

  // 检查成就
  private static checkAchievements(data: StudyData): void {
    const stats = data.stats;
    const achievements = data.achievements;
    
    // 初次尝试
    if (stats.totalQuestions >= 1 && !achievements.find(a => a.id === 'first_answer')?.earned) {
      this.unlockAchievement(data, 'first_answer');
    }
    
    // 十题达人
    if (stats.currentStreak >= 10 && !achievements.find(a => a.id === 'ten_correct')?.earned) {
      this.unlockAchievement(data, 'ten_correct');
    }
    
    // 完美表现
    const lastSession = data.sessions[data.sessions.length - 1];
    if (lastSession && lastSession.questionsAnswered > 0 && 
        lastSession.correctAnswers === lastSession.questionsAnswered &&
        !achievements.find(a => a.id === 'perfect_session')?.earned) {
      this.unlockAchievement(data, 'perfect_session');
    }
    
    // 速算高手
    if (stats.averageSessionTime > 0 && stats.totalQuestions > 0) {
      const avgTimePerQuestion = (stats.totalTime * 60) / stats.totalQuestions; // 秒
      if (avgTimePerQuestion < 5 && !achievements.find(a => a.id === 'speed_master')?.earned) {
        this.unlockAchievement(data, 'speed_master');
      }
    }
    
    // 每日学习
    if (stats.studyDays >= 7 && !achievements.find(a => a.id === 'daily_learner')?.earned) {
      this.unlockAchievement(data, 'daily_learner');
    }
    
    // 数学天才
    if (stats.correctRate >= 95 && stats.totalQuestions >= 100 && 
        !achievements.find(a => a.id === 'math_genius')?.earned) {
      this.unlockAchievement(data, 'math_genius');
    }
  }

  // 解锁成就
  private static unlockAchievement(data: StudyData, achievementId: string): void {
    const achievement = data.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.earned) {
      achievement.earned = true;
      achievement.earnedDate = this.getLocalDateStr();
      
      console.log(`[成就解锁]: ${achievement.name}`);
      
      // 添加到今日成就
      const today = this.getLocalDateStr();
      const dailyProgress = data.dailyProgress.find(dp => dp.date === today);
      if (dailyProgress) {
        dailyProgress.achievements.push(achievementId);
      }
    }
  }

  // 获取学习统计
  static getStudyStats(): StudyStats {
    const data = this.loadStudyData();
    const stats = { ...data.stats };

    // 将当前正在进行的 session 时间也计入统计（不依赖 endSession 被调用）
    if (this.currentSession && this.sessionStartTime) {
      const currentMinutes = (Date.now() - this.sessionStartTime.getTime()) / 60000;
      stats.totalTime = Number((stats.totalTime + currentMinutes).toFixed(2));
    }

    return stats;
  }

  // 获取错题列表
  static getWrongQuestions(): WrongQuestion[] {
    const data = this.loadStudyData();
    return data.wrongQuestions.filter(wq => !wq.mastered);
  }

  // 获取成就列表
  static getAchievements(): Achievement[] {
    const data = this.loadStudyData();
    return data.achievements;
  }

  // 获取每日进度
  static getDailyProgress(days: number = 30): DailyProgress[] {
    const data = this.loadStudyData();
    const endStr = this.getLocalDateStr(new Date());
    const startObj = new Date(new Date().getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    const startStr = this.getLocalDateStr(startObj);

    const results = data.dailyProgress.filter(dp => {
      return dp.date >= startStr && dp.date <= endStr;
    }).sort((a, b) => a.date.localeCompare(b.date));

    // 将当前正在进行的 session 时间也注入今日数据（不依赖 endSession 被调用）
    if (this.currentSession && this.sessionStartTime) {
      const today = this.getLocalDateStr();
      const currentMinutes = (Date.now() - this.sessionStartTime.getTime()) / 60000;
      const todayEntry = results.find(dp => dp.date === today);
      if (todayEntry) {
        // 返回一个浅拷贝，不修改原始数据，避免污染存储
        return results.map(dp =>
          dp.date === today
            ? { ...dp, timeSpent: Number((dp.timeSpent + currentMinutes).toFixed(2)) }
            : dp
        );
      } else {
        // 今日还没有任何已结束 session，插入一条临时记录
        results.push({
          date: today,
          questionsAnswered: this.currentSession.questionsAnswered,
          correctRate: this.currentSession.questionsAnswered > 0
            ? (this.currentSession.correctAnswers / this.currentSession.questionsAnswered) * 100
            : 0,
          timeSpent: Number(currentMinutes.toFixed(2)),
          sessions: 1,
          achievements: [],
        });
      }
    }

    return results;
  }

  // 标记错题为已掌握
  static markQuestionMastered(questionId: string): void {
    const data = this.loadStudyData();
    const wrongQuestion = data.wrongQuestions.find(wq => wq.id === questionId);
    
    if (wrongQuestion) {
      wrongQuestion.mastered = true;
      wrongQuestion.lastReviewDate = this.getLocalDateStr();
      this.saveStudyData(data);
    }
  }

  // 重置学习数据
  static resetStudyData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // 导出学习数据
  static exportStudyData(): string {
    const data = this.loadStudyData();
    return JSON.stringify(data, null, 2);
  }

  // 导入学习数据
  static importStudyData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveStudyData(data);
      return true;
    } catch (error) {
      console.error('导入学习数据失败:', error);
      return false;
    }
  }

  // 获取当前会话信息
  static getCurrentSession(): StudySession | null {
    return this.currentSession;
  }

  // 获取学习报告数据
  static getReportData() {
    const data = this.loadStudyData();
    const stats = data.stats;
    
    return {
      totalTime: stats.totalTime,
      correctRate: Math.round(stats.correctRate),
      questionsAnswered: stats.totalQuestions,
      streak: stats.currentStreak,
      achievements: data.achievements,
      wrongQuestions: data.wrongQuestions.slice(-10), // 最近10个错题
      dailyProgress: this.getDailyProgress(7), // 最近7天
    };
  }
}

export default StudyDataStorage;
export type {
  StudyData,
  StudySession,
  AnswerRecord,
  DailyProgress,
  WrongQuestion,
  Achievement,
  StudyStats,
};

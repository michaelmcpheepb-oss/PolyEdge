/**
 * Intelligence Scheduler for PolyEdge
 * Handles cron schedules and provides runAll() for local testing
 */

import { dailyPicksEngine } from './dailyPicksEngine';

export interface ScheduleConfig {
  dailyAnalysis: string; // Cron expression for daily analysis
  traderUpdate: string;  // Cron expression for trader updates
  resolutionCheck: string; // Cron expression for checking resolutions
  enabled: boolean;
}

const DEFAULT_SCHEDULE: ScheduleConfig = {
  dailyAnalysis: '0 6 * * *',    // 6 AM daily
  traderUpdate: '0 */4 * * *',   // Every 4 hours
  resolutionCheck: '0 * * * *',  // Every hour
  enabled: true
};

export class IntelligenceScheduler {
  private config: ScheduleConfig;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  constructor(config?: Partial<ScheduleConfig>) {
    this.config = { ...DEFAULT_SCHEDULE, ...config };
  }

  /**
   * Start the scheduler with configured intervals
   */
  start(): void {
    if (this.isRunning) {
      console.log('⏰ Scheduler already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('⏸️  Scheduler disabled in config');
      return;
    }

    console.log('🚀 Starting PolyEdge Intelligence Scheduler');

    // Daily analysis at 6 AM
    this.scheduleTask('dailyAnalysis', this.config.dailyAnalysis, async () => {
      console.log('🌅 Running scheduled daily analysis...');
      try {
        const result = await dailyPicksEngine.runDailyAnalysis();
        console.log(`✅ Daily analysis complete: ${result.picks.length} picks, ${result.marketsAnalyzed} markets analyzed`);
      } catch (error) {
        console.error('❌ Scheduled daily analysis failed:', error);
      }
    });

    // Trader updates every 4 hours
    this.scheduleTask('traderUpdate', this.config.traderUpdate, async () => {
      console.log('🐋 Running scheduled trader update...');
      try {
        const updated = await dailyPicksEngine.updateTop50Traders();
        console.log(`✅ Trader update complete: ${updated} traders updated`);
      } catch (error) {
        console.error('❌ Scheduled trader update failed:', error);
      }
    });

    // Resolution checks every hour
    this.scheduleTask('resolutionCheck', this.config.resolutionCheck, async () => {
      console.log('✅ Running scheduled resolution check...');
      try {
        await dailyPicksEngine.checkResolutions();
        console.log('✅ Resolution check complete');
      } catch (error) {
        console.error('❌ Scheduled resolution check failed:', error);
      }
    });

    this.isRunning = true;
    console.log('⏰ All scheduled tasks configured');
  }

  /**
   * Stop the scheduler and clear all intervals
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⏰ Scheduler not running');
      return;
    }

    console.log('⏹️  Stopping scheduler...');

    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`  ✅ Stopped ${name} task`);
    });

    this.intervals.clear();
    this.isRunning = false;

    console.log('⏹️  Scheduler stopped');
  }

  /**
   * Run all intelligence tasks immediately (for testing/manual execution)
   */
  async runAll(): Promise<{
    dailyAnalysis: any;
    tradersUpdated: number;
    resolutionsChecked: boolean;
    executionTime: number;
  }> {
    const startTime = Date.now();
    console.log('🚀 Running all intelligence tasks...');

    try {
      // 1. Run daily analysis
      console.log('📊 Running daily analysis...');
      const dailyAnalysis = await dailyPicksEngine.runDailyAnalysis();

      // 2. Update traders
      console.log('🐋 Updating top traders...');
      const tradersUpdated = await dailyPicksEngine.updateTop50Traders();

      // 3. Check resolutions
      console.log('✅ Checking resolutions...');
      await dailyPicksEngine.checkResolutions();

      const executionTime = Date.now() - startTime;

      console.log(`🎉 All tasks completed in ${executionTime}ms`);

      return {
        dailyAnalysis,
        tradersUpdated,
        resolutionsChecked: true,
        executionTime
      };

    } catch (error) {
      console.error('💥 Failed to run all tasks:', error);
      throw error;
    }
  }

  /**
   * Run just the daily analysis task
   */
  async runDailyAnalysis(): Promise<any> {
    console.log('📊 Running daily analysis manually...');
    return await dailyPicksEngine.runDailyAnalysis();
  }

  /**
   * Run just the trader update task
   */
  async runTraderUpdate(): Promise<number> {
    console.log('🐋 Running trader update manually...');
    return await dailyPicksEngine.updateTop50Traders();
  }

  /**
   * Run just the resolution check task
   */
  async runResolutionCheck(): Promise<void> {
    console.log('✅ Running resolution check manually...');
    await dailyPicksEngine.checkResolutions();
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    config: ScheduleConfig;
    activeTasks: string[];
    nextRuns: Record<string, string>;
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      activeTasks: Array.from(this.intervals.keys()),
      nextRuns: this.getNextRunTimes()
    };
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(newConfig: Partial<ScheduleConfig>): void {
    const wasRunning = this.isRunning;

    if (wasRunning) {
      this.stop();
    }

    this.config = { ...this.config, ...newConfig };

    if (wasRunning && this.config.enabled) {
      this.start();
    }

    console.log('⚙️  Scheduler config updated:', this.config);
  }

  private scheduleTask(name: string, cronExpression: string, task: () => Promise<void>): void {
    // Convert cron to interval (simplified - real implementation would use node-cron)
    const interval = this.cronToInterval(cronExpression);

    if (interval > 0) {
      const intervalId = setInterval(async () => {
        try {
          await task();
        } catch (error) {
          console.error(`❌ Task ${name} failed:`, error);
        }
      }, interval);

      this.intervals.set(name, intervalId);
      console.log(`  ⏰ Scheduled ${name}: every ${interval / 1000 / 60} minutes`);
    } else {
      console.warn(`  ⚠️  Invalid cron expression for ${name}: ${cronExpression}`);
    }
  }

  private cronToInterval(cronExpression: string): number {
    // Simplified cron to interval conversion
    // Real implementation would use a proper cron parser
    const parts = cronExpression.split(' ');

    if (parts.length !== 5) return 0;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Daily at specific hour (0 6 * * * = 6 AM daily)
    if (minute === '0' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 24 * 60 * 60 * 1000; // 24 hours
    }

    // Every N hours (0 */4 * * * = every 4 hours)
    if (minute === '0' && hour.startsWith('*/')) {
      const hours = parseInt(hour.slice(2));
      return hours * 60 * 60 * 1000;
    }

    // Every hour (0 * * * * = every hour)
    if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 60 * 60 * 1000; // 1 hour
    }

    // Every N minutes (*/N * * * *)
    if (minute.startsWith('*/') && hour === '*') {
      const minutes = parseInt(minute.slice(2));
      return minutes * 60 * 1000;
    }

    return 0; // Unsupported cron pattern
  }

  private getNextRunTimes(): Record<string, string> {
    const now = new Date();
    const nextRuns: Record<string, string> = {};

    // Simplified next run calculation
    if (this.intervals.has('dailyAnalysis')) {
      const tomorrow6AM = new Date(now);
      tomorrow6AM.setDate(tomorrow6AM.getDate() + 1);
      tomorrow6AM.setHours(6, 0, 0, 0);
      nextRuns.dailyAnalysis = tomorrow6AM.toISOString();
    }

    if (this.intervals.has('traderUpdate')) {
      const next4Hours = new Date(now.getTime() + (4 * 60 * 60 * 1000));
      nextRuns.traderUpdate = next4Hours.toISOString();
    }

    if (this.intervals.has('resolutionCheck')) {
      const nextHour = new Date(now.getTime() + (60 * 60 * 1000));
      nextRuns.resolutionCheck = nextHour.toISOString();
    }

    return nextRuns;
  }
}

// Export singleton scheduler instance
export const intelligenceScheduler = new IntelligenceScheduler();

// Auto-start scheduler in production
if (process.env.NODE_ENV === 'production') {
  intelligenceScheduler.start();
}
import { modelDiscoveryService } from './model_discovery.service.js';
import { logger } from '../utils/logger.js';

class ModelScheduler {
  private timer: NodeJS.Timeout | null = null;
  private intervalHours: number = 6;

  constructor() {
    const envHours = parseInt(process.env.MODEL_SYNC_INTERVAL_HOURS || '6', 10);
    this.intervalHours = isNaN(envHours) || envHours <= 0 ? 6 : envHours;
  }

  start() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    const intervalMs = this.intervalHours * 60 * 60 * 1000;
    logger.info(`Starting AI Model Discovery Scheduler: Running every ${this.intervalHours} hour(s) (${intervalMs}ms)`);

    // Initial background discovery run on startup after a short warm-up delay (5 seconds)
    setTimeout(() => {
      this.triggerScheduledSync();
    }, 5000);

    this.timer = setInterval(() => {
      this.triggerScheduledSync();
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info('AI Model Discovery Scheduler stopped.');
    }
  }

  private async triggerScheduledSync() {
    if (modelDiscoveryService.isSyncInProgress()) {
      logger.info('Scheduled model sync skipped: previous synchronization is currently in progress.');
      return;
    }

    try {
      logger.info('Scheduled model discovery synchronization starting...');
      await modelDiscoveryService.runSync(false);
    } catch (err: any) {
      logger.error('Scheduled model synchronization encountered error', { error: err.message });
    }
  }
}

export const modelScheduler = new ModelScheduler();

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let isMongoConnected = false;

// In-memory fallback cache store for resilient operation when MongoDB is not running locally
class MemoryStore {
  private store: Map<string, any> = new Map();

  set(id: string, doc: any) {
    this.store.set(id, { ...doc, updatedAt: new Date().toISOString() });
    return doc;
  }

  get(id: string) {
    return this.store.get(id) || null;
  }

  delete(id: string) {
    return this.store.delete(id);
  }

  list(limit = 50) {
    return Array.from(this.store.values()).slice(0, limit);
  }

  find(predicate: (item: any) => boolean) {
    return Array.from(this.store.values()).find(predicate) || null;
  }
}

export const inMemoryResearchStore = new MemoryStore();

export async function connectDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/librarylens';

  try {
    logger.info(`Attempting MongoDB connection to: ${uri.replace(/\/\/.*@/, '//***@')}`);

    // Set connection timeout to 3 seconds for quick graceful fallback if service is down
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });

    isMongoConnected = true;
    logger.info('MongoDB connected successfully. Cache and persistence layers active.');
    return true;
  } catch (error) {
    isMongoConnected = false;
    logger.warn('MongoDB connection unavailable. Using in-memory fallback cache. All research endpoints remain fully operational.');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

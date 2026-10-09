import dotenv from 'dotenv';
import path from 'path';

// Pre-load environment variables before any static imports execute
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

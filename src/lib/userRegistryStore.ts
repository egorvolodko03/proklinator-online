import { UserKarmaProfile } from '@/types';
import fs from 'fs';
import path from 'path';

const CACHE_DIR = process.platform === 'win32' ? process.cwd() : '/tmp';
const PROFILES_FILE = path.join(CACHE_DIR, '.profiles_cache.json');
const USERNAMES_FILE = path.join(CACHE_DIR, '.usernames_cache.json');

// Global in-memory maps
export const userProfilesRegistry = new Map<string, UserKarmaProfile>();
export const usernameToChatIdMap = new Map<string, number>();

// Initialize from persistent file on startup
function initFromDisk() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const pData = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
      Object.entries(pData).forEach(([k, v]) => {
        userProfilesRegistry.set(k, v as UserKarmaProfile);
      });
    }
    if (fs.existsSync(USERNAMES_FILE)) {
      const uData = JSON.parse(fs.readFileSync(USERNAMES_FILE, 'utf8'));
      Object.entries(uData).forEach(([k, v]) => {
        usernameToChatIdMap.set(k, Number(v));
      });
    }
  } catch {
    // ignore
  }
}

export function persistToDisk() {
  try {
    const pObj = Object.fromEntries(Array.from(userProfilesRegistry.entries()).slice(-500));
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(pObj), 'utf8');

    const uObj = Object.fromEntries(Array.from(usernameToChatIdMap.entries()).slice(-500));
    fs.writeFileSync(USERNAMES_FILE, JSON.stringify(uObj), 'utf8');
  } catch {
    // ignore
  }
}

initFromDisk();

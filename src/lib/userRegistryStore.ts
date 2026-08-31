import { UserKarmaProfile } from '@/types';

// Global shared user registry
export const userProfilesRegistry = new Map<string, UserKarmaProfile>();
export const usernameToChatIdMap = new Map<string, number>();

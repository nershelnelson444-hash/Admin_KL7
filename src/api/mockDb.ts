import { BIKES, LEADS, USERS, MEDIA_ITEMS, GALLERY_ITEMS } from "./mockData";
import type { Bike, Lead, AdminUser, MediaItem, GalleryItem } from "@/types";

const STORE_KEY = "kl7_mock_db_v1";

interface MockDb {
  bikes: Bike[];
  leads: Lead[];
  users: AdminUser[];
  media: MediaItem[];
  gallery: GalleryItem[];
}

function seed(): MockDb {
  return {
    bikes: BIKES,
    leads: LEADS,
    users: USERS,
    media: MEDIA_ITEMS,
    gallery: GALLERY_ITEMS,
  };
}

function load(): MockDb {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as MockDb;
    if (!parsed.bikes || !parsed.leads || !parsed.users) return seed();
    return parsed;
  } catch {
    return seed();
  }
}

let db: MockDb = load();

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
  } catch {
    // storage full or unavailable — fail silently, in-memory state still works
  }
}

export const mockDb = {
  get(): MockDb {
    return db;
  },
  update(mutator: (draft: MockDb) => void) {
    mutator(db);
    persist();
  },
  reset() {
    db = seed();
    persist();
  },
};

/** simulate realistic network latency for the mock layer */
export function networkDelay(min = 280, max = 650): Promise<void> {
  const ms = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

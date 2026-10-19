import { BankAccount, Transaction, SecurityAlert, PendingTransfer, UserProfile } from '../types/banking';
import {
  INITIAL_USER,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS,
} from '../data/mockData';

/**
 * Client-side persistent store.
 * Every write is committed immediately to localStorage so locked funds,
 * holds, accounts and activity survive reloads and repeat visits.
 */

const KEY = 'wells_fargo_online_db_v1';
/** Bump to force a reseed when seeded balances or the data shape change. */
const SCHEMA = 4;

interface Database {
  schema: number;
  user: UserProfile;
  accounts: BankAccount[];
  transactions: Transaction[];
  pending: PendingTransfer[];
  alerts: SecurityAlert[];
  /** References already used, to guarantee uniqueness */
  references: string[];
}

function seed(): Database {
  return {
    schema: SCHEMA,
    user: INITIAL_USER,
    accounts: structuredCloneSafe(INITIAL_ACCOUNTS),
    transactions: structuredCloneSafe(INITIAL_TRANSACTIONS),
    pending: [],
    alerts: structuredCloneSafe(INITIAL_ALERTS),
    references: [],
  };
}

function structuredCloneSafe<T>(v: T[]): T[] {
  return JSON.parse(JSON.stringify(v));
}

export function loadDb(): Database {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const fresh = seed();
      writeDb(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as Database;
    if (!parsed || parsed.schema !== SCHEMA || !Array.isArray(parsed.accounts)) {
      const fresh = seed();
      writeDb(fresh);
      return fresh;
    }
    // Guarantee every field exists even if the shape evolved
    return {
      schema: SCHEMA,
      user: parsed.user ?? INITIAL_USER,
      accounts: parsed.accounts ?? [],
      transactions: parsed.transactions ?? [],
      pending: parsed.pending ?? [],
      alerts: parsed.alerts ?? [],
      references: parsed.references ?? [],
    };
  } catch {
    const fresh = seed();
    writeDb(fresh);
    return fresh;
  }
}

export function writeDb(db: Database): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable — app still works in-memory for the session */
  }
}

export function resetDb(): Database {
  const fresh = seed();
  writeDb(fresh);
  return fresh;
}

/** Persist a partial patch atomically against the stored copy. */
export function patchDb(patch: Partial<Omit<Database, 'schema'>>): Database {
  const db = loadDb();
  const next: Database = { ...db, ...patch, schema: SCHEMA };
  writeDb(next);
  return next;
}

/** Generate a unique transfer reference, persisted so it can never repeat. */
export function nextReference(): string {
  const db = loadDb();
  let ref = '';
  do {
    ref = 'WF-' + Math.floor(100000 + Math.random() * 899999);
  } while (db.references.includes(ref));
  patchDb({ references: [...db.references, ref] });
  return ref;
}

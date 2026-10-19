export type AccountType = 'checking' | 'savings' | 'credit';

export type ExternalChannel = 'zelle' | 'wire' | 'ach' | 'billpay';

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  type: AccountType;
  balance: number;
  availableBalance: number;
  routingNumber?: string;
  apy?: number;
  creditLimit?: number;
  cardDetails?: {
    number: string;
    expiry: string;
    isLocked: boolean;
    type: 'active_cash' | 'autograph' | 'debit';
  };
}

/** Reasons a transfer can be blocked/locked */
export type LockReason =
  | 'security_verification'
  | 'suspicious_activity'
  | 'account_verification'
  | 'transfer_restricted';

export const LOCK_REASONS: Record<LockReason, { title: string; detail: string }> = {
  security_verification: {
    title: 'Security Verification Required',
    detail:
      'This transfer requires additional identity and device verification before funds can be released. The amount is held and cannot be spent, withdrawn, or transferred.',
  },
  suspicious_activity: {
    title: 'Suspicious Activity Detected',
    detail:
      'Our fraud monitoring system flagged patterns on this transaction. The funds are locked pending a fraud review and cannot be moved.',
  },
  account_verification: {
    title: 'Account Verification Pending',
    detail:
      'Your Wells Fargo profile requires updated verification details. Held funds stay locked until verification is complete.',
  },
  transfer_restricted: {
    title: 'Transfer Restricted',
    detail:
      'This payment type or destination is restricted under Wells Fargo policy. The amount is held and cannot be spent, withdrawn, or transferred.',
  },
};

export interface PendingTransfer {
  id: string;
  reference: string;
  channel: ExternalChannel;
  recipient: string;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  amount: number;
  /** Always 0 — holds never carry a charge */
  fee: number;
  fromAccountId: string;
  fromAccountName: string;
  createdAt: number;
  /** Stored as ISO string for persistence */
  lockedAt: string;
  lastAttemptAt?: number;
  status: 'locked' | 'release_requested';
  attempts: number;
  reason: LockReason;
  /** Fingerprint used to block duplicate lock requests on the same funds */
  dedupeKey: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'credit' | 'debit' | 'fee';
  status: 'cleared' | 'blocked' | 'cancelled';
  accountId: string;
  isExternal?: boolean;
  feeAmount?: number;
  reference?: string;
  runningBalance?: number;
  lockReason?: LockReason;
  /** ISO timestamp of when the block occurred */
  blockedAt?: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'fee_notice';
  resolved: boolean;
  actionRequired?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  tier: 'Wells Fargo Premier' | 'Prime Banking' | 'Standard Member';
  memberSince: string;
  avatarUrl?: string;
  unreadNotifications: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface MobileDepositRecord {
  id: string;
  date: string;
  amount: number;
  checkNumber: string;
  status: 'pending' | 'cleared';
  accountId: string;
}

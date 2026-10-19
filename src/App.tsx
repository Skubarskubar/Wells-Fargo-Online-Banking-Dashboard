import { useEffect, useState } from 'react';

import {
  BankAccount,
  Transaction,
  SecurityAlert,
  UserProfile,
  ToastMessage,
  ExternalChannel,
  PendingTransfer
} from './types/banking';
import { DECLINE_NOTES } from './constants';
import { formatCurrency } from './utils/formatters';
import { LOCK_REASONS, LockReason } from './types/banking';
import { loadDb, patchDb, nextReference } from './lib/db';

/** Fingerprint that identifies the exact funds being locked — blocks duplicates. */
function buildDedupeKey(
  fromAccountId: string,
  amount: number,
  recipientName: string,
  bankName: string,
  acctTail: string
): string {
  return [fromAccountId, amount.toFixed(2), recipientName.trim().toLowerCase(), bankName.trim().toLowerCase(), acctTail]
    .join('|');
}

/** Deterministically assign one of the four lock reasons. */
function pickLockReason(seed: string): LockReason {
  const reasons: LockReason[] = [
    'security_verification',
    'suspicious_activity',
    'account_verification',
    'transfer_restricted',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  return reasons[hash % reasons.length];
}

import { Header } from './components/Header';
import { AccountOverviewTab } from './components/AccountOverviewTab';
import { TransfersZelleTab, ExternalTransferDetails } from './components/TransfersZelleTab';
import { TransactionsTab } from './components/TransactionsTab';
import { MobileDepositTab } from './components/MobileDepositTab';
import { RewardsTab } from './components/RewardsTab';
import { SupportTab } from './components/SupportTab';
import { SecuritySettingsTab } from './components/SecuritySettingsTab';
import { PendingQueue } from './components/PendingQueue';
import { NotificationsModal } from './components/NotificationsModal';
import { ToastContainer } from './components/ToastContainer';
import { LoginPage } from './components/LoginPage';

const CHANNEL_LABEL: Record<ExternalChannel, string> = {
  wire: 'Wire Transfer',
  zelle: 'Zelle® Pay',
  ach: 'ACH External',
  billpay: 'Bill Pay',
};

export function App() {
  // (11) Load the persisted database ONCE (lazy init) so locked funds survive reloads
  //      without re-reading storage on every render.
  const [bootstrap] = useState(() => loadDb());

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user] = useState<UserProfile>(bootstrap.user);
  const [accounts, setAccounts] = useState<BankAccount[]>(bootstrap.accounts);
  const [transactions, setTransactions] = useState<Transaction[]>(bootstrap.transactions);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(bootstrap.alerts);
  const [pending, setPending] = useState<PendingTransfer[]>(bootstrap.pending);
  const [activeTab, setActiveTab] = useState('overview');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const addToast = (title: string, description: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => (prev.length >= 4 ? prev.slice(1) : prev).concat({ id, title, description, type }));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const unreadAlertCount = alerts.filter(a => !a.resolved).length;
  const heldAmount = pending.reduce((s, t) => s + t.amount, 0);

  // (8) Fingerprints of every transfer already locked — blocks duplicate lock requests.
  const [attemptedKeys, setAttemptedKeys] = useState<string[]>(() =>
    bootstrap.pending.map(p => p.dedupeKey).filter(Boolean)
  );
  const registerAttemptKey = (key: string) =>
    setAttemptedKeys(prev => (prev.includes(key) ? prev : [...prev, key]));

  // (11) Commit every change to the persistent store immediately.
  useEffect(() => {
    patchDb({ accounts, transactions, pending, alerts, user, references: attemptedKeys });
  }, [accounts, transactions, pending, alerts, user, attemptedKeys]);

  // Internal Transfer — locked funds cannot be moved
  const handleInternalTransfer = (fromAccId: string, toAccId: string, amount: number) => {
    const from = accounts.find(a => a.id === fromAccId);

    // (7) Locked/held funds can never be spent or transferred again.
    if (!from || amount > from.availableBalance) {
      addToast(
        'Transfer Blocked — Funds Locked',
        `${formatCurrency(amount)} exceeds your available balance. Locked funds cannot be spent or transferred.`,
        'error'
      );
      return;
    }

    setAccounts(prev => prev.map(acc => {
      if (acc.id === fromAccId) return { ...acc, balance: acc.balance - amount, availableBalance: acc.availableBalance - amount };
      if (acc.id === toAccId) return { ...acc, balance: acc.balance + amount, availableBalance: acc.availableBalance + amount };
      return acc;
    }));

    const date = new Date().toISOString().split('T')[0];
    const fromAcc = accounts.find(a => a.id === fromAccId);
    const toAcc = accounts.find(a => a.id === toAccId);

    setTransactions(prev => [
      {
        id: 'tx-' + Date.now(),
        date,
        description: `Online Transfer to ${toAcc?.name || 'Account'}`,
        category: 'Transfer',
        amount,
        type: 'debit',
        status: 'cleared',
        accountId: fromAccId,
        runningBalance: (fromAcc?.balance || 0) - amount,
      },
      ...prev,
    ]);
    addToast('Transfer Completed', `${formatCurrency(amount)} moved successfully between your accounts.`, 'success');
  };

  /**
   * Attempted external transfer.
   *
   * The transfer is NEVER completed. The amount is placed on hold, shown as
   * "Blocked — Funds Locked", and the funds become unspendable until released.
   */
  const handleExternalTransfer = (d: ExternalTransferDetails): boolean => {
    const from = accounts.find(a => a.id === d.fromAccountId);
    if (!from) {
      addToast('Transfer Blocked', 'Source account could not be found.', 'error');
      return false;
    }

    // (9) Never deduct or hold if the available balance is insufficient.
    const spendable = from.availableBalance;
    if (d.amount <= 0) {
      addToast('Transfer Blocked', 'Enter an amount greater than zero.', 'error');
      return false;
    }
    if (d.amount > spendable) {
      addToast(
        'Insufficient Available Balance',
        `${formatCurrency(d.amount)} exceeds your available balance of ${formatCurrency(spendable)}. No funds were held or deducted.`,
        'error'
      );
      return false;
    }

    // (8) Duplicate protection — the same funds can never be locked twice.
    const acctTail = d.accountNumber.replace(/\D/g, '').slice(-4);
    const dedupeKey = buildDedupeKey(d.fromAccountId, d.amount, d.recipientName, d.bankName, acctTail);
    const existing = pending.find(p => p.dedupeKey === dedupeKey);
    if (existing) {
      addToast(
        'Duplicate Request Blocked',
        `These funds are already locked under reference ${existing.reference}. The same amount cannot be locked twice.`,
        'error'
      );
      return false;
    }

    // (5) Assign a lock reason
    const reason = pickLockReason(dedupeKey);
    const reference = nextReference();
    const lockedAt = new Date().toISOString();
    const date = lockedAt.split('T')[0];
    const dest = `${d.recipientName} • ${d.bankName} (...${acctTail})`;

    // (2) Place the amount on hold: reduce AVAILABLE only.
    //     Current balance is untouched, and the held amount can no longer be spent.
    setAccounts(prev => prev.map(acc =>
      acc.id === d.fromAccountId
        ? { ...acc, availableBalance: acc.availableBalance - d.amount }
        : acc
    ));

    // (3)(4) Record the blocked transaction — never marked successful.
    const entry: PendingTransfer = {
      id: 'pnd-' + Date.now(),
      reference,
      channel: d.channel,
      recipient: dest,
      recipientName: d.recipientName,
      bankName: d.bankName,
      accountNumber: d.accountNumber,
      routingNumber: d.routingNumber,
      amount: d.amount,
      fee: 0,
      fromAccountId: d.fromAccountId,
      fromAccountName: `${from.name} ${from.accountNumber}`,
      createdAt: Date.now(),
      lockedAt,
      status: 'locked',
      attempts: 0,
      reason,
      dedupeKey,
    };

    const blockedTx: Transaction = {
      id: 'tx-' + Date.now(),
      date,
      description: `${CHANNEL_LABEL[d.channel]} to ${dest}`,
      category: 'Blocked — Funds Locked',
      amount: d.amount,
      type: 'debit',
      status: 'blocked',
      accountId: d.fromAccountId,
      isExternal: true,
      reference,
      lockReason: reason,
      blockedAt: lockedAt,
      runningBalance: from.balance,
    };

    setPending(prev => [entry, ...prev]);
    setTransactions(prev => [blockedTx, ...prev]);

    setAlerts(prev => [
      {
        id: 'alt-' + Date.now(),
        title: `Blocked — Funds Locked (${LOCK_REASONS[reason].title})`,
        message: `${formatCurrency(d.amount)} to ${d.recipientName} at ${d.bankName} (...${acctTail}) is locked under reference ${reference}. Reason: ${LOCK_REASONS[reason].title}. The funds cannot be spent, withdrawn, or transferred.`,
        date: 'Just now',
        type: 'warning',
        resolved: false,
        actionRequired: 'View locked funds',
      },
      ...prev,
    ]);

    addToast(
      'Blocked — Funds Locked',
      `${formatCurrency(d.amount)} is on hold. Reason: ${LOCK_REASONS[reason].title}. Reference ${reference}.`,
      'warning'
    );
    return true;
  };

  // Request early release — always stays locked, nothing is ever sent.
  const handlePayFee = (id: string) => {
    const item = pending.find(p => p.id === id);
    if (!item || busyId) return;

    // (8) Guard against repeat submissions while one is already processing.
    if (item.status === 'release_requested' && Date.now() - (item.lastAttemptAt ?? 0) < 5000) {
      addToast('Request Already Submitted', `A release review is already open for ${item.reference}.`, 'info');
      return;
    }

    setBusyId(id);
    window.setTimeout(() => {
      setBusyId(null);
      const note = DECLINE_NOTES[Math.min(item.attempts, DECLINE_NOTES.length - 1)];

      setPending(prev => prev.map(p => (p.id === id
        ? { ...p, status: 'release_requested', attempts: p.attempts + 1, lastAttemptAt: Date.now() }
        : p)));

      setAlerts(prev => [
        {
          id: 'alt-fee-' + Date.now(),
          title: 'Release Request Reviewed — Funds Still Locked',
          message: `${note} Reference ${item.reference}. ${formatCurrency(item.amount)} remains locked and cannot be spent, withdrawn, or transferred.`,
          date: 'Just now',
          type: 'warning',
          resolved: false,
          actionRequired: 'Contact Support',
        },
        ...prev,
      ]);

      addToast(
        'Release Request Reviewed',
        `${item.reference} remains locked. ${formatCurrency(item.amount)} is still held and cannot be moved.`,
        'error'
      );
    }, 1200);
  };

  // Cancelling a locked order releases the hold back to available balance.
  const handleCancelPending = (id: string) => {
    const item = pending.find(p => p.id === id);
    if (!item) return;

    setAccounts(prev => prev.map(acc =>
      acc.id === item.fromAccountId
        ? { ...acc, availableBalance: acc.availableBalance + item.amount }
        : acc
    ));
    setPending(prev => prev.filter(p => p.id !== id));
    setTransactions(prev => prev.map(t => (t.reference === item.reference && t.status === 'blocked'
      ? { ...t, status: 'cancelled' }
      : t)));
    addToast(
      'Locked Transfer Cancelled',
      `${formatCurrency(item.amount)} hold released back to your available balance. No funds were ever sent.`,
      'info'
    );
  };

  // Mobile Check Deposit Success Handler
  const handleDepositSuccess = (accountId: string, amount: number, checkNumber: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          balance: acc.balance + amount,
          availableBalance: acc.availableBalance + amount,
        };
      }
      return acc;
    }));

    const date = new Date().toISOString().split('T')[0];
    const acc = accounts.find(a => a.id === accountId);

    setTransactions(prev => [
      {
        id: 'tx-dep-' + Date.now(),
        date,
        description: `Mobile Deposit - Check #${checkNumber}`,
        category: 'Deposit',
        amount,
        type: 'credit',
        status: 'cleared',
        accountId,
        runningBalance: (acc?.balance || 0) + amount,
      },
      ...prev,
    ]);

    addToast(
      'Mobile Deposit Received',
      `Check #${checkNumber} for ${formatCurrency(amount)} credited to ${acc?.name || 'Account'}.`,
      'success'
    );
  };

  // Card Lock Toggle
  const handleToggleCardLock = (accId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accId && acc.cardDetails) {
        const locked = !acc.cardDetails.isLocked;
        addToast(
          locked ? 'Card Locked (Turned OFF)' : 'Card Unlocked (Turned ON)',
          `${acc.name} card ending in ${acc.cardDetails.number.slice(-4)} is now ${locked ? 'turned OFF' : 'active and turned ON'}.`,
          locked ? 'warning' : 'success'
        );
        return { ...acc, cardDetails: { ...acc.cardDetails, isLocked: locked } };
      }
      return acc;
    }));
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={() => {
          setIsLoggedIn(true);
          addToast('Signed In Successfully', `Welcome to Wells Fargo Online Banking, ${user.name}.`, 'success');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f0eb] flex flex-col font-sans text-[#1e1e1e] antialiased">
      <div className="wf-ambient" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadAlertCount}
          pendingCount={pending.length}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onLogout={() => setIsLoggedIn(false)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Queued Pending Banner (shows only after withdrawal has been placed) */}
          {pending.length > 0 && (
            <div className="bg-[#fff9e6] border-2 border-[#ffcc00] rounded-lg p-5 shadow-sm text-[#1e1e1e] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-bold text-xs bg-[#d71e28] text-white">
                      BLOCKED — FUNDS LOCKED
                    </span>
                    <span className="font-serif font-bold text-base text-[#1e1e1e]">
                      {pending.length} transfer{pending.length === 1 ? '' : 's'} blocked · {formatCurrency(heldAmount)} locked
                    </span>
                  </div>
                  <p className="text-xs text-[#595959]">
                    These funds are on hold and <strong>cannot be spent, withdrawn, or transferred</strong>. Reasons:{' '}
                    {[...new Set(pending.map(p => LOCK_REASONS[p.reason]?.title ?? 'Under review'))].join(' · ')}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('pending_queue')}
                    className="px-4 py-2 bg-[#d71e28] hover:bg-[#b3141d] text-white font-bold text-xs rounded shadow transition-colors cursor-pointer"
                  >
                    View Locked Transfers
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Tab Views */}
          {activeTab === 'overview' && (
            <AccountOverviewTab
              accounts={accounts}
              transactions={transactions}
              pending={pending}
              accountHolderName={user.name}
              onNavigateTab={setActiveTab}
              onOpenMobileDeposit={() => setActiveTab('mobile_deposit')}
            />
          )}

          {activeTab === 'transfers' && (
            <TransfersZelleTab
              accounts={accounts}
              onInternalTransfer={handleInternalTransfer}
              onExternalTransfer={handleExternalTransfer}
              onGoToPending={() => setActiveTab('pending_queue')}
              attemptedKeys={attemptedKeys}
              onAttemptRegister={registerAttemptKey}
            />
          )}

          {activeTab === 'mobile_deposit' && (
            <MobileDepositTab
              accounts={accounts}
              onDepositSuccess={handleDepositSuccess}
            />
          )}

          {activeTab === 'activity' && (
            <TransactionsTab transactions={transactions} />
          )}

          {activeTab === 'rewards' && (
            <RewardsTab />
          )}

          {activeTab === 'support' && (
            <SupportTab />
          )}

          {activeTab === 'settings' && (
            <SecuritySettingsTab
              accounts={accounts}
              onToggleCardLock={handleToggleCardLock}
            />
          )}

          {activeTab === 'pending_queue' && (
            <section className="space-y-5 max-w-5xl mx-auto">
              <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d71e28]">
                    Verification Hold
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#1e1e1e] mt-1">Temporarily Locked Transfers</h2>
                  <p className="text-xs text-[#595959] mt-1 max-w-xl">
                    Transfers are temporarily locked under a standard security review. There is no charge — funds are released automatically once the review completes.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#fbf9f6] rounded border border-[#d8d2c9] px-4 py-2.5 text-right">
                    <div className="text-[10px] uppercase font-bold text-[#595959]">Queued</div>
                    <div className="font-serif text-xl font-bold text-[#1e1e1e]">{pending.length}</div>
                  </div>
                  <div className="bg-[#fbf9f6] rounded border border-[#d8d2c9] px-4 py-2.5 text-right">
                    <div className="text-[10px] uppercase font-bold text-[#595959]">Locked Amount</div>
                    <div className="font-serif text-xl font-bold text-[#d71e28]">{formatCurrency(heldAmount)}</div>
                  </div>
                </div>
              </div>

              <PendingQueue
                items={pending}
                onPayFee={handlePayFee}
                onCancel={handleCancelPending}
                busyId={busyId}
              />
            </section>
          )}

        </main>

        {/* Wells Fargo Brand Footer */}
        <footer className="bg-white border-t border-[#d8d2c9] mt-16 py-8 text-xs text-[#595959]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-wrap justify-between items-center border-b border-[#e5e0d8] pb-4 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-serif font-black text-[#d71e28]">WELLS FARGO</span>
                <span className="text-[#8c857b]">| Online Banking</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#00698c]">
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">Privacy, Cookies &amp; Security</a>
                <span>•</span>
                <a href="#legal" onClick={(e) => e.preventDefault()} className="hover:underline">Legal Disclosures</a>
                <span>•</span>
                <a href="#agreement" onClick={(e) => e.preventDefault()} className="hover:underline">Online Access Agreement</a>
                <span>•</span>
                <a href="#fdic" onClick={(e) => e.preventDefault()} className="hover:underline">Member FDIC</a>
              </div>
            </div>

            <p className="text-[11px] text-[#737373] leading-relaxed">
              Deposit products offered by Wells Fargo Bank, N.A. Member FDIC. Equal Housing Lender. QSR-06282025-6192004.1.1. Outgoing external domestic wire transfers are subject to regulatory clearance under federal banking guidelines. © 1999 - 2026 Wells Fargo. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        alerts={alerts}
        onMarkAllRead={() => setAlerts(prev => prev.map(a => ({ ...a, resolved: true })))}
        onNavigateTab={setActiveTab}
      />

      {/* Toast Popups */}
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}

export default App;

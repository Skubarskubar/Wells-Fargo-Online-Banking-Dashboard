import React, { useEffect, useState } from 'react';
import { PendingTransfer, LOCK_REASONS, LockReason } from '../types/banking';
import { formatCurrency } from '../utils/formatters';
import {
  Zap,
  Landmark,
  Building2,
  Receipt,
  AlertTriangle,
  XCircle,
  Wallet,
  ShieldQuestion,
  Lock,
  ShieldAlert,
  FileSearch,
  IdCard,
  Ban,
} from 'lucide-react';

const CHANNEL_META: Record<string, { label: string; icon: React.ElementType }> = {
  zelle: { label: 'Zelle® Pay', icon: Zap },
  wire: { label: 'Wire Transfer', icon: Landmark },
  ach: { label: 'ACH External', icon: Building2 },
  billpay: { label: 'Bill Pay', icon: Receipt },
};

const REASON_ICON: Record<LockReason, React.ElementType> = {
  security_verification: ShieldAlert,
  suspicious_activity: FileSearch,
  account_verification: IdCard,
  transfer_restricted: Ban,
};

function elapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${String(s).padStart(2, '0')}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

interface PendingQueueProps {
  items: PendingTransfer[];
  onPayFee: (id: string) => void;
  onCancel: (id: string) => void;
  busyId?: string | null;
}

export const PendingQueue: React.FC<PendingQueueProps> = ({ items, onPayFee, onCancel, busyId }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#d8d2c9] p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-[#e8f5e9] text-[#1b5e20] flex items-center justify-center mx-auto mb-3">
          <Wallet className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-lg text-[#1e1e1e]">No locked funds</h3>
        <p className="text-xs text-[#595959] mt-1">
          Attempted transfers appear here as “Blocked — Funds Locked” with the lock reason.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((t, idx) => {
        // Defensive defaults — never crash on a malformed/persisted record
        const meta = CHANNEL_META[t.channel] ?? CHANNEL_META.wire;
        const ChannelIcon = meta.icon;
        const reasonKey = (t.reason && LOCK_REASONS[t.reason] ? t.reason : 'security_verification') as LockReason;
        const ReasonIcon = REASON_ICON[reasonKey] ?? ShieldAlert;
        const reasonInfo = LOCK_REASONS[reasonKey];
        const lockedMs = t.createdAt ? now - t.createdAt : 0;
        const waiting = elapsed(lockedMs);
        const sinceAttempt = t.lastAttemptAt ? elapsed(now - t.lastAttemptAt) : null;
        const lockedDate = t.lockedAt ? new Date(t.lockedAt) : new Date(t.createdAt || Date.now());
        const validDate = !isNaN(lockedDate.getTime()) ? lockedDate : new Date();

        return (
          <article
            key={t.id}
            className="animate-slide-up relative overflow-hidden rounded-lg border border-[#d71e28]/40 bg-white shadow-sm hover:shadow-md transition-shadow"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-[#d71e28]" />

            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Locked amount rail */}
              <div className="lg:col-span-3 bg-[#1e1e1e] text-white p-5 space-y-3 relative overflow-hidden">
                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#FFCC00]">
                    <Lock className="w-3.5 h-3.5 animate-blink" /> Blocked
                  </span>
                  <p className="font-serif text-3xl font-bold mt-1.5">{formatCurrency(t.amount || 0)}</p>
                  <p className="text-[11px] text-white/60 mt-0.5">Funds Locked</p>
                </div>
                <div className="relative pt-2 border-t border-white/15 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                    <ChannelIcon className="w-3.5 h-3.5 text-[#FFCC00]" /> {meta.label}
                  </div>
                  <div className="text-[11px] text-white/60 font-mono">{t.reference || 'WF-000000'}</div>
                  <div className="text-[10px] text-white/50">Locked {waiting} ago</div>
                </div>
              </div>

              {/* Details */}
              <div className="lg:col-span-6 p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-serif font-bold text-lg text-[#1e1e1e] leading-tight">
                      Blocked — Funds Locked
                    </h4>
                    <p className="text-xs text-[#595959] mt-0.5">
                      To <span className="font-semibold text-[#1e1e1e]">{t.recipientName || 'Recipient'}</span> · {t.bankName || 'External Bank'}
                    </p>
                    <p className="text-[11px] text-[#737373] font-mono mt-0.5">
                      Acct ••••{(t.accountNumber || '0000').slice(-4)} · Routing {t.routingNumber || '—'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-extrabold bg-[#fef2f2] text-[#d71e28] border border-[#fca5a5] uppercase tracking-wide whitespace-nowrap">
                    Not Sent
                  </span>
                </div>

                {/* Reference / date / time / amount */}
                <div className="rounded-lg border border-[#e5e0d8] bg-[#fbf9f6] p-3.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#737373]">Amount Held</div>
                    <div className="font-serif font-bold text-[#1e1e1e] num text-sm">{formatCurrency(t.amount)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#737373]">Transaction Reference</div>
                    <div className="font-mono font-bold text-[#1e1e1e] text-sm">{t.reference}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#737373]">Date</div>
                    <div className="text-[#1e1e1e] font-medium">
                      {validDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#737373]">Time</div>
                    <div className="text-[#1e1e1e] font-medium num">
                      {validDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Lock reason */}
                <div className="rounded-lg border border-[#d71e28]/30 bg-[#fef2f2] p-3.5 space-y-1.5">
                  <div className="flex items-start gap-2 text-[#991b1b]">
                    <ReasonIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#d71e28]" />
                    <div>
                      <div className="font-bold text-xs">Reason: {reasonInfo.title}</div>
                      <p className="text-[11px] text-[#7f1d1d] leading-relaxed mt-0.5">{reasonInfo.detail}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#7f1d1d] font-semibold pl-6">
                    <span className="flex items-center gap-1"><Ban className="w-3 h-3" /> Cannot be spent</span>
                    <span className="flex items-center gap-1"><Ban className="w-3 h-3" /> Cannot be withdrawn</span>
                    <span className="flex items-center gap-1"><Ban className="w-3 h-3" /> Cannot be transferred</span>
                  </div>
                  {sinceAttempt && (
                    <p className="text-[10px] text-[#737373] pl-6">
                      Last review request {sinceAttempt} ago.
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="lg:col-span-3 p-5 bg-[#fbf9f6] border-t lg:border-t-0 lg:border-l border-[#e5e0d8] flex flex-col justify-center gap-2">
                <button
                  onClick={() => onPayFee(t.id)}
                  disabled={busyId === t.id}
                  className="w-full bg-[#d71e28] hover:bg-[#b3141d] active:scale-[0.98] disabled:opacity-60 text-white font-bold text-xs py-2.5 rounded shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{busyId === t.id ? 'Submitting…' : 'Request release review'}</span>
                </button>
                <button
                  onClick={() => onCancel(t.id)}
                  className="w-full bg-white hover:bg-[#f4f0eb] text-[#1e1e1e] font-bold text-xs py-2 rounded border border-[#c4bcb1] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-[#595959]" />
                  <span>Cancel &amp; release hold</span>
                </button>
                <p className="flex items-start gap-1 text-[10px] text-[#737373] leading-snug mt-0.5">
                  <ShieldQuestion className="w-3.5 h-3.5 shrink-0 mt-px" />
                  No charge. Held funds stay locked until review completes.
                </p>
              </div>
            </div>
          </article>
        );
      })}

      {/* Warning banner */}
      <div className="flex items-start gap-2 text-[11px] text-[#7a5802] bg-[#fff9e6] border border-[#ffcc00] rounded-lg p-3">
        <AlertTriangle className="w-4 h-4 shrink-0 text-[#b78103] mt-px" />
        <span>
          Locked funds are reserved and are excluded from your available balance. They cannot be spent, withdrawn, or
          transferred again until Wells Fargo releases the hold.
        </span>
      </div>
    </div>
  );
};

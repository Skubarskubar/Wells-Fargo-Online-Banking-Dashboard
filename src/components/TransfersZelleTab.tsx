import React, { useEffect, useState } from 'react';
import { BankAccount, ExternalChannel } from '../types/banking';
import { formatCurrency } from '../utils/formatters';
import {
  ArrowRightLeft,
  Zap,
  Landmark,
  Building2,
  Receipt,
  ArrowRight,
  CheckCircle2,
  User,
  Hash,
  Banknote,
  StickyNote,
  Hourglass,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export interface ExternalTransferDetails {
  channel: ExternalChannel;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountKind: 'checking' | 'savings';
  memo: string;
  amount: number;
  fromAccountId: string;
}

interface TransfersZelleTabProps {
  accounts: BankAccount[];
  onInternalTransfer: (fromAccId: string, toAccId: string, amount: number) => void;
  onExternalTransfer: (details: ExternalTransferDetails) => boolean;
  onGoToPending?: () => void;
  /** Fingerprints of transfers already locked — blocks duplicate requests */
  attemptedKeys?: string[];
  /** Register a fingerprint once a transfer has been placed on hold */
  onAttemptRegister?: (key: string) => void;
}

const CHANNELS: { id: ExternalChannel; label: string; icon: React.ElementType }[] = [
  { id: 'wire', label: 'Wire Transfer', icon: Landmark },
  { id: 'zelle', label: 'Zelle® Pay', icon: Zap },
  { id: 'ach', label: 'ACH External', icon: Building2 },
  { id: 'billpay', label: 'Bill Pay', icon: Receipt },
];

export const TransfersZelleTab: React.FC<TransfersZelleTabProps> = ({
  accounts,
  onInternalTransfer,
  onExternalTransfer,
  attemptedKeys = [],
  onAttemptRegister = () => {},
}) => {
  const depositAccounts = accounts.filter(a => a.type === 'checking' || a.type === 'savings');
  const [mode, setMode] = useState<'external' | 'internal'>('external');
  const [channel, setChannel] = useState<ExternalChannel>('wire');

  const [fromAccountId, setFromAccountId] = useState(depositAccounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(depositAccounts[1]?.id || depositAccounts[0]?.id || '');

  // Keep selections valid if accounts load or change after mount
  useEffect(() => {
    if (depositAccounts.length === 0) return;
    if (!depositAccounts.some(a => a.id === fromAccountId)) {
      setFromAccountId(depositAccounts[0].id);
    }
    if (!depositAccounts.some(a => a.id === toAccountId)) {
      setToAccountId(depositAccounts[0].id);
    }
  }, [accounts, depositAccounts, fromAccountId, toAccountId]);
  const [amount, setAmount] = useState('');

  const [recipientName, setRecipientName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountKind, setAccountKind] = useState<'checking' | 'savings'>('checking');
  const [memo, setMemo] = useState('');

  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const sendAmount = parseFloat(amount) || 0;

  const digits = (s: string) => s.replace(/\D/g, '');

  const submitExternal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);

    if (!fromAccount || sendAmount <= 0) {
      setError('Please enter a valid transfer amount greater than $0.00.');
      return;
    }
    if (!recipientName.trim()) {
      setError('Please enter the recipient full legal name.');
      return;
    }
    if (!bankName.trim()) {
      setError('Please enter the recipient bank or financial institution.');
      return;
    }
    if (digits(routingNumber).length !== 9) {
      setError('The 9-digit ABA Routing transit number is required.');
      return;
    }
    if (digits(accountNumber).length < 5) {
      setError('Please enter a valid recipient account number.');
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match. Please re-check.');
      return;
    }

    if (sendAmount > fromAccount.availableBalance) {
      setError(
        `Insufficient available balance. ${formatCurrency(fromAccount.availableBalance)} is available — the rest may be locked. No funds were held.`
      );
      return;
    }

    // Duplicate guard on the form itself — same funds can't be locked twice.
    const acctTail = digits(accountNumber).slice(-4);
    const dupKey = [fromAccountId, sendAmount.toFixed(2), recipientName.trim().toLowerCase(), bankName.trim().toLowerCase(), acctTail].join('|');
    if (attemptedKeys.includes(dupKey)) {
      setError('This exact transfer was already submitted and is locked. Duplicate requests are blocked.');
      return;
    }

    setProcessing(true);
    onAttemptRegister(dupKey);
    window.setTimeout(() => {
      const ok = onExternalTransfer({
        channel,
        recipientName: recipientName.trim(),
        bankName: bankName.trim(),
        accountNumber: digits(accountNumber),
        routingNumber: digits(routingNumber),
        accountKind,
        memo: memo.trim(),
        amount: sendAmount,
        fromAccountId,
      });
      setProcessing(false);
      if (ok) {
        setDone(
          `${formatCurrency(sendAmount)} to ${recipientName.trim()} has been placed on hold and is blocked. The funds are locked and cannot be spent, withdrawn, or transferred. Reference added to your locked funds list.`
        );
        setRecipientName('');
        setBankName('');
        setAccountNumber('');
        setConfirmAccountNumber('');
        setRoutingNumber('');
        setMemo('');
        setAmount('');
      } else {
        setError('Transfer could not be placed. Please verify your balance and details.');
      }
    }, 1100);
  };

  const submitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);
    if (!fromAccount || sendAmount <= 0) {
      setError('Please enter a transfer amount.');
      return;
    }
    if (fromAccountId === toAccountId) {
      setError('Please choose two different Wells Fargo accounts.');
      return;
    }
    if (sendAmount > fromAccount.availableBalance) {
      setError('Amount exceeds available balance.');
      return;
    }
    setProcessing(true);
    window.setTimeout(() => {
      onInternalTransfer(fromAccountId, toAccountId, sendAmount);
      setProcessing(false);
      setDone(`${formatCurrency(sendAmount)} moved successfully between your Wells Fargo accounts.`);
      setAmount('');
      window.setTimeout(() => setDone(null), 6000);
    }, 700);
  };

  const inputCls =
    'w-full p-2.5 bg-white border border-[#8c857b] rounded text-xs text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#d71e28] transition-colors';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Bar */}
      <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1e1e1e]">Wells Fargo Transfer &amp; Pay</h1>
          <p className="text-xs text-[#595959] mt-0.5 max-w-xl">
            Send money securely to external domestic accounts or transfer funds instantly between your Wells Fargo accounts.
          </p>
        </div>
        <div className="flex bg-[#f4f0eb] p-1 rounded border border-[#d8d2c9] text-xs font-bold">
          <button
            onClick={() => { setMode('external'); setError(null); setDone(null); }}
            className={`px-4 py-2 rounded transition-all cursor-pointer ${mode === 'external' ? 'bg-[#d71e28] text-white shadow' : 'text-[#4d4d4d]'}`}
          >
            Send External (Wire/Zelle)
          </button>
          <button
            onClick={() => { setMode('internal'); setError(null); setDone(null); }}
            className={`px-4 py-2 rounded transition-all cursor-pointer ${mode === 'internal' ? 'bg-[#d71e28] text-white shadow' : 'text-[#4d4d4d]'}`}
          >
            Between My Wells Fargo Accounts
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#fef2f2] border-l-4 border-[#d71e28] p-4 rounded-r text-xs text-[#991b1b] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#d71e28] mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {done && (
        <div className={`border-l-4 p-4 rounded-r flex items-start gap-3 text-xs ${
          mode === 'external'
            ? 'bg-[#fff9e6] border-[#ffcc00] text-[#5c4100]'
            : 'bg-[#e8f5e9] border-[#2e7d32] text-[#1b5e20]'
        }`}>
          {mode === 'external'
            ? <Hourglass className="w-5 h-5 text-[#b78103] shrink-0 mt-0.5 animate-pulse" />
            : <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />}
          <div className="space-y-1">
            <span className="font-bold text-sm">
              {mode === 'external' ? 'Blocked — Funds Locked' : 'Internal Transfer Completed'}
            </span>
            <p className="leading-relaxed">{done}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs">
          {mode === 'external' ? (
            <form onSubmit={submitExternal} className="space-y-5">
              
              {/* Channel Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#1e1e1e] block">Transfer Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CHANNELS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setChannel(c.id)}
                      className={`p-2.5 rounded border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        channel === c.id
                          ? 'bg-[#d71e28] border-[#d71e28] text-white shadow-xs'
                          : 'bg-[#fbf9f6] border-[#d8d2c9] text-[#4d4d4d] hover:bg-[#f4f0eb]'
                      }`}
                    >
                      <c.icon className="w-4 h-4" />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Account */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1e1e1e] block">Transfer From</label>
                <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className={inputCls}>
                  {depositAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) — Available: {formatCurrency(acc.availableBalance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient details */}
              <div className="rounded-lg border border-[#e0dad1] p-4 space-y-4 bg-[#fbf9f6]">
                <div className="text-xs font-bold text-[#1e1e1e] flex items-center gap-1.5 border-b border-[#e5e0d8] pb-2">
                  <User className="w-4 h-4 text-[#d71e28]" />
                  <span>Beneficiary / Recipient Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1 block">
                    <span className="text-[11px] font-bold text-[#4d4d4d]">Recipient Full Name</span>
                    <input 
                      value={recipientName} 
                      onChange={e => setRecipientName(e.target.value)} 
                      placeholder="e.g. Johnathan Doe" 
                      className={inputCls} 
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[11px] font-bold text-[#4d4d4d]">Recipient Bank Name</span>
                    <input 
                      value={bankName} 
                      onChange={e => setBankName(e.target.value)} 
                      placeholder="e.g. Chase Bank, NA" 
                      className={inputCls} 
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1 block">
                    <span className="text-[11px] font-bold text-[#4d4d4d] flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-[#595959]" /> 9-Digit Routing Number
                    </span>
                    <input
                      value={routingNumber}
                      onChange={e => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      inputMode="numeric"
                      placeholder="021000021"
                      className={`${inputCls} font-mono`}
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[11px] font-bold text-[#4d4d4d]">Account Type</span>
                    <select value={accountKind} onChange={e => setAccountKind(e.target.value as 'checking' | 'savings')} className={inputCls}>
                      <option value="checking">Checking Account</option>
                      <option value="savings">Savings Account</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1 block">
                    <span className="text-[11px] font-bold text-[#4d4d4d] flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5 text-[#595959]" /> Recipient Account Number
                    </span>
                    <input
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                      inputMode="numeric"
                      placeholder="Enter account number"
                      className={`${inputCls} font-mono`}
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-[11px] font-bold text-[#4d4d4d]">Confirm Account Number</span>
                    <input
                      value={confirmAccountNumber}
                      onChange={e => setConfirmAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                      inputMode="numeric"
                      placeholder="Re-enter account number"
                      className={`${inputCls} font-mono`}
                    />
                  </label>
                </div>

                <label className="space-y-1 block">
                  <span className="text-[11px] font-bold text-[#4d4d4d] flex items-center gap-1">
                    <StickyNote className="w-3.5 h-3.5 text-[#595959]" /> Memo / Reference (Optional)
                  </span>
                  <input value={memo} onChange={e => setMemo(e.target.value)} placeholder="e.g. Invoice #1021 or Personal payment" className={inputCls} />
                </label>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1e1e1e] block">Transfer Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-base font-bold text-[#8c857b]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 bg-white border border-[#8c857b] rounded text-xl font-bold font-serif text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#d71e28]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-[#d71e28] hover:bg-[#b3141d] text-white font-bold text-sm py-3 rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Hourglass className="w-4 h-4 animate-spin" />
                    <span>Processing Wire Order...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Transfer</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={submitInternal} className="space-y-4">
              <h3 className="font-serif font-bold text-[#1e1e1e] flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#d71e28]" /> Between My Wells Fargo Accounts
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1e1e1e]">From Account</label>
                <select value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className={inputCls}>
                  {depositAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} — {formatCurrency(acc.availableBalance)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1e1e1e]">To Account</label>
                <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} className={inputCls}>
                  {depositAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} — {formatCurrency(acc.availableBalance)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1e1e1e]">Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-base font-bold text-[#8c857b]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 bg-white border border-[#8c857b] rounded text-lg font-bold font-serif text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#d71e28]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-[#d71e28] hover:bg-[#b3141d] text-white font-bold text-sm py-3 rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{processing ? 'Processing...' : 'Transfer Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Informational Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#B3141D] text-white p-5 rounded-lg space-y-3 shadow-xs">
            <h4 className="font-serif font-bold text-sm text-[#FFCC00]">Wells Fargo Wire &amp; Transfer Policy</h4>
            <p className="text-xs text-white/90 leading-relaxed">
              Outgoing transfers are never completed automatically. Every attempt is placed on hold as “Blocked — Funds Locked” and the funds cannot be spent, withdrawn, or transferred until Wells Fargo releases the hold.
            </p>
            <div className="bg-[#8c0f16] p-3 rounded text-xs space-y-1 text-white/90">
              <div className="flex justify-between">
                <span>Internal Transfer Charge:</span>
                <strong className="text-[#0a8550] bg-white px-1.5 py-0.2 rounded font-bold">FREE ($0.00)</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/20">
                <span>Security Clearance:</span>
                <strong className="text-[#FFCC00]">Wells Fargo Guarantee</strong>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-[#d8d2c9] text-xs text-[#595959] space-y-3">
            <div className="font-bold text-[#1e1e1e] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0a8550]" />
              Transfer Requirements Checklist
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d71e28] shrink-0 mt-1.5"></span>
                <span>Recipient legal name matching their bank records.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d71e28] shrink-0 mt-1.5"></span>
                <span>Exact 9-digit ABA routing transit number.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d71e28] shrink-0 mt-1.5"></span>
                <span>Beneficiary checking or savings account number.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

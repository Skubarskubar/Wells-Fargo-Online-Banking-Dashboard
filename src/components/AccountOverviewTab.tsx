import React from 'react';
import { BankAccount, Transaction, PendingTransfer, LOCK_REASONS } from '../types/banking';
import { formatCurrency, formatDate, getTimeGreeting } from '../utils/formatters';
import { 
  ArrowUpRight, 
  FileText, 
  ChevronRight, 
  ShieldCheck, 
  MoreHorizontal,
  Camera
} from 'lucide-react';

interface AccountOverviewTabProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  pending: PendingTransfer[];
  accountHolderName: string;
  onNavigateTab: (tab: string) => void;
  onOpenMobileDeposit?: () => void;
}

export const AccountOverviewTab: React.FC<AccountOverviewTabProps> = ({
  accounts,
  transactions,
  pending,
  accountHolderName,
  onNavigateTab,
  onOpenMobileDeposit,
}) => {
  // Time-aware greeting — same shared logic as the login page
  const greeting = getTimeGreeting();
  const lastLoginString = 'Sep 22, 2025 2:17 PM ET';

  // Defensive lookups — never crash if the persisted store is missing an account
  const checkingAcc = accounts.find(a => a.id === 'acc-checking') ?? accounts.find(a => a.type === 'checking') ?? accounts[0];
  const savingsAcc = accounts.find(a => a.id === 'acc-savings') ?? accounts.find(a => a.type === 'savings');
  const creditAcc = accounts.find(a => a.id === 'acc-credit-activecash') ?? accounts.find(a => a.type === 'credit');

  // Total balance across all deposit accounts (Checking + Savings)
  const totalBalance = accounts
    .filter(a => a.type !== 'credit')
    .reduce((sum, a) => sum + a.availableBalance, 0);

  /** Sum of all held/locked funds */
  const lockedTotal = pending.reduce((s, t) => s + t.amount, 0);

  /** Wells Fargo palette */
  const WF_RED = '#B24A3B';

  /** Map an account to the Wells Fargo list-row shape used in the mobile app */
  const rows = [
    {
      id: checkingAcc?.id ?? '',
      title: 'EVERYDAY CHECKING',
      masked: '...' + (checkingAcc?.accountNumber?.replace(/\D/g, '').slice(-4) ?? '0000'),
      amount: checkingAcc?.availableBalance ?? 0,
      label: 'Available balance',
      kind: 'deposit' as const,
    },
    {
      id: savingsAcc?.id ?? '',
      title: 'SAVINGS',
      masked: '...' + (savingsAcc?.accountNumber?.replace(/\D/g, '').slice(-4) ?? '0000'),
      amount: savingsAcc?.availableBalance ?? 0,
      label: 'Available balance',
      kind: 'deposit' as const,
    },
    {
      id: creditAcc?.id ?? '',
      title: 'WELLS FARGO CASH BACK VISA SIGNATURE® CARD',
      masked: '...' + (creditAcc?.accountNumber?.replace(/\D/g, '').slice(-4) ?? '0000'),
      amount: Math.abs(creditAcc?.balance ?? 0),
      label: 'Outstanding balance',
      kind: 'credit' as const,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Greeting & Last Sign On Section (Authentic Wells Fargo style) */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5e0d8] pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e1e1e]">
            {greeting}, {accountHolderName}
          </h1>
          <p className="text-xs text-[#595959] mt-0.5">
            Here's your account summary.
          </p>
        </div>
        <div className="text-xs text-[#595959] flex items-center gap-1.5">
          <span>Last sign on: {lastLoginString}</span>
          <ShieldCheck className="w-4 h-4 text-[#0a8550]" />
        </div>
      </div>

      {/* Total Balance Summary across all deposit accounts */}
      <div className="bg-white rounded-lg shadow-sm border border-[#d8d2c9] overflow-hidden">
        <div className="bg-[#BA0C2F] text-white p-6 sm:p-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/80 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FFCC00]" />
              <span>Total Balance — All Wells Fargo Accounts</span>
            </div>
            <div className="text-3xl sm:text-5xl font-serif font-bold text-white mt-2 leading-none">
              {formatCurrency(totalBalance)}
            </div>
            <div className="text-xs text-white/85 mt-2">
              Premier Client • Member since 2019
            </div>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <div className="bg-white/10 border border-white/25 rounded px-4 py-2.5">
              <div className="text-[11px] uppercase tracking-wide text-white/80 font-semibold">Everyday Checking</div>
              <div className="font-serif text-lg font-bold">{formatCurrency(checkingAcc?.availableBalance ?? 0)}</div>
            </div>
            {savingsAcc && (
              <div className="bg-white/10 border border-white/25 rounded px-4 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-white/80 font-semibold">Savings</div>
                <div className="font-serif text-lg font-bold">{formatCurrency(savingsAcc.availableBalance)}</div>
              </div>
            )}
            {pending.length > 0 && (
              <div className="bg-[#d71e28] border border-white/30 rounded px-4 py-2.5">
                <div className="text-[11px] uppercase tracking-wide text-white/85 font-semibold">Funds Locked</div>
                <div className="font-serif text-lg font-bold">{formatCurrency(lockedTotal)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blocked — Funds Locked summary */}
      {pending.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-[#d8d2c9] overflow-hidden">
          <div className="px-5 sm:px-7 py-4 border-b border-[#e5e0d8] flex items-center justify-between gap-3">
            <h2 className="font-serif text-lg font-bold text-[#1e1e1e]">Blocked — Funds Locked</h2>
            <button
              onClick={() => onNavigateTab('pending_queue')}
              className="text-xs font-bold text-[#00698c] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-[#e8e2d8]">
            {pending.slice(0, 3).map(t => {
              const info = LOCK_REASONS[t.reason];
              return (
                <div key={t.id} className="px-5 sm:px-7 py-4 flex flex-wrap items-start justify-between gap-3 bg-[#fef2f2]">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[#d71e28]">Blocked — Funds Locked</div>
                    <div className="text-xs text-[#595959] mt-0.5 truncate">{t.recipientName} · {t.bankName}</div>
                    <div className="text-[11px] text-[#737373] font-mono mt-0.5">Ref {t.reference}</div>
                    <div className="text-[11px] text-[#b78103] font-semibold mt-1">
                      Reason: {info?.title ?? 'Under review'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-serif font-bold text-lg text-[#1e1e1e] num">
                      {formatCurrency(t.amount)}
                    </div>
                    <div className="text-[11px] text-[#737373] num">
                      {new Date(t.lockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
                      {new Date(t.lockedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pending.length > 3 && (
            <button
              onClick={() => onNavigateTab('pending_queue')}
              className="w-full py-3 text-xs font-bold text-[#00698c] hover:underline bg-[#fbf9f6] cursor-pointer"
            >
              View all {pending.length} locked transfers
            </button>
          )}
        </div>
      )}

      {/* Wells Fargo Accounts List — matches the mobile app layout exactly */}
      <div className="bg-white rounded-lg shadow-sm border border-[#d8d2c9] overflow-hidden">
        <div className="px-5 sm:px-7 py-4 border-b border-[#e5e0d8] flex items-baseline justify-between">
          <h2 className="font-serif text-lg font-bold text-[#1e1e1e]">My Accounts</h2>
          <span className="text-xs text-[#595959]">
            Total deposits: <span className="font-serif font-bold text-[#1e1e1e] num">{formatCurrency(totalBalance)}</span>
          </span>
        </div>

        <div className="divide-y divide-[#e8e2d8]">
          {rows.map((row) => (
            <div
              key={row.id}
              role="button"
              tabIndex={0}
              onClick={() => onNavigateTab('activity')}
              onKeyDown={(e) => { if (e.key === 'Enter') onNavigateTab('activity'); }}
              className="relative px-5 sm:px-7 py-6 sm:py-7 hover:bg-[#faf8f5] focus:outline-none focus:bg-[#faf8f5] cursor-pointer transition-colors"
              style={{ backgroundColor: '#f2f0ec' }}
            >
              {/* Two-column row: name block left, balance block right */}
              <div className="flex items-start justify-between gap-6">
                {/* Left: red uppercase title + masked number underneath */}
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-sans font-bold uppercase leading-tight tracking-wide text-[17px] sm:text-[19px]"
                    style={{ color: WF_RED }}
                  >
                    {row.title}
                  </h3>
                  <p className="text-[15px] sm:text-base text-[#4d4d4d] mt-1.5 num">{row.masked}</p>
                </div>

                {/* Right: balance with caption below */}
                <div className="text-right shrink-0 pl-2">
                  <div
                    className="font-sans font-normal text-[#1e1e1e] num leading-none text-[24px] sm:text-[30px] whitespace-nowrap"
                  >
                    <span className="align-baseline">$&nbsp;</span>
                    {formatCurrency(row.amount).replace('$', '')}
                  </div>
                  <div className="text-[13px] sm:text-sm text-[#595959] mt-2 sm:mt-3">{row.label}</div>
                </div>
              </div>

              {/* Three-dot vertical menu, right edge */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNavigateTab('activity'); }}
                aria-label={`Actions for ${row.title}`}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[#e4ded4] transition-colors cursor-pointer"
              >
                <span className="flex flex-col gap-[3px] items-center">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#8c857b]"></span>
                  <span className="w-[5px] h-[5px] rounded-full bg-[#8c857b]"></span>
                  <span className="w-[5px] h-[5px] rounded-full bg-[#8c857b]"></span>
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Quick actions strip beneath the account list */}
        <div className="p-4 sm:px-7 sm:py-5 bg-white border-t border-[#e5e0d8] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('transfers')}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-white hover:bg-[#f4f0eb] border border-[#c4bcb1] rounded text-[#1e1e1e] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-[#d71e28]" />
            <span>Transfer Money</span>
          </button>

          <button
            onClick={() => onNavigateTab('transfers')}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-white hover:bg-[#f4f0eb] border border-[#c4bcb1] rounded text-[#1e1e1e] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#00698c]" />
            <span>Pay Bills</span>
          </button>

          <button
            onClick={onOpenMobileDeposit || (() => onNavigateTab('mobile_deposit'))}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-white hover:bg-[#f4f0eb] border border-[#c4bcb1] rounded text-[#1e1e1e] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#0a8550]" />
            <span>Deposit Check</span>
          </button>

          <button
            onClick={() => onNavigateTab('activity')}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-white hover:bg-[#f4f0eb] border border-[#c4bcb1] rounded text-[#1e1e1e] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4 text-[#595959]" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions Table (Matching Screenshot layout exactly) */}
      <div className="bg-white rounded-lg shadow-sm border border-[#d8d2c9] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e0d8] flex justify-between items-center">
          <h2 className="text-lg font-serif font-bold text-[#1e1e1e]">Recent Transactions</h2>
          <button
            onClick={() => onNavigateTab('activity')}
            className="text-xs text-[#00698c] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fbf9f6] border-b border-[#e5e0d8] text-[#595959] font-bold text-[11px]">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6 text-right">Amount</th>
                <th className="py-3 px-6 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece6]">
              {transactions.slice(0, 8).map((tx) => {
                const isPositive = tx.type === 'credit';
                return (
                  <tr key={tx.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3.5 px-6 text-[#595959] font-medium whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-[#1e1e1e] text-[13px]">{tx.description}</div>
                      <div className="text-[11px] text-[#737373] mt-0.5">{tx.category}</div>
                    </td>
                    <td className={`py-3.5 px-6 text-right font-serif font-bold text-sm ${
                      isPositive ? 'text-[#0a8550]' : 'text-[#1e1e1e]'
                    }`}>
                      {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-serif text-[#595959] font-medium">
                      {tx.runningBalance ? formatCurrency(tx.runningBalance) : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 bg-[#fbf9f6] border-t border-[#e5e0d8] flex justify-between items-center text-xs text-[#737373]">
          <span>Showing 8 of {transactions.length} transactions</span>
          <button
            onClick={() => onNavigateTab('activity')}
            className="text-[#00698c] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Transactions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

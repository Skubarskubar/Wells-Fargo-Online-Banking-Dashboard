import React, { useState } from 'react';
import { Transaction, LOCK_REASONS } from '../types/banking';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Search,
  Download,
  Filter,
  Hourglass,
  CheckCircle2
} from 'lucide-react';

interface TransactionsTabProps {
  transactions: Transaction[];
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all');

  const rows = transactions.filter(tx => {
    if (!tx) return false;
    const desc = (tx.description || '').toLowerCase();
    const cat = (tx.category || '').toLowerCase();
    const matchesSearch =
      desc.includes(searchTerm.toLowerCase()) || cat.includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'deposits') return tx.type === 'credit';
    if (filter === 'withdrawals') return tx.type === 'debit' || tx.type === 'fee';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1e1e1e]">Statements &amp; Account Activity</h1>
          <p className="text-xs text-[#595959] mt-0.5">
            Review detailed cleared transactions, electronic deposits, wire status, and monthly statements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.alert('Preparing official Wells Fargo PDF Account Statement...')}
            className="px-3.5 py-2 bg-[#f4f0eb] hover:bg-[#e8e2d8] text-[#1e1e1e] font-bold text-xs rounded border border-[#d8d2c9] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#d71e28]" />
            <span>Download Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-lg p-4 border border-[#d8d2c9] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <label className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-[#8c857b] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search description, merchant, check #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#8c857b] rounded text-xs text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#d71e28]"
          />
        </label>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#595959]" />
          {[
            { id: 'all' as const, label: 'All Transactions' },
            { id: 'deposits' as const, label: 'Deposits & Credits' },
            { id: 'withdrawals' as const, label: 'Withdrawals & Debits' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                filter === f.id
                  ? 'bg-[#d71e28] text-white shadow-2xs'
                  : 'bg-[#f4f0eb] text-[#4d4d4d] hover:bg-[#e8e2d8]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-2xs border border-[#d8d2c9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fbf9f6] border-b border-[#e5e0d8] text-[#595959] font-bold text-[11px]">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Amount</th>
                <th className="py-3 px-6 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece6]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#737373]">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                rows.map(tx => {
                  const isPositive = tx.type === 'credit';
                  const isPending = tx.status === 'blocked';
                  const reasonInfo =
                    tx.lockReason && LOCK_REASONS[tx.lockReason] ? LOCK_REASONS[tx.lockReason] : null;
                  const txDate = tx.blockedAt ? new Date(tx.blockedAt) : null;
                  const safeTime = txDate && !isNaN(txDate.getTime())
                    ? txDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
                    : null;
                  return (
                    <tr key={tx.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className={`py-3.5 px-6 font-medium whitespace-nowrap ${isPending ? 'text-[#d71e28]' : 'text-[#595959]'}`}>
                        {formatDate(tx.date)}
                        {isPending && safeTime && (
                          <div className="text-[10px] text-[#737373] num">{safeTime}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className={`font-bold text-[13px] ${isPending ? 'text-[#d71e28]' : 'text-[#1e1e1e]'}`}>
                          {isPending ? 'Blocked — Funds Locked' : tx.description}
                        </div>
                        {isPending ? (
                          <>
                            <div className="text-[11px] text-[#595959] mt-0.5">{tx.description}</div>
                            {reasonInfo && (
                              <div className="text-[10px] text-[#b78103] font-semibold mt-0.5">
                                Reason: {reasonInfo.title}
                              </div>
                            )}
                          </>
                        ) : (
                          reasonInfo && (
                            <div className="text-[10px] text-[#b78103] font-semibold mt-0.5">
                              Reason: {reasonInfo.title}
                            </div>
                          )
                        )}
                        {tx.reference && (
                          <div className="text-[10px] text-[#737373] font-mono">Ref: {tx.reference}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 rounded font-medium ${
                          isPending ? 'bg-[#fef2f2] text-[#d71e28]' : 'bg-[#f4f0eb] text-[#595959]'
                        }`}>
                          {isPending ? 'Funds Locked' : tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fef2f2] text-[#d71e28] border border-[#fca5a5]">
                            <Hourglass className="w-3 h-3" /> Blocked — Funds Locked
                          </span>
                        ) : tx.status === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f4f0eb] text-[#737373]">
                            Hold Released
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f5e9] text-[#1b5e20]">
                            <CheckCircle2 className="w-3 h-3" /> Cleared
                          </span>
                        )}
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
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 bg-[#fbf9f6] border-t border-[#e5e0d8] flex justify-between items-center text-xs text-[#737373]">
          <span>Displaying {rows.length} transactions</span>
          <span className="font-semibold text-[#00698c]">Wells Fargo Online Guarantee Active</span>
        </div>
      </div>
    </div>
  );
};

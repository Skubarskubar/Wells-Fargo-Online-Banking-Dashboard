import React, { useState } from 'react';
import { Award, Gift, DollarSign, CheckCircle2, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const RewardsTab: React.FC = () => {
  const [points, setPoints] = useState<number>(124500);
  const [redeemedNotice, setRedeemedNotice] = useState<string | null>(null);

  // Clamp to a sane range so the balance can never go negative or NaN
  const safePoints = typeof points === 'number' && !isNaN(points) && points > 0 ? points : 0;
  const cashValue = safePoints * 0.01;

  const handleRedeem = (option: string, cost: number) => {
    if (!cost || cost <= 0 || safePoints < cost) return;
    setPoints(prev => Math.max(0, (typeof prev === 'number' && !isNaN(prev) ? prev : 0) - cost));
    setRedeemedNotice(`Redeemed ${cost.toLocaleString()} points for ${option}!`);
    setTimeout(() => setRedeemedNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-[#B3141D] rounded-lg p-6 text-white shadow-sm space-y-4">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 text-[#FFCC00] rounded-lg border border-white/20">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFCC00]">
                Wells Fargo Rewards®
              </span>
              <h2 className="text-2xl font-serif font-bold text-white">Active Cash® Rewards Center</h2>
            </div>
          </div>

          <div className="bg-[#8c0f16] p-4 rounded-lg border border-white/20 text-right">
            <div className="text-xs text-white/80">Available Cash Rewards</div>
            <div className="text-3xl font-serif font-bold text-[#FFCC00] mt-0.5">
              {formatCurrency(cashValue)}
            </div>
            <div className="text-[11px] text-white/70">({safePoints.toLocaleString()} points)</div>
          </div>
        </div>
      </div>

      {redeemedNotice && (
        <div className="bg-[#e8f5e9] border border-[#a5d6a7] p-4 rounded-lg flex items-center space-x-2 text-[#1b5e20] text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0" />
          <span>{redeemedNotice}</span>
        </div>
      )}

      {/* Redemption Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Direct Deposit / Statement Credit */}
        <div className="bg-white rounded-lg p-5 border border-[#d8d2c9] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 bg-[#e8f5e9] text-[#1b5e20] rounded w-fit">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1e1e1e]">Statement Credit</h3>
            <p className="text-xs text-[#595959]">
              Apply your cash rewards directly toward your Active Cash® Card balance.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#f0ece6]">
            <div className="text-xs font-bold text-[#1e1e1e]">10,000 Points = $100.00 Credit</div>
            <button
              onClick={() => handleRedeem('$100.00 Statement Credit', 10000)}
              className="w-full bg-[#d71e28] hover:bg-[#b3141d] text-white font-bold text-xs py-2.5 rounded transition-colors cursor-pointer"
            >
              Redeem 10,000 pts ($100.00)
            </button>
          </div>
        </div>

        {/* Direct Deposit to Checking */}
        <div className="bg-white rounded-lg p-5 border border-[#d8d2c9] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 bg-[#f0f9ff] text-[#0284c7] rounded w-fit">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1e1e1e]">Deposit to Checking</h3>
            <p className="text-xs text-[#595959]">
              Deposit cash back directly into your Everyday Checking (...4821) account.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#f0ece6]">
            <div className="text-xs font-bold text-[#1e1e1e]">25,000 Points = $250.00 Cash</div>
            <button
              onClick={() => handleRedeem('$250.00 Checking Deposit', 25000)}
              className="w-full bg-[#1b5e20] hover:bg-[#144818] text-white font-bold text-xs py-2.5 rounded transition-colors cursor-pointer"
            >
              Deposit $250.00 Cash
            </button>
          </div>
        </div>

        {/* Merchant Gift Cards */}
        <div className="bg-white rounded-lg p-5 border border-[#d8d2c9] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2.5 bg-[#fff8e1] text-[#b78103] rounded w-fit">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1e1e1e]">Retail Gift Cards</h3>
            <p className="text-xs text-[#595959]">
              Redeem points for digital gift cards at Amazon, Apple, Target, and Starbucks.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#f0ece6]">
            <div className="text-xs font-bold text-[#1e1e1e]">5,000 Points = $50.00 Card</div>
            <button
              onClick={() => handleRedeem('$50.00 Amazon Gift Card', 5000)}
              className="w-full bg-[#f4f0eb] hover:bg-[#e8e2d8] text-[#1e1e1e] font-bold text-xs py-2.5 rounded border border-[#d8d2c9] transition-colors cursor-pointer"
            >
              Redeem 5,000 pts ($50.00)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

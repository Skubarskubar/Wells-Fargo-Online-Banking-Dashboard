import React, { useEffect, useState } from 'react';
import { BankAccount } from '../types/banking';
import { formatCurrency } from '../utils/formatters';
import { Camera, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface MobileDepositTabProps {
  accounts: BankAccount[];
  onDepositSuccess: (accountId: string, amount: number, checkNumber: string) => void;
}

export const MobileDepositTab: React.FC<MobileDepositTabProps> = ({
  accounts,
  onDepositSuccess,
}) => {
  const depositAccounts = accounts.filter(a => a.type === 'checking' || a.type === 'savings');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(depositAccounts[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [checkNumber, setCheckNumber] = useState<string>('');
  const [frontUploaded, setFrontUploaded] = useState<boolean>(false);
  const [backUploaded, setBackUploaded] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep the account selection valid if accounts load or change after mount
  useEffect(() => {
    if (depositAccounts.length === 0) return;
    if (!depositAccounts.some(a => a.id === selectedAccountId)) {
      setSelectedAccountId(depositAccounts[0].id);
    }
  }, [accounts, depositAccounts, selectedAccountId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedAmount = parseFloat(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid deposit amount.');
      return;
    }

    if (!checkNumber.trim()) {
      setError('Please enter the 4-digit check number.');
      return;
    }

    if (!frontUploaded || !backUploaded) {
      setError('Please upload or snap both Front and Back photos of the check with proper endorsement.');
      return;
    }

    // Never submit against a missing account
    if (!selectedAccountId || !accounts.some(a => a.id === selectedAccountId)) {
      setError('Please select a valid deposit account.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onDepositSuccess(selectedAccountId, parsedAmount, checkNumber.trim());
      setSuccessMessage(`Check #${checkNumber} for ${formatCurrency(parsedAmount)} has been submitted for mobile deposit. Funds typically become available within 1 business day.`);
      setAmount('');
      setCheckNumber('');
      setFrontUploaded(false);
      setBackUploaded(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#e8f5e9] text-[#1b5e20] rounded-lg">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1e1e1e]">Wells Fargo Mobile Deposit®</h1>
            <p className="text-xs text-[#595959] mt-0.5">
              Deposit paper checks quickly and securely anytime from your smartphone or computer.
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-[#e8f5e9] border border-[#a5d6a7] p-4 rounded-lg flex items-start gap-3 text-xs text-[#1b5e20]">
          <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm">Deposit Submitted Successfully!</span>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-[#fef2f2] border-l-4 border-[#d71e28] p-4 rounded-r-lg text-xs text-[#991b1b] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#d71e28]" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Deposit Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-8 bg-white rounded-lg border border-[#d8d2c9] shadow-2xs p-6 space-y-5">
          
          {/* Account Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1e1e1e] block">
              Deposit to Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#8c857b] rounded text-xs font-medium text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#d71e28]"
            >
              {depositAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — Available: {formatCurrency(acc.availableBalance)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1e1e1e] block">
                Check Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-white border border-[#8c857b] rounded text-sm font-bold text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#d71e28]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1e1e1e] block">
                Check Number
              </label>
              <input
                type="text"
                placeholder="e.g. 1042"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#8c857b] rounded text-sm text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#d71e28]"
              />
            </div>
          </div>

          {/* Photo Capture Boxes */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-[#1e1e1e]">Check Photos</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Front of Check */}
              <div 
                onClick={() => setFrontUploaded(!frontUploaded)}
                className={`p-5 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  frontUploaded 
                    ? 'bg-[#e8f5e9] border-[#2e7d32] text-[#1b5e20]' 
                    : 'bg-[#fbf9f6] border-[#c4bcb1] hover:border-[#d71e28] text-[#595959]'
                }`}
              >
                {frontUploaded ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-[#2e7d32] mb-1.5" />
                    <span className="text-xs font-bold">Front of Check Captured</span>
                    <span className="text-[10px] text-[#2e7d32] mt-0.5">Click to retake</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-[#8c857b] mb-1.5" />
                    <span className="text-xs font-bold text-[#1e1e1e]">Snap / Upload Front</span>
                    <span className="text-[10px] text-[#737373] mt-0.5">Include all 4 corners</span>
                  </>
                )}
              </div>

              {/* Back of Check */}
              <div 
                onClick={() => setBackUploaded(!backUploaded)}
                className={`p-5 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  backUploaded 
                    ? 'bg-[#e8f5e9] border-[#2e7d32] text-[#1b5e20]' 
                    : 'bg-[#fbf9f6] border-[#c4bcb1] hover:border-[#d71e28] text-[#595959]'
                }`}
              >
                {backUploaded ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-[#2e7d32] mb-1.5" />
                    <span className="text-xs font-bold">Back of Check Captured</span>
                    <span className="text-[10px] text-[#2e7d32] mt-0.5">Click to retake</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-[#8c857b] mb-1.5" />
                    <span className="text-xs font-bold text-[#1e1e1e]">Snap / Upload Back</span>
                    <span className="text-[10px] text-[#737373] mt-0.5">Endorsed: "For Mobile Deposit"</span>
                  </>
                )}
              </div>

            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#d71e28] hover:bg-[#b3141d] text-white font-bold text-sm py-3 rounded shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? 'Processing Check Verification...' : 'Submit Deposit'}
            {!isProcessing && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Instructions & Guidelines */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-[#fbf9f6] p-5 rounded-lg border border-[#e0dad1] space-y-3 text-xs text-[#595959]">
            <div className="font-bold text-[#1e1e1e] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0a8550]" />
              Deposit Guidelines
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#0a8550] shrink-0 mt-0.5" />
                <span>Sign the back of your check with your legal signature.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#0a8550] shrink-0 mt-0.5" />
                <span>Write "For mobile deposit at Wells Fargo only" below your signature.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#0a8550] shrink-0 mt-0.5" />
                <span>Place the check on a dark, well-lit surface with no shadows.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-[#d8d2c9] text-xs space-y-2 text-[#595959]">
            <div className="font-bold text-[#1e1e1e]">Daily Deposit Limit</div>
            <div className="text-xl font-bold font-serif text-[#1b5e20]">$50,000.00</div>
            <p className="text-[11px] text-[#737373]">
              Premier Client Enhanced Deposit Limit. Funds generally available by the next business day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

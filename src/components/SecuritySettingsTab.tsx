import React, { useState } from 'react';
import { BankAccount } from '../types/banking';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  Fingerprint,
  CheckCircle2,
  Receipt,
  Smartphone
} from 'lucide-react';

interface SecuritySettingsTabProps {
  accounts: BankAccount[];
  onToggleCardLock: (accountId: string) => void;
}

export const SecuritySettingsTab: React.FC<SecuritySettingsTabProps> = ({
  accounts,
  onToggleCardLock,
}) => {
  const cardAccounts = accounts.filter(a => a.cardDetails);
  const [twoFactor, setTwoFactor] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [saveNotice, setSaveNotice] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#e8f5e9] text-[#1b5e20] rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1e1e1e]">Security &amp; Account Controls</h1>
            <p className="text-xs text-[#595959] mt-0.5">
              Control debit and credit card lock status, manage 2-step verification, and biometric sign-on.
            </p>
          </div>
        </div>
      </div>

      {saveNotice && (
        <div className="bg-[#e8f5e9] border border-[#a5d6a7] p-4 rounded-lg flex items-center space-x-2 text-[#1b5e20] text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-[#2e7d32] shrink-0" />
          <span>Security settings saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Lock Section */}
        <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#e5e0d8] pb-3">
            <CreditCard className="w-5 h-5 text-[#d71e28]" />
            <h2 className="font-serif font-bold text-[#1e1e1e] text-base">Wells Fargo Card On/Off Controls</h2>
          </div>
          <p className="text-xs text-[#595959]">
            Instantly turn your card off if lost or misplaced. When off, new purchases and ATM withdrawals are declined.
          </p>
          <div className="space-y-4 divide-y divide-[#f0ece6]">
            {cardAccounts.map((acc) => {
              const card = acc.cardDetails!;
              return (
                <div key={acc.id} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#1e1e1e] text-xs">{acc.name}</div>
                    <div className="text-xs text-[#595959] font-mono mt-0.5">{card.number}</div>
                    <div className="text-[10px] text-[#737373]">Exp: {card.expiry}</div>
                  </div>
                  <button
                    onClick={() => onToggleCardLock(acc.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-colors ${
                      card.isLocked ? 'bg-[#fef2f2] text-[#d71e28] border border-[#fca5a5]' : 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]'
                    }`}
                  >
                    {card.isLocked ? (
                      <><Lock className="w-4 h-4 text-[#d71e28]" /><span>Card Locked (OFF)</span></>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 text-[#2e7d32]" /><span>Card Active (ON)</span></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Step Sign On Settings */}
        <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-[#e5e0d8] pb-3">
            <Smartphone className="w-5 h-5 text-[#00698c]" />
            <h2 className="font-serif font-bold text-[#1e1e1e] text-base">Sign On Security Preferences</h2>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-[#1e1e1e]">2-Step Verification for Outgoing Wires</div>
              <div className="text-[#595959] text-[11px]">Always require 6-digit SMS text code for wire transfers</div>
            </div>
            <button onClick={() => setTwoFactor(!twoFactor)} className="cursor-pointer">
              {twoFactor ? <ToggleRight className="w-8 h-8 text-[#d71e28]" /> : <ToggleLeft className="w-8 h-8 text-[#8c857b]" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-[#f0ece6] pt-3">
            <div>
              <div className="font-bold text-[#1e1e1e] flex items-center">
                <Fingerprint className="w-3.5 h-3.5 mr-1 text-[#00698c]" /> Biometric Face / Touch ID
              </div>
              <div className="text-[#595959] text-[11px]">Fast and encrypted biometric authentication</div>
            </div>
            <button onClick={() => setBiometrics(!biometrics)} className="cursor-pointer">
              {biometrics ? <ToggleRight className="w-8 h-8 text-[#d71e28]" /> : <ToggleLeft className="w-8 h-8 text-[#8c857b]" />}
            </button>
          </div>

          <button
            onClick={() => { setSaveNotice(true); setTimeout(() => setSaveNotice(false), 3000); }}
            className="w-full bg-[#d71e28] hover:bg-[#b3141d] text-white font-bold text-xs py-2.5 rounded transition-colors cursor-pointer"
          >
            Save Security Preferences
          </button>
        </div>
      </div>

      {/* Wire & Transfer Regulatory Notice */}
      <div className="bg-[#fbf9f6] border border-[#d8d2c9] rounded-lg p-5 text-xs text-[#595959] flex items-start space-x-3">
        <Receipt className="w-5 h-5 text-[#d71e28] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[#1e1e1e]">Wells Fargo Online® Transfer Disclosures</div>
          <p className="leading-relaxed">
            External domestic wires and expedited Zelle payments sent outside Wells Fargo are subject to a temporary security hold during routine review. There is no charge — transfers remain temporarily locked until the review completes. All deposits remain FDIC insured up to $250,000 per depositor.
          </p>
        </div>
      </div>
    </div>
  );
};

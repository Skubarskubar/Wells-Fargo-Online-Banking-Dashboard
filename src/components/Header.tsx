import React, { useState } from 'react';
import { UserProfile } from '../types/banking';
import { User, X, LogOut } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  pendingCount?: number;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

const NAV_TABS = [
  { id: 'overview', label: 'Accounts' },
  { id: 'transfers', label: 'Transfer & Pay' },
  { id: 'mobile_deposit', label: 'Deposit Checks' },
  { id: 'activity', label: 'Statements & Activity' },
  { id: 'rewards', label: 'Rewards & Offers' },
  { id: 'support', label: 'Customer Support' },
  { id: 'settings', label: 'Security & Settings' },
];

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  unreadCount,
  pendingCount = 0,
  onOpenNotifications,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="bg-white border-b border-[#d8d2c9] sticky top-0 z-40 shadow-xs">
      {/* Main Bar: red with centered WELLS FARGO, profile icon left, hamburger right */}
      <div className="bg-[#B24A3B] text-white">
        <div className="relative h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between">
          {/* Left: profile avatar icon (outline person in circle) */}
          <button
            onClick={onOpenNotifications}
            aria-label="Profile and alerts"
            className="relative w-10 h-10 shrink-0 rounded-full border-2 border-white flex items-center justify-center hover:bg-white/15 transition-colors cursor-pointer"
          >
            <User className="w-5 h-5 stroke-[2]" />
            {(unreadCount > 0 || pendingCount > 0) && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#FFCC00] text-[#1e1e1e] text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount + pendingCount}
              </span>
            )}
          </button>

          {/* Center: WELLS FARGO wordmark */}
          <div className="absolute inset-x-0 flex justify-center pointer-events-none">
            <span
              onClick={() => setActiveTab('overview')}
              className="font-serif font-black tracking-[0.06em] text-white text-xl sm:text-[26px] leading-none cursor-pointer select-none pointer-events-auto drop-shadow-xs"
            >
              WELLS FARGO
            </span>
          </div>

          {/* Right: hamburger menu */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            className="w-10 h-10 shrink-0 flex flex-col items-end justify-center gap-[5px] hover:opacity-80 transition-opacity cursor-pointer"
          >
            {menuOpen ? (
              <X className="w-7 h-7 stroke-[2.2]" />
            ) : (
              <>
                <span className="block h-[3px] w-7 bg-white rounded-sm"></span>
                <span className="block h-[3px] w-7 bg-white rounded-sm"></span>
                <span className="block h-[3px] w-7 bg-white rounded-sm"></span>
              </>
            )}
          </button>
        </div>

        {/* Gold stripe under the red bar */}
        <div className="h-[3px] bg-[#EAAA00] w-full"></div>

        {/* Sign-on strip: tier + name + sign off */}
        <div className="bg-white border-b border-[#d8d2c9] px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#1e1e1e]">{user.tier}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#595959] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0a8550]"></span>
              {user.name} · Signed In
            </span>
            <button
              onClick={onLogout}
              className="px-3 py-1 bg-[#f4f0eb] hover:bg-[#e8e2d8] text-[#1e1e1e] text-xs font-semibold rounded border border-[#d8d2c9] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Off"
            >
              <LogOut className="w-3.5 h-3.5 text-[#d71e28]" />
              <span>Sign Off</span>
            </button>
          </div>
        </div>

        {/* Slide-down nav menu */}
        {menuOpen && (
          <nav className="bg-[#9c3e31] text-white px-4 sm:px-6 py-3 space-y-1 animate-fade-in">
            {NAV_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.id ? 'bg-[#7e3226] text-[#FFCC00]' : 'hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

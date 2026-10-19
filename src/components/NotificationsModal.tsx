import React from 'react';
import { SecurityAlert } from '../types/banking';
import { X, Bell, Receipt, Info, ShieldAlert } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SecurityAlert[];
  onMarkAllRead: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAllRead,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl border border-[#d8d2c9] w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#B3141D] text-white p-4 px-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#FFCC00]" />
            <h3 className="font-serif font-bold text-base">Wells Fargo Alerts &amp; Messages</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto divide-y divide-[#f0ece6]">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#737373]">
              No active security alerts or messages.
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="pt-3 first:pt-0 flex items-start space-x-3 text-xs">
                <div className={`p-2 rounded-full shrink-0 ${
                  alert.type === 'fee_notice' ? 'bg-[#fff9e6] text-[#b78103]' :
                  alert.type === 'warning' ? 'bg-[#fef2f2] text-[#d71e28]' : 'bg-[#f0f9ff] text-[#0284c7]'
                }`}>
                  {alert.type === 'fee_notice' ? <Receipt className="w-4 h-4" /> :
                   alert.type === 'warning' ? <ShieldAlert className="w-4 h-4" /> :
                   <Info className="w-4 h-4" />}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[#1e1e1e]">{alert.title}</span>
                    <span className="text-[10px] text-[#737373]">{alert.date}</span>
                  </div>
                  <p className="text-[#595959] text-[11px] leading-relaxed">{alert.message}</p>
                  {alert.actionRequired && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab('transfers');
                      }}
                      className="text-xs font-bold text-[#00698c] hover:underline pt-1 inline-block cursor-pointer"
                    >
                      {alert.actionRequired} →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fbf9f6] border-t border-[#e5e0d8] flex justify-between items-center text-xs">
          <button onClick={onMarkAllRead} className="text-[#00698c] font-bold hover:underline cursor-pointer">
            Mark all as read
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-[#d71e28] text-white font-bold rounded hover:bg-[#b3141d] cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

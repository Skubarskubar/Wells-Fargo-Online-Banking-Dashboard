import React, { useState } from 'react';
import { Phone, MessageSquare, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export const SupportTab: React.FC = () => {
  const [topic, setTopic] = useState('transfers');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setMessage('');
      setSent(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs">
        <h1 className="text-2xl font-serif font-bold text-[#1e1e1e]">Wells Fargo Customer Support</h1>
        <p className="text-xs text-[#595959] mt-0.5">
          We're here to help you 24 hours a day, 7 days a week.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-5 border border-[#d8d2c9] shadow-2xs space-y-2">
          <div className="p-2.5 bg-[#fef2f2] text-[#d71e28] rounded w-fit">
            <Phone className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-[#1e1e1e]">General Inquiries</div>
          <div className="text-base font-serif font-bold text-[#d71e28]">1-800-869-3557</div>
          <div className="text-[11px] text-[#737373]">Available 24/7/365</div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-[#d8d2c9] shadow-2xs space-y-2">
          <div className="p-2.5 bg-[#f0f9ff] text-[#0284c7] rounded w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-[#1e1e1e]">Premier Client Priority</div>
          <div className="text-base font-serif font-bold text-[#0284c7]">1-800-742-4932</div>
          <div className="text-[11px] text-[#737373]">Dedicated Premier Banker line</div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-[#d8d2c9] shadow-2xs space-y-2">
          <div className="p-2.5 bg-[#e8f5e9] text-[#2e7d32] rounded w-fit">
            <Clock className="w-5 h-5" />
          </div>
          <div className="font-bold text-sm text-[#1e1e1e]">Online & Wire Support</div>
          <div className="text-base font-serif font-bold text-[#2e7d32]">1-800-956-4442</div>
          <div className="text-[11px] text-[#737373]">Mon–Fri 7am–10pm ET</div>
        </div>
      </div>

      {/* Direct Secure Message Form */}
      <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs space-y-4">
        <div className="border-b border-[#e5e0d8] pb-3">
          <h2 className="text-lg font-serif font-bold text-[#1e1e1e] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#d71e28]" />
            Send a Secure Message to Your Premier Banking Team
          </h2>
          <p className="text-xs text-[#595959] mt-0.5">
            Responses are securely delivered to your Wells Fargo Message Center within 2 to 4 business hours.
          </p>
        </div>

        {sent && (
          <div className="bg-[#e8f5e9] border border-[#a5d6a7] p-4 rounded-lg flex items-center gap-2 text-xs text-[#1b5e20] font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0" />
            <span>Your message has been securely sent. A banker will respond shortly.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1e1e1e] block">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#8c857b] rounded text-xs text-[#1e1e1e] focus:ring-2 focus:ring-[#d71e28]"
              >
                <option value="transfers">Temporarily Locked Wire Transfer</option>
                <option value="checking">Everyday Checking Account Inquiry</option>
                <option value="savings">Way2Save® Savings Interest Rates</option>
                <option value="mobile_deposit">Mobile Deposit Limit Increase</option>
                <option value="fraud">Fraud & Card Security Verification</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1e1e1e] block">Email Address</label>
              <input
                type="text"
                disabled
                value="s•••••••••@gmail.com"
                className="w-full p-2.5 bg-[#fbf9f6] border border-[#d8d2c9] rounded text-xs text-[#595959]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#1e1e1e] block">Message Details</label>
            <textarea
              rows={4}
              placeholder="Describe your question or transaction reference number..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-white border border-[#8c857b] rounded text-xs text-[#1e1e1e] focus:outline-none focus:ring-2 focus:ring-[#d71e28]"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#d71e28] hover:bg-[#b3141d] text-white font-bold text-xs rounded shadow transition-colors cursor-pointer"
          >
            Submit Message
          </button>
        </form>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-lg p-6 border border-[#d8d2c9] shadow-2xs space-y-4">
        <h2 className="text-base font-serif font-bold text-[#1e1e1e]">Frequently Asked Questions</h2>
        <div className="divide-y divide-[#f0ece6] text-xs">
          <div className="py-3">
            <div className="font-bold text-[#1e1e1e]">Why is my outgoing transfer temporarily locked?</div>
            <p className="text-[#595959] mt-1 leading-relaxed">
              Outgoing wires and expedited third-party transfers require a standard security review under federal banking guidelines. There is no charge — the funds are temporarily held and released automatically once the review completes.
            </p>
          </div>
          <div className="py-3">
            <div className="font-bold text-[#1e1e1e]">How long do mobile check deposits take to clear?</div>
            <p className="text-[#595959] mt-1 leading-relaxed">
              Checks submitted through Wells Fargo Mobile Deposit® before 9:00 PM local time on a business day are typically available on the next business day.
            </p>
          </div>
          <div className="py-3">
            <div className="font-bold text-[#1e1e1e]">How do I freeze or unfreeze my Active Cash® card?</div>
            <p className="text-[#595959] mt-1 leading-relaxed">
              Navigate to "Security & Settings" in the top menu and toggle your card lock on or off at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

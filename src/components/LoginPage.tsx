import React, { useState } from 'react';
import {
  X,
  User,
  Key,
  Smartphone,
} from 'lucide-react';
import {
  LOGIN_USERNAME,
  LOGIN_PASSWORD,
  VALID_OTP_CODES,
} from '../constants';
import { getTimeGreeting } from '../utils/formatters';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveUsername, setSaveUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Time-aware greeting — matches the user's real local clock
  const greeting = getTimeGreeting();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      const cleanUser = username.trim().toLowerCase();
      if (cleanUser === LOGIN_USERNAME.toLowerCase() && password === LOGIN_PASSWORD) {
        setStep('otp');
        setOtp('');
        setOtpError(null);
      } else {
        setError('The username or password you entered does not match our records. Please try again.');
      }
    }, 500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    const code = otp.replace(/\D/g, '');
    if (code.length !== 6) {
      setOtpError('Please enter the 6-digit code sent to your registered phone.');
      return;
    }
    setOtpVerifying(true);
    window.setTimeout(() => {
      setOtpVerifying(false);
      if (VALID_OTP_CODES.includes(code)) {
        onLogin(LOGIN_USERNAME);
      } else {
        setOtpError('That security code is incorrect or expired. Please try again.');
        setOtp('');
      }
    }, 600);
  };

  const isFormFilled = username.trim().length > 0 && password.length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans text-[#1e1e1e] selection:bg-[#c8102e] selection:text-white">
      {/* 1. Header Bar: Rich Wells Fargo Red with Centered Serif Logo + Gold Stripe */}
      <header className="sticky top-0 z-50 shadow-xs">
        <div className="bg-[#BA0C2F] h-14 sm:h-16 px-4 sm:px-8 flex items-center justify-between relative">
          {/* Left spacer so title stays perfectly centered */}
          <div className="w-8 sm:w-10"></div>

          {/* Centered Bold Serif Logo */}
          <div className="text-center cursor-pointer select-none" onClick={() => setStep('credentials')}>
            <span className="text-white font-serif font-black tracking-[0.06em] text-xl sm:text-2xl drop-shadow-xs">
              WELLS FARGO
            </span>
          </div>

          {/* Right Hamburger Menu Icon */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-8 sm:w-10 flex items-center justify-end text-white hover:opacity-80 transition-opacity p-1 cursor-pointer"
            aria-label="Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <div className="space-y-1.5 w-6">
                <span className="block h-0.5 w-6 bg-white rounded-xs"></span>
                <span className="block h-0.5 w-6 bg-white rounded-xs"></span>
                <span className="block h-0.5 w-6 bg-white rounded-xs"></span>
              </div>
            )}
          </button>
        </div>

        {/* Thin Gold Line below Red Bar (Exact match to screenshot) */}
        <div className="h-[3px] bg-[#EAAA00] w-full"></div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="bg-[#BA0C2F] text-white border-t border-[#d84050] px-6 py-4 space-y-3 text-sm font-semibold shadow-lg animate-fade-in">
            <div className="flex justify-between items-center py-2 border-b border-white/20">
              <span>Personal Banking</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Active</span>
            </div>
            <div className="py-2 border-b border-white/20 hover:text-amber-200 cursor-pointer">
              Small Business
            </div>
            <div className="py-2 border-b border-white/20 hover:text-amber-200 cursor-pointer">
              Commercial &amp; Wealth Management
            </div>
            <div className="py-2 border-b border-white/20 hover:text-amber-200 cursor-pointer">
              Locations &amp; ATMs
            </div>
            <div className="py-2 hover:text-amber-200 cursor-pointer flex justify-between items-center">
              <span>Customer Service: 1-800-869-3557</span>
            </div>
          </div>
        )}
      </header>

      {/* 2. Main Login Area */}
      <main className="w-full max-w-[460px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-12 flex-1 flex flex-col justify-start">
        {step === 'credentials' ? (
          <div>
            {/* Greeting Header — updates with the user's real local time */}
            <h1 className="font-serif text-[38px] sm:text-[44px] font-normal text-[#1e1e1e] text-center my-6 sm:my-8 tracking-tight">
              {greeting}
            </h1>

            {/* Error Message if credentials fail */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-[#fef2f2] border border-[#fca5a5] text-[#991b1b] text-xs font-semibold leading-relaxed animate-fade-in">
                {error}
              </div>
            )}

            {/* Form Fields matching the screenshot */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input with pill-like rounded box */}
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                  required
                  className="w-full px-5 py-4 bg-white border border-[#595959] rounded-[18px] text-base text-[#1e1e1e] placeholder-[#595959] focus:outline-none focus:border-[#1e1e1e] focus:ring-1 focus:ring-[#1e1e1e] transition-colors"
                />
              </div>

              {/* Password Input with Show button inside */}
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-5 pr-20 py-4 bg-white border border-[#595959] rounded-[18px] text-base text-[#1e1e1e] placeholder-[#595959] focus:outline-none focus:border-[#1e1e1e] focus:ring-1 focus:ring-[#1e1e1e] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 text-sm font-bold text-[#1b4f8c] hover:underline cursor-pointer select-none"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Save Username Checkbox & Security Advice */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveUsername}
                    onChange={(e) => setSaveUsername(e.target.checked)}
                    className="w-5 h-5 rounded-xs border-2 border-[#595959] text-[#BA0C2F] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-base text-[#1e1e1e] font-normal">Save username</span>
                </label>
                <p className="text-[13px] text-[#4d4d4d] leading-snug mt-2">
                  To help keep your account secure, save your username only on devices that aren't used by other people.
                </p>
              </div>

              {/* Sign on Button (Pill shaped as in screenshot) */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 sm:py-4 rounded-full font-semibold text-base transition-all duration-200 cursor-pointer ${
                    isFormFilled
                      ? 'bg-[#BA0C2F] text-white hover:bg-[#990a26] shadow-sm'
                      : 'bg-[#e6e2dd] text-[#8c857b] hover:bg-[#dedad4]'
                  }`}
                >
                  {isLoading ? 'Signing on...' : 'Sign on'}
                </button>
              </div>

              {/* "or" Divider */}
              <div className="text-center text-sm text-[#4d4d4d] py-1">or</div>

              {/* "Use a passkey" Pill Button with user+key icon */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    // Passkey sign on — authenticates without exposing credentials
                    setStep('otp');
                  }}
                  className="w-full py-3 sm:py-3.5 rounded-full border border-[#1e1e1e] text-sm font-semibold text-[#1e1e1e] bg-white hover:bg-[#f8f8f8] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-0.5">
                    <User className="w-4 h-4 fill-current" />
                    <Key className="w-3.5 h-3.5 text-[#1e1e1e] -ml-1" />
                  </div>
                  <span>Use a passkey</span>
                </button>
                <p className="text-[13px] text-[#4d4d4d] text-center mt-3 leading-snug px-1">
                  Don't have one? Create a passkey after signing on and skip the password next time.
                </p>
              </div>

              {/* Forgot username or password link */}
              <div className="pt-6 pb-2 text-center">
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setError('To reset your credentials, please verify your mobile number or visit a Wells Fargo branch.');
                  }}
                  className="text-sm font-medium text-[#3b2c85] hover:underline inline-flex items-center gap-1.5"
                >
                  <span className="text-base">→</span>
                  <span>Forgot username or password?</span>
                </a>
              </div>
            </form>
          </div>
        ) : (
          /* Step 2: 2-Step OTP Verification (in matching clean Wells Fargo style) */
          <div className="pt-4 animate-fade-in">
            <h1 className="font-serif text-[32px] sm:text-[38px] font-normal text-[#1e1e1e] text-center my-4 tracking-tight">
              2-Step Verification
            </h1>

            <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-4 flex items-start gap-3 my-4">
              <Smartphone className="w-5 h-5 text-[#0284c7] shrink-0 mt-0.5" />
              <p className="text-xs text-[#0c4a6e] leading-relaxed">
                We sent a 6-digit one-time security code to your registered mobile device ending in <strong>••4821</strong>.
              </p>
            </div>

            {otpError && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#fef2f2] border border-[#fca5a5] text-[#991b1b] text-xs font-semibold">
                {otpError}
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-[#595959] uppercase tracking-wider block mb-1.5 text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="w-full px-4 py-3.5 bg-white border border-[#595959] rounded-[18px] text-center text-3xl font-mono font-bold tracking-[0.4em] text-[#1e1e1e] focus:outline-none focus:border-[#1e1e1e] focus:ring-1 focus:ring-[#1e1e1e]"
                />
                <p className="text-[11px] text-[#737373] text-center mt-2">
                  Your code expires in 10 minutes. Never share it with anyone.
                </p>
              </div>

              <button
                type="submit"
                disabled={otpVerifying}
                className="w-full py-3.5 sm:py-4 rounded-full font-semibold text-base bg-[#BA0C2F] text-white hover:bg-[#990a26] transition-colors cursor-pointer shadow-sm"
              >
                {otpVerifying ? 'Verifying...' : 'Verify and continue'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtp(''); setOtpError(null); }}
                  className="text-[#4d4d4d] hover:underline font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setOtpError('A new code has been sent.')}
                  className="text-[#1b4f8c] hover:underline font-semibold"
                >
                  Resend code
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. "Investment and Insurance Products are:" Box (Exact match to screenshot) */}
        <div className="mt-12 border border-[#8c857b]/50 p-5 sm:p-6 bg-white">
          <h2 className="font-sans font-bold text-[17px] text-[#1e1e1e] mb-4 leading-snug">
            Investment and Insurance Products are:
          </h2>
          <ul className="space-y-3.5 text-sm sm:text-[14.5px] font-bold text-[#1e1e1e] leading-snug">
            <li className="flex items-start gap-2.5">
              <span className="inline-block w-1.5 h-1.5 bg-[#1e1e1e] mt-1.5 shrink-0"></span>
              <span>Not Insured by the FDIC or Any Federal Government Agency</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="inline-block w-1.5 h-1.5 bg-[#1e1e1e] mt-1.5 shrink-0"></span>
              <span>Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="inline-block w-1.5 h-1.5 bg-[#1e1e1e] mt-1.5 shrink-0"></span>
              <span>Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested</span>
            </li>
          </ul>
        </div>

        {/* Disclaimer text below the box */}
        <p className="text-sm sm:text-[14.5px] text-[#1e1e1e] my-4 leading-normal">
          Deposit products offered by Wells Fargo Bank, N.A. Member FDIC.
        </p>
      </main>

      {/* 4. Footer Section (Exact match to screenshot) */}
      <footer className="bg-[#f4f0eb] border-t border-[#e0dad1] pt-8 pb-12 px-6 sm:px-10 text-xs sm:text-[13px] text-[#1e1e1e]">
        <div className="max-w-[800px] mx-auto space-y-6">
          {/* Two-Column Footer Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 font-normal leading-relaxed">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <a href="#about" onClick={(e) => e.preventDefault()} className="hover:underline">
                  About Wells Fargo
                </a>
              </div>
              <div>
                <a href="#agreement" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Online Access Agreement
                </a>
              </div>
              <div>
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Privacy, Cookies, Security &amp; Legal
                </a>
              </div>
              <div>
                <a href="#do-not-sell" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Do not sell or share my personal information
                </a>
              </div>
              <div>
                <a href="#data-collection" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Notice of Data Collection
                </a>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <a href="#fraud" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Report Email Fraud
                </a>
              </div>
              <div>
                <a href="#security" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Security Center
                </a>
              </div>
              <div>
                <a href="#sitemap" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Sitemap
                </a>
              </div>
              <div>
                <a href="#feedback" onClick={(e) => e.preventDefault()} className="hover:underline">
                  Give Us Feedback
                </a>
              </div>
            </div>
          </div>

          {/* Thin separator line and Copyright / NMLSR info */}
          <div className="border-t border-[#d8d2c9] pt-4 text-xs text-[#595959]">
            © 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801
          </div>
        </div>
      </footer>
    </div>
  );
};

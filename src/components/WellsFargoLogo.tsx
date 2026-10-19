import React from 'react';

interface WellsFargoLogoProps {
  className?: string;
  size?: number;
  variant?: 'red-gold' | 'white' | 'dark';
}

export const WellsFargoLogo: React.FC<WellsFargoLogoProps> = ({
  className = "h-8",
  size = 32,
  variant = 'red-gold'
}) => {
  if (variant === 'white') {
    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        <div className="bg-[#D71E28] text-white font-serif font-black px-2 py-0.5 rounded-sm tracking-wider text-xs border border-white/20 shadow-sm flex items-center justify-center min-w-[28px] h-7">
          WF
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-white font-serif font-black tracking-tight text-base sm:text-lg">
            WELLS FARGO
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Wells Fargo Iconic Red Stagecoach Icon Badge */}
      <div 
        style={{ width: size, height: size }} 
        className="bg-[#D71E28] rounded-sm shadow flex items-center justify-center p-1 relative overflow-hidden shrink-0 border border-[#b3141d]"
      >
        <span className="text-[#FFCC00] font-serif font-black text-sm tracking-tighter">
          WF
        </span>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FFCC00]"></div>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[#D71E28] font-serif font-extrabold tracking-tight text-lg sm:text-xl">
          WELLS <span className="text-[#B3141D]">FARGO</span>
        </span>
      </div>
    </div>
  );
};

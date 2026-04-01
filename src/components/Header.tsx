import React from 'react';
import { ArrowLeft, Sparkles, History, Info, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  title: string;
  version: string;
  subtitle: string;
  logoSrc?: string;
  onBack?: () => void;
  onHistory?: () => void;
  onInfo?: () => void;
  onSettings?: () => void;
  showBack?: boolean;
  showSettings?: boolean;
  hasHistoryData?: boolean;
  isSettingsActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  version,
  subtitle,
  logoSrc,
  onBack,
  onHistory,
  onInfo,
  onSettings,
  showBack = false,
  showSettings = true,
  hasHistoryData = false,
  isSettingsActive = false,
}) => {
  return (
    <header className="sticky top-0 z-[100] h-16 w-full bg-violet-800/95 backdrop-blur-md text-white shadow-lg transition-all">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Left Section: Branding */}
        <div className="flex items-center gap-3 overflow-hidden">
          {showBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
          )}

          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 shadow-inner overflow-hidden">
              {logoSrc ? (
                <img 
                  src={logoSrc} 
                  alt="Logo" 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="font-black text-lg">NN</div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white shadow-sm">
              <Sparkles className="h-2.5 w-2.5 text-violet-800" />
            </div>
          </div>

          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-black uppercase tracking-tight leading-none">
                {title}
              </h1>
              <span className="flex-shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
                {version}
              </span>
            </div>
            <p className="truncate text-[10px] font-medium text-white/70 mt-0.5">
              <span className="hidden sm:inline">{subtitle}</span>
              <span className="sm:hidden">by Nhân Nhân</span>
            </p>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onHistory}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            aria-label="History"
          >
            <History className="h-5 w-5" />
            {hasHistoryData && (
              <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onInfo}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            aria-label="Information"
          >
            <Info className="h-5 w-5" />
          </motion.button>

          {showSettings && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettings}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                isSettingsActive ? 'bg-white text-violet-800 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              aria-label="Settings"
            >
              <Settings className={`h-5 w-5 ${isSettingsActive ? 'rotate-90' : ''} transition-transform duration-500`} />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};

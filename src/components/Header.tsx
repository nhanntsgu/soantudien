import React from 'react';
import { ArrowLeft, Sparkles, History, Info, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
  historyCount?: number;
  apiKeyStatus: 'valid' | 'invalid' | 'checking' | 'empty';
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
  historyCount = 0,
  apiKeyStatus = 'empty',
}) => {
  return (
    <header className="sticky top-0 z-[100] h-16 w-full bg-blue-800 text-white shadow-lg transition-all">
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
              <Sparkles className="h-2.5 w-2.5 text-blue-800" />
            </div>
          </div>

          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-black uppercase tracking-tight leading-none pt-2 pb-0">
                {title}
              </h1>
              <span className="flex-shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 pb-[3px] text-[8px] font-bold text-white backdrop-blur-sm">
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
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* History Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onHistory}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10"
            title="Lịch sử gần đây (Recent History)"
            aria-label="History"
          >
            <History className="h-5 w-5" />
            {hasHistoryData && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-[10px] font-extrabold text-blue-950 shadow-md border-2 border-blue-800">
                {historyCount > 0 ? (historyCount > 9 ? '9+' : historyCount) : ''}
              </span>
            )}
          </motion.button>

          {/* App Info Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onInfo}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10"
            title="Thông tin ứng dụng & Nhật ký thay đổi"
            aria-label="Information"
          >
            <Info className="h-5 w-5" />
          </motion.button>

          {/* Settings Button */}
          {showSettings && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettings}
              className={`flex h-10 items-center justify-center gap-2 rounded-xl px-3 transition-all ${
                apiKeyStatus === 'valid'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md'
                  : apiKeyStatus === 'checking'
                  ? 'bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-md'
                  : 'bg-red-600 hover:bg-red-500 text-white font-bold shadow-md'
              }`}
              title="Cấu hình API Key"
              aria-label="Config API Key"
            >
              <Key className="h-4.5 w-4.5 flex-shrink-0" />
              <span className="text-xs font-bold hidden md:inline">
                {apiKeyStatus === 'valid' && 'API: Hoạt động'}
                {apiKeyStatus === 'checking' && 'API: Kiểm tra...'}
                {apiKeyStatus === 'invalid' && 'API: Lỗi key'}
                {apiKeyStatus === 'empty' && 'API: Chưa có key'}
              </span>
              <span className="text-xs font-bold md:hidden">
                {apiKeyStatus === 'valid' && 'API'}
                {apiKeyStatus === 'checking' && '...'}
                {apiKeyStatus === 'invalid' && 'Lỗi'}
                {apiKeyStatus === 'empty' && 'Key'}
              </span>
              {apiKeyStatus === 'valid' && <CheckCircle2 className="h-3.5 w-3.5" />}
              {(apiKeyStatus === 'invalid' || apiKeyStatus === 'empty') && <AlertCircle className="h-3.5 w-3.5" />}
              {apiKeyStatus === 'checking' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};

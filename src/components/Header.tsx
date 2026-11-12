import React from 'react';
import { History, Info, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  version?: string;
  subtitle?: string;
  logoSrc?: string;
  onBack?: () => void;
  onHistory?: () => void;
  onInfo?: () => void;
  onSettings?: () => void;
  lang?: 'vi' | 'en';
  showBack?: boolean;
  showSettings?: boolean;
  hasHistoryData?: boolean;
  historyCount?: number;
  apiKeyStatus: 'valid' | 'invalid' | 'checking' | 'empty';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  logoSrc,
  onHistory,
  onInfo,
  onSettings,
  lang = 'vi',
  showSettings = true,
  historyCount = 0,
  apiKeyStatus = 'empty',
}) => {
  return (
    <header className="shrink-0 z-40 w-full bg-[#1E40AF] text-white border-b border-blue-900/50 shadow-xs">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between gap-4 px-3 sm:px-5 lg:px-6">
        {/* Zone 1: Brand Wordmark (single-line) */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-blue-300/30 bg-white/10 overflow-hidden shrink-0">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Logo trường THCS Tùng Thiện Vương"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="font-bold text-xs text-white">NN</span>
            )}
          </div>
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-white">
            {title}
          </span>
          <span className="hidden xl:inline-block text-xs text-blue-100/90 font-medium pl-2.5 border-l border-blue-400/40">
            Thầy Nhân Nhân · THCS Tùng Thiện Vương, TP.HCM
          </span>
        </div>

        {/* Zone 2: Concise single-line Navigation Links */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs font-semibold text-blue-100">
          <button
            type="button"
            onClick={onHistory}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
          >
            <History className="h-3.5 w-3.5 text-blue-200" />
            <span>
              {lang === 'vi' ? 'Kho đề đã lưu' : 'Saved'}
              {historyCount > 0 ? ` (${historyCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={onInfo}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
          >
            <Info className="h-3.5 w-3.5 text-blue-200" />
            <span className="hidden sm:inline">
              {lang === 'vi' ? 'Thông tin & Phiên bản' : 'About & Changelog'}
            </span>
            <span className="sm:hidden">{lang === 'vi' ? 'Thông tin' : 'Info'}</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (API Configuration & Status) */}
        <div className="flex items-center shrink-0">
          {showSettings && (
            <button
              type="button"
              onClick={onSettings}
              className={`flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                apiKeyStatus === 'valid'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
                  : apiKeyStatus === 'checking'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
              title={lang === 'vi' ? 'Cấu hình kết nối AI' : 'Configure AI Connection'}
            >
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span>
                {apiKeyStatus === 'valid' && (lang === 'vi' ? 'AI · Sẵn sàng' : 'AI · Ready')}
                {apiKeyStatus === 'checking' && (lang === 'vi' ? 'AI · Kiểm tra' : 'AI · Checking')}
                {apiKeyStatus === 'invalid' && (lang === 'vi' ? 'AI · Lỗi kết nối' : 'AI · Error')}
                {apiKeyStatus === 'empty' && (lang === 'vi' ? 'AI · Chưa có key' : 'AI · Missing')}
              </span>
              {apiKeyStatus === 'valid' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
              {(apiKeyStatus === 'invalid' || apiKeyStatus === 'empty') && (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              )}
              {apiKeyStatus === 'checking' && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

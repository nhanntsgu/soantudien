import React from 'react';
import { History, Info, Key, CheckCircle2, AlertCircle, Loader2, Globe } from 'lucide-react';

interface HeaderProps {
  title: string;
  version?: string;
  subtitle?: string;
  logoSrc?: string;
  onBack?: () => void;
  onHistory?: () => void;
  onInfo?: () => void;
  onSettings?: () => void;
  onToggleLang?: () => void;
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
  onToggleLang,
  lang = 'vi',
  showSettings = true,
  historyCount = 0,
  apiKeyStatus = 'empty',
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F172A] text-white border-b border-slate-800">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (single-line) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 overflow-hidden shrink-0">
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
              <span className="font-bold text-sm text-white">NN</span>
            )}
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-blue-200 transition-colors">
            {title}
          </span>
        </a>

        {/* Zone 2: Concise single-line Navigation Links */}
        <nav className="flex items-center gap-5 sm:gap-7 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={onHistory}
            className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 border-transparent hover:border-blue-400"
          >
            <History className="h-4 w-4 text-slate-400" />
            <span>
              {lang === 'vi' ? 'Kho đề đã lưu' : 'Saved Exercises'}
              {historyCount > 0 ? ` (${historyCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={onInfo}
            className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 border-transparent hover:border-blue-400"
          >
            <Info className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">
              {lang === 'vi' ? 'Thông tin & Phiên bản' : 'About & Changelog'}
            </span>
            <span className="sm:hidden">{lang === 'vi' ? 'Thông tin' : 'Info'}</span>
          </button>

          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 border-b-2 border-transparent hover:border-blue-400"
              title={lang === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
            >
              <Globe className="h-4 w-4 text-slate-400" />
              <span>{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action (API Configuration & Status) */}
        <div className="flex items-center shrink-0">
          {showSettings && (
            <button
              type="button"
              onClick={onSettings}
              className={`flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                apiKeyStatus === 'valid'
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  : apiKeyStatus === 'checking'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-red-700 hover:bg-red-600 text-white'
              }`}
              title={lang === 'vi' ? 'Cấu hình kết nối AI' : 'Configure AI Connection'}
            >
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span>
                {apiKeyStatus === 'valid' && (lang === 'vi' ? 'Cấu hình AI · Sẵn sàng' : 'AI Config · Ready')}
                {apiKeyStatus === 'checking' && (lang === 'vi' ? 'Cấu hình AI · Kiểm tra' : 'AI Config · Checking')}
                {apiKeyStatus === 'invalid' && (lang === 'vi' ? 'Cấu hình AI · Lỗi kết nối' : 'AI Config · Error')}
                {apiKeyStatus === 'empty' && (lang === 'vi' ? 'Cấu hình AI · Chưa có key' : 'AI Config · Missing')}
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

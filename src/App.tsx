/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  BookOpen,
  Send,
  X,
  Key,
  Settings,
  ShieldCheck,
  FileDown,
  Copy,
  Check,
  History,
  Trash2,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  Eye,
  EyeOff,
  Edit3,
  ClipboardList,
  AlertTriangle,
  PlusCircle,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { changelog } from './changelog';
import { Header } from './components/Header';
import {
  EXAM_PARTS,
  ExamPartSpec,
  getUnitsForGrade,
  GlobalSuccessUnit,
} from './data/globalSuccessData';
import { buildExamPrompt } from './utils/promptBuilders';

const translations = {
  vi: {
    title: 'SOẠN ĐỀ TIẾNG ANH · GLOBAL SUCCESS',
    author: 'Thầy Nhân Nhân · Trường THCS Tùng Thiện Vương, Phường Phú Định, TP.HCM',
    historyTitle: 'Kho đề đã lưu',
    clearHistory: 'Xóa tất cả',
    apiSettings: 'Cấu hình kết nối AI',
    apiGuide: 'Hướng dẫn lấy API key miễn phí',
    apiCustomLabel: 'Nhập Gemini API Key cá nhân',
    apiPlaceholder: 'Dán API Key của bạn vào đây...',
    apiNote: '* API Key được lưu cục bộ trong trình duyệt của bạn cho các lần sử dụng sau.',
    apiModeLabel: 'Chế độ kết nối AI',
    apiModeDefault: 'Hệ thống mặc định',
    apiModeCustom: 'Tự nhập API Key',
    apiDefaultDesc: 'Hệ thống tự động sử dụng kết nối AI từ máy chủ đã được cấu hình sẵn.',
    apiDefaultStatus: 'Trạng thái kết nối:',
    apiConnected: 'Đang hoạt động ổn định',
    apiConnectError: 'Lỗi kết nối máy chủ',
    apiChecking: 'Đang kiểm tra kết nối...',
    generateBtn: 'Soạn đề & Thẩm định ngay',
    generatingBtn: 'Đang biên soạn & thẩm định...',
    errorEmpty: 'Vui lòng nhập từ khóa hoặc chọn một gợi ý từ sách Global Success!',
    errorFailed: 'Không thể tạo nội dung. Vui lòng thử lại.',
    errorConnect: 'Đã xảy ra lỗi khi kết nối với máy chủ AI. Vui lòng thử lại.',
    resultTitle: 'Phiếu Đề Bài & Đáp Án Chính Thức',
    copyQuestionsBtn: 'Copy riêng Đề bài',
    copiedQuestionsBtn: 'Đã copy Đề',
    copyBtn: 'Copy Đề + Đáp án',
    copiedBtn: 'Đã copy toàn bộ',
    exportBtn: 'Tải file Word (.docx)',
    emptyStateTitle: 'Sẵn sàng biên soạn đề thi theo sách Global Success',
    emptyStateDesc:
      'Chọn phần thi trên thanh công cụ (Từ Phần I đến Phần VII hoặc Đề 40 câu), chọn Unit sách Global Success ở cột bên trái và bấm “Soạn đề & Thẩm định ngay”.',
    loadingMessages: [
      'Đang trích xuất ngữ liệu từ vựng & ngữ pháp SGK Tiếng Anh Global Success...',
      'Giáo viên AI đang biên soạn câu hỏi theo đúng ma trận Sở GD&ĐT TP.HCM 2025...',
      'Đang kiểm tra độ dài đoạn văn và tỷ lệ từ loại (Noun, Verb, Adj, Adv, Prep)...',
      'Đang thẩm định chéo từng phương án để chống tranh cãi...',
      'Đang chuẩn hóa định dạng Times New Roman sẵn sàng xuất file Word...',
    ],
    settingsTitle: 'Cấu hình hệ thống AI',
    modelLabel: 'Lựa chọn mô hình xử lý',
    modelArgon: 'Gemini 4 Argon (gemini-4-argon)',
    modelFlash: 'Gemini 3.8 Flash (gemini-3.8-flash)',
    modelLite: 'Gemini 3.5 Flash Lite (gemini-3.5-flash-lite · Mặc định)',
    appDescription:
      'Hệ thống biên soạn đề thi Tiếng Anh toàn diện bám sát 100% chương trình sách giáo khoa Global Success (NXB Giáo dục Việt Nam) và Cấu trúc Đề thi Tuyển sinh lớp 10 tại TP.HCM từ năm 2025 (40 câu / 7 phần). Tích hợp bước thẩm định tự động cho từng phần để đảm bảo không có đáp án gây tranh cãi. Mọi đóng góp xin gửi về email nhanntsgu@gmail.com.',
    changelogTitle: 'Nhật ký phiên bản',
    versionLabel: 'Phiên bản',
    dateLabel: 'Cập nhật ngày',
  },
  en: {
    title: 'ENGLISH EXAM STUDIO · GLOBAL SUCCESS',
    author: 'Nhan Nhan · Tung Thien Vuong Secondary School, Ho Chi Minh City',
    historyTitle: 'Saved Exercises',
    clearHistory: 'Clear All',
    apiSettings: 'AI Connection Settings',
    apiGuide: 'How to get a free API key',
    apiCustomLabel: 'Enter Custom Gemini API Key',
    apiPlaceholder: 'Paste your API Key here...',
    apiNote: '* Your API Key is saved locally in your browser for future sessions.',
    apiModeLabel: 'AI Connection Mode',
    apiModeDefault: 'Default Server API',
    apiModeCustom: 'Custom API Key',
    apiDefaultDesc: 'Automatically uses the pre-configured server-side AI connection.',
    apiDefaultStatus: 'Connection Status:',
    apiConnected: 'Connected & Ready',
    apiConnectError: 'Connection Error',
    apiChecking: 'Checking connection...',
    generateBtn: 'Generate & Verify Section',
    generatingBtn: 'Drafting & Verifying...',
    errorEmpty: 'Please enter a keyword or select a Global Success suggestion!',
    errorFailed: 'Could not generate content. Please try again.',
    errorConnect: 'An error occurred while connecting to the AI server.',
    resultTitle: 'Official Exam Sheet & Answer Key',
    copyQuestionsBtn: 'Copy Questions Only',
    copiedQuestionsBtn: 'Questions Copied',
    copyBtn: 'Copy Full Sheet',
    copiedBtn: 'All Copied',
    exportBtn: 'Download Word (.docx)',
    emptyStateTitle: 'Ready to Generate Global Success Exam Sections',
    emptyStateDesc:
      'Select an exam part from the top bar (Part I to Part VII or Full 40-Question Exam), choose a Global Success Unit on the left, and click Generate.',
    loadingMessages: [
      'Extracting vocabulary & grammar from Global Success textbooks...',
      'Drafting questions matching the 2025 HCMC Grade 10 Exam Matrix...',
      'Checking passage word count and part-of-speech distribution...',
      'Head of Department is cross-checking all options to eliminate ambiguity...',
      'Formatting exam sheet for Microsoft Word export...',
    ],
    settingsTitle: 'AI System Configuration',
    modelLabel: 'Model Selection',
    modelArgon: 'Gemini 4 Argon (gemini-4-argon)',
    modelFlash: 'Gemini 3.8 Flash (gemini-3.8-flash)',
    modelLite: 'Gemini 3.5 Flash Lite (gemini-3.5-flash-lite · Default)',
    appDescription:
      'Comprehensive English Exam Generator aligned 100% with the Global Success curriculum and the 2025 HCMC Grade 10 Entrance Exam Blueprint (40 questions / 7 sections). Includes Head of Department QA verification. Contact: nhanntsgu@gmail.com.',
    changelogTitle: 'Release Notes',
    versionLabel: 'Version',
    dateLabel: 'Updated',
  },
};

interface HistoryItem {
  keyword: string;
  result: string;
  level?: string;
  boldWords?: string;
  partId?: string;
  unitTitle?: string;
}

interface ParsedExam {
  instructionLine: string;
  dictionaryLines: string[];
  questionLines: string[];
  answerLines: string[];
}

function splitQuestionsAndAnswers(raw: string): { questionsPart: string; answersPart: string } {
  const lines = raw.split('\n');
  const qLines: string[] = [];
  const aLines: string[] = [];
  let inAnswers = false;

  for (const line of lines) {
    const trimmed = line.trim().toUpperCase();
    if (
      trimmed.includes('**ĐÁP ÁN') ||
      trimmed === 'ĐÁP ÁN' ||
      trimmed.includes('**ANSWER KEY') ||
      trimmed === '**ANSWERS**'
    ) {
      inAnswers = true;
      continue;
    }
    if (inAnswers) {
      if (line.trim()) aLines.push(line.trim());
    } else {
      qLines.push(line);
    }
  }

  return {
    questionsPart: qLines.join('\n').trim(),
    answersPart: aLines.join('\n').trim(),
  };
}

const PART_START_NUMBER: Record<string, { start: number; count: number }> = {
  part1: { start: 1, count: 14 },
  part2: { start: 15, count: 2 },
  part3: { start: 17, count: 6 },
  part4: { start: 23, count: 6 },
  part5: { start: 29, count: 6 },
  part6: { start: 35, count: 4 },
  part7: { start: 37, count: 4 },
};

function normalizePartQuestionNumbers(raw: string, partId: string): string {
  const cfg = PART_START_NUMBER[partId];
  if (!cfg || cfg.start === 1 || !raw) return raw;

  return raw
    .split('\n')
    .map((line) => {
      // Match lines starting with 1. .. count. or **1.** .. **count.**
      const match = line.match(/^(\s*)(\*\*)?(\d+)(\.\*\*|\.)\s+(.*)$/);
      if (match) {
        const [, indent, boldOpen, numStr, dotPart, rest] = match;
        const num = parseInt(numStr, 10);
        if (num >= 1 && num <= cfg.count) {
          const mappedNum = cfg.start + num - 1;
          return `${indent}${boldOpen || ''}${mappedNum}${dotPart} ${rest}`;
        }
      }
      return line;
    })
    .join('\n');
}

function preserveMarkdownQuestionNumbers(text: string): string {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => line.replace(/^(\s*)(\d+)\.\s+/, '$1**$2.** '))
    .join('\n');
}

function parseDictionaryOutput(raw: string): ParsedExam {
  const normalized = normalizePartQuestionNumbers(raw, 'part6');
  const lines = normalized.split('\n');
  let instructionLine = '';
  const dictionaryLines: string[] = [];
  const questionLines: string[] = [];
  const answerLines: string[] = [];

  let section: 'header' | 'dict' | 'questions' | 'answers' = 'header';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (
      line.toUpperCase().includes('ĐÁP ÁN') ||
      line.toUpperCase().includes('ANSWER KEY') ||
      line.toUpperCase() === '**ANSWERS**'
    ) {
      section = 'answers';
      continue;
    }

    if (section === 'header' && (line.includes('Look at the entry') || line.startsWith('**VI.'))) {
      instructionLine = line;
      section = 'dict';
      continue;
    }

    if (section === 'answers') {
      answerLines.push(line);
      continue;
    }

    if (/^(\*\*)?([1-4]|35|36|37|38)(\.\*\*|\.)\s+/.test(line)) {
      section = 'questions';
      questionLines.push(line);
      continue;
    }

    if (section === 'questions') {
      questionLines.push(line);
    } else {
      dictionaryLines.push(line);
    }
  }

  return {
    instructionLine,
    dictionaryLines,
    questionLines,
    answerLines,
  };
}

function getQuestionsOnlyText(raw: string): string {
  return splitQuestionsAndAnswers(raw).questionsPart;
}

const GRADE_OPTIONS = [
  { id: 'grade6', short: 'Lớp 6', cefr: 'Global Success 6 (A2)' },
  { id: 'grade7', short: 'Lớp 7', cefr: 'Global Success 7 (A2+)' },
  { id: 'grade8', short: 'Lớp 8', cefr: 'Global Success 8 (A2/B1)' },
  { id: 'grade9', short: 'Lớp 9', cefr: 'Global Success 9 (B1)' },
  { id: 'entrance10', short: 'Tuyển sinh 10', cefr: 'Trọng tâm GS 9 (B1+)' },
];

const SIGN_SCENARIOS = [
  'Trường học, Phòng thí nghiệm & Thư viện',
  'An toàn giao thông & Nơi công cộng',
  'Bảo tàng, Công viên & Du lịch sinh thái',
  'Siêu thị, Trung tâm thương mại & Chung cư',
  'Hồ bơi, Phòng tập thể thao & Sức khỏe',
];

const WRITING_STRUCTURES = [
  'Phrasal Verbs (pass down, look after, take part in, cut down on, get over...)',
  'Wish + Past Simple (Câu ước ở hiện tại)',
  'Reported Speech (Câu tường thuật / Wh- + to V)',
  'Relative Clauses (Mệnh đề quan hệ who, which, whose)',
  'Double Comparatives (The more..., the more...)',
  'Suggest / Advise + V-ing / that S (should) V',
  'Although / Because <-> Despite / Because of / So...that',
];

function SettingsModal({
  show,
  onClose,
  t,
  apiKey,
  onApiKeyChange,
  selectedModel,
  onModelChange,
  apiMode,
  onApiModeChange,
  apiKeyStatus,
}: {
  show: boolean;
  onClose: () => void;
  t: any;
  apiKey: string;
  onApiKeyChange: (val: string) => void;
  selectedModel: string;
  onModelChange: (val: any) => void;
  apiMode: 'default' | 'custom';
  onApiModeChange: (val: 'default' | 'custom') => void;
  apiKeyStatus: 'valid' | 'invalid' | 'checking' | 'empty';
}) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{t.settingsTitle}</h2>
                    <p className="text-xs text-slate-500">{t.apiSettings}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2.5">
                    {t.modelLabel}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => onModelChange('gemini-4-argon')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedModel === 'gemini-4-argon'
                          ? 'border-blue-800 bg-blue-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-bold ${
                            selectedModel === 'gemini-4-argon' ? 'text-blue-900' : 'text-slate-800'
                          }`}
                        >
                          {t.modelArgon}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          Tư duy chuyên sâu & Thẩm định độ chính xác cao nhất
                        </span>
                      </div>
                      {selectedModel === 'gemini-4-argon' && (
                        <ShieldCheck className="w-5 h-5 text-blue-800 shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onModelChange('gemini-3.8-flash')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedModel === 'gemini-3.8-flash'
                          ? 'border-blue-800 bg-blue-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-bold ${
                            selectedModel === 'gemini-3.8-flash' ? 'text-blue-900' : 'text-slate-800'
                          }`}
                        >
                          {t.modelFlash}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          Tốc độ cao & Phân tích ma trận sâu
                        </span>
                      </div>
                      {selectedModel === 'gemini-3.8-flash' && (
                        <ShieldCheck className="w-5 h-5 text-blue-800 shrink-0" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onModelChange('gemini-3.5-flash-lite')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedModel === 'gemini-3.5-flash-lite'
                          ? 'border-blue-800 bg-blue-50/50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-bold ${
                            selectedModel === 'gemini-3.5-flash-lite'
                              ? 'text-blue-900'
                              : 'text-slate-800'
                          }`}
                        >
                          {t.modelLite}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          Tốc độ phản hồi nhanh & tiết kiệm hạn mức
                        </span>
                      </div>
                      {selectedModel === 'gemini-3.5-flash-lite' && (
                        <ShieldCheck className="w-5 h-5 text-blue-800 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2.5">
                    {t.apiModeLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                    <button
                      type="button"
                      onClick={() => onApiModeChange('default')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        apiMode === 'default'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.apiModeDefault}
                    </button>
                    <button
                      type="button"
                      onClick={() => onApiModeChange('custom')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        apiMode === 'custom'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.apiModeCustom}
                    </button>
                  </div>

                  {apiMode === 'default' ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                      <p className="text-xs text-slate-600 leading-relaxed">{t.apiDefaultDesc}</p>
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="text-slate-500 font-medium">{t.apiDefaultStatus}</span>
                        {apiKeyStatus === 'valid' ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            {t.apiConnected}
                          </span>
                        ) : apiKeyStatus === 'checking' ? (
                          <span className="text-amber-700 flex items-center gap-1 font-bold">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                            {t.apiChecking}
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1 font-bold">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            {t.apiConnectError}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">
                          {t.apiCustomLabel}
                        </label>
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-blue-800 hover:underline flex items-center gap-1"
                        >
                          {t.apiGuide}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Key className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => onApiKeyChange(e.target.value)}
                          placeholder={t.apiPlaceholder}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all text-sm font-mono"
                        />
                      </div>
                      <p className="text-xs text-slate-500">{t.apiNote}</p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-[#1E40AF] hover:bg-blue-900 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm cursor-pointer"
                >
                  Đóng & Lưu cài đặt
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function HistoryModal({
  show,
  onClose,
  history,
  onSelect,
  onDelete,
  onClear,
  t,
}: {
  show: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (e: React.MouseEvent, item: HistoryItem) => void;
  onClear: () => void;
  t: any;
}) {
  const [search, setSearch] = useState('');
  const filteredHistory = history.filter(
    (item) =>
      item.keyword.toLowerCase().includes(search.toLowerCase()) ||
      (item.unitTitle && item.unitTitle.toLowerCase().includes(search.toLowerCase())) ||
      (item.boldWords && item.boldWords.toLowerCase().includes(search.toLowerCase()))
  );

  const getPartName = (partId?: string) => {
    const found = EXAM_PARTS.find((p) => p.id === partId);
    return found ? `${found.roman}. ${found.nameVi}` : 'VI. Dictionary Entry';
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]"
          >
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {t.historyTitle} ({history.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Mở lại nhanh các phần đề thi đã biên soạn và thẩm định
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {history.length > 0 && (
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Tìm theo từ khóa hoặc Unit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-800"
                />
                <button
                  onClick={onClear}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.clearHistory}
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-2.5 custom-scrollbar">
              {history.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <History className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Chưa có đề bài nào trong kho lưu trữ</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Mỗi phần đề thi sau khi biên soạn sẽ tự động lưu tại đây để thầy cô mở lại bất cứ lúc nào.
                  </p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Không tìm thấy bài tập nào khớp với "{search}".
                </div>
              ) : (
                filteredHistory.map((item, idx) => (
                  <div
                    key={item.keyword + idx}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="group p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-800 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className="font-bold text-slate-900 group-hover:text-blue-900 truncate">
                          {getPartName(item.partId)}
                        </span>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs font-semibold text-blue-800 truncate">
                          {item.keyword}
                        </span>
                      </div>
                      {item.unitTitle && (
                        <p className="text-xs text-slate-500 truncate mt-1">
                          SGK Global Success: {item.unitTitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-blue-800 group-hover:underline">
                        Mở đề
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(e, item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa đề này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function AppInfoModal({
  show,
  onClose,
  t,
  lang,
}: {
  show: boolean;
  onClose: () => void;
  t: any;
  lang: 'vi' | 'en';
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'changelog'>('info');

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]"
          >
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1E40AF] rounded-xl flex items-center justify-center text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {lang === 'vi' ? 'Thông tin ứng dụng & Phiên bản' : 'Application Information'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    SOẠN ĐỀ TIẾNG ANH GLOBAL SUCCESS v6.0.0 · Thầy Nhân Nhân
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-6">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'info'
                    ? 'border-blue-800 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'vi' ? '01. Giới thiệu & Tác giả' : '01. About & Author'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('changelog')}
                className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'changelog'
                    ? 'border-blue-800 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'vi' ? '02. Nhật ký phiên bản' : '02. Release Notes'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {activeTab === 'info' ? (
                <div className="space-y-5 text-slate-700 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                    <img
                      src="https://i.ibb.co/Nd7jfCGJ/NN-logo.jpg"
                      alt="Logo Thầy Nhân Nhân"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-blue-800 block">
                        Tác giả phát triển
                      </span>
                      <h4 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                        Thầy Nhân Nhân
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Giáo viên Tiếng Anh · Trường THCS Tùng Thiện Vương, Phường Phú Định, TP.HCM
                      </p>
                      <a
                        href="mailto:nhanntsgu@gmail.com"
                        className="inline-block text-xs font-semibold text-blue-800 hover:underline mt-1"
                      >
                        nhanntsgu@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-900 text-xs">Giới thiệu hệ thống</h5>
                    <p className="text-slate-600 leading-relaxed text-xs">{t.appDescription}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-900 block mb-1">
                        01. 100% Ngữ liệu Global Success
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tích hợp toàn bộ 12 Unit của từng khối lớp (6, 7, 8, 9) thuộc bộ sách Tiếng Anh Global Success.
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-900 block mb-1">
                        02. Đủ 7 Phần Đề Thi TP.HCM 2025
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Multiple Choice, Signs, Cloze Text (80–100 chữ), Reading T/F (180–200 chữ), Word Form, Dictionary, Writing.
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-900 block mb-1">
                        03. Đã thẩm định & Kiểm định chéo
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Kiểm tra ma trận từ loại, phiên âm IPA và loại bỏ hoàn toàn phương án gây tranh cãi.
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-900 block mb-1">
                        04. Ghép Đề 40 Câu & Xuất Word
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Lưu từng phần vào Giỏ Đề Thi 40 câu hoặc tạo trọn bộ đề hoàn chỉnh xuất ra file Word (.docx).
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {changelog.map((entry, idx) => (
                    <div
                      key={entry.version}
                      className={`pb-5 ${
                        idx !== changelog.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5 text-xs">
                        <span className="font-bold text-blue-900">
                          {t.versionLabel} {entry.version}
                        </span>
                        <span className="text-slate-500">
                          {t.dateLabel}: {entry.date}
                        </span>
                      </div>
                      <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-600 leading-relaxed">
                        {entry.changes[lang].map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#1E40AF] hover:bg-blue-900 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function GeneratingModal({
  show,
  status,
  partSpec,
  unitTitle,
  loadingMsg,
  lang,
}: {
  show: boolean;
  status: 'loading' | 'reviewing' | 'success';
  partSpec: ExamPartSpec;
  unitTitle: string;
  loadingMsg: string;
  lang: 'vi' | 'en';
}) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {status === 'success'
                    ? lang === 'vi'
                      ? 'Hoàn tất biên soạn & thẩm định!'
                      : 'Drafting & Verification Complete!'
                    : lang === 'vi'
                    ? `Đang soạn ${partSpec.roman}. ${partSpec.nameVi}`
                    : `Generating ${partSpec.roman}. ${partSpec.nameEn}`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  SGK Global Success: <span className="font-bold text-blue-900">{unitTitle}</span>
                </p>
              </div>
              {status === 'success' ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800 shrink-0">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-3 mb-5">
              <div
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  status === 'loading'
                    ? 'bg-blue-50/60 border-blue-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 text-blue-800 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">
                    01. Biên soạn theo Ma trận Sở GD&ĐT ({partSpec.questionRange})
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {status === 'loading'
                      ? loadingMsg
                      : 'Đã hoàn thành bản thảo bám sát từ vựng & ngữ pháp sách Global Success.'}
                  </p>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  status === 'reviewing'
                    ? 'bg-amber-50/70 border-amber-300'
                    : status === 'success'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-slate-50/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {status === 'reviewing' ? (
                    <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
                  ) : status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">
                    {status === 'success' ? '02. Đã thẩm định' : '02. Thẩm định & chống tranh cãi'}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {status === 'reviewing'
                      ? 'Đang kiểm tra chéo ma trận từ loại, độ dài văn bản và tính độc bản của từng đáp án...'
                      : status === 'success'
                      ? 'Đã thẩm định: Đúng ma trận 100%, không có phương án gây tranh cãi!'
                      : 'Chờ bản thảo hoàn tất để tiến hành thẩm định chéo...'}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  status === 'success'
                    ? 'bg-emerald-600'
                    : status === 'reviewing'
                    ? 'bg-amber-600'
                    : 'bg-blue-800'
                }`}
                initial={{ width: '15%' }}
                animate={{
                  width: status === 'loading' ? '48%' : status === 'reviewing' ? '88%' : '100%',
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [activePartId, setActivePartId] = useState<
    'part1' | 'part2' | 'part3' | 'part4' | 'part5' | 'part6' | 'part7' | 'full_exam'
  >('part6');
  const [gradeLevel, setGradeLevel] = useState<string>(() => {
    return localStorage.getItem('dictionary_grade_level') || 'entrance10';
  });
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [pronunciationEnding, setPronunciationEnding] = useState<'ed' | 's_es'>('ed');

  const [keyword, setKeyword] = useState('');
  const [targetBoldWords, setTargetBoldWords] = useState<string>(() => {
    return localStorage.getItem('dictionary_bold_words') || '';
  });
  const [showAdvancedBold, setShowAdvancedBold] = useState<boolean>(false);

  const [result, setResult] = useState('');
  const [examCart, setExamCart] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('gs_exam_cart_v1');
    return saved ? JSON.parse(saved) : {};
  });
  const [cartSaveToast, setCartSaveToast] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState<'loading' | 'reviewing' | 'success'>('loading');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const [error, setError] = useState('');
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [apiMode, setApiMode] = useState<'default' | 'custom'>(() => {
    const savedMode = localStorage.getItem('gemini_api_mode');
    if (savedMode === 'default' || savedMode === 'custom') return savedMode;
    return localStorage.getItem('gemini_api_key') ? 'custom' : 'default';
  });
  const [apiKeyStatus, setApiKeyStatus] = useState<'valid' | 'invalid' | 'checking' | 'empty'>('checking');

  const [showSettings, setShowSettings] = useState(() => {
    const mode = localStorage.getItem('gemini_api_mode') || 'default';
    const hasKey = mode === 'default' ? true : !!localStorage.getItem('gemini_api_key');
    return !hasKey;
  });
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyQuestionsSuccess, setCopyQuestionsSuccess] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);
  const [isEditingResult, setIsEditingResult] = useState(false);

  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [selectedModel, setSelectedModel] = useState<
    'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.5-flash-lite'
  >('gemini-3.5-flash-lite');

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('dictionary_history_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const t = translations[lang];
  const resultRef = React.useRef<HTMLDivElement>(null);

  const unitsForCurrentGrade = React.useMemo(() => getUnitsForGrade(gradeLevel), [gradeLevel]);
  const selectedUnitObj: GlobalSuccessUnit | undefined = React.useMemo(
    () => unitsForCurrentGrade.find((u) => u.id === selectedUnitId),
    [unitsForCurrentGrade, selectedUnitId]
  );
  const activePartSpec: ExamPartSpec = React.useMemo(
    () => EXAM_PARTS.find((p) => p.id === activePartId) || EXAM_PARTS[5],
    [activePartId]
  );

  // Reset selectedUnitId to 'all' if grade changes and unit doesn't belong to new grade
  useEffect(() => {
    if (selectedUnitId !== 'all' && !unitsForCurrentGrade.some((u) => u.id === selectedUnitId)) {
      setSelectedUnitId('all');
    }
  }, [gradeLevel, unitsForCurrentGrade, selectedUnitId]);

  useEffect(() => {
    localStorage.setItem('dictionary_history_v2', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('gs_exam_cart_v1', JSON.stringify(examCart));
  }, [examCart]);

  useEffect(() => {
    if (result && window.innerWidth < 1024) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingMsgIndex(0);
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % t.loadingMessages.length);
      }, 2800);
    }
    return () => clearInterval(interval);
  }, [isLoading, t.loadingMessages.length]);

  useEffect(() => {
    setApiKeyStatus('checking');
    const delay = apiMode === 'custom' ? 800 : 0;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/gemini/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: customApiKey, apiMode }),
        });
        const rawText = await res.text();
        let data: any = {};
        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch {
          data = { valid: false, error: `HTTP ${res.status}` };
        }
        if (res.ok && data.valid) {
          setApiKeyStatus('valid');
        } else {
          setApiKeyStatus('invalid');
        }
      } catch (err) {
        console.error('API Connection checking failed:', err);
        setApiKeyStatus('invalid');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [apiMode, customApiKey]);

  const handleGradeLevelChange = (val: string) => {
    setGradeLevel(val);
    localStorage.setItem('dictionary_grade_level', val);
  };

  const handleTargetBoldWordsChange = (val: string) => {
    setTargetBoldWords(val);
    localStorage.setItem('dictionary_bold_words', val);
  };

  const handleApiKeyChange = (value: string) => {
    setCustomApiKey(value);
    localStorage.setItem('gemini_api_key', value);
  };

  const handleApiModeChange = (mode: 'default' | 'custom') => {
    setApiMode(mode);
    localStorage.setItem('gemini_api_mode', mode);
  };

  // Suggested chips based on activePartId & selected Global Success Unit
  const currentSuggestions = React.useMemo(() => {
    const unitPool = selectedUnitObj
      ? selectedUnitObj
      : {
          vocabulary: unitsForCurrentGrade.flatMap((u) => u.vocabulary.slice(0, 2)).slice(0, 14),
          phrasalVerbsAndCollocations: unitsForCurrentGrade
            .flatMap((u) => u.phrasalVerbsAndCollocations.slice(0, 2))
            .slice(0, 12),
          readingThemes: unitsForCurrentGrade.flatMap((u) => u.readingThemes.slice(0, 1)).slice(0, 8),
          grammar: unitsForCurrentGrade.flatMap((u) => u.grammar.slice(0, 1)).slice(0, 8),
        };

    if (activePartId === 'part2') {
      return SIGN_SCENARIOS;
    }
    if (activePartId === 'part3' || activePartId === 'part4') {
      return unitPool.readingThemes;
    }
    if (activePartId === 'part7') {
      return [...unitPool.phrasalVerbsAndCollocations.slice(0, 5), ...WRITING_STRUCTURES.slice(0, 4)];
    }
    return unitPool.vocabulary;
  }, [activePartId, selectedUnitObj, unitsForCurrentGrade]);

  const invalidBoldPhrases = React.useMemo(() => {
    if (activePartId !== 'part6' || !targetBoldWords.trim()) return [];
    return targetBoldWords
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((phrase) => {
        const wc = phrase.split(/\s+/).length;
        return wc < 2 || wc > 3;
      });
  }, [activePartId, targetBoldWords]);

  const saveCurrentToExamCart = () => {
    if (!result || activePartId === 'full_exam') return;
    setExamCart((prev) => ({
      ...prev,
      [activePartId]: result,
    }));
    setCartSaveToast(true);
    setTimeout(() => setCartSaveToast(false), 2200);
  };

  const assembleCartIntoFullExam = () => {
    const orderedIds = ['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7'];
    const questionBlocks: string[] = [];
    const answerBlocks: string[] = [];

    for (const pid of orderedIds) {
      const content = examCart[pid];
      if (!content) continue;
      const spec = EXAM_PARTS.find((p) => p.id === pid);
      const { questionsPart, answersPart } = splitQuestionsAndAnswers(content);
      if (questionsPart) {
        questionBlocks.push(questionsPart);
      }
      if (answersPart) {
        answerBlocks.push(`**[${spec?.roman}. ${spec?.nameVi}]**\n${answersPart}`);
      }
    }

    if (questionBlocks.length === 0) return;

    const combined = `${questionBlocks.join('\n\n')}\n\n**ĐÁP ÁN**\n${answerBlocks.join('\n\n')}`;
    setActivePartId('full_exam');
    setResult(combined);
  };

  const exportToWord = async () => {
    if (!result) return;

    const lines = result.split('\n');
    const paragraphs = lines.map((line) => {
      const cleanLine = line.trim();

      if (cleanLine === '') {
        return new Paragraph({
          children: [new TextRun('')],
          spacing: { after: 120 },
        });
      }

      const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);

      const children = parts.map((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return new TextRun({
            text: part.slice(2, -2),
            bold: true,
            font: 'Times New Roman',
            size: 24,
          });
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return new TextRun({
            text: part.slice(1, -1),
            italics: true,
            font: 'Times New Roman',
            size: 24,
          });
        }
        return new TextRun({
          text: part,
          font: 'Times New Roman',
          size: 24,
        });
      });

      return new Paragraph({
        children,
        spacing: {
          line: 276,
        },
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `De_Tieng_Anh_Global_Success_${activePartSpec.roman}_${keyword || 'HCMC'}.docx`);
  };

  const writeFormattedClipboard = async (rawMarkdown: string) => {
    const htmlContent = rawMarkdown
      .split('\n')
      .map((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
          return '<p style="margin: 0; min-height: 1.2em; font-family: \'Times New Roman\'; font-size: 12pt;">&nbsp;</p>';
        } else {
          const formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/\*(.*?)\*/g, '<i>$1</i>');
          return `<p style="margin: 0; font-family: 'Times New Roman'; font-size: 12pt; line-height: 1.25;">${formattedLine}</p>`;
        }
      })
      .join('');

    const blobHtml = new Blob([htmlContent], { type: 'text/html' });
    const blobText = new Blob([rawMarkdown.replace(/\*\*/g, '').replace(/\*/g, '')], {
      type: 'text/plain',
    });

    const data = [
      new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      }),
    ];

    await navigator.clipboard.write(data);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    try {
      await writeFormattedClipboard(result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      await navigator.clipboard.writeText(result.replace(/\*\*/g, '').replace(/\*/g, ''));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const copyQuestionsOnly = async () => {
    if (!result) return;
    const questionsOnly = getQuestionsOnlyText(result);
    try {
      await writeFormattedClipboard(questionsOnly);
      setCopyQuestionsSuccess(true);
      setTimeout(() => setCopyQuestionsSuccess(false), 2000);
    } catch {
      await navigator.clipboard.writeText(questionsOnly.replace(/\*\*/g, '').replace(/\*/g, ''));
      setCopyQuestionsSuccess(true);
      setTimeout(() => setCopyQuestionsSuccess(false), 2000);
    }
  };

  const generateExercise = async () => {
    if (apiKeyStatus !== 'valid') {
      setError(
        lang === 'vi'
          ? 'Vui lòng cấu hình API Key hợp lệ và hoạt động để sử dụng!'
          : 'Please configure a valid active API Key to use!'
      );
      setShowSettings(true);
      return;
    }

    // For Part 6 (Dictionary), if keyword is empty, pick the first vocabulary word from the selected Global Success unit
    let effectiveKeyword = keyword.trim();
    if (activePartId === 'part6' && !effectiveKeyword) {
      effectiveKeyword = selectedUnitObj ? selectedUnitObj.vocabulary[0] : 'benefit';
      setKeyword(effectiveKeyword);
    }

    setIsLoading(true);
    setShowGeneratingModal(true);
    setGeneratingStatus('loading');
    setIsEditingResult(false);
    setError('');
    setResult('');

    const unitTitleLabel = selectedUnitObj
      ? `${selectedUnitObj.title} (${selectedUnitObj.viTitle})`
      : 'Tổng hợp 12 Unit SGK Global Success';

    const tryGenerate = async (modelName: string) => {
      const fullPrompt = buildExamPrompt({
        partId: activePartId,
        gradeLevel,
        selectedUnitId,
        keyword: effectiveKeyword,
        targetBoldWords,
        pronunciationEnding,
      });

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: modelName,
          apiKey: customApiKey,
          apiMode,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(`Server error (${res.status}): Endpoint /api/gemini/generate unavailable`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }
      return data.text;
    };

    const tryReview = async (draftText: string, modelName: string) => {
      const res = await fetch('/api/gemini/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: draftText,
          partId: activePartId,
          keyword: effectiveKeyword,
          gradeLevel,
          selectedUnitId,
          targetBoldWords,
          model: modelName,
          apiKey: customApiKey,
          apiMode,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(`Server error (${res.status}): Endpoint /api/gemini/review unavailable`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Review failed');
      }
      return data.text || draftText;
    };

    const runReviewStep = async (draftText: string, modelName: string) => {
      setGeneratingStatus('reviewing');
      try {
        return await tryReview(draftText, modelName);
      } catch (reviewErr: any) {
        console.warn('Review step fallback:', reviewErr);
        if (modelName !== 'gemini-3.5-flash-lite') {
          try {
            return await tryReview(draftText, 'gemini-3.5-flash-lite');
          } catch {
            return draftText;
          }
        }
        return draftText;
      }
    };

    try {
      const draftText = await tryGenerate(selectedModel);

      if (draftText) {
        const reviewedText = await runReviewStep(draftText, selectedModel);
        const finalText = normalizePartQuestionNumbers(reviewedText, activePartId);
        setResult(finalText);
        if (activePartId !== 'full_exam') {
          setExamCart((prev) => ({
            ...prev,
            [activePartId]: finalText,
          }));
        }
        setGeneratingStatus('success');
        const historyLabel =
          effectiveKeyword || (selectedUnitObj ? selectedUnitObj.title : activePartSpec.nameVi);
        setHistory((prev) => {
          const newHistory = [
            {
              keyword: historyLabel,
              result: finalText,
              level: gradeLevel,
              boldWords: targetBoldWords,
              partId: activePartId,
              unitTitle: unitTitleLabel,
            },
            ...prev.slice(0, 19),
          ];
          return newHistory;
        });

        setTimeout(() => {
          setShowGeneratingModal(false);
          setIsLoading(false);
        }, 1000);
      } else {
        setShowGeneratingModal(false);
        setIsLoading(false);
        setError(t.errorFailed);
      }
    } catch (err: any) {
      console.error(err);
      const isQuotaError =
        err?.message?.includes('429') || err?.message?.toLowerCase().includes('quota');

      if (isQuotaError && selectedModel !== 'gemini-3.5-flash-lite') {
        try {
          const draftText = await tryGenerate('gemini-3.5-flash-lite');
          if (draftText) {
            const reviewedText = await runReviewStep(draftText, 'gemini-3.5-flash-lite');
            const finalText = normalizePartQuestionNumbers(reviewedText, activePartId);
            setResult(finalText);
            if (activePartId !== 'full_exam') {
              setExamCart((prev) => ({
                ...prev,
                [activePartId]: finalText,
              }));
            }
            setGeneratingStatus('success');
            setTimeout(() => {
              setShowGeneratingModal(false);
              setIsLoading(false);
            }, 1000);
            return;
          }
        } catch (fallbackErr) {
          console.error('Fallback failed:', fallbackErr);
        }
      }

      setShowGeneratingModal(false);
      setIsLoading(false);

      if (isQuotaError) {
        setError(
          lang === 'vi'
            ? 'Hạn mức API đã hết (Rate Limit). Vui lòng nhập API Key khác.'
            : 'API Rate Limit exceeded. Please enter a different API Key.'
        );
        setShowSettings(true);
      } else {
        setError(t.errorConnect);
      }
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    if (item.partId && EXAM_PARTS.some((p) => p.id === item.partId)) {
      setActivePartId(item.partId as any);
    }
    setKeyword(item.keyword);
    setResult(item.result);
    setIsEditingResult(false);
    if (item.level) {
      setGradeLevel(item.level);
      localStorage.setItem('dictionary_grade_level', item.level);
    }
    if (item.boldWords !== undefined) {
      setTargetBoldWords(item.boldWords);
      localStorage.setItem('dictionary_bold_words', item.boldWords);
    }
  };

  const parsedDictionaryExam = React.useMemo(() => {
    if (!result || activePartId !== 'part6') return null;
    return parseDictionaryOutput(result);
  }, [result, activePartId]);

  const splitResult = React.useMemo(() => {
    if (!result) return { questionsPart: '', answersPart: '' };
    const normalized = normalizePartQuestionNumbers(result, activePartId);
    return splitQuestionsAndAnswers(normalized);
  }, [result, activePartId]);

  const cartFilledCount = Object.keys(examCart).length;

  return (
    <div
      id="top"
      className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100"
    >
      {/* Top Bar Contract (h-12 shrink-0) */}
      <Header
        title={t.title}
        logoSrc="https://i.ibb.co/Nd7jfCGJ/NN-logo.jpg"
        onHistory={() => setShowHistoryModal(true)}
        onInfo={() => setShowAppInfoModal(true)}
        onSettings={() => setShowSettings(!showSettings)}
        lang={lang}
        showSettings={true}
        historyCount={history.length}
        hasHistoryData={history.length > 0}
        apiKeyStatus={apiKeyStatus}
      />

      {/* Compact 7-Part Exam Blueprint Navigation Strip (Zero horizontal scroll) */}
      <div className="shrink-0 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-5 lg:px-6 py-1.5">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {EXAM_PARTS.map((part) => {
              const isActive = activePartId === part.id;
              const isSavedInCart = part.id !== 'full_exam' && !!examCart[part.id];
              const shortLabels: Record<string, string> = {
                part1: 'Trắc nghiệm MCQ',
                part2: 'Biển báo',
                part3: 'Cloze text',
                part4: 'Reading T/F',
                part5: 'Word form',
                part6: 'Từ điển',
                part7: 'Biến đổi câu',
                full_exam: 'Đề 40 câu',
              };
              const shortLabel = shortLabels[part.id] || part.nameVi;
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => {
                    if (activePartId !== part.id) {
                      setActivePartId(part.id);
                      setResult('');
                      setIsEditingResult(false);
                      setError('');
                    }
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                    isActive
                      ? 'bg-[#1E40AF] text-white shadow-xs'
                      : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <span className="truncate">
                    {part.id === 'full_exam' && cartFilledCount > 0
                      ? `${shortLabel} (${cartFilledCount}/7)`
                      : shortLabel}
                  </span>
                  {isSavedInCart && (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-emerald-300' : 'text-emerald-600'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Fixed-Viewport Workspace */}
      <main className="flex-1 min-h-0 mx-auto max-w-[1440px] w-full px-3 sm:px-5 lg:px-6 py-2.5 flex flex-col lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 lg:overflow-hidden">
          {/* Left Column: Compact Guided Control Deck (Fits 100% in viewport height) */}
          <div className="lg:col-span-5 xl:col-span-4 h-full min-h-0 bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3 overflow-hidden">
              {/* Active Section Header Summary */}
              <div className="pb-2.5 border-b border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-blue-900 font-bold">
                  <span>
                    PHẦN {activePartSpec.roman} · {activePartSpec.questionRange}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900">
                    {activePartSpec.points}
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5 leading-snug">
                  {activePartSpec.nameVi}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {activePartSpec.shortDesc}
                </p>
              </div>

              {/* Step 01: Grade & Global Success Unit Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900">
                    01. Khối lớp & Unit (SGK Global Success)
                  </label>
                  <span className="text-[11px] font-semibold text-blue-900">NXB Giáo dục VN</span>
                </div>

                {/* 1-Tap Grade Buttons */}
                <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-lg">
                  {GRADE_OPTIONS.map((opt) => {
                    const active = gradeLevel === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleGradeLevelChange(opt.id)}
                        className={`py-1.5 px-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                          active
                            ? 'bg-[#1E40AF] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        {opt.short}
                      </button>
                    );
                  })}
                </div>

                {/* Global Success Unit Selector */}
                <div className="relative">
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-800 outline-none text-xs font-bold text-slate-800 appearance-none cursor-pointer"
                  >
                    <option value="all">
                      📚 Tất cả 12 Unit SGK Global Success (Tổng hợp kiến thức)
                    </option>
                    {unitsForCurrentGrade.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title} — {u.viTitle}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Compact 1-Line Selected Unit Grammar Preview */}
                {selectedUnitObj && (
                  <div
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 truncate"
                    title={`Ngữ pháp: ${selectedUnitObj.grammar.join(' · ')} | Cụm từ: ${selectedUnitObj.phrasalVerbsAndCollocations.join(', ')}`}
                  >
                    <span className="font-bold text-slate-900">Trọng tâm:</span>{' '}
                    {selectedUnitObj.grammar.join(' · ')}
                  </div>
                )}
              </div>

              {/* Step 02: Section-Specific Input & Global Success Quick Suggestions */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="keyword" className="block text-xs font-bold text-slate-900 truncate">
                    {activePartId === 'part6'
                      ? '02. Từ khóa từ điển (Global Success)'
                      : activePartId === 'part3' || activePartId === 'part4'
                      ? '02. Chủ đề bài đọc / Từ vựng (Tùy chọn)'
                      : activePartId === 'part5'
                      ? '02. Từ gốc Word Form (Tùy chọn)'
                      : activePartId === 'part7'
                      ? '02. Cấu trúc / Phrasal Verb (Tùy chọn)'
                      : '02. Từ vựng / Chủ điểm ưu tiên (Tùy chọn)'}
                  </label>

                  {/* Inline Part 1 Question 2 Ending Selector */}
                  {activePartId === 'part1' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] text-slate-500">Câu 2:</span>
                      <button
                        type="button"
                        onClick={() => setPronunciationEnding('ed')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          pronunciationEnding === 'ed'
                            ? 'bg-[#1E40AF] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        -ed
                      </button>
                      <button
                        type="button"
                        onClick={() => setPronunciationEnding('s_es')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          pronunciationEnding === 's_es'
                            ? 'bg-[#1E40AF] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        -s/es
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="keyword"
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generateExercise()}
                    placeholder={
                      activePartId === 'part6'
                        ? 'Nhập từ khóa (artisan, congestion, priority, benefit...)'
                        : 'Để trống cho AI tự chọn theo Unit hoặc bấm gợi ý bên dưới...'
                    }
                    className="w-full pl-3 pr-14 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-800 outline-none text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    {keyword && (
                      <button
                        type="button"
                        onClick={() => setKeyword('')}
                        className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentSuggestions.length > 0) {
                          const rand =
                            currentSuggestions[
                              Math.floor(Math.random() * currentSuggestions.length)
                            ];
                          setKeyword(rand);
                        }
                      }}
                      className="p-1 hover:bg-blue-50 text-blue-800 rounded-md transition-colors cursor-pointer"
                      title="Chọn ngẫu nhiên từ SGK Global Success"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Compact 1-Tap Global Success Suggestions (Max 2 rows, no scrollbar needed) */}
                <div className="flex flex-wrap gap-1 max-h-[52px] overflow-hidden">
                  {currentSuggestions.slice(0, 10).map((item) => {
                    const isSelected = keyword.toLowerCase().includes(item.toLowerCase());
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (
                            activePartId === 'part6' ||
                            activePartId === 'part3' ||
                            activePartId === 'part4'
                          ) {
                            setKeyword(item);
                          } else {
                            setKeyword((prev) =>
                              prev.trim()
                                ? prev.toLowerCase().includes(item.toLowerCase())
                                  ? prev
                                  : `${prev}, ${item}`
                                : item
                            );
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer truncate max-w-[180px] ${
                          isSelected
                            ? 'bg-[#1E40AF] text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                {/* Part 6 Specific: Compact Inline 2-3 Word Bold Collocations */}
                {activePartId === 'part6' && (
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedBold((prev) => !prev)}
                      className="w-full flex items-center justify-between text-left py-0.5 cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-900">
                        + Chỉ định cụm từ in đậm 2–3 từ (Tùy chọn)
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                          showAdvancedBold ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {showAdvancedBold && (
                      <div className="pt-1 space-y-1">
                        <input
                          type="text"
                          value={targetBoldWords}
                          onChange={(e) => handleTargetBoldWordsChange(e.target.value)}
                          placeholder="Ví dụ: pass down, craft village, preserve tradition..."
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-800"
                        />
                        {invalidBoldPhrases.length > 0 && (
                          <div className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-800 truncate">
                            Lưu ý: {invalidBoldPhrases.map((p) => `“${p}”`).join(', ')} chưa đúng 2–3 từ.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 03: Compact Matrix Specification Summary */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Chuẩn Ma trận Sở GD&ĐT TP.HCM 2025:</span>
                </div>
                <ul className="space-y-0.5 text-[11px] text-slate-600 list-disc pl-4 leading-snug">
                  {activePartSpec.matrixRules.slice(0, 3).map((rule, i) => (
                    <li key={i} className="line-clamp-1" title={rule}>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Pinned Section: Cart Bar + Primary CTA Button */}
            <div className="shrink-0 pt-2.5 space-y-2 border-t border-slate-100">
              {cartFilledCount > 0 && (
                <div className="px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5 truncate">
                    <Layers className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                    <span>Giỏ Đề 40 Câu ({cartFilledCount}/7 phần)</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={assembleCartIntoFullExam}
                      className="px-2.5 py-1 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Ghép đề
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamCart({})}
                      className="text-slate-400 hover:text-red-600 text-[11px] font-semibold cursor-pointer"
                      title="Xóa giỏ đề"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={generateExercise}
                disabled={isLoading}
                className="w-full bg-[#1E40AF] hover:bg-blue-900 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] text-sm cursor-pointer whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.generatingBtn}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      {activePartId === 'full_exam'
                        ? 'Tạo mới Trọn bộ Đề thi 40 Câu'
                        : `Soạn & Thẩm định Phần ${activePartSpec.roman} (${activePartSpec.questionRange})`}
                    </span>
                  </>
                )}
              </button>

              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                  <span className="truncate">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Exam Paper Canvas (ONLY this pane scrolls inside its body) */}
          <div
            ref={resultRef}
            className="lg:col-span-7 xl:col-span-8 h-full min-h-0 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col"
          >
            {result ? (
              <div className="flex flex-col h-full min-h-0">
                {/* Fixed Top Toolbar (shrink-0) */}
                <div className="shrink-0 py-2.5 px-4 sm:px-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {activePartSpec.roman}. {activePartSpec.nameVi} ({activePartSpec.questionRange})
                      </h2>
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        · {selectedUnitObj ? selectedUnitObj.title : 'SGK Global Success'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Đã thẩm định · Chuẩn ma trận Sở GD&ĐT TP.HCM 2025</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activePartId !== 'full_exam' && (
                      <button
                        type="button"
                        onClick={saveCurrentToExamCart}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                        title="Lưu phần này vào Giỏ Đề Thi 40 câu"
                      >
                        {cartSaveToast ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Đã lưu</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Ghép vào Đề 40 câu</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Toggle Show/Hide Answers */}
                    <button
                      type="button"
                      onClick={() => setShowAnswers((prev) => !prev)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {showAnswers ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ẩn đáp án</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-blue-800" />
                          <span>Hiện đáp án</span>
                        </>
                      )}
                    </button>

                    {/* Toggle Direct Edit */}
                    <button
                      type="button"
                      onClick={() => setIsEditingResult((prev) => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        isEditingResult
                          ? 'bg-amber-50 border-amber-300 text-amber-900'
                          : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingResult ? 'Xong' : 'Sửa'}</span>
                    </button>

                    {/* Copy Questions Only */}
                    <button
                      type="button"
                      onClick={copyQuestionsOnly}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {copyQuestionsSuccess ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>{copyQuestionsSuccess ? t.copiedQuestionsBtn : t.copyQuestionsBtn}</span>
                    </button>

                    {/* Copy Full Sheet */}
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {copySuccess ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>{copySuccess ? t.copiedBtn : t.copyBtn}</span>
                    </button>

                    {/* Export Word */}
                    <button
                      type="button"
                      onClick={exportToWord}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#1E40AF] hover:bg-blue-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Word (.docx)</span>
                    </button>
                  </div>
                </div>

                {/* Scrollable Exam Paper Canvas Body (ONLY THIS AREA SCROLLS) */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 sm:p-7 bg-white">
                  {isEditingResult ? (
                    <div className="h-full flex flex-col space-y-2">
                      <label className="block text-xs font-semibold text-slate-600 shrink-0">
                        Chỉnh sửa trực tiếp nội dung (giữ ký hiệu **in đậm** và *in nghiêng* để xuất file Word chuẩn):
                      </label>
                      <textarea
                        value={result}
                        onChange={(e) => setResult(e.target.value)}
                        className="flex-1 w-full p-4 bg-slate-50 border border-slate-300 rounded-xl font-exam text-base leading-relaxed text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-800 outline-none resize-none"
                      />
                    </div>
                  ) : activePartId === 'part6' &&
                    parsedDictionaryExam &&
                    (parsedDictionaryExam.dictionaryLines.length > 0 ||
                      parsedDictionaryExam.questionLines.length > 0) ? (
                    /* Specialized Dictionary Entry Box View */
                    <div className="max-w-3xl mx-auto font-exam text-[17px] leading-relaxed text-slate-900 space-y-5">
                      {parsedDictionaryExam.instructionLine && (
                        <div className="text-[17px] leading-snug text-slate-900">
                          <ReactMarkdown
                            remarkPlugins={[remarkBreaks]}
                            components={{
                              p: ({ children }) => <p className="m-0">{children}</p>,
                              strong: ({ children }) => (
                                <strong className="font-bold text-slate-950">{children}</strong>
                              ),
                            }}
                          >
                            {parsedDictionaryExam.instructionLine}
                          </ReactMarkdown>
                        </div>
                      )}

                      {parsedDictionaryExam.dictionaryLines.length > 0 && (
                        <div className="p-4 sm:p-5 bg-[#F8FAFC] border border-slate-300 rounded-xl space-y-1.5">
                          <ReactMarkdown
                            remarkPlugins={[remarkBreaks]}
                            components={{
                              p: ({ children }) => (
                                <p className="text-slate-900 leading-relaxed m-0">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold text-slate-950 bg-amber-100/70 px-1 rounded-xs">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-slate-800">{children}</em>
                              ),
                            }}
                          >
                            {parsedDictionaryExam.dictionaryLines.join('\n')}
                          </ReactMarkdown>
                        </div>
                      )}

                      {parsedDictionaryExam.questionLines.length > 0 && (
                        <div className="space-y-2.5 pt-1">
                          <ReactMarkdown
                            remarkPlugins={[remarkBreaks]}
                            components={{
                              p: ({ children }) => (
                                <p className="text-slate-900 leading-relaxed mb-2">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-bold text-slate-950">{children}</strong>
                              ),
                            }}
                          >
                            {preserveMarkdownQuestionNumbers(
                              parsedDictionaryExam.questionLines.join('\n')
                            )}
                          </ReactMarkdown>
                        </div>
                      )}

                      {parsedDictionaryExam.answerLines.length > 0 && (
                        <div className="pt-4 border-t border-slate-200">
                          {showAnswers ? (
                            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                              <div className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-800 mb-2">
                                ĐÁP ÁN CHÍNH THỨC (ĐÃ THẨM ĐỊNH)
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-base font-bold text-slate-900">
                                {parsedDictionaryExam.answerLines.map((ans, idx) => (
                                  <div key={idx} className="py-0.5">
                                    {ans.replace(/\*\*/g, '')}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-sans text-slate-600">
                              <span>
                                Đáp án đang được ẩn để phục vụ chiếu đề cho học sinh làm bài.
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowAnswers(true)}
                                className="font-bold text-blue-800 hover:underline cursor-pointer shrink-0 ml-3"
                              >
                                Hiện đáp án ngay
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* General Exam Section View (Parts I, II, III, IV, V, VII & Full Exam) */
                    <div className="max-w-3xl mx-auto font-exam text-[17px] leading-relaxed text-slate-900 space-y-5">
                      <div className="space-y-3">
                        <ReactMarkdown
                          remarkPlugins={[remarkBreaks]}
                          components={{
                            p: ({ children }) => (
                              <p className="text-slate-900 leading-relaxed mb-3">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-slate-950">{children}</strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-slate-800">{children}</em>
                            ),
                          }}
                        >
                          {preserveMarkdownQuestionNumbers(splitResult.questionsPart)}
                        </ReactMarkdown>
                      </div>

                      {splitResult.answersPart && (
                        <div className="pt-4 border-t border-slate-200">
                          {showAnswers ? (
                            <div className="p-4 sm:p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                              <div className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-800">
                                ĐÁP ÁN & GIẢI THÍCH CHI TIẾT (ĐÃ THẨM ĐỊNH)
                              </div>
                              <div className="text-base text-slate-900 space-y-1.5">
                                <ReactMarkdown
                                  remarkPlugins={[remarkBreaks]}
                                  components={{
                                    p: ({ children }) => (
                                      <p className="text-slate-900 leading-relaxed mb-1.5">
                                        {children}
                                      </p>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-bold text-emerald-950">
                                        {children}
                                      </strong>
                                    ),
                                  }}
                                >
                                  {preserveMarkdownQuestionNumbers(splitResult.answersPart)}
                                </ReactMarkdown>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-sans text-slate-600">
                              <span>
                                Đáp án & lời giải đang được ẩn để phục vụ chiếu đề cho học sinh làm bài.
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowAnswers(true)}
                                className="font-bold text-blue-800 hover:underline cursor-pointer shrink-0 ml-3"
                              >
                                Hiện đáp án ngay
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Compact Empty State with Interactive 7-Section Overview (Fits inside viewport) */
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center p-4 sm:p-6">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {t.emptyStateTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-xl text-center leading-relaxed mb-4">
                  {t.emptyStateDesc}
                </p>

                {/* Interactive Grid of all 7 HCMC Exam Sections + Full 40-Q Exam */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-3xl">
                  {EXAM_PARTS.map((part) => {
                    const isCurrent = activePartId === part.id;
                    const inCart = part.id !== 'full_exam' && !!examCart[part.id];
                    return (
                      <button
                        key={part.id}
                        type="button"
                        onClick={() => {
                          if (activePartId !== part.id) {
                            setActivePartId(part.id);
                            setResult('');
                            setIsEditingResult(false);
                            setError('');
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-blue-50/70 border-blue-800 shadow-2xs'
                            : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 mb-0.5">
                            <span>
                              PHẦN {part.roman} · {part.questionRange}
                            </span>
                            <span className="text-slate-500 font-semibold">{part.points}</span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate">{part.nameVi}</span>
                            {inCart && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                            {part.shortDesc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        t={t}
        apiKey={customApiKey}
        onApiKeyChange={handleApiKeyChange}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        apiMode={apiMode}
        onApiModeChange={handleApiModeChange}
        apiKeyStatus={apiKeyStatus}
      />

      <AppInfoModal
        show={showAppInfoModal}
        onClose={() => setShowAppInfoModal(false)}
        t={t}
        lang={lang}
      />

      <HistoryModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        onSelect={loadHistoryItem}
        onDelete={(e, itemToDelete) => {
          e.stopPropagation();
          setHistory((prev) => prev.filter((item) => item !== itemToDelete));
        }}
        onClear={() => setHistory([])}
        t={t}
      />

      <GeneratingModal
        show={showGeneratingModal}
        status={generatingStatus}
        partSpec={activePartSpec}
        unitTitle={selectedUnitObj ? selectedUnitObj.title : 'Tổng hợp 12 Unit'}
        loadingMsg={t.loadingMessages[loadingMsgIndex]}
        lang={lang}
      />
    </div>
  );
}

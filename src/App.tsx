/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, BookOpen, Send, X, Key, Settings, ShieldCheck, FileDown, Copy, Check, Languages, History, Trash2, Home, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Translations
const translations = {
  vi: {
    title: "SOẠN TỪ ĐIỂN v4.0",
    author: "by Nhân Nhân - Trường THCS Tùng Thiện Vương, phường Phú Định, TPHCM",
    homeBtn: "Về trang chủ NHÂN NHÂN APP",
    historyTitle: "Lịch sử gần đây",
    clearHistory: "Xóa tất cả",
    poweredBy: "Powered by Gemini",
    apiSettings: "Cấu hình API Gemini",
    apiGuide: "Hướng dẫn lấy API key miễn phí",
    apiCustomLabel: "Nhập Gemini API Key",
    apiPlaceholder: "Dán API Key của bạn vào đây...",
    apiNote: "* API Key được lưu an toàn trong trình duyệt của bạn để sử dụng cho lần sau.",
    keywordLabel: "Từ khóa",
    keywordPlaceholder: "Ví dụ: benefit, information, aware...",
    generateBtn: "Tạo",
    generatingBtn: "Đang xử lý...",
    errorEmpty: "Vui lòng nhập từ khóa!",
    errorNoCustomApi: "Vui lòng nhập API Key của bạn!",
    errorFailed: "Không thể tạo nội dung. Vui lòng thử lại.",
    errorConnect: "Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra lại.",
    resultTitle: "Đã tạo xong!",
    copyBtn: "Copy toàn bộ",
    copiedBtn: "Đã copy",
    exportBtn: "Tải file Word",
    emptyState: "Nhập từ khóa để bắt đầu",
    loadingMessages: [
      "AI đang phân tích từ khóa của bạn...",
      "Đang soạn câu hỏi định nghĩa (Definition)...",
      "Đang tạo các câu dự phòng (Backup)...",
      "Đang kiểm tra định dạng và đáp án...",
      "Sắp xong rồi, vui lòng đợi thêm chút nữa..."
    ],
    settingsTitle: "Cấu hình",
    modelLabel: "Lựa chọn Model",
    modelFlash: "Gemini 3 Flash (Nhanh)",
    modelLite: "Gemini 2.5 Flash Lite (Tiết kiệm)",
    appDescription: "Hỗ trợ soạn bài tập dạng Từ điển (Definition Entry) chuẩn đề thi Tuyển sinh lớp 10 tại TP.HCM (Câu 35, 36). Thầy cô chỉ cần gõ từ khóa (cách nhau dấu phẩy), bấm Tạo thì sẽ nhận được bài hoàn chỉnh, có thể copy trực tiếp hoặc xuất file Word để sử dụng. Cảm ơn thầy cô đã sử dụng app! Mọi đóng góp xin gửi về email nhanntsgu@gmail.com.",
  },
  en: {
    title: "DICTIONARY ENTRY GENERATOR v4.0",
    author: "by Nhan Nhan - Tung Thien Vuong Secondary School, Ho Chi Minh City",
    homeBtn: "Back to NHAN NHAN APP Home",
    historyTitle: "Recent History",
    clearHistory: "Clear All",
    poweredBy: "Powered by Gemini",
    apiSettings: "Gemini API Configuration",
    apiGuide: "How to get a free API key",
    apiCustomLabel: "Enter Gemini API Key",
    apiPlaceholder: "Paste your API Key here...",
    apiNote: "* Your API Key is saved securely in your browser for future use.",
    keywordLabel: "Keyword",
    keywordPlaceholder: "Example: benefit, information, aware...",
    generateBtn: "Generate",
    generatingBtn: "Processing...",
    errorEmpty: "Please enter a keyword!",
    errorNoCustomApi: "Please enter your API Key!",
    errorFailed: "Could not generate content. Please try again.",
    errorConnect: "An error occurred while connecting to AI. Please check again.",
    resultTitle: "Generation Complete!",
    copyBtn: "Copy All",
    copiedBtn: "Copied",
    exportBtn: "Download Word",
    emptyState: "Enter a keyword to start",
    loadingMessages: [
      "AI is analyzing your keywords...",
      "Composing definition questions...",
      "Generating backup questions...",
      "Checking format and answers...",
      "Almost done, please wait a bit longer..."
    ],
    settingsTitle: "Settings",
    modelLabel: "Model Selection",
    modelFlash: "Gemini 3 Flash (Fast)",
    modelLite: "Gemini 2.5 Flash Lite (Lite)",
    appDescription: "Supports creating Dictionary Entry exercises standard for the Grade 10 Entrance Exam in Ho Chi Minh City (Questions 1, 2). Teachers just need to type keywords (separated by commas), click Generate to receive a complete lesson, which can be copied directly or exported to a Word file for use. Thank you for using the app! Please send any feedback to email nhanntsgu@gmail.com.",
  }
};

// Prompt cơ sở - Người dùng có thể tùy chỉnh ở đây
const BASE_PROMPT = `Bạn là một chuyên gia soạn đề thi tiếng Anh lớp 10 tại TP.HCM.
Nhiệm vụ: Soạn bài tập dạng Dictionary Entry (câu 1–2) dựa trên từ khóa được cung cấp.

YÊU CẦU VỀ NỘI DUNG:
1. Dictionary Entry: Word, Phonetic, Part of speech, Definition (ngắn gọn), Synonym (nếu có).
2. Examples: 5 câu ví dụ đơn giản, tự nhiên. Trong đó 4 câu đầu phải chứa cụm từ (2-3 từ) làm đáp án cho 4 câu hỏi bên dưới. TẤT CẢ 5 câu ví dụ đều phải in đậm cụm từ chứa từ khóa để đảm bảo tính thống nhất.
3. Questions: 2 câu chính (1, 2) và 2 câu dự phòng (3, 4). Câu hỏi phải có ngữ cảnh khác ví dụ nhưng đáp án phải giữ nguyên văn từ ví dụ.

YÊU CẦU VỀ ĐỊNH DẠNG (CỰC KỲ QUAN TRỌNG - ĐỂ COPY SANG WORD KHÔNG LỖI):
- KHÔNG sử dụng dấu # hay ## cho tiêu đề.
- Sử dụng **[Tiêu đề]** in hoa cho các phần: ĐÁP ÁN, CÂU DỰ PHÒNG, ĐÁP ÁN CÂU DỰ PHÒNG.
- Giữa các phần lớn (ví dụ giữa Examples và nội dung câu hỏi) PHẢI có đúng 1 dòng trống (nhấn Enter 2 lần). KHÔNG ĐƯỢC có 2 dòng trống liên tiếp.
- Giữa nội dung Examples và nội dung câu hỏi ngay bên dưới (câu 1) PHẢI có đúng 1 dòng trống.
- Giữa các câu hỏi (1, 2 hoặc 3, 4) KHÔNG ĐƯỢC có dòng trống, chỉ cần xuống dòng bình thường (nhấn Enter 1 lần).
- Đảm bảo mỗi dòng văn bản kết thúc bằng một dấu xuống dòng đơn giản (Paragraph Mark).

CẤU TRÚC MẪU BẮT BUỘC (SAO CHÉP CHÍNH XÁC THỨ TỰ):
**VI. Look at the entry of the word “_____” in a dictionary. Use what you can get from the entry to complete the sentences with two or three words.**

**[word]** /[phonetic]/ *([part of speech])*
*definition*
**SYNONYM**: ...

• example 1 (có **cụm đáp án**)
• example 2 (có **cụm đáp án**)
• example 3 (có **cụm đáp án dự phòng**)
• example 4 (có **cụm đáp án dự phòng**)
• example 5 (cũng phải **in đậm từ khóa**)

1. [câu hỏi 1 có chỗ trống _______ để điền từ]
2. [câu hỏi 2 có chỗ trống _______ để điền từ]

**ĐÁP ÁN**
1. [đáp án của câu 1]
2. [đáp án của câu 2]

**CÂU DỰ PHÒNG**
3. [câu hỏi dự phòng 3 có chỗ trống _______]
4. [câu hỏi dự phòng 4 có chỗ trống _______]

**ĐÁP ÁN CÂU DỰ PHÒNG**
3. [đáp án của câu dự phòng 3]
4. [đáp án của câu dự phòng 4]

LƯU Ý: Thay _____ bằng từ khóa. Đảm bảo các ví dụ (example) nằm trên các dòng riêng biệt. Sau các tiêu đề **ĐÁP ÁN**, **CÂU DỰ PHÒNG**, **ĐÁP ÁN CÂU DỰ PHÒNG** phải xuống dòng ngay để viết nội dung, không để dòng trống. Phân cách giữa các phần bằng đúng 1 dòng trống.
Từ khóa: `;

interface HistoryItem {
  keyword: string;
  result: string;
}

function SettingsModal({ 
  show, 
  onClose, 
  t, 
  apiKey, 
  onApiKeyChange, 
  selectedModel, 
  onModelChange 
}: { 
  show: boolean; 
  onClose: () => void; 
  t: any; 
  apiKey: string; 
  onApiKeyChange: (val: string) => void;
  selectedModel: string;
  onModelChange: (val: any) => void;
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
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-800" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{t.apiSettings}</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    {t.modelLabel}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => onModelChange('gemini-3-flash-preview')}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedModel === 'gemini-3-flash-preview' ? 'border-blue-800 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-bold ${selectedModel === 'gemini-3-flash-preview' ? 'text-blue-800' : 'text-slate-700'}`}>{t.modelFlash}</span>
                        <span className="text-[10px] text-slate-400">Nhanh & Thông minh</span>
                      </div>
                      {selectedModel === 'gemini-3-flash-preview' && <ShieldCheck className="w-5 h-5 text-blue-800" />}
                    </button>
                    <button
                      onClick={() => onModelChange('gemini-3.1-flash-lite-preview')}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedModel === 'gemini-3.1-flash-lite-preview' ? 'border-blue-800 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-bold ${selectedModel === 'gemini-3.1-flash-lite-preview' ? 'text-blue-800' : 'text-slate-700'}`}>{t.modelLite}</span>
                        <span className="text-[10px] text-slate-400">Tiết kiệm & Ổn định</span>
                      </div>
                      {selectedModel === 'gemini-3.1-flash-lite-preview' && <ShieldCheck className="w-5 h-5 text-blue-800" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {t.apiCustomLabel}
                    </label>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-blue-800 hover:underline flex items-center gap-1"
                    >
                      {t.apiGuide}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => onApiKeyChange(e.target.value)}
                      placeholder={t.apiPlaceholder}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all text-sm font-mono"
                    />
                  </div>
                  <p className="mt-3 text-[10px] text-slate-400 italic">
                    {t.apiNote}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] text-sm"
                >
                  Xong
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const [error, setError] = useState('');
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [showSettings, setShowSettings] = useState(() => {
    return !localStorage.getItem('gemini_api_key');
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [selectedModel, setSelectedModel] = useState<'gemini-3-flash-preview' | 'gemini-3.1-flash-lite-preview'>('gemini-3-flash-preview');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('dictionary_history_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const sampleKeywords = [
    'benefit', 'information', 'aware', 'environment', 'technology', 
    'education', 'community', 'opportunity', 'challenge', 'success',
    'experience', 'knowledge', 'resource', 'solution', 'impact',
    'development', 'innovation', 'creativity', 'communication', 'leadership'
  ];

  const generateRandomKeyword = () => {
    const randomIndex = Math.floor(Math.random() * sampleKeywords.length);
    setKeyword(sampleKeywords[randomIndex]);
  };

  const t = translations[lang];

  const resultRef = React.useRef<HTMLDivElement>(null);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('dictionary_history_v2', JSON.stringify(history));
  }, [history]);

  // Scroll to result on mobile when it appears
  useEffect(() => {
    if (result && window.innerWidth < 1024) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  // Loading messages rotation
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingMsgIndex(0);
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % t.loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading, t.loadingMessages.length]);

  const handleApiKeyChange = (value: string) => {
    setCustomApiKey(value);
    localStorage.setItem('gemini_api_key', value);
  };

  const exportToWord = async () => {
    if (!result) return;

    const lines = result.split('\n');
    const paragraphs = lines.map(line => {
      const cleanLine = line.trim();
      
      if (cleanLine === '') {
        return new Paragraph({
          children: [new TextRun("")],
          spacing: { after: 120 },
        });
      }

      // Simple Markdown parser for Word export (handles **bold** and *italic*)
      const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      
      const children = parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return new TextRun({
            text: part.slice(2, -2),
            bold: true,
            font: "Times New Roman",
            size: 24, // 12pt
          });
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return new TextRun({
            text: part.slice(1, -1),
            italics: true,
            font: "Times New Roman",
            size: 24,
          });
        }
        return new TextRun({
          text: part,
          font: "Times New Roman",
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
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Dictionary_Exercise_${keyword || 'Result'}.docx`);
  };

  const copyToClipboard = async () => {
    if (!result) return;

    try {
      // Convert Markdown to HTML for rich text clipboard
      // Use <p> tags for each line to ensure Paragraph Marks (Enter) in Word
      const htmlContent = result
        .split('\n')
        .map(line => {
          const trimmedLine = line.trim();
          if (trimmedLine === '') {
            return '<p style="margin: 0; min-height: 1.2em; font-family: \'Times New Roman\'; font-size: 12pt;">&nbsp;</p>';
          } else {
            let formattedLine = line
              .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
              .replace(/\*(.*?)\*/g, '<i>$1</i>');
            return `<p style="margin: 0; font-family: 'Times New Roman'; font-size: 12pt; line-height: 1.2;">${formattedLine}</p>`;
          }
        })
        .join('');
      
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([result.replace(/\*\*/g, '').replace(/\*/g, '')], { type: 'text/plain' });
      
      const data = [new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      })];

      await navigator.clipboard.write(data);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback to plain text if rich text fails
      await navigator.clipboard.writeText(result.replace(/\*\*/g, '').replace(/\*/g, ''));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const generateExercise = async () => {
    if (!keyword.trim()) {
      setError(t.errorEmpty);
      return;
    }

    if (!customApiKey) {
      setError(t.errorNoCustomApi);
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    const tryGenerate = async (modelName: string) => {
      const ai = new GoogleGenAI({ apiKey: customApiKey });
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `${BASE_PROMPT} ${keyword}`,
      });
      return response.text;
    };

    try {
      let text = await tryGenerate(selectedModel);
      
      if (text) {
        setResult(text);
        // Update history with result
        setHistory(prev => {
          const newHistory = [
            { keyword, result: text }, 
            ...prev.filter(item => item.keyword !== keyword)
          ].slice(0, 10);
          return newHistory;
        });
      } else {
        setError(t.errorFailed);
      }
    } catch (err: any) {
      console.error(err);
      const isQuotaError = err?.message?.includes('429') || err?.message?.toLowerCase().includes('quota');
      
      if (isQuotaError && selectedModel === 'gemini-3-flash-preview') {
        // Fallback to Lite model if Flash fails due to quota
        try {
          console.log("Flash quota exceeded, falling back to Lite...");
          let text = await tryGenerate('gemini-3.1-flash-lite-preview');
          if (text) {
            setResult(text);
            return;
          }
        } catch (fallbackErr) {
          console.error("Fallback failed:", fallbackErr);
        }
      }

      if (isQuotaError) {
        setError("Hạn mức API đã hết (Rate Limit). Vui lòng nhập API Key khác.");
        setShowSettings(true);
      } else {
        setError(t.errorConnect);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử?' : 'Are you sure you want to clear all history?')) {
      setHistory([]);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, itemToDelete: HistoryItem) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.keyword !== itemToDelete.keyword));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setKeyword(item.keyword);
    setResult(item.result);
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#f5f5f5] text-slate-900 font-sans selection:bg-blue-100 lg:overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-black/5 py-3 px-4 flex-shrink-0 shadow-sm z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.ibb.co/Nd7jfCGJ/NN-logo.jpg" 
              alt="Logo" 
              className="h-10 w-auto object-contain rounded-lg shadow-sm"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">{t.title}</h1>
              <p className="text-[10px] text-slate-400 font-medium -mt-1">
                {t.author}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://nhannhan.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-100 transition-all border border-slate-200"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.homeBtn}</span>
            </a>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 hover:bg-slate-100 rounded-xl transition-all ${showSettings ? 'text-blue-800 bg-blue-50' : 'text-slate-500'}`}
              title={t.settingsTitle}
            >
              <Settings className={`w-5 h-5 ${showSettings ? 'rotate-90' : ''} transition-transform duration-300`} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
          {/* Left Column: Controls */}
          <div className="w-full lg:w-[340px] flex flex-col gap-4 lg:overflow-y-auto pr-1 pb-4 lg:pb-0">
            {/* App Description */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông tin ứng dụng</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {t.appDescription.split('nhanntsgu@gmail.com').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <a href="mailto:nhanntsgu@gmail.com" className="text-blue-800 font-semibold hover:underline">
                        nhanntsgu@gmail.com
                      </a>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </motion.div>

            {/* Input Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-black/5"
            >
              <div className="flex flex-col gap-5">
                <div>
                  <label htmlFor="keyword" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                    {t.keywordLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="keyword"
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateExercise()}
                      placeholder={t.keywordPlaceholder}
                      className="w-full pl-4 pr-20 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <AnimatePresence>
                        {keyword && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setKeyword('')}
                            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={generateRandomKeyword}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-full transition-all active:rotate-180 duration-500"
                        title="Tạo ngẫu nhiên"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateExercise}
                  disabled={isLoading}
                  className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.generatingBtn}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t.generateBtn}
                    </>
                  )}
                </button>

                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-blue-800 font-bold">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={loadingMsgIndex}
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          className="text-[10px] uppercase tracking-wider text-center"
                        >
                          {t.loadingMessages[loadingMsgIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-800"
                        animate={{ width: ["0%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </div>
                )}
                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-[11px] font-bold text-center mt-2"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* History Section */}
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center gap-2 text-slate-500">
                    <History className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.historyTitle}</span>
                  </div>
                  <button 
                    onClick={clearHistory}
                    className="text-[9px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                  >
                    {t.clearHistory}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.keyword}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => loadHistoryItem(item)}
                      className="group flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
                    >
                      <span className="text-xs text-slate-600 group-hover:text-blue-800 font-medium truncate">{item.keyword}</span>
                      <button
                        onClick={(e) => deleteHistoryItem(e, item)}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Result */}
          <div 
            ref={resultRef}
            className="flex-1 bg-white rounded-2xl shadow-md border border-black/5 overflow-hidden flex flex-col min-h-[400px] lg:min-h-0"
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-blue-800 rounded-full"></div>
                      <h2 className="text-lg font-bold tracking-tight">{t.resultTitle}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold transition-all shadow-sm"
                      >
                        {copySuccess ? <Check className="w-3 h-3 text-blue-800" /> : <Copy className="w-3 h-3" />}
                        {copySuccess ? t.copiedBtn : t.copyBtn}
                      </button>
                      <button
                        onClick={exportToWord}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                      >
                        <FileDown className="w-3 h-3" />
                        {t.exportBtn}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="prose prose-slate max-w-none prose-headings:m-0 prose-p:m-0 prose-li:m-0 prose-ul:m-0 prose-ol:m-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkBreaks]}
                        components={{
                          p: ({ children }) => <p className="text-slate-900 leading-snug !m-0 text-base">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 !m-0 text-slate-900">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 !m-0 text-slate-900">{children}</ol>,
                          li: ({ children }) => <li className="text-slate-900 leading-snug !m-0">
                            {children}
                          </li>,
                          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                          em: ({ children }) => <em className="italic text-slate-700">{children}</em>
                        }}
                      >
                        {result}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="opacity-20 select-none flex flex-col items-center">
                    <img 
                      src="https://i.ibb.co/Nd7jfCGJ/NN-logo.jpg" 
                      alt="School Logo" 
                      className="w-24 h-24 mb-6 grayscale opacity-50 object-contain rounded-2xl"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">{t.emptyState}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        show={showSettings}
        onClose={() => setShowSettings(false)}
        t={t}
        apiKey={customApiKey}
        onApiKeyChange={handleApiKeyChange}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </div>
  );
}


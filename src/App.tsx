/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, BookOpen, Send, X, Key, Settings, ShieldCheck, FileDown, Copy, Check, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Translations
const translations = {
  vi: {
    title: "SOẠN TỪ ĐIỂN v3.0",
    author: "by Nhân Nhân - Trường THCS Tùng Thiện Vương, phường Phú Định, TPHCM",
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
    title: "DICTIONARY ENTRY GENERATOR v3.0",
    author: "by Nhan Nhan - Tung Thien Vuong Secondary School, Ho Chi Minh City",
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
    appDescription: "Supports creating Dictionary Entry exercises standard for the Grade 10 Entrance Exam in Ho Chi Minh City (Questions 35, 36). Teachers just need to type keywords (separated by commas), click Generate to receive a complete lesson, which can be copied directly or exported to a Word file for use. Thank you for using the app! Please send any feedback to email nhanntsgu@gmail.com.",
  }
};

// Prompt cơ sở - Người dùng có thể tùy chỉnh ở đây
const BASE_PROMPT = `Bạn là một chuyên gia soạn đề thi tiếng Anh lớp 10 tại TP.HCM.
Nhiệm vụ: Soạn bài tập dạng Dictionary Entry (câu 35–36) dựa trên từ khóa được cung cấp.

YÊU CẦU VỀ NỘI DUNG:
1. Dictionary Entry: Word, Phonetic, Part of speech, Definition (ngắn gọn), Synonym (nếu có).
2. Examples: 5 câu ví dụ đơn giản, tự nhiên. Trong đó 4 câu đầu phải chứa cụm từ (2-3 từ) làm đáp án cho 4 câu hỏi bên dưới. In đậm cụm từ đó.
3. Questions: 2 câu chính (35, 36) và 2 câu dự phòng (1, 2). Câu hỏi phải có ngữ cảnh khác ví dụ nhưng đáp án phải giữ nguyên văn từ ví dụ.

YÊU CẦU VỀ ĐỊNH DẠNG (CỰC KỲ QUAN TRỌNG - ĐỂ COPY SANG WORD KHÔNG LỖI):
- KHÔNG sử dụng dấu # hay ## cho tiêu đề.
- Sử dụng **[Tiêu đề]** cho các phần như ANSWERS, ĐÁP ÁN, Câu dự phòng.
- Giữa các phần (ví dụ giữa Examples và ANSWERS) PHẢI có đúng 1 dòng trống.
- Giữa các câu hỏi (35, 36, 1, 2) KHÔNG ĐƯỢC có dòng trống dư thừa.
- Các câu hỏi 35, 36 và 1, 2 phải được viết rõ ràng với số thứ tự ở đầu dòng.

CẤU TRÚC MẪU BẮT BUỘC (KHÔNG ĐƯỢC DƯ THỪA DÒNG TRỐNG):
**VI. Look at the entry of the word “_____” in a dictionary. Use what you can get from the entry to complete the sentences with two or three words.**

[word] /[phonetic]/
*part of speech*
*definition*
**SYNONYM**: ...

• example 1 (có **cụm đáp án**)
• example 2 (có **cụm đáp án**)
• example 3 (có **cụm đáp án dự phòng**)
• example 4 (có **cụm đáp án dự phòng**)
• example 5

**ANSWERS**
35. [câu hỏi 35]
36. [câu hỏi 36]

**Câu dự phòng**
1. [câu hỏi dự phòng 1]
2. [câu hỏi dự phòng 2]

**ĐÁP ÁN**
35. [đáp án]
36. [đáp án]

**Câu dự phòng**
1. [đáp án]
2. [đáp án]

LƯU Ý: Thay _____ bằng từ khóa. Đảm bảo các số thứ tự 35, 36, 1, 2 luôn xuất hiện đầy đủ.
Từ khóa: `;

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

  const t = translations[lang];

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

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-black/5 py-6 px-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.ibb.co/39w261cD/logottv-goc.png" 
              alt="Logo" 
              className="h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to book icon if link fails
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const icon = document.createElement('div');
                  icon.className = "bg-blue-800 p-2 rounded-xl";
                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open w-6 h-6 text-white"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
                  parent.insertBefore(icon, parent.firstChild);
                }
              }}
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
              <p className="text-[10px] text-slate-400 font-medium -mt-1">
                {t.author}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-xs font-mono text-slate-400 uppercase tracking-widest">
              {t.poweredBy}
            </div>
            <div className="flex items-center bg-slate-100 rounded-full p-1">
              <button
                onClick={() => setLang('vi')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'vi' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                VI
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 hover:bg-slate-100 rounded-full transition-colors ${showSettings ? 'text-blue-800 bg-blue-50' : 'text-slate-500'}`}
              title={t.settingsTitle}
            >
              <Settings className={`w-5 h-5 ${showSettings ? 'rotate-90' : ''} transition-transform duration-300`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {/* App Description */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 bg-slate-50/80 border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden group"
        >
          <div className="flex-shrink-0 w-14 h-14 bg-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform duration-500">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-slate-700 leading-relaxed text-sm text-center md:text-left">
              {t.appDescription.split('nhanntsgu@gmail.com').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <a href="mailto:nhanntsgu@gmail.com" className="text-blue-800 font-semibold hover:underline decoration-2 underline-offset-4">
                      nhanntsgu@gmail.com
                    </a>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>
        </motion.div>

        {/* API Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSettings(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <Settings className="w-5 h-5 text-blue-800" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                          {t.apiSettings}
                        </h3>
                        <a 
                          href="https://youtu.be/w0ux_YQwtx4" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-medium mt-0.5"
                        >
                          {t.apiGuide}
                        </a>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {t.apiCustomLabel}
                      </label>
                      <input
                        type="password"
                        value={customApiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        placeholder={t.apiPlaceholder}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all text-sm"
                      />
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {t.apiNote}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        {t.modelLabel}
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          onClick={() => setSelectedModel('gemini-3-flash-preview')}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                            selectedModel === 'gemini-3-flash-preview'
                              ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                              : 'bg-white border-slate-200 hover:border-blue-200'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedModel === 'gemini-3-flash-preview' ? 'border-blue-800' : 'border-slate-300'
                          }`}>
                            {selectedModel === 'gemini-3-flash-preview' && <div className="w-2.5 h-2.5 bg-blue-800 rounded-full" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${selectedModel === 'gemini-3-flash-preview' ? 'text-blue-900' : 'text-slate-700'}`}>
                              {t.modelFlash}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5">Model mặc định, thông minh & nhanh</span>
                          </div>
                        </button>

                        <button
                          onClick={() => setSelectedModel('gemini-3.1-flash-lite-preview')}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                            selectedModel === 'gemini-3.1-flash-lite-preview'
                              ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                              : 'bg-white border-slate-200 hover:border-blue-200'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedModel === 'gemini-3.1-flash-lite-preview' ? 'border-blue-800' : 'border-slate-300'
                          }`}>
                            {selectedModel === 'gemini-3.1-flash-lite-preview' && <div className="w-2.5 h-2.5 bg-blue-800 rounded-full" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${selectedModel === 'gemini-3.1-flash-lite-preview' ? 'text-blue-900' : 'text-slate-700'}`}>
                              {t.modelLite}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5">Dùng khi Flash hết hạn mức, tiết kiệm API</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowSettings(false)}
                      className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] mt-2"
                    >
                      Lưu & Đóng
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-md border border-black/5 mb-8"
        >
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
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
                  className="w-full pl-4 pr-20 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all text-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <AnimatePresence>
                    {keyword && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setKeyword('')}
                        className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                        title="Xóa nhanh"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <Sparkles className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>

            <button
              onClick={generateExercise}
              disabled={isLoading}
              className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-slate-400 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.generatingBtn}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t.generateBtn}
                </>
              )}
            </button>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 py-4 bg-blue-50/50 rounded-xl border border-blue-100/50"
              >
                <div className="flex items-center gap-2 text-blue-800 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={loadingMsgIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm"
                    >
                      {t.loadingMessages[loadingMsgIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-600"
                    animate={{ 
                      width: ["0%", "100%"],
                      x: ["-100%", "100%"]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm font-medium text-center"
              >
                {error}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Result Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 shadow-md border border-black/5"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-blue-800 rounded-full"></div>
                  <h2 className="text-2xl font-bold tracking-tight">{t.resultTitle}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-all"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-blue-800" /> : <Copy className="w-3.5 h-3.5" />}
                    {copySuccess ? t.copiedBtn : t.copyBtn}
                  </button>
                  <button
                    onClick={exportToWord}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-medium transition-all shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    {t.exportBtn}
                  </button>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none prose-headings:m-0 prose-p:m-0 prose-li:m-0">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-slate-900 leading-snug mb-0.5 last:mb-0 text-base">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-0.5 text-slate-900">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5 text-slate-900">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-900 leading-snug mb-0.5">
                      {children}
                    </li>,
                    strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                    em: ({ children }) => <em className="italic text-slate-700">{children}</em>
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {!result && !isLoading && (
          <div className="text-center py-20 opacity-20 select-none flex flex-col items-center">
            <img 
              src="https://i.ibb.co/39w261cD/logottv-goc.png" 
              alt="School Logo" 
              className="w-32 h-32 mb-4 grayscale object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <p className="text-xl font-medium">{t.emptyState}</p>
          </div>
        )}
      </main>
    </div>
  );
}


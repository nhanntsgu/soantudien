/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, BookOpen, Send, X, Key, Settings, ShieldCheck, FileDown, Copy, Check, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

// Translations
const translations = {
  vi: {
    title: "Dictionary Entry Generator v1.0",
    author: "by Nhân Nhân - Tung Thien Vuong Secondary School",
    poweredBy: "Powered by Gemini",
    apiSettings: "Cấu hình API Gemini",
    apiDefault: "API Mặc định",
    apiCustom: "API Riêng",
    apiPlaceholder: "Nhập Gemini API Key của bạn...",
    apiNote: "* API Key của bạn chỉ được lưu trong phiên làm việc này và không được gửi đi đâu khác ngoài Google Gemini.",
    apiDefaultNote: "Đang sử dụng API hệ thống do nhà phát triển cung cấp. Khóa API này được ẩn an toàn và không hiển thị với người dùng.",
    keywordLabel: "Từ khóa",
    keywordPlaceholder: "Ví dụ: benefit, information, aware...",
    generateBtn: "Tạo",
    generatingBtn: "Đang tạo...",
    errorEmpty: "Vui lòng nhập từ khóa!",
    errorNoDefaultApi: "API mặc định chưa được cấu hình.",
    errorNoCustomApi: "Vui lòng nhập API Key của bạn!",
    errorFailed: "Không thể tạo nội dung. Vui lòng thử lại.",
    errorConnect: "Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra lại.",
    resultTitle: "Đã tạo xong!",
    copyBtn: "Copy toàn bộ",
    copiedBtn: "Đã copy",
    exportBtn: "Tải file Word",
    emptyState: "Nhập từ khóa để bắt đầu",
    settingsTitle: "Cấu hình",
  },
  en: {
    title: "Dictionary Entry Generator v1.0",
    author: "by Nhan Nhan - Tung Thien Vuong Secondary School",
    poweredBy: "Powered by Gemini",
    apiSettings: "Gemini API Configuration",
    apiDefault: "Default API",
    apiCustom: "Custom API",
    apiPlaceholder: "Enter your Gemini API Key...",
    apiNote: "* Your API Key is only saved for this session and is not sent anywhere else except Google Gemini.",
    apiDefaultNote: "Using the system API provided by the developer. This API key is securely hidden and not visible to users.",
    keywordLabel: "Keyword",
    keywordPlaceholder: "Example: benefit, information, aware...",
    generateBtn: "Generate",
    generatingBtn: "Generating...",
    errorEmpty: "Please enter a keyword!",
    errorNoDefaultApi: "Default API is not configured.",
    errorNoCustomApi: "Please enter your API Key!",
    errorFailed: "Could not generate content. Please try again.",
    errorConnect: "An error occurred while connecting to AI. Please check again.",
    resultTitle: "Generation Complete!",
    copyBtn: "Copy All",
    copiedBtn: "Copied",
    exportBtn: "Download Word",
    emptyState: "Enter a keyword to start",
    settingsTitle: "Settings",
  }
};

// Khởi tạo Gemini AI
const DEFAULT_API_KEY = process.env.GEMINI_API_KEY || '';

// Prompt cơ sở - Người dùng có thể tùy chỉnh ở đây
const BASE_PROMPT = `Soạn bài tập dạng Dictionary giống đề tuyển sinh lớp 10 TP.HCM (câu 35–36).
Tôi sẽ cung cấp các từ khóa tiếng Anh.
Nhiệm vụ:
Với mỗi từ khóa, tạo:
• 1 dictionary entry
• 2 câu hỏi điền khuyết (câu 35 và 36)
PHẦN 1 — DICTIONARY ENTRY
Dictionary entry phải gồm:
word
phonetic transcription
part of speech
definition (ngắn gọn, dễ hiểu cho học sinh lớp 9)
SYNONYM (nếu có)
Sau đó viết 5 example sentences.
Yêu cầu example:
• câu đơn giản, tự nhiên
• trình độ lớp 9
• mỗi câu nên chứa 1 cụm từ có thể dùng làm đáp án
• cụm đó dài 2–3 từ
PHẦN 2 — TẠO CÂU HỎI
Tạo 2 câu hỏi điền khuyết:
ANSWERS
35.	
36.	
Quy tắc bắt buộc:
1.	Mỗi câu phải lấy chính xác một cụm 2–3 từ từ example sentences.
2.	Không được thay đổi dạng từ.
3.	Đáp án phải xuất hiện nguyên văn trong example. Đáp án phải có chứa từ khóa.
4.	Câu hỏi phải viết ngữ cảnh khác example để học sinh suy luận.
5.	Không được sao chép nguyên câu example.
6.	Mỗi câu chỉ có 1 đáp án đúng.
7.	Trình độ phù hợp học sinh lớp 9.
PHẦN 3 — KIỂM TRA LẠI (SELF-CHECK)
Trước khi xuất kết quả, kiểm tra:
✓ đáp án có xuất hiện nguyên văn trong example
✓ đáp án dài đúng 2–3 từ
✓ không có câu nào có 2 đáp án hợp lý
✓ câu hỏi không trùng với example
Nếu phát hiện lỗi → sửa lại trước khi xuất kết quả.
LƯU Ý: KHÔNG HIỂN THỊ NỘI DUNG PHẦN 3 TRONG KẾT QUẢ TRẢ VỀ.

PHẦN 4 — FORMAT BẮT BUỘC (Đảm bảo xuống dòng chính xác như mẫu sau):
**VI. Look at the entry of the word “_____” in a dictionary. Use what you can get from the entry to complete the sentences with two or three words.**
# [word] /phonetic/
part of speech
definition
**SYNONYM**: ...
• example 1 (Lưu ý: In đậm cụm từ chứa từ khóa mà bạn dùng làm đáp án)
• example 2 (Lưu ý: In đậm cụm từ chứa từ khóa mà bạn dùng làm đáp án)
• example 3
• example 4
• example 5
**ANSWERS**
35.	
36.	
**ĐÁP ÁN**
35.	…
36.	…

LƯU Ý: Thay _____ bằng từ khóa. Các dòng thông tin phải tách biệt rõ ràng.
Từ khóa: `;

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiMode, setApiMode] = useState<'default' | 'custom'>('default');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  const t = translations[lang];

  const exportToWord = async () => {
    if (!result) return;

    // Split content by lines to handle paragraphs
    const lines = result.split('\n');
    const paragraphs = lines.map(line => {
      // Detect Markdown H1 (# ) for the word line
      if (line.startsWith('# ')) {
        const content = line.slice(2);
        // Match word and phonetic part: "word /phonetic/"
        const phoneticMatch = content.match(/^(.*?)\s(\/.*\/)$/);
        
        if (phoneticMatch) {
          const word = phoneticMatch[1];
          const phonetic = phoneticMatch[2];
          return new Paragraph({
            children: [
              new TextRun({
                text: word,
                bold: true,
                font: "Times New Roman",
                size: 36, // 18pt
              }),
              new TextRun({
                text: ' ' + phonetic,
                font: "Times New Roman",
                size: 24, // 12pt
              }),
            ],
            spacing: {
              line: 276,
            },
          });
        }
      }

      let isHeader = false;
      let cleanLine = line;
      
      if (line.startsWith('# ')) {
        isHeader = true;
        cleanLine = line.slice(2);
      }

      // Simple bold detection (Markdown **)
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const children = parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return new TextRun({
            text: part.slice(2, -2),
            bold: true,
            font: "Times New Roman",
            size: isHeader ? 36 : 24,
          });
        }
        return new TextRun({
          text: part,
          bold: isHeader,
          font: "Times New Roman",
          size: isHeader ? 36 : 24,
        });
      });

      return new Paragraph({
        children,
        spacing: {
          line: 276, // 1.15 * 240 (standard line height) = 276
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
      // Convert Markdown bold to HTML bold for rich text clipboard
      const htmlContent = result
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\n/g, '<br>');
      
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([result.replace(/\*\*/g, '')], { type: 'text/plain' });
      
      const data = [new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      })];

      await navigator.clipboard.write(data);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback to plain text if rich text fails
      await navigator.clipboard.writeText(result.replace(/\*\*/g, ''));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const generateExercise = async () => {
    if (!keyword.trim()) {
      setError(t.errorEmpty);
      return;
    }

    const apiKeyToUse = apiMode === 'default' ? DEFAULT_API_KEY : customApiKey;
    
    if (!apiKeyToUse) {
      setError(apiMode === 'default' ? t.errorNoDefaultApi : t.errorNoCustomApi);
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: apiKeyToUse });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${BASE_PROMPT} ${keyword}`,
      });
      const text = response.text;
      
      if (text) {
        setResult(text);
      } else {
        setError(t.errorFailed);
      }
    } catch (err) {
      console.error(err);
      setError(t.errorConnect);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-black/5 py-6 px-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to school website logo if local logo.png is missing
                e.currentTarget.src = "https://thcstungthienvuong.hcm.edu.vn/UploadImages/thcstungthienvuong/2017_1/logo_211201710.png";
                e.currentTarget.onerror = () => {
                  // Final fallback to book icon
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const icon = document.createElement('div');
                    icon.className = "bg-emerald-500 p-2 rounded-xl";
                    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open w-6 h-6 text-white"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
                    parent.insertBefore(icon, parent.firstChild);
                  }
                };
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
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'vi' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                VI
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 hover:bg-slate-100 rounded-full transition-colors ${showSettings ? 'text-emerald-500 bg-emerald-50' : 'text-slate-500'}`}
              title={t.settingsTitle}
            >
              <Settings className={`w-5 h-5 ${showSettings ? 'rotate-90' : ''} transition-transform duration-300`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {/* API Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-500" />
                    {t.apiSettings}
                  </h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setApiMode('default')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        apiMode === 'default' 
                          ? 'bg-white text-emerald-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {t.apiDefault}
                    </button>
                    <button
                      onClick={() => setApiMode('custom')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        apiMode === 'custom' 
                          ? 'bg-white text-emerald-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Key className="w-4 h-4" />
                      {t.apiCustom}
                    </button>
                  </div>

                  {apiMode === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <input
                        type="password"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        placeholder={t.apiPlaceholder}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                      />
                      <p className="mt-2 text-[11px] text-slate-400">
                        {t.apiNote}
                      </p>
                    </motion.div>
                  )}

                  {apiMode === 'default' && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        {t.apiDefaultNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
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
                  className="w-full pl-4 pr-20 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg"
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
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
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
                  <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold tracking-tight">{t.resultTitle}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-all"
                  >
                    {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copySuccess ? t.copiedBtn : t.copyBtn}
                  </button>
                  <button
                    onClick={exportToWord}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-all shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    {t.exportBtn}
                  </button>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-p:text-slate-600 prose-li:text-slate-600 whitespace-pre-wrap">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => {
                      const text = String(children);
                      const phoneticMatch = text.match(/^(.*?)\s(\/.*\/)$/);
                      if (phoneticMatch) {
                        return (
                          <h1 className="mb-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{phoneticMatch[1]}</span>
                            <span className="text-base font-normal text-slate-500">{phoneticMatch[2]}</span>
                          </h1>
                        );
                      }
                      return <h1 className="text-2xl font-bold mb-2">{children}</h1>;
                    }
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
              src="/logo.png" 
              alt="School Logo" 
              className="w-32 h-32 mb-4 grayscale object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://thcstungthienvuong.hcm.edu.vn/UploadImages/thcstungthienvuong/2017_1/logo_211201710.png";
                e.currentTarget.onerror = () => {
                  e.currentTarget.style.display = 'none';
                };
              }}
            />
            <p className="text-xl font-medium">{t.emptyState}</p>
          </div>
        )}
      </main>
    </div>
  );
}


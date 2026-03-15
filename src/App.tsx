/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, BookOpen, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

// Khởi tạo Gemini AI
// Lưu ý: process.env.GEMINI_API_KEY được tự động chèn bởi hệ thống
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
VI. Look at the entry of the word “_____” in a dictionary. Use what you can get from the entry to complete the sentences with two or three words.
[word] /phonetic/
part of speech
definition
SYNONYM: ...
• example 1
• example 2
• example 3
• example 4
• example 5
ANSWERS
35.	
36.	
ĐÁP ÁN
35.	…
36.	…

LƯU Ý: Thay _____ bằng từ khóa. Các dòng thông tin phải tách biệt rõ ràng.
Từ khóa: `;

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateExercise = async () => {
    if (!keyword.trim()) {
      setError('Vui lòng nhập từ khóa!');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${BASE_PROMPT} ${keyword}`,
      });
      const text = response.text;
      
      if (text) {
        setResult(text);
      } else {
        setError('Không thể tạo nội dung. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-black/5 py-6 px-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Dictionary Entry Generator</h1>
          </div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Powered by Gemini
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-md border border-black/5 mb-8"
        >
          <div className="flex flex-col gap-6">
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                Từ khóa
              </label>
              <div className="relative">
                <input
                  id="keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateExercise()}
                  placeholder="Ví dụ: benefit, information, aware..."
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
                  Đang tạo...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Tạo
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
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                <h2 className="text-2xl font-bold tracking-tight">Kết quả bài tập</h2>
              </div>
              
              <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-p:text-slate-600 prose-li:text-slate-600 whitespace-pre-wrap">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => window.print()}
                  className="text-sm font-medium text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
                >
                  In bài tập này
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !isLoading && (
          <div className="text-center py-20 opacity-20 select-none">
            <BookOpen className="w-24 h-24 mx-auto mb-4" />
            <p className="text-xl font-medium">Nhập từ khóa để bắt đầu</p>
          </div>
        )}
      </main>
    </div>
  );
}


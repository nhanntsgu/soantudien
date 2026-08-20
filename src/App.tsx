/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, BookOpen, Send, X, Key, Settings, ShieldCheck, FileDown, Copy, Check, Languages, History, Trash2, Home, ExternalLink, RefreshCw, Info, ArrowLeft, GraduationCap, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { changelog } from './changelog';
import { Header } from './components/Header';

// Translations
const translations = {
  vi: {
    title: "SOẠN TỪ ĐIỂN v4.5.2",
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
    apiModeLabel: "Chế độ API Key",
    apiModeDefault: "Sử dụng API mặc định",
    apiModeCustom: "Tự nhập API Key",
    apiDefaultDesc: "Hệ thống sẽ tự động dùng API Key cấu hình từ biến môi trường của dự án.",
    apiDefaultEnvText: "Tên biến môi trường cần cấu hình:",
    apiDefaultFound: "Đã thiết lập biến môi trường VITE_GEMINI_API_KEY thành công!",
    apiDefaultNotFound: "Chưa cấu hình biến môi trường VITE_GEMINI_API_KEY. Vui lòng thêm biến này hoặc chọn 'Tự nhập API Key'.",
    apiDefaultStatus: "Trạng thái:",
    apiConnected: "Đã kết nối",
    apiConnectError: "Lỗi kết nối",
    apiChecking: "Đang kiểm tra...",
    keywordLabel: "Từ khóa",
    keywordPlaceholder: "Ví dụ: benefit, information, aware...",
    targetBoldWordsLabel: "Các từ in đậm cần xuất hiện",
    targetBoldWordsPlaceholder: "Ví dụ: financial benefit, benefit from, mutual benefit...",
    targetBoldWordsHint: "Nhập các từ/cụm từ (cách nhau bằng dấu phẩy) muốn xuất hiện in đậm trong câu ví dụ và làm đáp án.",
    optionalTag: "Tùy chọn",
    levelLabel: "Cấp độ & Bộ lọc từ vựng",
    levelGrade6: "Lớp 6: Đầu bậc A2 (Ví dụ đơn giản)",
    levelGrade7: "Lớp 7: Giữa/cuối bậc A2 (Nâng cao hơn lớp 6)",
    levelGrade8: "Lớp 8: Cuối A2 / Đầu B1",
    levelGrade9: "Lớp 9: Đầu B1 đến giữa B1",
    levelEntrance10: "Tuyển sinh 10: Nâng cao B1 (B1+)",
    generateBtn: "Tạo",
    generatingBtn: "Đang xử lý...",
    errorEmpty: "Vui lòng nhập từ khóa!",
    errorNoCustomApi: "Vui lòng cấu hình API Key hoạt động của bạn!",
    errorFailed: "Không thể tạo nội dung. Vui lòng thử lại.",
    errorConnect: "Đã xảy ra lỗi khi kết nối với AI. Vui lòng kiểm tra lại cấu hình key.",
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
    modelFlash: "Gemini 3.5 Flash (Mới nhất)",
    modelLite: "Gemini 3.1 Flash Lite (Tiết kiệm)",
    appDescription: "Hỗ trợ soạn bài tập dạng Từ điển (Definition Entry) chuẩn đề thi Tuyển sinh lớp 10 tại TP.HCM (Câu 35, 36). Thầy cô chỉ cần gõ từ khóa (cách nhau dấu phẩy), bấm Tạo thì sẽ nhận được bài hoàn chỉnh, có thể copy trực tiếp hoặc xuất file Word để sử dụng. Cảm ơn thầy cô đã sử dụng app! Mọi đóng góp xin gửi về email nhanntsgu@gmail.com.",
    changelogTitle: "Nhật ký thay đổi",
    versionLabel: "Phiên bản",
    dateLabel: "Ngày cập nhật",
  },
  en: {
    title: "DICTIONARY ENTRY GENERATOR v4.5.0",
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
    apiModeLabel: "API Key Mode",
    apiModeDefault: "Use Default API",
    apiModeCustom: "Enter Custom API Key",
    apiDefaultDesc: "The system will automatically use the API Key configured via the environment variables.",
    apiDefaultEnvText: "Required environment variable name:",
    apiDefaultFound: "Environment variable VITE_GEMINI_API_KEY is configured successfully!",
    apiDefaultNotFound: "VITE_GEMINI_API_KEY not found. Please add this variable to your environment or choose 'Enter Custom API Key'.",
    apiDefaultStatus: "Status:",
    apiConnected: "Connected",
    apiConnectError: "Connection Error",
    apiChecking: "Checking...",
    keywordLabel: "Keyword",
    keywordPlaceholder: "Example: benefit, information, aware...",
    targetBoldWordsLabel: "Bold Target Words to Appear",
    targetBoldWordsPlaceholder: "Example: financial benefit, benefit from, mutual benefit...",
    targetBoldWordsHint: "Enter specific words/phrases (comma-separated) to be bolded in example sentences and used as answers.",
    optionalTag: "Optional",
    levelLabel: "Grade Level & Vocabulary Filter",
    levelGrade6: "Grade 6: Early A2 Level (Simple Examples)",
    levelGrade7: "Grade 7: Mid/Late A2 Level (Advanced than Grade 6)",
    levelGrade8: "Grade 8: Late A2 / Early B1 Level",
    levelGrade9: "Grade 9: Early B1 to Mid B1 Level",
    levelEntrance10: "Grade 10 Entrance Exam: Advanced B1 (B1+)",
    generateBtn: "Generate",
    generatingBtn: "Processing...",
    errorEmpty: "Please enter a keyword!",
    errorNoCustomApi: "Please configure an active API Key!",
    errorFailed: "Could not generate content. Please try again.",
    errorConnect: "An error occurred while connecting to AI. Please verify your key.",
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
    modelFlash: "Gemini 3.5 Flash (Latest)",
    modelLite: "Gemini 3.1 Flash Lite (Lite)",
    appDescription: "Supports creating Dictionary Entry exercises standard for the Grade 10 Entrance Exam in Ho Chi Minh City (Questions 35, 36). Teachers just need to type keywords (separated by commas), click Generate to receive a complete lesson, which can be copied directly or exported to a Word file for use. Thank you for using the app! Please send any feedback to email nhanntsgu@gmail.com.",
    changelogTitle: "Changelog",
    versionLabel: "Version",
    dateLabel: "Update Date",
  }
};

// Prompt cơ sở - Người dùng có thể tùy chỉnh ở đây
const BASE_PROMPT = `Bạn là một chuyên gia soạn đề thi tiếng Anh lớp 10 tại TP.HCM.
Nhiệm vụ: Soạn bài tập dạng Dictionary Entry (câu 1–2) dựa trên từ khóa được cung cấp.

YÊU CẦU VỀ NỘI DUNG (CỰC KỲ QUAN TRỌNG):
1. Dictionary Entry: Word, Phonetic, Part of speech, Definition (ngắn gọn), Synonym (nếu có).
2. Examples (5 câu ví dụ):
   - TẤT CẢ 5 CÂU VÍ DỤ BẮT BUỘC PHẢI CHỨA TỪ KHÓA ĐÃ CHO. Tuyệt đối không được có bất kỳ câu ví dụ nào thiếu từ khóa.
   - ĐỊNH DẠNG CÂU VÍ DỤ: Mỗi câu ví dụ BẮT ĐẦU TRỰC TIẾP bằng dấu chấm tròn "• " kèm câu văn tiếng Anh tự nhiên. TUYỆT ĐỐI KHÔNG ghi chữ "example 1", "example 2", "Example 1:", "Ex 1:" hay "câu ví dụ 1" trước câu.
   - CỤM TỪ IN ĐẬM Ở CẢ 5 CÂU VÍ DỤ BẮT BUỘC PHẢI LÀ CÁC COLLOCATIONS / CỤM TỪ (2-3 TỪ) CHỨA TRỰC TIẾP TỪ KHÓA (Ví dụ: Từ khóa là "benefit" thì các cụm in đậm phải là "**health benefit**", "**benefit from**", "**mutual benefit**", "**financial benefit**", "**reap the benefit**", "**of great benefit**"...). TUYỆT ĐỐI KHÔNG ĐƯỢC in đậm bất kỳ cụm từ ngẫu nhiên nào không chứa từ khóa (như "**take care of**", "**in addition to**"...).
   - TỶ LỆ ĐỘ DÀI CỤM IN ĐẬM (BẮT BUỘC PHÂN BỔ 40% 3 TỪ & 60% 2 TỪ):
     + BẮT BUỘC trong 5 câu ví dụ phải có ĐÚNG 2 CÂU in đậm CỤM 3 TỪ (chiếm 40%; ví dụ: "**reap the benefit**", "**of great benefit**", "**derive much benefit**", "**have the benefit**", "**bring great benefit**"...).
     + 3 CÂU CÒN LẠI in đậm CỤM 2 TỪ (chiếm 60%; ví dụ: "**benefit from**", "**health benefit**", "**mutual benefit**"...).
     + TUYỆT ĐỐI KHÔNG ĐƯỢC để 100% đều là cụm 2 từ, và TUYỆT ĐỐI KHÔNG IN ĐẬM 1 TỪ ĐƠN LẺ.
   - TÍNH ĐỘC LẬP / KHÔNG TRÙNG NHAU: Cụm từ in đậm ở mỗi câu ví dụ PHẢI KHÁC NHAU, TUYỆT ĐỐI KHÔNG TRÙNG NHAU (mỗi câu 1 cụm in đậm riêng biệt, không lặp lại).
   - 4 câu ví dụ đầu chứa 4 cụm in đậm làm đáp án cho 4 câu hỏi bên dưới (câu 1, 2 và câu dự phòng 3, 4). Câu ví dụ 5 cũng phải chứa cụm in đậm chứa từ khóa (khác biệt với 4 cụm trước).
3. Questions: 2 câu chính (1, 2) và 2 câu dự phòng (3, 4). Câu hỏi phải có ngữ cảnh khác ví dụ nhưng đáp án phải giữ nguyên văn cụm in đậm (2 hoặc 3 từ) tương ứng từ phần ví dụ.

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

• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 2 từ có từ khóa 1**]
• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 3 từ có từ khóa 2**]
• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 2 từ có từ khóa 3**]
• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 3 từ có từ khóa 4**]
• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 2 từ có từ khóa 5**]

1. [câu hỏi 1 có chỗ trống _______ để điền cụm 1 (2 từ)]
2. [câu hỏi 2 có chỗ trống _______ để điền cụm 2 (3 từ)]

**ĐÁP ÁN**
1. [đáp án của câu 1 - nguyên văn cụm 1]
2. [đáp án của câu 2 - nguyên văn cụm 2]

**CÂU DỰ PHÒNG**
3. [câu hỏi dự phòng 3 có chỗ trống _______ để điền cụm 3 (2 từ)]
4. [câu hỏi dự phòng 4 có chỗ trống _______ để điền cụm 4 (3 từ)]

**ĐÁP ÁN CÂU DỰ PHÒNG**
3. [đáp án của câu dự phòng 3 - nguyên văn cụm 3]
4. [đáp án của câu dự phòng 4 - nguyên văn cụm 4]

LƯU Ý: Thay _____ bằng từ khóa. ĐẶC BIỆT LƯU Ý: CẢ 5 câu ví dụ BẮT BUỘC PHẢI CHỨA TỪ KHÓA và cụm in đậm trong cả 5 câu BẮT BUỘC phải là cụm chứa trực tiếp từ khóa, trong đó ĐÚNG 2 CÂU LÀ CỤM 3 TỪ (40%) và 3 CÂU LÀ CỤM 2 TỪ (60%). TUYỆT ĐỐI KHÔNG ghi chữ "example 1", "example 2" hay số thứ tự trước câu ví dụ (chỉ dùng dấu "• " rồi viết câu). TUYỆT ĐỐI KHÔNG in đậm 1 từ đơn lẻ, TUYỆT ĐỐI KHÔNG để 100% là 2 từ, và TUYỆT ĐỐI KHÔNG in đậm cụm từ không chứa từ khóa. Từ/cụm từ in đậm ở mỗi câu ví dụ PHẢI HOÀN TOÀN KHÁC NHAU, KHÔNG TRÙNG LẮP. Đảm bảo các ví dụ (example) nằm trên các dòng riêng biệt. Sau các tiêu đề **ĐÁP ÁN**, **CÂU DỰ PHÒNG**, **ĐÁP ÁN CÂU DỰ PHÒNG** phải xuống dòng ngay để viết nội dung, không để dòng trống. Phân cách giữa các phần bằng đúng 1 dòng trống.`;

// Helper hàm tạo prompt bổ sung theo Cấp độ & Bộ lọc từ vựng
const getGradeLevelPrompt = (level: string) => {
  switch (level) {
    case 'grade6':
      return `YÊU CẦU TRÌNH ĐỘ VÀ BỘ LỌC TỪ VỰNG (CỰC KỲ QUAN TRỌNG):
- Trình độ target: Lớp 6 (Đầu bậc A2 CEFR).
- Từ vựng & Cấu trúc: Các câu ví dụ (example), định nghĩa và ngữ cảnh câu hỏi BẮT BUỘC ở dạng đơn giản, ngắn gọn, cấu trúc ngữ pháp cơ bản, cực kỳ dễ hiểu phù hợp với học sinh Lớp 6 đầu cấp THCS.`;
    case 'grade7':
      return `YÊU CẦU TRÌNH ĐỘ VÀ BỘ LỌC TỪ VỰNG (CỰC KỲ QUAN TRỌNG):
- Trình độ target: Lớp 7 (Giữa/cuối bậc A2 CEFR).
- Từ vựng & Cấu trúc: Các câu ví dụ và ngữ cảnh câu hỏi nâng cao hơn hẳn so với lớp 6, câu dài hơn một chút nhưng nằm hoàn toàn trong phạm vi chuẩn mực bậc A2.`;
    case 'grade8':
      return `YÊU CẦU TRÌNH ĐỘ VÀ BỘ LỌC TỪ VỰNG (CỰC KỲ QUAN TRỌNG):
- Trình độ target: Lớp 8 (Cuối bậc A2 đến Đầu bậc B1 CEFR).
- Từ vựng & Cấu trúc: Ngữ cảnh đa dạng, kết hợp hài hòa từ vựng A2 nâng cao và từ vựng/ngữ pháp mới tiếp cận bậc B1.`;
    case 'grade9':
      return `YÊU CẦU TRÌNH ĐỘ VÀ BỘ LỌC TỪ VỰNG (CỰC KỲ QUAN TRỌNG):
- Trình độ target: Lớp 9 (Đầu B1 đến giữa bậc B1 CEFR).
- Từ vựng & Cấu trúc: Sử dụng ngữ pháp phong phú, từ vựng chuẩn chương trình Lớp 9 THCS, ngữ cảnh bài tập thực tế.`;
    case 'entrance10':
    default:
      return `YÊU CẦU TRÌNH ĐỘ VÀ BỘ LỌC TỪ VỰNG (CỰC KỲ QUAN TRỌNG):
- Trình độ target: Ôn thi Tuyển sinh Lớp 10 (Nâng cao B1+ CEFR).
- Từ vựng & Cấu trúc: Ngữ cảnh câu mang tính phân hóa cao, từ vựng chuẩn cấu trúc đề thi Tuyển sinh 10 TP.HCM, cấu trúc câu tự nhiên, chặt chẽ.`;
  }
};

interface HistoryItem {
  keyword: string;
  result: string;
  level?: string;
  boldWords?: string;
}

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
  defaultKeyExists,
  apiKeyStatus
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
  defaultKeyExists: boolean;
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

              <div className="space-y-5">
                {/* Model Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                    {t.modelLabel}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => onModelChange('gemini-3.6-flash')}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedModel === 'gemini-3.6-flash' ? 'border-blue-800 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-bold ${selectedModel === 'gemini-3.6-flash' ? 'text-blue-800' : 'text-slate-700'}`}>{t.modelFlash}</span>
                        <span className="text-[10px] text-slate-400">Gemini 3.6 Flash (Nhanh & Thông minh nhất)</span>
                      </div>
                      {selectedModel === 'gemini-3.6-flash' && <ShieldCheck className="w-5 h-5 text-blue-800" />}
                    </button>
                    <button
                      onClick={() => onModelChange('gemini-3.5-flash-lite')}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedModel === 'gemini-3.5-flash-lite' ? 'border-blue-800 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-bold ${selectedModel === 'gemini-3.5-flash-lite' ? 'text-blue-800' : 'text-slate-700'}`}>{t.modelLite}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Gemini 3.5 Flash Lite (Tiết kiệm & Mặc định)</span>
                      </div>
                      {selectedModel === 'gemini-3.5-flash-lite' && <ShieldCheck className="w-5 h-5 text-blue-800" />}
                    </button>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* API Key Connection Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    {t.apiModeLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => onApiModeChange('default')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all ${apiMode === 'default' ? 'border-blue-800 bg-blue-50/50 text-blue-800 font-bold' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}
                    >
                      <Settings className="w-5 h-5 mb-1" />
                      <span className="text-xs">{t.apiModeDefault}</span>
                    </button>
                    <button
                      onClick={() => onApiModeChange('custom')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all ${apiMode === 'custom' ? 'border-blue-800 bg-blue-50/50 text-blue-800 font-bold' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}
                    >
                      <Key className="w-5 h-5 mb-1" />
                      <span className="text-xs">{t.apiModeCustom}</span>
                    </button>
                  </div>

                  {apiMode === 'default' ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {t.apiDefaultDesc}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-xs font-semibold">
                        <span className="text-slate-500">{t.apiDefaultStatus}</span>
                        {apiKeyStatus === 'valid' ? (
                          <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            {t.apiConnected}
                          </span>
                        ) : apiKeyStatus === 'checking' ? (
                          <span className="text-amber-500 flex items-center gap-1.5 font-bold">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                            {t.apiChecking}
                          </span>
                        ) : (
                          <span className="text-red-500 flex items-center gap-1.5 font-bold">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                            {t.apiConnectError}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
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
                      <p className="text-[10px] text-slate-400 italic">
                        {t.apiNote}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] text-sm mt-2"
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

function HistoryModal({ 
  show, 
  onClose, 
  history, 
  onSelect, 
  onDelete, 
  onClear, 
  t 
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
  const filteredHistory = history.filter(item => 
    item.keyword.toLowerCase().includes(search.toLowerCase()) ||
    (item.boldWords && item.boldWords.toLowerCase().includes(search.toLowerCase()))
  );

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
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-800">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">{t.historyTitle}</h2>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full">
                      {history.length} bài
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Xem và mở lại các bài tập đã tạo</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Actions Bar */}
            {history.length > 0 && (
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm từ khóa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-800"
                />
                <button
                  onClick={onClear}
                  className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.clearHistory}
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2.5 custom-scrollbar">
              {history.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                    <History className="w-8 h-8 text-blue-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Chưa có lịch sử soạn bài</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    Khi bạn nhập từ khóa và bấm "Tạo", bài tập sẽ tự động được lưu tại đây.
                  </p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Không tìm thấy bài tập nào phù hợp với "{search}".
                </div>
              ) : (
                filteredHistory.map((item, idx) => (
                  <div
                    key={item.keyword + idx}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="group p-3.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm hover:shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-800 group-hover:text-blue-900 truncate">
                          {item.keyword}
                        </span>
                        {item.level && (
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200 flex-shrink-0">
                            {item.level === 'grade6' ? 'Lớp 6' :
                             item.level === 'grade7' ? 'Lớp 7' :
                             item.level === 'grade8' ? 'Lớp 8' :
                             item.level === 'grade9' ? 'Lớp 9' : 'Tuyển sinh 10'}
                          </span>
                        )}
                      </div>
                      {item.boldWords && (
                        <p className="text-[11px] text-slate-500 truncate">
                          <span className="font-semibold text-slate-600">In đậm:</span> {item.boldWords}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[11px] font-bold text-blue-800 bg-white border border-blue-200 px-2.5 py-1 rounded-lg shadow-2xs group-hover:bg-blue-800 group-hover:text-white transition-colors">
                        Mở bài
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(e, item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa bài này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
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
  lang 
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
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-800 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-900/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {lang === 'vi' ? 'Thông tin ứng dụng' : 'Application Information'}
                  </h2>
                  <p className="text-xs text-slate-400">SOẠN TỪ ĐIỂN v4.5.0 - by Thầy Nhân Nhân</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 px-6 pt-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'info'
                    ? 'border-blue-800 text-blue-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                {lang === 'vi' ? 'Giới thiệu & Tác giả' : 'About & Author'}
              </button>
              <button
                onClick={() => setActiveTab('changelog')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'changelog'
                    ? 'border-blue-800 text-blue-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {lang === 'vi' ? 'Nhật ký thay đổi (Changelog)' : 'Release Notes'}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {activeTab === 'info' ? (
                <div className="space-y-4 text-slate-700 text-xs">
                  {/* Author Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
                    <img
                      src="https://i.ibb.co/Nd7jfCGJ/NN-logo.jpg"
                      alt="Logo"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">Tác giả biên soạn</span>
                      <h4 className="text-base font-black text-slate-900 leading-tight">Thầy Nhân Nhân</h4>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        Giáo viên Tiếng Anh - Trường THCS Tùng Thiện Vương, phường Phú Định, TP.HCM
                      </p>
                      <a
                        href="mailto:nhanntsgu@gmail.com"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 hover:underline mt-1"
                      >
                        nhanntsgu@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Mục đích ứng dụng</h5>
                    <p className="text-slate-600 leading-relaxed">
                      {t.appDescription.split('nhanntsgu@gmail.com').map((part: string, i: number, arr: any[]) => (
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
                  </div>

                  {/* Key Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-800 block mb-1">🎯 5 Cấp độ chuẩn năng lực</span>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Lớp 6 (Đầu A2), Lớp 7 (A2), Lớp 8 (A2/B1), Lớp 9 (B1) và Tuyển sinh 10 (B1+).
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-800 block mb-1">📝 Cụm từ in đậm 2-3 từ</span>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Chuẩn hóa câu 1-2 đề TS10: bắt buộc cụm từ in đậm phải từ 2 đến 3 từ, không in đậm 1 từ đơn.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-800 block mb-1">📄 Xuất file Word (.docx)</span>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Xuất file Word chuẩn định dạng, canh lề bài bản, sẵn sàng in hoặc chèn vào đề kiểm tra.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-800 block mb-1">⚡ Lưu lịch sử tự động</span>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Toàn bộ từ khóa và bài tập đã tạo được lưu cục bộ an toàn, truy cập lại nhanh ở góc phải thanh Header.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {changelog.map((entry, idx) => (
                    <div key={entry.version} className={`pb-6 ${idx !== changelog.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-blue-800 text-white text-[10px] font-bold rounded-full">
                          {t.versionLabel} {entry.version}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {t.dateLabel}: {entry.date}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {entry.changes[lang].map((change, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
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
  keyword,
  loadingMsg,
  lang,
}: {
  show: boolean;
  status: 'loading' | 'success';
  keyword: string;
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
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 border border-slate-100 flex flex-col items-center text-center overflow-hidden"
          >
            {status === 'loading' ? (
              <div className="flex flex-col items-center w-full">
                {/* AI Animation Ring */}
                <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-800 border-r-blue-600"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center shadow-inner"
                  >
                    <Sparkles className="w-6 h-6 text-blue-800" />
                  </motion.div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {lang === 'vi' ? 'Đang soạn bài tập...' : 'Generating Exercise...'}
                </h3>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-slate-600 text-xs font-semibold mb-3 truncate max-w-full">
                  {lang === 'vi' ? 'Từ khóa:' : 'Keyword:'} <span className="text-blue-800 font-bold">"{keyword}"</span>
                </div>

                {/* Step Message */}
                <div className="min-h-[42px] flex items-center justify-center px-2">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMsg}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs font-medium text-slate-500 leading-relaxed"
                    >
                      {loadingMsg}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center w-full py-2"
              >
                {/* Green Checkmark Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border-4 border-emerald-100 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </motion.div>

                {/* Success Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-black text-emerald-700 tracking-tight mb-1"
                >
                  {lang === 'vi' ? 'Đã tạo xong!' : 'Generated Successfully!'}
                </motion.h3>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs font-medium text-slate-500 mt-1"
                >
                  {lang === 'vi' ? 'Bài tập đã sẵn sàng sử dụng!' : 'Exercise is ready to use!'}
                </motion.p>
              </motion.div>
            )}
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
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState<'loading' | 'success'>('loading');
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
    const hasKey = mode === 'default' 
      ? !!import.meta.env.VITE_GEMINI_API_KEY 
      : !!localStorage.getItem('gemini_api_key');
    return !hasKey;
  });
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.6-flash' | 'gemini-3.5-flash-lite'>('gemini-3.5-flash-lite');
  const [gradeLevel, setGradeLevel] = useState<string>(() => {
    return localStorage.getItem('dictionary_grade_level') || 'entrance10';
  });
  const [targetBoldWords, setTargetBoldWords] = useState<string>(() => {
    return localStorage.getItem('dictionary_bold_words') || '';
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('dictionary_history_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const handleGradeLevelChange = (val: string) => {
    setGradeLevel(val);
    localStorage.setItem('dictionary_grade_level', val);
  };

  const handleTargetBoldWordsChange = (val: string) => {
    setTargetBoldWords(val);
    localStorage.setItem('dictionary_bold_words', val);
  };

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

  // key checking effect
  useEffect(() => {
    const key = apiMode === 'default' 
      ? import.meta.env.VITE_GEMINI_API_KEY 
      : customApiKey;

    if (!key) {
      setApiKeyStatus('empty');
      return;
    }

    setApiKeyStatus('checking');

    const delay = apiMode === 'custom' ? 800 : 0;
    const timer = setTimeout(async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: 'Ping',
          config: { maxOutputTokens: 1 },
        });
        setApiKeyStatus('valid');
      } catch (err) {
        console.error("API Connection checking failed:", err);
        setApiKeyStatus('invalid');
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [apiMode, customApiKey]);

  const handleApiKeyChange = (value: string) => {
    setCustomApiKey(value);
    localStorage.setItem('gemini_api_key', value);
  };

  const handleApiModeChange = (mode: 'default' | 'custom') => {
    setApiMode(mode);
    localStorage.setItem('gemini_api_mode', mode);
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
    if (apiKeyStatus !== 'valid') {
      setError(lang === 'vi' ? 'Vui lòng cấu hình API Key hợp lệ và hoạt động để sử dụng!' : 'Please configure a valid active API Key to use!');
      setShowSettings(true);
      return;
    }

    if (!keyword.trim()) {
      setError(t.errorEmpty);
      return;
    }

    setIsLoading(true);
    setShowGeneratingModal(true);
    setGeneratingStatus('loading');
    setError('');
    setResult('');

    const tryGenerate = async (modelName: string) => {
      const activeKey = apiMode === 'default' 
        ? import.meta.env.VITE_GEMINI_API_KEY 
        : customApiKey;

      if (!activeKey) {
        throw new Error("No API key configured");
      }

      const ai = new GoogleGenAI({ apiKey: activeKey });
      const levelPrompt = getGradeLevelPrompt(gradeLevel);

      let boldWordsPrompt = '';
      if (targetBoldWords && targetBoldWords.trim()) {
        boldWordsPrompt = `\n\nYÊU CẦU BẮT BUỘC VỀ CÁC TỪ IN ĐẬM / CỤM ĐÁP ÁN:
Người dùng ĐÃ CHỈ ĐỊNH CỤ THỂ các từ/cụm từ in đậm (sẽ là đáp án điền vào chỗ trống trong các câu ví dụ và câu hỏi) như sau:
"${targetBoldWords.trim()}"

QUY TẮC BẮT BUỘC:
1. TẤT CẢ 5 câu ví dụ (Examples 1, 2, 3, 4, 5) BẮT BUỘC PHẢI CHỨA TỪ KHÓA "${keyword}".
2. BẮT BUỘC phải sử dụng lần lượt đúng các từ/cụm từ trên làm các cụm từ được IN ĐẬM (**từ_in_đậm**) trong các câu ví dụ. Mỗi câu ví dụ PHẢI DÙNG một cụm in đậm KHÁC NHAU, TUYỆT ĐỐI KHÔNG TRÙNG NHAU.
3. Tất cả các cụm từ in đậm BẮT BUỘC phải gồm TỪ 2 ĐẾN 3 TỪ (độ dài ít nhất 2 từ, nhiều nhất 3 từ). TUYỆT ĐỐI KHÔNG ĐƯỢC IN ĐẬM 1 TỪ ĐƠN LẺ và TUYỆT ĐỐI KHÔNG in đậm cụm từ không liên quan đến từ khóa "${keyword}".
4. Các cụm từ in đậm độc lập này BẮT BUỘC phải được dùng làm đáp án chính xác tương ứng cho các câu hỏi 1, 2, 3, 4.
5. Soạn ngữ cảnh xung quanh câu ví dụ và câu hỏi sao cho hoàn chỉnh, tự nhiên và phù hợp với từ khóa "${keyword}".`;
      } else {
        boldWordsPrompt = `\n\nQUY TẮC BẮT BUỘC VỀ TỪ KHÓA VÀ PHÂN BỔ TỶ LỆ CỤM IN ĐẬM:
- Từ khóa chính: "${keyword}".
- TẤT CẢ 5 CÂU VÍ DỤ BẮT BUỘC PHẢI CHỨA TỪ KHÓA "${keyword}". Tuyệt đối không được bỏ sót từ khóa ở bất kỳ câu nào.
- TUYỆT ĐỐI KHÔNG ghi chữ "example 1", "example 2", "Example 1:", "Ex 1:" trước mỗi câu ví dụ. Bắt đầu trực tiếp bằng dấu chấm tròn "• " rồi viết câu văn.
- Cụm từ in đậm ở CẢ 5 CÂU VÍ DỤ BẮT BUỘC phải là cụm từ / collocation CHỨA TRỰC TIẾP TỪ KHÓA "${keyword}". Tuyệt đối KHÔNG ĐƯỢC in đậm cụm từ ngẫu nhiên không chứa từ khóa "${keyword}".
- QUY TẮC TỶ LỆ ĐỘ DÀI CỤM IN ĐẬM (BẮT BUỘC 40% CỤM 3 TỪ):
  + BẮT BUỘC trong 5 câu ví dụ phải có ĐÚNG 2 CÂU in đậm CỤM 3 TỪ (chiếm 40%; ví dụ nếu từ khóa là "benefit": "**reap the benefit**", "**of great benefit**", "**have the benefit**", "**bring great benefit**", "**derive much benefit**"...).
  + 3 CÂU CÒN LẠI in đậm CỤM 2 TỪ (chiếm 60%; ví dụ: "**health benefit**", "**benefit from**", "**mutual benefit**", "**financial benefit**"...).
  + TUYỆT ĐỐI KHÔNG để 100% đều là cụm 2 từ, và TUYỆT ĐỐI KHÔNG IN ĐẬM 1 TỪ ĐƠN LẺ.
- Mỗi câu ví dụ có 1 cụm in đậm KHÁC NHAU hoàn toàn, không lặp lại.`;
      }

      const fullPrompt = `${BASE_PROMPT}\n\n${levelPrompt}${boldWordsPrompt}\n\nTừ khóa: ${keyword}`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: fullPrompt,
      });
      return response.text;
    };

    try {
      let text = await tryGenerate(selectedModel);
      
      if (text) {
        setResult(text);
        setGeneratingStatus('success');
        // Update history with result, level, and boldWords
        setHistory(prev => {
          const newHistory = [
            { keyword, result: text, level: gradeLevel, boldWords: targetBoldWords }, 
            ...prev.filter(item => item.keyword !== keyword)
          ].slice(0, 10);
          return newHistory;
        });

        // Show "Đã tạo xong" with green checkmark for ~1.3s before smoothly closing
        setTimeout(() => {
          setShowGeneratingModal(false);
          setIsLoading(false);
        }, 1300);
      } else {
        setShowGeneratingModal(false);
        setIsLoading(false);
        setError(t.errorFailed);
      }
    } catch (err: any) {
      console.error(err);
      const isQuotaError = err?.message?.includes('429') || err?.message?.toLowerCase().includes('quota');
      
      if (isQuotaError && selectedModel === 'gemini-3.6-flash') {
        // Fallback to Lite model if Flash fails due to quota
        try {
          console.log("Flash quota exceeded, falling back to Lite...");
          let text = await tryGenerate('gemini-3.5-flash-lite');
          if (text) {
            setResult(text);
            setGeneratingStatus('success');
            setHistory(prev => {
              const newHistory = [
                { keyword, result: text, level: gradeLevel, boldWords: targetBoldWords }, 
                ...prev.filter(item => item.keyword !== keyword)
              ].slice(0, 10);
              return newHistory;
            });
            setTimeout(() => {
              setShowGeneratingModal(false);
              setIsLoading(false);
            }, 1300);
            return;
          }
        } catch (fallbackErr) {
          console.error("Fallback failed:", fallbackErr);
        }
      }

      setShowGeneratingModal(false);
      setIsLoading(false);

      if (isQuotaError) {
        setError(lang === 'vi' ? "Hạn mức API đã hết (Rate Limit). Vui lòng nhập API Key khác." : "API Rate Limit exceeded. Please enter a different API Key.");
        setShowSettings(true);
      } else {
        setError(t.errorConnect);
      }
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
    if (item.level) {
      setGradeLevel(item.level);
      localStorage.setItem('dictionary_grade_level', item.level);
    }
    if (item.boldWords !== undefined) {
      setTargetBoldWords(item.boldWords);
      localStorage.setItem('dictionary_bold_words', item.boldWords);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#f5f5f5] text-slate-900 font-sans selection:bg-blue-100 lg:overflow-hidden">
      {/* Header */}
      <Header 
        title={lang === 'vi' ? "SOẠN TỪ ĐIỂN" : "DICTIONARY GEN"}
        version="v4.5.2"
        subtitle="by Nhân Nhân - GV tiếng Anh trường THCS Tùng Thiện Vương, phường Phú Định, TP.HCM"
        logoSrc="https://i.ibb.co/Nd7jfCGJ/NN-logo.jpg"
        showBack={!!result}
        onBack={() => setResult('')}
        onHistory={() => setShowHistoryModal(true)}
        onInfo={() => setShowAppInfoModal(true)}
        onSettings={() => setShowSettings(!showSettings)}
        showSettings={true}
        historyCount={history.length}
        hasHistoryData={history.length > 0}
        apiKeyStatus={apiKeyStatus}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
          {/* Left Column: Controls */}
          <div className="w-full lg:w-[380px] flex flex-col gap-4 lg:overflow-y-auto pr-1 pb-4 lg:pb-0">
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

                {/* Target Bold Words Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="boldWords" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {t.targetBoldWordsLabel}
                    </label>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {t.optionalTag}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="boldWords"
                      type="text"
                      value={targetBoldWords}
                      onChange={(e) => handleTargetBoldWordsChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateExercise()}
                      placeholder={t.targetBoldWordsPlaceholder}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all text-xs font-semibold text-slate-700"
                    />
                    <AnimatePresence>
                      {targetBoldWords && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => handleTargetBoldWordsChange('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    {t.targetBoldWordsHint}
                  </p>
                </div>

                {/* Grade Level & Vocabulary Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="gradeLevel" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {t.levelLabel}
                    </label>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {gradeLevel === 'grade6' && 'Đầu A2'}
                      {gradeLevel === 'grade7' && 'A2'}
                      {gradeLevel === 'grade8' && 'A2 / B1'}
                      {gradeLevel === 'grade9' && 'B1'}
                      {gradeLevel === 'entrance10' && 'B1+'}
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      id="gradeLevel"
                      value={gradeLevel}
                      onChange={(e) => handleGradeLevelChange(e.target.value)}
                      className="w-full pl-9 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none transition-all text-xs font-semibold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="grade6">{t.levelGrade6}</option>
                      <option value="grade7">{t.levelGrade7}</option>
                      <option value="grade8">{t.levelGrade8}</option>
                      <option value="grade9">{t.levelGrade9}</option>
                      <option value="entrance10">{t.levelEntrance10}</option>
                    </select>
                    <GraduationCap className="w-4 h-4 text-blue-800 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  onClick={generateExercise}
                  disabled={isLoading}
                  className="w-full bg-blue-800 hover:bg-blue-900 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] text-sm cursor-pointer"
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
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {copySuccess ? <Check className="w-3 h-3 text-blue-800" /> : <Copy className="w-3 h-3" />}
                        {copySuccess ? t.copiedBtn : t.copyBtn}
                      </button>
                      <button
                        onClick={exportToWord}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
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
        apiMode={apiMode}
        onApiModeChange={handleApiModeChange}
        defaultKeyExists={!!import.meta.env.VITE_GEMINI_API_KEY}
        apiKeyStatus={apiKeyStatus}
      />

      {/* App Info & Changelog Modal */}
      <AppInfoModal
        show={showAppInfoModal}
        onClose={() => setShowAppInfoModal(false)}
        t={t}
        lang={lang}
      />

      {/* History Modal */}
      <HistoryModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        onSelect={loadHistoryItem}
        onDelete={deleteHistoryItem}
        onClear={clearHistory}
        t={t}
      />

      {/* Generating Loading & Success Modal */}
      <GeneratingModal
        show={showGeneratingModal}
        status={generatingStatus}
        keyword={keyword}
        loadingMsg={t.loadingMessages[loadingMsgIndex]}
        lang={lang}
      />
    </div>
  );
}


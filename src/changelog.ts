export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    vi: string[];
    en: string[];
  };
}

export const changelog: ChangelogEntry[] = [
  {
    version: "4.6.0",
    date: "2026-08-31",
    changes: {
      vi: [
        "Quy định nghiêm ngặt về câu hỏi đề bài & tính độc bản của đáp án:",
        "- Paraphrase 100% các câu đề bài: Bắt buộc các câu hỏi (câu 1, 2 và câu dự phòng 3, 4) phải được paraphrase toàn diện với ngữ cảnh, chủ ngữ, vị ngữ mới, tuyệt đối không được lấy nguyên câu hay sao chép cấu trúc từ phần câu ví dụ.",
        "- Ngăn ngừa đề thi gây tranh cãi: Ngữ cảnh và cấu trúc ngữ pháp xung quanh chỗ trống (_______) phải được thiết kế chặt chẽ, đảm bảo CHỈ CÓ DUY NHẤT 1 CỤM TỪ IN ĐẬM phù hợp làm đáp án, loại bỏ hoàn toàn tình trạng 1 chỗ trống có thể điền nhiều đáp án khác nhau.",
        "- Kiểm soát độ dài cụm in đậm: Giới hạn nghiêm ngặt từ 2 đến 3 từ (ít nhất 2 từ, nhiều nhất 3 từ), nghiêm cấm in đậm 1 từ đơn lẻ hoặc cụm dài từ 4 từ trở lên."
      ],
      en: [
        "Strict Question Paraphrasing & Unambiguous Single-Answer Rules:",
        "- 100% Paraphrased Questions: Exercise questions (1, 2 and backup 3, 4) must be thoroughly paraphrased with new context and sentence structure, strictly forbidding copying verbatim from example sentences.",
        "- Elimination of Question Ambiguity: Grammatical cues, prepositions, and contextual nuances around blanks (_______) must strictly ensure that ONLY ONE bold phrase can validly fit, eliminating dual-answer controversies.",
        "- Strict Bold Phrase Length: Enforces strictly 2 to 3 words (at least 2, at most 3 words), strictly prohibiting single words or 4+ word phrases."
      ]
    }
  },
  {
    version: "4.5.2",
    date: "2026-08-20",
    changes: {
      vi: [
        "Chuẩn hóa định dạng câu ví dụ (loại bỏ nhãn 'example 1, example 2'):",
        "- Loại bỏ hoàn toàn các tiền tố thừa như 'example 1:', 'Example 1:', 'Ex 1:' trước mỗi câu ví dụ.",
        "- Mỗi câu ví dụ bắt đầu trực tiếp bằng dấu chấm tròn ('• ') kèm câu văn tiếng Anh tự nhiên chứa cụm từ in đậm chuẩn từ điển."
      ],
      en: [
        "Cleaned Example Sentences Format (Removed 'example 1, example 2' labels):",
        "- Completely removed redundant prefixes such as 'example 1:', 'Example 1:', 'Ex 1:' before each sentence.",
        "- Each example sentence starts directly with a bullet point ('• ') followed by a natural English sentence containing the bold phrase."
      ]
    }
  },
  {
    version: "4.5.1",
    date: "2026-08-20",
    changes: {
      vi: [
        "Tối ưu hóa tỷ lệ cụm in đậm 2 từ và 3 từ (40% cụm 3 từ):",
        "- Bắt buộc trong 5 câu ví dụ (Examples) phải có khoảng 40% là cụm in đậm 3 từ (đúng 2 trên 5 câu ví dụ; ví dụ: 'reap the benefit', 'of great benefit', 'have the benefit', 'bring great benefit'...).",
        "- Khoảng 60% còn lại (3 trên 5 câu ví dụ) là cụm in đậm 2 từ (ví dụ: 'benefit from', 'health benefit', 'mutual benefit'...).",
        "- Giúp các câu hỏi kiểm tra điền từ đa dạng, cân đối hoàn hảo theo đúng đặc tả câu 1-2 đề thi Tuyển sinh 10 ('complete the sentences with two or three words')."
      ],
      en: [
        "Optimized 2-Word vs 3-Word Bold Ratio (40% 3-Word Phrases):",
        "- Enforces that approximately 40% of the 5 examples (exactly 2 out of 5 sentences) must have a 3-word bold phrase (e.g., 'reap the benefit', 'of great benefit', 'have the benefit'...).",
        "- The remaining 60% (3 out of 5 sentences) have 2-word bold phrases (e.g., 'benefit from', 'health benefit'...).",
        "- Provides a balanced variety matching the Grade 10 Entrance Exam standard ('complete the sentences with two or three words')."
      ]
    }
  },
  {
    version: "4.5.0",
    date: "2026-08-19",
    changes: {
      vi: [
        "Chuẩn hóa 5 câu ví dụ (Examples) & Cụm in đậm chứa từ khóa:",
        "- Bắt buộc cả 5 câu ví dụ đều phải chứa từ khóa đã chỉ định.",
        "- Toàn bộ các cụm in đậm (2-3 từ) trong 5 câu ví dụ bắt buộc phải là collocations/phrases chứa từ khóa, loại bỏ hoàn toàn tình trạng in đậm cụm từ ngẫu nhiên không liên quan.",
        "Hộp thoại Loading & Thông báo hoàn tất thông minh:",
        "- Khi bấm nút 'Tạo', tự động hiển thị hộp thoại loading với hiệu ứng AI đang xử lý và các bước cập nhật trạng thái trực quan.",
        "- Khi tạo xong, hiển thị trạng thái 'Đã tạo xong' kèm biểu tượng dấu check xanh lá nổi bật trước khi chuyển tiếp sang nội dung bài tập.",
        "Tối ưu hóa giao diện thanh Header & Không gian làm việc:",
        "- Chuyển 'Thông tin ứng dụng' và 'Lịch sử gần đây' lên thành 2 biểu tượng độc lập, trực quan ở góc phải thanh Header.",
        "- Tích hợp hộp thoại 'Lịch sử gần đây' chuyên nghiệp: hiển thị danh sách bài đã soạn, huy hiệu cấp độ, từ in đậm, xem lại bài cũ, xóa từng bài hoặc xóa tất cả.",
        "- Tích hợp hộp thoại 'Thông tin ứng dụng & Nhật ký thay đổi' dạng tab tiện lợi, hiển thị đầy đủ thông tin tác giả, liên hệ và các phiên bản cập nhật.",
        "- Giúp khung nhập liệu chính gọn gàng, thoáng đãng và tập trung tối đa vào việc soạn đề."
      ],
      en: [
        "Enforced 5 Examples & Keyword Collocation Bold Constraint:",
        "- Guarantees that ALL 5 example sentences MUST contain the specified keyword.",
        "- Enforces that all bolded phrases (2-3 words) across all 5 examples MUST be collocations/phrases directly containing the keyword, preventing irrelevant random bold phrases.",
        "Smart Loading Dialog & Success Celebration:",
        "- Clicking 'Generate' automatically displays an interactive loading modal with AI animation and live status steps.",
        "- Once complete, displays 'Generated Successfully' with a prominent green checkmark before revealing the exercise.",
        "Header UI Optimization & Workspace Cleanup:",
        "- Moved 'App Information' and 'Recent History' to dedicated interactive icon buttons on the top right of the Header.",
        "- Integrated a comprehensive 'Recent History' modal: displays generated exercises, grade badges, target words, quick load, and deletion management.",
        "- Integrated 'App Info & Changelog' tabbed dialog with full teacher details, contact info, and release history.",
        "- Provides a cleaner, more spacious workspace focusing purely on exercise generation."
      ]
    }
  },
  {
    version: "4.4.2",
    date: "2026-08-14",
    changes: {
      vi: [
        "Bổ sung quy tắc giới hạn độ dài cụm từ in đậm:",
        "- Bắt buộc các phần được in đậm trong câu ví dụ (Examples) và làm đáp án phải có độ dài từ 2 đến 3 từ.",
        "- Nghiêm cấm tuyệt đối việc in đậm 1 từ đơn lẻ (ví dụ: 'benefit' đơn lẻ) để đúng chuẩn cấu trúc câu 1-2 đề thi Tuyển sinh 10 (chỉ điền two or three words)."
      ],
      en: [
        "Added length constraint for bold target phrases:",
        "- Enforces that all bolded target phrases in examples and gap-fill answers MUST be 2 or 3 words long.",
        "- Strictly forbids single bolded words to match the Grade 10 exam specification (complete sentences with two or three words)."
      ]
    }
  },
  {
    version: "4.4.1",
    date: "2026-08-14",
    changes: {
      vi: [
        "Bổ sung quy tắc kiểm soát nghiêm ngặt cho Prompt:",
        "- Bắt buộc các từ/cụm từ in đậm trong 5 câu ví dụ (Examples) PHẢI HOÀN TOÀN KHÁC NHAU, tuyệt đối không trùng lặp.",
        "- Đảm bảo tính đa dạng từ vựng và tính chính xác cho từng đáp án câu hỏi điền từ."
      ],
      en: [
        "Added strict Prompt control rule:",
        "- Enforces that bold target words/phrases across all 5 example sentences MUST BE UNIQUE and non-duplicate.",
        "- Guarantees vocabulary diversity and unambiguous gap-fill answers."
      ]
    }
  },
  {
    version: "4.4.0",
    date: "2026-08-14",
    changes: {
      vi: [
        "Thêm tùy chọn 'Các từ in đậm cần xuất hiện':",
        "- Cho phép thầy/cô tự nhập các từ/cụm từ cụ thể (ví dụ: financial benefit, benefit from...).",
        "- AI sẽ bắt buộc đưa chính xác các cụm từ này vào câu ví dụ dưới dạng in đậm và sử dụng chúng làm đáp án điền vào chỗ trống.",
        "- Giúp giới hạn chuẩn xác dạng từ/cụm từ cần kiểm tra trong bài tập.",
        "- Tự động lưu và khôi phục khi mở lại trong Lịch sử gần đây."
      ],
      en: [
        "Added 'Bold Target Words to Appear' option:",
        "- Allows teachers to specify target words/phrases (e.g., financial benefit, benefit from...).",
        "- AI forces these exact phrases to appear bolded in example sentences and used as gap-fill answers.",
        "- Accurately restricts target collocations/word forms for testing.",
        "- Auto-saves and restores in Recent History."
      ]
    }
  },
  {
    version: "4.3.0",
    date: "2026-08-14",
    changes: {
      vi: [
        "Thêm mục Cấp độ & Bộ lọc từ vựng linh hoạt theo trình độ THCS:",
        "- Lớp 6: Đầu bậc A2 (câu ví dụ dạng đơn giản, dễ hiểu).",
        "- Lớp 7: Giữa/cuối bậc A2 (nâng cao hơn so với Lớp 6).",
        "- Lớp 8: Cuối A2 / Đầu B1 (phong phú ngữ cảnh).",
        "- Lớp 9: Đầu B1 đến giữa B1 (ngữ pháp đa dạng, ngữ cảnh thực tế).",
        "- Tuyển sinh 10: Nâng cao B1 (B1+) chuẩn đề thi Tuyển sinh 10 TP.HCM.",
        "Lưu lại cấp độ đã chọn trong Lịch sử soạn thảo."
      ],
      en: [
        "Added Grade Level & Vocabulary Filter based on Secondary School CEFR targets:",
        "- Grade 6: Early A2 Level (Simple example sentences).",
        "- Grade 7: Mid/Late A2 Level (Advanced than Grade 6).",
        "- Grade 8: Late A2 / Early B1 Level.",
        "- Grade 9: Early B1 to Mid B1 Level.",
        "- Grade 10 Entrance Exam: Advanced B1 (B1+).",
        "Saves selected grade level in drafting history."
      ]
    }
  },
  {
    version: "4.2.0",
    date: "2026-05-22",
    changes: {
      vi: [
        "Nâng cấp model Gemini 3.5 Flash (mới nhất) và Gemini 3.1 Flash Lite.",
        "Thiết kế lại và chuyển đổi nút Cài đặt răng cưa thành nút Trạng thái API trực quan (Xanh lá khi hoạt động, Đỏ khi lỗi/trống).",
        "Thêm 2 chế độ cấu hình API: Sử dụng mặc định (qua biến môi trường VITE_GEMINI_API_KEY) và Tự nhập API Key.",
        "Xác thực tự động kết nối API Key và khóa các thao tác soạn câu hỏi nếu Key không hoạt động hoặc chưa nhập.",
        "Cập nhật thanh Header sang màu xanh dương đồng bộ với nút Tạo chính."
      ],
      en: [
        "Upgraded models to Gemini 3.5 Flash (latest) and Gemini 3.1 Flash Lite.",
        "Redesigned Settings button into an intuitive live API Status button (Green when active, Red when error/missing).",
        "Added 2 API configuration modes: Use Default API (via VITE_GEMINI_API_KEY) and Enter Custom API Key.",
        "Automatic validation of API Key connectivity, locking content generation when Key is inactive or missing.",
        "Updated Header background color to blue, matching the main Generate button."
      ]
    }
  },
  {
    version: "4.1.6",
    date: "2026-03-31",
    changes: {
      vi: [
        "Tích hợp Header component mới chuyên nghiệp hơn.",
        "Cập nhật Logo và hiệu ứng Sparkles.",
        "Tối ưu hóa giao diện cho thiết bị di động.",
        "Thêm nút quay lại và ẩn hiện cài đặt thông minh."
      ],
      en: [
        "Integrated a more professional new Header component.",
        "Updated Logo and Sparkles effect.",
        "Optimized mobile UI.",
        "Added back button and smart settings visibility."
      ]
    }
  },
  {
    version: "4.1.0",
    date: "2026-03-25",
    changes: {
      vi: [
        "Tích hợp hệ thống Changelog và Versioning.",
        "Cập nhật mô tả ứng dụng (Câu 35, 36).",
        "Tối ưu hóa giao diện và hiệu ứng chuyển cảnh."
      ],
      en: [
        "Integrated Changelog and Versioning system.",
        "Updated app description (Questions 35, 36).",
        "Optimized UI and transition effects."
      ]
    }
  },
  {
    version: "4.0.0",
    date: "2026-03-21",
    changes: {
      vi: [
        "Cập nhật giao diện theo chuẩn mới (Standard Layout v4.0).",
        "Thêm tính năng tạo từ khóa ngẫu nhiên.",
        "Cập nhật Logo và Favicon mới.",
        "Tối ưu hóa khả năng hiển thị trên thiết bị di động."
      ],
      en: [
        "Updated UI to the new standard (Standard Layout v4.0).",
        "Added random keyword generation feature.",
        "Updated new Logo and Favicon.",
        "Optimized mobile responsiveness."
      ]
    }
  },
  {
    version: "3.0.0",
    date: "2026-03-15",
    changes: {
      vi: [
        "Hỗ trợ xuất file Word (.docx) chuyên nghiệp.",
        "Tích hợp lịch sử soạn thảo gần đây.",
        "Cải thiện thuật toán AI cho định dạng Dictionary Entry."
      ],
      en: [
        "Support professional Word file export (.docx).",
        "Integrated recent drafting history.",
        "Improved AI algorithm for Dictionary Entry format."
      ]
    }
  }
];

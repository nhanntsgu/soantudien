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

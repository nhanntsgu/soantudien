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

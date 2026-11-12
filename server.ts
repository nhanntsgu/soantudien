import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

function resolveModelName(requestedModel?: string): string {
  if (!requestedModel || requestedModel === 'gemini-3.5-flash-lite') {
    return 'gemini-3.1-flash-lite';
  }
  if (requestedModel === 'gemini-3.6-flash' || requestedModel === 'gemini-3.5-flash') {
    return 'gemini-3.8-flash';
  }
  return requestedModel;
}

const HOD_REVIEW_SYSTEM_INSTRUCTION = `Bạn là TỔ TRƯỞNG CHUYÊN MÔN TIẾNG ANH giàu kinh nghiệm chấm thi và thẩm định đề thi Tuyển sinh lớp 10 tại TP.HCM (theo cấu trúc mới từ năm 2025 và chương trình SGK Tiếng Anh Global Success).
Nhiệm vụ của bạn là KIỂM TRA, RÀ SOÁT NGHIÊM NGẶT và HIỆU ĐÍNH bản thảo đề thi / bài tập trước khi xuất ra màn hình cho giáo viên sử dụng, đảm bảo ĐỀ THI CHÍNH XÁC TUYỆT ĐỐI, ĐÚNG MA TRẬN SỞ GD&ĐT TP.HCM VÀ KHÔNG CÓ BẤT KỲ ĐÁP ÁN GÂY TRANH CÃI NÀO.

QUY TRÌNH THẨM ĐỊNH BẮT BUỘC THEO TỪNG PHẦN:
1. NẾU LÀ PHẦN I (MULTIPLE CHOICE - CÂU 1–14):
   - Kiểm tra phiên âm IPA chuẩn Oxford cho Câu 1 (nguyên âm cơ bản a, e, i, o, u) và Câu 2 (-s/es hoặc -ed): Nếu có từ bị sai nhóm phát âm khiến câu hỏi có 2 đáp án hoặc không có đáp án, PHẢI THAY TỪ ĐÓ NGAY.
   - Kiểm tra dấu nhấn trọng âm Câu 3 (2 âm tiết) và Câu 4 (3 âm tiết, ưu tiên hậu tố -tion, -ate, -ity, -ic, hạn chế từ ghép): Đảm bảo đúng 3 từ cùng trọng âm và 1 từ khác trọng âm.
   - Kiểm tra Câu 5–12: Đảm bảo đủ 1 câu giới từ (in/on/at), 1 câu verb tense, 1 câu liên từ, 1 câu phrasal verb, 4 câu từ vựng/cấu trúc (ưu tiên từ vựng sách Global Success). Loại bỏ mọi phương án nhiễu có thể lắp vừa câu gây tranh cãi.
   - Kiểm tra Câu 13–14: 1 câu chọn vế nói, 1 câu chọn vế đáp tự nhiên.

2. NẾU LÀ PHẦN II (SIGNS & NOTICES - CÂU 15–16):
   - Câu 15 phải là biển báo (cần làm gì must/should hoặc KHÔNG được làm gì mustn't/not allowed).
   - Câu 16 phải là mẫu thông báo ngắn thực tế. Đảm bảo chỉ có duy nhất 1 phương án A/B/C/D đúng.

3. NẾU LÀ PHẦN III (CLOZE TEXT - CÂU 17–22):
   - Kiểm tra độ dài đoạn văn: chuẩn 80–100 chữ.
   - TUYỆT ĐỐI KHÔNG có câu hỏi kiểm tra Word Form trong phần này (nếu có câu nào 4 đáp án A, B, C, D là biến thể từ loại của cùng 1 gốc từ thì phải đổi ngay thành 4 từ vựng khác nhau).
   - Đảm bảo 6 chỗ trống gồm đủ: 1 noun, 1 adjective, 1 verb, 1 adverb, 1 preposition và 1 từ vựng ngữ cảnh.

4. NẾU LÀ PHẦN IV (READING TRUE/FALSE - CÂU 23–28):
   - Kiểm tra độ dài đoạn văn: chuẩn 180–200 chữ, từ vựng A2–B1 theo chủ đề Global Success.
   - Câu 23–26 (TRUE/FALSE): Bắt buộc được paraphrase lại từ văn bản, tuyệt đối không chép nguyên câu trong bài xuống làm câu hỏi, trải dài từ đầu đến cuối bài.
   - Câu 27–28: Câu hỏi trắc nghiệm đọc hiểu rõ ràng, chỉ có 1 đáp án đúng duy nhất.

5. NẾU LÀ PHẦN V (WORD FORM - CÂU 29–34):
   - Đếm kỹ từ loại của 6 đáp án (29–34): BẮT BUỘC phải có đúng **2 Nouns, 2 Adjectives, 1 Verb và 1 Adverb** (tối đa 01 câu vận dụng cao). Nếu lệch tỷ lệ này, phải sửa lại câu hỏi tương ứng để đạt chuẩn 2N - 2Adj - 1V - 1Adv.
   - Kiểm tra dấu hiệu ngữ pháp trước và sau chỗ trống (số ít/số nhiều, khẳng định/phủ định) để chỉ có duy nhất 1 đáp án đúng.

6. NẾU LÀ PHẦN VI (DICTIONARY ENTRY - CÂU 35–36 HOẶC 1–4):
   - Thực hiện phép thử lắp chéo cả 5 cụm từ in đậm (bắt buộc dài 2–3 từ, chứa từ khóa) vào từng chỗ trống _______. Nếu bất kỳ câu hỏi nào có thể điền được từ 2 cụm in đậm trở lên, PHẢI VIẾT LẠI CÂU HỎI ĐÓ NGAY để chỉ có duy nhất 1 đáp án đúng.
   - Giữ đúng bố cục: sau 5 câu ví dụ (• ...) là các câu hỏi đề bài, tiếp theo là phần **ĐÁP ÁN**.

7. NẾU LÀ PHẦN VII (WRITING - CÂU 37–40):
   - Đảm bảo có ít nhất 01 câu biến đổi câu sử dụng **Phrasal Verb** trong chương trình Global Success.
   - Kiểm tra câu viết lại hoàn chỉnh chuẩn ngữ pháp, tự nhiên và sát nghĩa câu gốc.

QUY TẮC XUẤT KẾT QUẢ CUỐI CÙNG:
- CHỈ XUẤT RA NỘI DUNG ĐỀ BÀI VÀ ĐÁP ÁN ĐÃ ĐƯỢC HIỆU ĐÍNH HOÀN CHỈNH (không dùng dấu #, giữ đúng định dạng để copy sang Word).
- TUYỆT ĐỐI KHÔNG viết thêm lời chào, lời nhận xét hay báo cáo rà soát bên ngoài nội dung đề và đáp án.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Endpoints
  app.post('/api/gemini/check', async (req, res) => {
    try {
      const { apiKey, apiMode } = req.body || {};
      const key =
        apiMode === 'custom'
          ? apiKey
          : process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      if (!key) {
        return res.status(400).json({ valid: false, error: 'API key is missing' });
      }

      if (apiMode !== 'custom') {
        return res.json({ valid: true });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: 'Ping',
      });

      return res.json({ valid: true });
    } catch (err: any) {
      console.error('API check error:', err);
      return res.status(400).json({ valid: false, error: err.message || 'Invalid API key' });
    }
  });

  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, model, apiKey, apiMode } = req.body || {};
      const key =
        apiMode === 'custom' && apiKey
          ? apiKey
          : process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      if (!key) {
        return res.status(400).json({ error: 'API key is missing' });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const resolvedModel = resolveModelName(model);

      const response = await ai.models.generateContent({
        model: resolvedModel,
        contents: prompt,
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error('Generation error:', err);
      return res.status(500).json({ error: err.message || 'Generation failed' });
    }
  });

  app.post('/api/gemini/review', async (req, res) => {
    try {
      const { draft, partId, keyword, gradeLevel, selectedUnitId, targetBoldWords, model, apiKey, apiMode } = req.body || {};
      const key =
        apiMode === 'custom' && apiKey
          ? apiKey
          : process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      if (!key) {
        return res.status(400).json({ error: 'API key is missing' });
      }

      if (!draft) {
        return res.status(400).json({ error: 'Draft content is missing' });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const resolvedModel = resolveModelName(model);

      const reviewPrompt = `Hãy đóng vai TỔ TRƯỞNG CHUYÊN MÔN TIẾNG ANH để kiểm tra, rà soát chéo và hiệu đính bản thảo đề thi dưới đây.

THÔNG TIN ĐẦU VÀO:
- Phân hệ đề thi: "${partId || 'part6'}"
- Cấp độ học sinh: "${gradeLevel}" (Sách giáo khoa Tiếng Anh Global Success - Unit: "${selectedUnitId || 'all'}")
${keyword ? `- Từ khóa / Chủ đề trọng tâm: "${keyword}"` : ''}
${targetBoldWords ? `- Yêu cầu bổ sung / Cụm từ chỉ định: "${targetBoldWords}"` : ''}

BẢN THẢO CẦN RÀ SOÁT:
"""
${draft}
"""

YÊU CẦU ĐẶC BIỆT QUAN TRỌNG:
- Kiểm tra tính chính xác tuyệt đối của từng câu hỏi và đáp án theo đúng ma trận đề thi Tuyển sinh lớp 10 TP.HCM từ năm 2025 và từ vựng/ngữ pháp bộ sách Global Success.
- Loại bỏ 100% các phương án gây tranh cãi (mỗi câu hỏi/chỗ trống chỉ được phép có DUY NHẤT 1 đáp án đúng).
- Chỉ trả về nội dung đề bài và phần **ĐÁP ÁN** hoàn chỉnh cuối cùng sau khi đã hiệu đính, tuyệt đối không kèm lời giải thích hay nhận xét của Tổ trưởng chuyên môn bên ngoài bài tập.`;

      const response = await ai.models.generateContent({
        model: resolvedModel,
        contents: reviewPrompt,
        config: {
          systemInstruction: HOD_REVIEW_SYSTEM_INSTRUCTION,
        },
      });

      return res.json({ text: response.text || draft });
    } catch (err: any) {
      console.error('Review error:', err);
      return res.status(500).json({ error: err.message || 'Review failed' });
    }
  });

  if (isProduction) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();

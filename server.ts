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

const HOD_REVIEW_SYSTEM_INSTRUCTION = `Bạn là TỔ TRƯỞNG CHUYÊN MÔN TIẾNG ANH giàu kinh nghiệm chấm thi và thẩm định đề thi Tuyển sinh lớp 10 tại TP.HCM.
Nhiệm vụ của bạn là KIỂM TRA, RÀ SOÁT NGHIÊM NGẶT và HIỆU ĐÍNH bản thảo bài tập Dictionary Entry trước khi ban hành chính thức để đảm bảo ĐỀ THI CHÍNH XÁC TUYỆT ĐỐI, KHÔNG CÓ BẤT KỲ ĐÁP ÁN GÂY TRANH CÃI NÀO.

QUY TRÌNH THẨM ĐỊNH BẮT BUỘC CỦA TỔ TRƯỞNG CHUYÊN MÔN:
1. PHÉP THỬ THAY THẾ CHÉO (LOẠI BỎ 100% ĐÁP ÁN GÂY TRANH CÃI):
   - Lấy tất cả 5 cụm từ in đậm (**...**) trong phần câu ví dụ (Examples) lắp thử lần lượt vào từng chỗ trống _______ của cả 4 câu hỏi đề bài (Câu 1, Câu 2, Câu 3, Câu 4).
   - Nếu một chỗ trống có thể điền được từ 2 cụm in đậm trở lên mà vẫn đúng ngữ pháp hoặc hợp nghĩa (ví dụ: 2 cụm danh từ như "**health benefit**" và "**financial benefit**" hoặc "**mutual benefit**" cùng đứng được ở vị trí danh từ), bạn BẮT BUỘC PHẢI SỬA LẠI CÂU HỎI ĐÓ NGAY LẬP TỨC.
   - Cách sửa: Bổ sung ngữ cảnh đặc thù rõ ràng (ví dụ: nhắc đến bác sĩ/tập thể dục/bệnh tật cho "health benefit"; nhắc đến tiền bạc/ngân hàng/lợi nhuận/thu nhập cho "financial benefit"; nhắc đến hợp tác đôi bên cùng có lợi cho "mutual benefit") VÀ khóa chặt dấu hiệu ngữ pháp (giới từ đứng ngay trước/sau chỗ trống, mạo từ a/an/the, chủ ngữ số ít/số nhiều, động từ nguyên mẫu/chia thì) để CHỈ DUY NHẤT 1 CỤM TỪ IN ĐẬM LÀ ĐÁP ÁN ĐÚNG.

2. KIỂM TRA PARAPHRASE 100% SO VỚI VÍ DỤ:
   - Đối chiếu từng câu hỏi (1, 2, 3, 4) với 5 câu ví dụ. Nếu câu hỏi nào sao chép cấu trúc, giữ nguyên chủ ngữ/tình huống hoặc quá giống câu ví dụ, BẮT BUỘC viết lại bằng ngữ cảnh và cấu trúc câu hoàn toàn mới.

3. KIỂM TRA QUY CHUẨN CỤM TỪ IN ĐẬM & VÍ DỤ:
   - Cả 5 câu ví dụ phải bắt đầu trực tiếp bằng "• " (tuyệt đối không có chữ "Example 1:", "Ex 1:", "câu ví dụ 1").
   - Cả 5 câu ví dụ đều phải chứa từ khóa chính.
   - Mỗi câu ví dụ chỉ có 1 cụm từ in đậm chứa trực tiếp từ khóa, độ dài NGHIÊM NGẶT TỪ 2 ĐẾN 3 TỪ (tuyệt đối không có cụm 1 từ hoặc từ 4 từ trở lên). Nếu phát hiện cụm 1 từ hoặc >= 4 từ, phải sửa lại câu ví dụ và cụm in đậm thành 2 hoặc 3 từ ngay.
   - 5 cụm in đậm ở 5 câu ví dụ phải hoàn toàn khác nhau, không trùng lặp.

4. KIỂM TRA BỐ CỤC & ĐỘ KHỚP ĐÁP ÁN:
   - Ngay sau 5 câu ví dụ (cách 1 dòng trống) là 4 câu hỏi đề bài xếp liên tiếp từ 1 đến 4 (1., 2., 3., 4. — TUYỆT ĐỐI KHÔNG tách thành mục "CÂU DỰ PHÒNG").
   - Ngay sau 4 câu hỏi đề bài (cách 1 dòng trống) là mục **ĐÁP ÁN** gồm đầy đủ đáp án của cả 4 câu (1., 2., 3., 4.).
   - Đáp án của cả 4 câu ở mục **ĐÁP ÁN** phải khớp chính xác từng chữ với cụm in đậm tương ứng và khi điền vào chỗ trống _______ phải tạo thành câu tiếng Anh hoàn chỉnh, tự nhiên, chuẩn ngữ pháp 100%.

5. QUY TẮC XUẤT KẾT QUẢ CUỐI CÙNG:
   - CHỈ XUẤT RA NỘI DUNG BÀI TẬP ĐÃ ĐƯỢC HIỆU ĐÍNH HOÀN CHỈNH theo đúng định dạng gốc (từ dòng "**VI. Look at the entry...**" đến hết phần "**ĐÁP ÁN**" câu 1, 2, 3, 4).
   - TUYỆT ĐỐI KHÔNG viết thêm lời nhận xét, lời chào, báo cáo rà soát hay bất kỳ ký tự thừa nào bên ngoài nội dung bài tập để giáo viên có thể copy hoặc tải file Word sử dụng ngay.`;

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
      const { draft, keyword, gradeLevel, targetBoldWords, model, apiKey, apiMode } = req.body || {};
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
- Từ khóa chính: "${keyword}"
- Cấp độ học sinh: "${gradeLevel}"
${targetBoldWords && targetBoldWords.trim() ? `- Các cụm từ in đậm bắt buộc người dùng chỉ định: "${targetBoldWords.trim()}"` : '- Tỷ lệ cụm in đậm: Đúng 2 câu ví dụ in đậm cụm 3 từ (40%) và 3 câu ví dụ in đậm cụm 2 từ (60%).'}

BẢN THẢO CẦN RÀ SOÁT:
"""
${draft}
"""

YÊU CẦU ĐẶC BIỆT QUAN TRỌNG:
- Thực hiện phép thử lắp chéo cả 5 cụm từ in đậm vào từng câu hỏi 1, 2, 3, 4. Nếu bất kỳ câu hỏi nào có nguy cơ điền được từ 2 đáp án trở lên hoặc ngữ cảnh chưa đủ rõ để loại trừ các đáp án còn lại, HÃY VIẾT LẠI CÂU HỎI ĐÓ NGAY để đảm bảo tính độc bản tuyệt đối của đáp án (1 chỗ trống = duy nhất 1 đáp án đúng, không gây tranh cãi).
- Bố cục bắt buộc: Sau 5 câu ví dụ (• ...) là 4 câu hỏi đề bài liên tiếp (1., 2., 3., 4.), sau đó là mục **ĐÁP ÁN** chứa đáp án của cả 4 câu (1., 2., 3., 4.). Tuyệt đối không tách mục "CÂU DỰ PHÒNG".
- Giữ nguyên chuẩn định dạng (không dùng dấu #, giữ đúng khoảng cách dòng, chỉ trả về nội dung đề và đáp án hoàn chỉnh cuối cùng, tuyệt đối không kèm lời giải thích hay nhận xét của Tổ trưởng chuyên môn).`;

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

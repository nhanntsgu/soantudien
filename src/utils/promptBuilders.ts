import { getUnitsForGrade, GlobalSuccessUnit } from '../data/globalSuccessData';

export interface GenerationOptions {
  partId: 'part1' | 'part2' | 'part3' | 'part4' | 'part5' | 'part6' | 'part7' | 'full_exam';
  gradeLevel: string;
  selectedUnitId: string; // 'all' or unit id like 'g9_u1'
  keyword: string; // Used in Part 6 (Dictionary) or as custom focus/topic/root words in other parts
  targetBoldWords: string; // Used in Part 6 or additional instructions/focus in other parts
  pronunciationEnding?: 's_es' | 'ed'; // For Part 1 Question 2
}

export function getGradeContextPrompt(gradeLevel: string, selectedUnitId: string): string {
  const units = getUnitsForGrade(gradeLevel);
  const selectedUnit: GlobalSuccessUnit | undefined =
    selectedUnitId === 'all' ? undefined : units.find((u) => u.id === selectedUnitId);

  const gradeName =
    gradeLevel === 'grade6'
      ? 'Lớp 6 (Đầu bậc A2 CEFR)'
      : gradeLevel === 'grade7'
      ? 'Lớp 7 (Giữa/cuối bậc A2 CEFR)'
      : gradeLevel === 'grade8'
      ? 'Lớp 8 (Cuối A2 / Đầu B1 CEFR)'
      : gradeLevel === 'grade9'
      ? 'Lớp 9 (Bậc B1 THCS)'
      : 'Tuyển sinh Lớp 10 (Nâng cao B1+ CEFR, trọng tâm SGK Tiếng Anh 9 Global Success)';

  if (selectedUnit) {
    return `NGUỒN DỮ LIỆU BẮT BUỘC (SÁCH GIÁO KHOA TIẾNG ANH GLOBAL SUCCESS - NXB GIÁO DỤC VIỆT NAM):
- Khối lớp / Trình độ: ${gradeName}
- Đơn vị bài học (Unit trọng tâm): **${selectedUnit.title} (${selectedUnit.viTitle})**
- Từ vựng cốt lõi trong Unit này: ${selectedUnit.vocabulary.join(', ')}
- Cụm động từ (Phrasal verbs) & Collocations trong Unit này: ${selectedUnit.phrasalVerbsAndCollocations.join(', ')}
- Ngữ pháp trọng tâm trong Unit này: ${selectedUnit.grammar.join(' | ')}
- Chủ đề đọc hiểu / ngữ cảnh trong Unit này: ${selectedUnit.readingThemes.join('; ')}
YÊU CẦU TUYỆT ĐỐI: Chỉ sử dụng hệ thống từ vựng, cụm động từ, ngữ pháp và chủ đề bám sát bộ sách Tiếng Anh GLOBAL SUCCESS (đặc biệt là ${selectedUnit.title}).`;
  }

  const allTitles = units.map((u) => `${u.title} (${u.viTitle})`).join('; ');
  const sampleVocab = units
    .flatMap((u) => u.vocabulary.slice(0, 4))
    .slice(0, 32)
    .join(', ');
  const samplePhrasal = units
    .flatMap((u) => u.phrasalVerbsAndCollocations.slice(0, 3))
    .slice(0, 24)
    .join(', ');
  const sampleGrammar = units.flatMap((u) => u.grammar).join(' | ');

  return `NGUỒN DỮ LIỆU BẮT BUỘC (SÁCH GIÁO KHOA TIẾNG ANH GLOBAL SUCCESS - NXB GIÁO DỤC VIỆT NAM):
- Khối lớp / Trình độ: ${gradeName}
- Phạm vi kiến thức: Tổng hợp 12 Unit sách Tiếng Anh Global Success (${allTitles})
- Từ vựng tiêu biểu trong SGK Global Success: ${sampleVocab}...
- Cụm động từ (Phrasal verbs) & Collocations tiêu biểu trong SGK Global Success: ${samplePhrasal}...
- Ngữ pháp trọng tâm trong SGK Global Success: ${sampleGrammar}
YÊU CẦU TUYỆT ĐỐI: Chỉ lấy từ vựng, ngữ pháp, phrasal verbs và chủ đề bài đọc nằm trong chương trình bộ sách Tiếng Anh GLOBAL SUCCESS.`;
}

const COMMON_FORMAT_RULES = `YÊU CẦU ĐỊNH DẠNG CHUNG (ĐỂ HIỂN THỊ & COPY SANG WORD CHUẨN 100%):
- KHÔNG sử dụng dấu # hay ## cho tiêu đề.
- Sử dụng in đậm **...** cho tiêu đề phần và tiêu đề **ĐÁP ÁN**.
- Tuyệt đối không viết lời chào, lời dẫn hay nhận xét thừa bên ngoài nội dung đề và đáp án.`;

export function buildExamPrompt(opts: GenerationOptions): string {
  const { partId, gradeLevel, selectedUnitId, keyword, targetBoldWords, pronunciationEnding = 'ed' } = opts;
  const gsContext = getGradeContextPrompt(gradeLevel, selectedUnitId);
  const customTopicHint = keyword.trim()
    ? `\nƯU TIÊN TỪ KHÓA / CHỦ ĐỀ / YÊU CẦU RIÊNG CỦA GIÁO VIÊN: "${keyword.trim()}"`
    : '';
  const extraHint = targetBoldWords.trim()
    ? `\nGHI CHÚ / CHỈ ĐỊNH BỔ SUNG CỦA GIÁO VIÊN: "${targetBoldWords.trim()}"`
    : '';

  switch (partId) {
    case 'part1':
      return `Bạn là chuyên gia ra đề thi Tuyển sinh lớp 10 môn Tiếng Anh tại TP.HCM (cấu trúc mới từ năm 2025).
${gsContext}${customTopicHint}${extraHint}

Nhiệm vụ: Soạn **Phần I. Multiple Choice (Câu 1 đến Câu 14 - 3.5 điểm)** bám sát 100% ma trận đề thi của Sở GD&ĐT TP.HCM và từ vựng/ngữ pháp sách **Global Success**.

QUY TẮC MA TRẬN BẮT BUỘC CHO TỪNG CÂU (TUYỆT ĐỐI TUÂN THỦ):
1. **Câu 1–2 (Phonetics - Phát âm)**:
   - **Câu 1**: Kiểm tra phát âm nguyên âm cơ bản (âm **a, e, i, o, u**). Đánh dấu phần nguyên âm gạch chân bằng in đậm-nghiêng hoặc gạch dưới rõ ràng (ví dụ: A. h**a**ndicraft  B. **a**rtisan  C. p**a**ckage  D. b**a**lance). Bắt buộc 3 từ có nguyên âm phát âm GIỐNG HỆT NHAU và 1 từ KHÁC BIỆT DUY NHẤT theo từ điển Oxford IPA.
   - **Câu 2**: Kiểm tra phát âm đuôi **${pronunciationEnding === 's_es' ? '-s/-es' : '-ed'}**. Bắt buộc 3 từ có đuôi phát âm cùng nhóm quy tắc và 1 từ thuộc nhóm khác.
2. **Câu 3–4 (Stress - Dấu nhấn trọng âm)**:
   - **Câu 3**: Trọng âm của từ có **2 âm tiết** (lấy từ vựng Global Success).
   - **Câu 4**: Trọng âm của từ có **3 âm tiết** (Hạn chế từ ghép; KHUYẾN KHÍCH sử dụng các từ có hậu tố như *-tion, -ate, -ity, -ic, -ical* trong sách Global Success). Bắt buộc 3 từ cùng vị trí trọng âm và 1 từ khác vị trí trọng âm.
3. **Câu 5–12 (Lexico-Grammar - 8 câu trắc nghiệm A, B, C, D dạng ĐỐI THOẠI 2 NHÂN VẬT - TỶ LỆ CHỖ TRỐNG 50–50)**:
   - **ĐỊNH DẠNG & TỶ LỆ 50–50 BẮT BUỘC TUYỆT ĐỐI CHO CẢ 8 CÂU (CÂU 5 ĐẾN CÂU 12)**:
     + Tất cả 8 câu từ **Câu 5 đến Câu 12** BẮT BUỘC phải được viết dưới dạng **đối thoại ngắn giữa 2 nhân vật** (ví dụ: *Lan / Mai, Nam / Tom, Hoa / Linda, Minh / Peter, Anna / Ben, Tony / Nick, Linh / Nga, Jack / Emma, Lucy / Kate...*).
     + **TỶ LỆ BỐ TRÍ CHỖ TRỐNG 50–50 (4 CÂU - 4 CÂU)**: Trong 8 câu (từ Câu 5 đến Câu 12), BẮT BUỘC phải có **ĐÚNG 4 CÂU (50%) đặt chỗ trống '______' ở lượt lời của người nói đầu tiên** và **ĐÚNG 4 CÂU (50%) đặt chỗ trống '______' ở lượt lời của người nói sau (người đáp)**, đan xen tự nhiên.
     + Lượt lời không chứa chỗ trống phải cung cấp ngữ cảnh rõ ràng, tự nhiên để khóa chặt duy nhất 1 đáp án đúng.
     + TUYỆT ĐỐI KHÔNG viết câu đơn 1 dòng không có nhân vật đối thoại cho Câu 5–12.
   - **PHÂN BỔ MA TRẬN KIẾN THỨC TRONG CÂU 5–12 (ĐÚNG VÀ ĐỦ)**:
     + **1 câu** về giới từ chỉ thời gian hoặc nơi chốn (**in / on / at**) lồng trong đối thoại 2 nhân vật.
     + **1 câu** về thì của động từ (**verb tense** - có dấu hiệu thời gian rõ ràng trong lời thoại).
     + **1 câu** về liên từ (**conjunction**: *although, though, because, since, however, therefore, so that...*) lồng trong đối thoại 2 nhân vật.
     + **1 câu** về cụm động từ (**phrasal verb** trong SGK Global Success như *pass down, get around, come down with, look after, cut down on, pick up, look up, find out...*) lồng trong đối thoại 2 nhân vật.
     + **4 câu còn lại**: Kiểm tra từ vựng (danh từ, tính từ, động từ theo chủ đề bài học Global Success như *artisan, garbage collectors, pottery, traffic congestion, bustling, pricey, priority, stressed out, counsellor, accomplished...*) và cấu trúc câu, **ƯU TIÊN TỪ VỰNG NHIỀU HƠN**.
   - **MẪU THAM KHẢO CHUẨN CHO CÂU 5–12 (50% CHỖ TRỐNG Ở NGƯỜI NÓI ĐẦU - 50% Ở NGƯỜI NÓI SAU)**:
     *Ví dụ mẫu 1 (Chỗ trống ở người nói đầu):*
     Jack: You look really ______. Are you okay?
     Emma: I have two exams and a big assignment this week.
     A. optimistic   B. additional   C. stressed out   D. well-balanced
     *Ví dụ mẫu 2 (Chỗ trống ở người nói sau):*
     Lan: Who made these beautiful bowls and vases?
     Mai: A local ______ made them by hand.
     A. firefighter   B. artisan   C. counsellor   D. electrician
     *Ví dụ mẫu 3 (Chỗ trống ở người nói đầu):*
     Minh: Why did the artisan ______ this traditional craft to his youngest son?
     Peter: Because his son has a great passion for pottery.
     A. pass down   B. cut down   C. look around   D. come back
     *Ví dụ mẫu 4 (Chỗ trống ở người nói sau):*
     Linh: I have three assignments to finish tonight. I don't know which one to do first.
     Nga: You should decide which task is your top ______.
     A. anxiety   B. priority   C. distraction   D. ingredient
4. **Câu 13–14 (Communication - Giao tiếp thực tế)**:
   - **Câu 13**: Cho 2 lượt lời nói-đáp, trong đó để trống **VẾ NÓI (cả câu mở đầu/hỏi/đề nghị)** và cho sẵn vế đáp để học sinh chọn câu nói phù hợp ngữ cảnh.
   - **Câu 14**: Cho 2 lượt lời nói-đáp, trong đó cho sẵn vế nói và để trống **VẾ ĐÁP (cả câu phản hồi)** để học sinh chọn câu trả lời phù hợp.

${COMMON_FORMAT_RULES}

CẤU TRÚC MẪU BẮT BUỘC:
**I. Choose the word / phrase / sentence (A, B, C or D) that best fits the space or best answers the question given in each sentence. (3.5 pts)**

**Which word has the underlined part pronounced differently from that of the others?**
1. A. ...   B. ...   C. ...   D. ...
2. A. ...   B. ...   C. ...   D. ...

**Which word has a different stress pattern from that of the others?**
3. A. ...   B. ...   C. ...   D. ...
4. A. ...   B. ...   C. ...   D. ...

**Choose the word / phrase / sentence (A, B, C or D) that best fits the space in each sentence.**
5. [Tên nhân vật A]: [Lời thoại A (có thể chứa ______)]
[Tên nhân vật B]: [Lời thoại B (có thể chứa ______)]
A. ...   B. ...   C. ...   D. ...
6. [Tên nhân vật A]: [Lời thoại A (có thể chứa ______)]
[Tên nhân vật B]: [Lời thoại B (có thể chứa ______)]
A. ...   B. ...   C. ...   D. ...
... (liệt kê đầy đủ từ câu 5 đến câu 14 theo đúng dạng đối thoại 2 nhân vật)

**ĐÁP ÁN**
1. [A/B/C/D] (Giải thích ngắn gọn kèm phiên âm IPA của cả 4 từ)
2. [A/B/C/D] (Giải thích ngắn gọn kèm phiên âm đuôi)
3. [A/B/C/D] (Giải thích vị trí trọng âm của cả 4 từ, ví dụ: 'artisan (1) vs ...)
4. [A/B/C/D] (Giải thích vị trí trọng âm của cả 4 từ)
5. [A/B/C/D] ([Nhãn ma trận: Giới từ / Verb tense / Liên từ / Phrasal verb / Từ vựng] - Giải thích ngắn gọn)
... (đến hết câu 14)`;

    case 'part2':
      return `Bạn là chuyên gia ra đề thi Tuyển sinh lớp 10 môn Tiếng Anh tại TP.HCM (cấu trúc mới từ năm 2025).
${gsContext}${customTopicHint}${extraHint}

Nhiệm vụ: Soạn **Phần II. Signs & Short Notices (Câu 15–16 - 0.5 điểm)** theo đúng đặc tả đề thi Sở GD&ĐT TP.HCM và chủ đề sách **Global Success**.

QUY TẮC MA TRẬN BẮT BUỘC:
1. **Câu 15 (Biển báo - Sign)**:
   - Kiểm tra khả năng đọc hiểu qua hình ảnh biển báo.
   - Tập trung vào các biển báo quy định **cần làm gì (must / should / have to)** và **KHÔNG được làm gì (mustn't / not allowed / prohibited)**.
   - Trình bày mô tả trực quan biển báo trong khung rõ ràng (kèm biểu tượng minh họa và chữ trên biển báo nếu có) để giáo viên dùng trực tiếp hoặc chèn hình tương ứng.
2. **Câu 16 (Mẫu thông báo ngắn - Short Notice)**:
   - Cho 1 mẫu thông báo ngắn gọn (30–50 chữ: bảng tin trường học, thư viện, câu lạc bộ tiếng Anh, bảo tàng, trung tâm thể thao, cửa hàng, khu dân cư...) liên quan đến cuộc sống, sinh hoạt, học tập thường ngày trong chương trình Global Success.
   - 4 phương án A, B, C, D kiểm tra thông tin chính xác trong thông báo, đảm bảo chỉ có DUY NHẤT 1 đáp án đúng.

${COMMON_FORMAT_RULES}

CẤU TRÚC MẪU BẮT BUỘC:
**II. Look at the sign or the notice. Choose the best answer (A, B, C or D) for questions 15 and 16. (0.5 pt)**

15. What does the sign say?
• [BIỂN BÁO: Mô tả trực quan biển báo & nội dung chữ trên biển báo]
A. ...
B. ...
C. ...
D. ...

16. What does the notice say?
• [THÔNG BÁO: Nội dung mẫu thông báo ngắn bằng tiếng Anh tự nhiên]
A. ...
B. ...
C. ...
D. ...

**ĐÁP ÁN**
15. [A/B/C/D] (Giải thích rõ nghĩa của biển báo)
16. [A/B/C/D] (Giải thích thông tin đối chiếu trong mẫu thông báo)`;

    case 'part3':
      return `Bạn là chuyên gia ra đề thi Tuyển sinh lớp 10 môn Tiếng Anh tại TP.HCM (cấu trúc mới từ năm 2025).
${gsContext}${customTopicHint}${extraHint}

Nhiệm vụ: Soạn **Phần III. Cloze Text - Đọc điền khuyết văn bản (Câu 17–22 - 1.5 điểm)** bám sát tuyệt đối đặc tả của Sở GD&ĐT TP.HCM và chủ đề/từ vựng sách **Global Success**.

QUY TẮC MA TRẬN BẮT BUỘC (CỰC KỲ NGHIÊM NGẶT):
1. **Độ dài văn bản**: Đoạn văn BẮT BUỘC có độ dài **từ 80 đến 100 chữ** (không tính số thứ tự chỗ trống). Hãy đếm kỹ từng từ để đoạn văn nằm đúng trong khoảng 80–100 chữ.
2. **TUYỆT ĐỐI KHÔNG KIỂM TRA WORD FORM TRONG PHẦN NÀY**:
   - Trong mỗi câu hỏi (17 đến 22), 4 phương án A, B, C, D PHẢI là 4 từ vựng khác nhau về nghĩa (cùng từ loại), TUYỆT ĐỐI KHÔNG cho 4 dạng từ loại (noun/verb/adj/adv) của cùng 1 gốc từ.
3. **Ma trận từ loại của 6 chỗ trống (17–22)**:
   - Bắt buộc 6 chỗ trống (17), (18), (19), (20), (21), (22) trong đoạn văn phải bao gồm ĐỦ các thành phần:
     + **1 Noun** (kiểm tra đọc hiểu chọn danh từ phù hợp ngữ cảnh)
     + **1 Adjective** (kiểm tra đọc hiểu chọn tính từ phù hợp ngữ cảnh)
     + **1 Verb** (kiểm tra đọc hiểu chọn động từ phù hợp ngữ cảnh)
     + **1 Adverb** (kiểm tra đọc hiểu chọn trạng từ phù hợp ngữ cảnh)
     + **1 Preposition** (giới từ đi kèm cụm cố định hoặc ngữ cảnh)
     + **1 từ vựng / liên từ kết nối** phù hợp mạch đọc hiểu.
4. **Tính độc bản của đáp án**: Ngữ cảnh xung quanh mỗi chỗ trống (17)–(22) phải khóa chặt để chỉ có DUY NHẤT 1 phương án đúng trong 4 lựa chọn A, B, C, D.

${COMMON_FORMAT_RULES}

CẤU TRÚC MẪU BẮT BUỘC:
**III. Choose the word (A, B, C or D) that best fits each space in the following passage. (1.5 pts)**

[Đoạn văn tiếng Anh 80–100 chữ có chứa các chỗ trống **(17) _______**, **(18) _______**, **(19) _______**, **(20) _______**, **(21) _______**, **(22) _______**]

17. A. ...   B. ...   C. ...   D. ...
18. A. ...   B. ...   C. ...   D. ...
19. A. ...   B. ...   C. ...   D. ...
20. A. ...   B. ...   C. ...   D. ...
21. A. ...   B. ...   C. ...   D. ...
22. A. ...   B. ...   C. ...   D. ...

**ĐÁP ÁN**
17. [A/B/C/D] - [Từ đáp án] ([Từ loại: Noun/Adj/Verb/Adv/Preposition] - Giải thích ngữ cảnh)
18. [A/B/C/D] - [Từ đáp án] ([Từ loại: Noun/Adj/Verb/Adv/Preposition] - Giải thích ngữ cảnh)
19. [A/B/C/D] - [Từ đáp án] ([Từ loại: Noun/Adj/Verb/Adv/Preposition] - Giải thích ngữ cảnh)
20. [A/B/C/D] - [Từ đáp án] ([Từ loại: Noun/Adj/Verb/Adv/Preposition] - Giải thích ngữ cảnh)
21. [A/B/C/D] - [Từ đáp án] ([Từ loại: Noun/Adj/Verb/Adv/Preposition] - Giải thích ngữ cảnh)
22. [A/B/C/D] - [Từ đáp án] ([Từ loại: Noun/Adj/Verb/Adv/Preposition] - Giải thích ngữ cảnh)`;

    case 'part4':
      return `Bạn là chuyên gia ra đề thi Tuyển sinh lớp 10 môn Tiếng Anh tại TP.HCM (cấu trúc mới từ năm 2025).
${gsContext}${customTopicHint}${extraHint}

Nhiệm vụ: Soạn **Phần IV. Reading True/False & Multiple Choice (Câu 23–28 - 1.5 điểm)** bám sát 100% đặc tả đề thi Sở GD&ĐT TP.HCM và chủ đề sách **Global Success**.

QUY TẮC MA TRẬN BẮT BUỘC (CỰC KỲ NGHIÊM NGẶT):
1. **Văn bản đọc hiểu (180–200 chữ)**:
   - Độ dài đoạn văn BẮT BUỘC từ **180 đến 200 chữ**.
   - Chủ đề phù hợp với bài học trong sách **Global Success** hoặc đời sống học tập, làm việc của học sinh; từ vựng điều chỉnh chuẩn ở mức **A2–B1**.
2. **Câu 23–26 (4 câu TRUE / FALSE)**:
   - **BẮT BUỘC PARAPHRASE LẠI THÔNG TIN TRONG VĂN BẢN**: TUYỆT ĐỐI TRÁNH đem nguyên cả câu trong văn bản xuống làm câu hỏi. Phải dùng từ đồng nghĩa, cấu trúc tương đương hoặc tổng hợp ý rõ ràng.
   - **Trải dài từ đầu đến cuối văn bản**: Câu 23 kiểm tra thông tin ở phần đầu bài, Câu 24–25 ở phần giữa bài, Câu 26 ở phần cuối bài.
   - Phân bổ hợp lý câu TRUE và câu FALSE (ví dụ: 2 câu TRUE, 2 câu FALSE hoặc 3 TRUE, 1 FALSE), thông tin đối chiếu phải rõ ràng 100%, không suy diễn mơ hồ gây tranh cãi.
3. **Câu 27–28 (2 câu Trắc nghiệm A, B, C, D)**:
   - Áp dụng chuẩn các dạng câu hỏi đọc hiểu của Sở GD&ĐT: **main idea / best title, detail, EXCEPT / NOT mentioned, inference, vocabulary in context**.

${COMMON_FORMAT_RULES}

CẤU TRÚC MẪU BẮT BUỘC:
**IV. Read the following passage. Decide whether the statements from 23 to 26 are True or False and choose the correct answer (A, B, C or D) to complete the statements in the questions 27 and 28. (1.5 pts)**

[Đoạn văn tiếng Anh chuẩn 180–200 chữ theo chủ đề Global Success]

23. [Câu nhận định 23 được paraphrase hoàn toàn...] _______
24. [Câu nhận định 24 được paraphrase hoàn toàn...] _______
25. [Câu nhận định 25 được paraphrase hoàn toàn...] _______
26. [Câu nhận định 26 được paraphrase hoàn toàn...] _______

27. [Câu hỏi trắc nghiệm 27: Main idea / NOT mentioned / Detail / Inference...]
A. ...
B. ...
C. ...
D. ...

28. [Câu hỏi trắc nghiệm 28: Vocabulary / Detail / Inference...]
A. ...
B. ...
C. ...
D. ...

**ĐÁP ÁN**
23. [TRUE / FALSE] (Dẫn chứng câu gốc trong bài: "...")
24. [TRUE / FALSE] (Dẫn chứng câu gốc trong bài: "...")
25. [TRUE / FALSE] (Dẫn chứng câu gốc trong bài: "...")
26. [TRUE / FALSE] (Dẫn chứng câu gốc trong bài: "...")
27. [A/B/C/D] (Giải thích ngắn gọn)
28. [A/B/C/D] (Giải thích ngắn gọn)`;

    case 'part5':
      return `Bạn là chuyên gia ra đề thi Tuyển sinh lớp 10 môn Tiếng Anh tại TP.HCM (cấu trúc mới từ năm 2025).
${gsContext}${customTopicHint}${extraHint}

Nhiệm vụ: Soạn **Phần V. Word Form - Cho dạng đúng của từ trong ngoặc (Câu 29–34 - 1.5 điểm)** bám sát 100% ma trận đề thi Sở GD&ĐT TP.HCM và từ vựng sách **Global Success**.

QUY TẮC MA TRẬN BẮT BUỘC (CỰC KỲ NGHIÊM NGẶT):
1. **Tỷ lệ từ loại của 6 đáp án (Câu 29–34)**:
   Bắt buộc trong 6 câu phải đảm bảo ĐÚNG VÀ ĐỦ:
   - **2 Nouns** (Danh từ: có thể là danh từ số ít, danh từ số nhiều hoặc danh từ chỉ người/vật)
   - **2 Adjectives** (Tính từ)
   - **1 Verb** (Động từ: nguyên mẫu, chia thì hoặc phân từ)
   - **1 Adverb** (Trạng từ đuôi -ly)
2. **Độ khó & Phân hóa**:
   - 5 câu ở mức độ Nhận biết / Thông hiểu (học sinh nhìn dấu hiệu mạo từ, giới từ, tính từ, động từ thường/to be là xác định được từ loại).
   - **Tối đa 01 câu Vận dụng cao** (ví dụ: biến đổi sang tính từ/danh từ mang tiền tố phủ định *un-, in-, im-, ir-, dis-* hoặc danh từ số nhiều đòi hỏi đọc hiểu kỹ ngữ cảnh).
3. **Tính độc bản của đáp án (KHÔNG GÂY TRANH CÃI)**:
   - Thiết kế dấu hiệu ngữ pháp và ngữ cảnh chặt chẽ để mỗi chỗ trống _______ chỉ chấp nhận DUY NHẤT 1 từ loại và 1 từ đáp án chuẩn (ví dụ: nếu đáp án là danh từ số nhiều thì trước/sau chỗ trống phải có dấu hiệu số nhiều rõ ràng như *many, several, various, are...*).

${COMMON_FORMAT_RULES}

CẤU TRÚC MẪU BẮT BUỘC:
**V. Use the correct form of the word given in each sentence. (1.5 pts)**

29. [Câu 29 có chỗ trống _______ và từ gốc in hoa trong ngoặc ở cuối câu] (**[WORD 1]**)
30. [Câu 30 có chỗ trống _______ và từ gốc in hoa trong ngoặc ở cuối câu] (**[WORD 2]**)
31. [Câu 31 có chỗ trống _______ và từ gốc in hoa trong ngoặc ở cuối câu] (**[WORD 3]**)
32. [Câu 32 có chỗ trống _______ và từ gốc in hoa trong ngoặc ở cuối câu] (**[WORD 4]**)
33. [Câu 33 có chỗ trống _______ và từ gốc in hoa trong ngoặc ở cuối câu] (**[WORD 5]**)
34. [Câu 34 có chỗ trống _______ và từ gốc in hoa trong ngoặc ở cuối câu] (**[WORD 6]**)

**ĐÁP ÁN**
29. [đáp án 29] ([Noun / Adjective / Verb / Adverb] - Giải thích dấu hiệu ngữ pháp)
30. [đáp án 30] ([Noun / Adjective / Verb / Adverb] - Giải thích dấu hiệu ngữ pháp)
31. [đáp án 31] ([Noun / Adjective / Verb / Adverb] - Giải thích dấu hiệu ngữ pháp)
32. [đáp án 32] ([Noun / Adjective / Verb / Adverb] - Giải thích dấu hiệu ngữ pháp)
33. [đáp án 33] ([Noun / Adjective / Verb / Adverb] - Giải thích dấu hiệu ngữ pháp)
34. [đáp án 34] ([Noun / Adjective / Verb / Adverb] - Giải thích dấu hiệu ngữ pháp)`;

    case 'part6': {
      const targetWord = keyword.trim() || 'benefit';
      let boldWordsPrompt = '';
      if (targetBoldWords && targetBoldWords.trim()) {
        boldWordsPrompt = `\n\nYÊU CẦU BẮT BUỘC VỀ CÁC TỪ IN ĐẬM & PARAPHRASE ĐỀ BÀI:
Người dùng ĐÃ CHỈ ĐỊNH CỤ THỂ các từ/cụm từ in đậm (sẽ là đáp án điền vào chỗ trống trong các câu ví dụ và câu hỏi) như sau:
"${targetBoldWords.trim()}"
1. TẤT CẢ 5 câu ví dụ BẮT BUỘC PHẢI CHỨA TỪ KHÓA "${targetWord}".
2. BẮT BUỘC sử dụng lần lượt đúng các từ/cụm từ trên làm các cụm từ được IN ĐẬM (**từ_in_đậm**) trong các câu ví dụ, mỗi câu 1 cụm khác nhau.
3. CHỈ IN ĐẬM ÍT NHẤT 2 TỪ VÀ NHIỀU NHẤT 3 TỪ.
4. Cả 4 câu hỏi đề bài (đánh số thứ tự **35, 36, 37, 38** tương ứng với Phần VI của đề thi) phải được PARAPHRASE 100% và mỗi chỗ trống chỉ có DUY NHẤT 1 đáp án đúng, không gây tranh cãi.`;
      } else {
        boldWordsPrompt = `\n\nQUY TẮC BẮT BUỘC VỀ TỪ KHÓA "${targetWord}", PARAPHRASE VÀ ĐÁP ÁN:
- TẤT CẢ 5 CÂU VÍ DỤ BẮT BUỘC PHẢI CHỨA TỪ KHÓA "${targetWord}".
- Bắt đầu trực tiếp mỗi câu ví dụ bằng dấu chấm tròn "• " (TUYỆT ĐỐI KHÔNG ghi "Example 1:", "Ex 1:").
- Cụm từ in đậm ở CẢ 5 CÂU VÍ DỤ phải chứa trực tiếp từ khóa "${targetWord}", hoàn toàn khác nhau, độ dài NGHIÊM NGẶT TỪ 2 ĐẾN 3 TỪ (Đúng 2 câu in đậm cụm 3 từ chiếm 40%, và 3 câu in đậm cụm 2 từ chiếm 60%).
- Cả 4 câu hỏi đề bài (BẮT BUỘC đánh số thứ tự **35, 36, 37, 38** tương ứng với Phần VI của đề thi, trong đó 35–36 là 2 câu chính thức và 37–38 là 2 câu dự phòng) phải được PARAPHRASE 100% và khóa chặt ngữ cảnh/ngữ pháp để mỗi chỗ trống _______ chỉ có DUY NHẤT 1 đáp án đúng trong số các cụm in đậm.`;
      }

      return `Bạn là chuyên gia soạn đề thi tiếng Anh lớp 10 tại TP.HCM.
${gsContext}${boldWordsPrompt}

CẤU TRÚC MẪU BẮT BUỘC (SAO CHÉP CHÍNH XÁC THỨ TỰ VÀ SỐ CÂU 35, 36, 37, 38):
**VI. Look at the entry of the word “${targetWord}” in a dictionary. Use what you can get from the entry to complete the sentences with two or three words. (0.5 pt)**

**${targetWord}** /[phonetic]/ *([part of speech])*
*definition*
**SYNONYM**: ...

• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 2 từ có từ khóa 1**]
• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 3 từ có từ khóa 2**]
• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 2 từ có từ khóa 3**]
• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 3 từ có từ khóa 4**]
• [câu ví dụ tiếng Anh tự nhiên hoàn chỉnh có chứa **cụm 2 từ có từ khóa 5**]

35. [câu hỏi 35 ngữ cảnh mới được paraphrase hoàn toàn, có chỗ trống _______ duy nhất chỉ điền được cụm 1 (2 từ)]
36. [câu hỏi 36 ngữ cảnh mới được paraphrase hoàn toàn, có chỗ trống _______ duy nhất chỉ điền được cụm 2 (3 từ)]
37. [câu hỏi 37 (dự phòng) ngữ cảnh mới được paraphrase hoàn toàn, có chỗ trống _______ duy nhất chỉ điền được cụm 3 (2 từ)]
38. [câu hỏi 38 (dự phòng) ngữ cảnh mới được paraphrase hoàn toàn, có chỗ trống _______ duy nhất chỉ điền được cụm 4 (3 từ)]

**ĐÁP ÁN**
35. [đáp án của câu 35 - nguyên văn cụm 1]
36. [đáp án của câu 36 - nguyên văn cụm 2]
37. [đáp án của câu 37 - nguyên văn cụm 3]
38. [đáp án của câu 38 - nguyên văn cụm 4]

${COMMON_FORMAT_RULES}`;
    }

    case 'part7':
      return `Bạn là chuyên gia ra đề thi Tuyển sinh lớp 10 môn Tiếng Anh tại TP.HCM (cấu trúc mới từ năm 2025).
${gsContext}${customTopicHint}${extraHint}

Nhiệm vụ: Soạn **Phần VII. Writing - Biến đổi câu tương đương nghĩa (Câu 37–40 - 1.0 điểm)** bám sát 100% đặc tả đề thi Sở GD&ĐT TP.HCM và ngữ pháp/cụm động từ sách **Global Success**.

QUY TẮC MA TRẬN BẮT BUỘC (CỰC KỲ NGHIÊM NGẶT):
1. **Bắt buộc có ít nhất 01 câu biến đổi sử dụng PHRASAL VERB**:
   - Ít nhất 1 câu trong 4 câu (37–40) BẮT BUỘC kiểm tra biến đổi câu dùng **Phrasal Verb** trong SGK Global Success (ví dụ: *participate in -> take part in*, *continue -> go on / carry on*, *look after -> take care of*, *postpone/delay -> put off*, *discover/learn -> find out*, *transmit to younger generations -> pass down / hand down*, *reduce -> cut down on*, *recover from -> get over*, *admire/respect -> look up to*...).
2. **3 câu còn lại (trong Câu 37–40)**:
   - Kiểm tra các cấu trúc biến đổi câu trọng tâm của SGK Tiếng Anh Global Success:
     + *Wish + past simple* / *If only*
     + *Reported speech* (Câu trần thuật hoặc câu hỏi Yes/No / Wh-questions, hoặc *asked/wondered + wh- + to V*)
     + *Relative clauses* (who, which, whose) hoặc *Double comparatives (The more..., the more...)*
     + *Suggest / Advise + V-ing / that S (should) V*
     + *Although/Though <-> Despite/In spite of* hoặc *Because <-> Because of* hoặc *So...that / Such...that*
     + *Spend time V-ing <-> It takes...* hoặc *Present perfect <-> Past simple*
3. **Định dạng chuẩn đề thi Sở GD&ĐT**:
   - Mỗi câu gồm câu gốc và dòng bên dưới in sẵn từ gợi ý mở đầu câu viết lại ('→ [Từ gợi ý đầu câu] _______').

${COMMON_FORMAT_RULES}

CẤU TRÚC MẪU BẮT BUỘC:
**VII. Rewrite each of the following sentences in another way so that it means almost the same as the sentence printed before it. (1.0 pt)**

37. [Câu gốc 37]
→ [Từ gợi ý đầu câu 37] _______________________________________________________.
38. [Câu gốc 38]
→ [Từ gợi ý đầu câu 38] _______________________________________________________.
39. [Câu gốc 39]
→ [Từ gợi ý đầu câu 39] _______________________________________________________.
40. [Câu gốc 40]
→ [Từ gợi ý đầu câu 40] _______________________________________________________.

**ĐÁP ÁN**
37. [Câu viết lại hoàn chỉnh 37] ([Cấu trúc kiểm tra])
38. [Câu viết lại hoàn chỉnh 38] ([Cấu trúc kiểm tra])
39. [Câu viết lại hoàn chỉnh 39] ([Cấu trúc kiểm tra])
40. [Câu viết lại hoàn chỉnh 40] ([Cấu trúc kiểm tra - Phrasal Verb])`;

    case 'full_exam':
    default:
      return `Bạn là Tổ trưởng Hội đồng ra đề thi Tuyển sinh lớp 10 môn Tiếng Anh tại TP.HCM (cấu trúc mới từ năm 2025).
${gsContext}${customTopicHint}${extraHint}

Nhiệm vụ: Biên soạn **ĐỀ THI TUYỂN SINH LỚP 10 MÔN TIẾNG ANH HOÀN CHỈNH (40 CÂU - 10 ĐIỂM)** gồm đầy đủ 7 phần (từ Câu 1 đến Câu 40), lấy 100% ngữ liệu từ vựng, cụm động từ, ngữ pháp và chủ đề từ bộ sách **Tiếng Anh Global Success**.

MA TRẬN 40 CÂU BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI:
- **I. Multiple Choice (3.5 pts | Câu 1–14)**:
  + Câu 1: Phát âm nguyên âm cơ bản (a, e, i, o, u).
  + Câu 2: Phát âm đuôi -s/es hoặc -ed.
  + Câu 3: Trọng âm từ 2 âm tiết.
  + Câu 4: Trọng âm từ 3 âm tiết (khuyến khích hậu tố -tion, -ate, -ity, -ic; hạn chế từ ghép).
  + Câu 5–12: BẮT BUỘC 100% ở dạng ĐỐI THOẠI 2 NHÂN VẬT với tỷ lệ chỗ trống 50–50 (đúng 4 câu có chỗ trống ______ ở lượt lời người nói đầu tiên và 4 câu có chỗ trống ______ ở lượt lời người nói sau), gồm đúng 1 câu giới từ (in/on/at), 1 câu verb tense, 1 câu liên từ, 1 câu phrasal verb, 4 câu từ vựng/cấu trúc (ưu tiên từ vựng Global Success).
  + Câu 13–14: 2 câu giao tiếp (1 câu chọn vế nói, 1 câu chọn vế đáp).
- **II. Signs & Notices (0.5 pt | Câu 15–16)**:
  + Câu 15: Biển báo (cần làm gì và KHÔNG được làm gì).
  + Câu 16: Mẫu thông báo ngắn gọn liên quan đến sinh hoạt, học tập thường ngày.
- **III. Cloze Text (1.5 pts | Câu 17–22)**:
  + Đoạn văn 80–100 chữ. KHÔNG kiểm tra word form. Đảm bảo đủ: 1 noun, 1 adjective, 1 verb, 1 adverb, 1 preposition và 1 từ vựng ngữ cảnh.
- **IV. Reading True/False (1.5 pts | Câu 23–28)**:
  + Đoạn văn 180–200 chữ (mức A2–B1, chủ đề Global Success).
  + Câu 23–26: TRUE / FALSE (paraphrase lại thông tin, trải dài từ đầu đến cuối bài, tránh chép nguyên câu).
  + Câu 27–28: Trắc nghiệm A, B, C, D (main idea, detail, except, not mentioned, inference, vocabulary).
- **V. Word Form (1.5 pts | Câu 29–34)**:
  + 6 câu đảm bảo đúng: 2 nouns, 2 adjectives, 1 verb, 1 adverb (tối đa 01 câu vận dụng cao).
- **VI. Dictionary Entry (0.5 pt | Câu 35–36)**:
  + Mục từ điển Oxford (đánh máy trực tiếp, 5 câu ví dụ '• ...' chứa 5 cụm từ in đậm dài 2–3 từ có từ khóa), theo sau là Câu 35 và Câu 36 hoàn thành câu với 2 hoặc 3 từ.
- **VII. Writing (1.0 pt | Câu 37–40)**:
  + 4 câu biến đổi câu, đảm bảo có ít nhất 1 câu biến đổi sử dụng Phrasal Verb.
- Cuối đề là mục **ĐÁP ÁN** liệt kê đầy đủ đáp án từ Câu 1 đến Câu 40 kèm giải thích ngắn gọn.

${COMMON_FORMAT_RULES}`;
  }
}

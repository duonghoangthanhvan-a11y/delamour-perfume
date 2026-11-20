# Quy tắc Vận hành AI Agent cho Dự án & Bộ kỹ năng SEO (Claude SEO & Delamour SEO)

## 1. Cơ chế Tiếp nhận Lệnh SEO (/seo hoặc Tiếng Việt)
Bất cứ khi nào người dùng nhập một câu lệnh bắt đầu bằng `/seo` hoặc yêu cầu tác vụ SEO, Agent sẽ tự động ánh xạ tới Sub-skill tương ứng trong thư mục `.agents/skills/`:

| Lệnh người dùng gõ | Sub-skill tương ứng | Chức năng thực hiện |
| :--- | :--- | :--- |
| `/seo audit [url]` | `seo-audit` & `delamour-seo` | Kiểm toán SEO toàn diện (Technical, Content, Schema, Speed, AI Search). |
| `/seo page [url]` | `seo-page` | Kiểm tra chuyên sâu một trang duy nhất. |
| `/seo technical [url]` | `seo-technical` | Kiểm tra kỹ thuật: robots.txt, sitemap, thẻ canonical, mobile, HTTP headers. |
| `/seo schema [url]` | `seo-schema` | Kiểm tra, sinh mã JSON-LD đa tầng cho Sản phẩm, Thương hiệu, FAQ, Return Policy. |
| `/seo geo [url]` | `seo-geo` | Tối ưu hóa công cụ tìm kiếm tạo sinh (Generative Engine Optimization - ChatGPT, Perplexity, Gemini). |
| `/seo agentic [url]` | `seo-agentic` | Kiểm tra độ thân thiện với AI Agent, llms.txt, cấu trúc Markdown. |
| `/seo content [url]` | `seo-content` | Đánh giá E-E-A-T, chiều sâu nội dung, phát hiện nội dung mỏng. |
| `/seo content-brief <topic>` | `seo-content-brief` | Lập dàn bài (Content Brief) chi tiết kèm từ khóa, H2/H3, internal links. |
| `/seo cluster <keyword>` | `seo-cluster` | Gom nhóm từ khóa theo ngữ nghĩa và hành trình khách hàng. |
| `/seo local [url]` / `/seo maps` | `seo-local` & `seo-maps` | Tối ưu Google Maps, Google Business Profile và SEO địa phương. |
| `/seo competitor-pages [url]` | `seo-competitor-pages` | Xây dựng trang so sánh đối thủ (X vs Y). |
| `/seo sxo [url]` | `seo-sxo` | Tối ưu trải nghiệm tìm kiếm và chân dung người dùng (Search Experience Optimization). |
| `/seo sitemap [url]` | `seo-sitemap` | Phân tích và sinh file sitemap.xml chuẩn. |
| `/seo images [url]` | `seo-images` | Tối ưu hình ảnh, kích thước WebP, thẻ Alt cho Google và AI Vision. |

## 2. Dự án Mục tiêu: De L'amour Digital Flagship Store
- URL mặc định khi không truyền tham số: `https://delamour-perfume.vercel.app/`
- Tôn trọng nguyên tắc bảo toàn thực thể và cấu trúc ngữ nghĩa tại `.agents/skills/delamour-seo/SKILL.md`.

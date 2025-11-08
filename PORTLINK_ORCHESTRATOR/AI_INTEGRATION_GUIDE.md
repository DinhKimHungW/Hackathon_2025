# 🤖 Hướng dẫn tích hợp AI vào PortLink Chatbot

## 📋 Tổng quan

Dự án đã được tích hợp **GitHub Models API** để chatbot có thể:
- ✅ Trả lời câu hỏi dựa trên dữ liệu thực tế của dự án
- ✅ Phân tích conflicts và đề xuất giải pháp
- ✅ Đưa ra khuyến nghị tối ưu hóa
- ✅ Hỗ trợ tiếng Việt và tiếng Anh

## 🚀 Cách lấy GitHub API Key (MIỄN PHÍ)

### Bước 1: Tạo GitHub Personal Access Token

1. Đăng nhập GitHub: https://github.com
2. Vào Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Hoặc truy cập trực tiếp: https://github.com/settings/tokens
3. Click "Generate new token" → "Generate new token (classic)"
4. Điền thông tin:
   - **Note:** `PortLink AI Access`
   - **Expiration:** 90 days (hoặc No expiration)
   - **Select scopes:** Chỉ cần tích ✅ **"Read access to models"**
5. Click "Generate token"
6. **QUAN TRỌNG:** Copy token ngay (chỉ hiển thị 1 lần!)
   - Format: `github_pat_...` (dài ~90 ký tự)

### Bước 2: Cấu hình trong dự án

Mở file `backend/.env` và thêm:

```env
AI_API_KEY=github_pat_YOUR_TOKEN_HERE
AI_API_ENDPOINT=https://models.inference.ai.azure.com
AI_MODEL=gpt-4o-mini
```

**Các model có sẵn MIỄN PHÍ:**
- `gpt-4o-mini` - Nhanh, nhẹ, tốt cho chatbot (khuyên dùng)
- `gpt-4o` - Mạnh hơn nhưng chậm hơn
- `Phi-3-medium-128k-instruct` - Microsoft Phi-3
- `Llama-3.1-405B-Instruct` - Meta Llama 3.1
- `Mistral-large-2407` - Mistral AI
- `Cohere-command-r-plus-08-2024` - Cohere

### Bước 3: Khởi động lại Backend

```bash
cd backend
npm run start:dev
```

## 🎯 Cách sử dụng AI trong Chatbot

### 1. Chat với AI (tự động sử dụng dữ liệu dự án)

**Endpoint:** `POST /api/v1/chatbot/chat`

```json
{
  "message": "Hiện tại có bao nhiêu tàu đang đậu ở cảng?"
}
```

**Response:**
```json
{
  "message": "Dựa trên dữ liệu hiện tại, có 3 tàu đang đậu ở cảng:\n\n1. MSC SARAH (Container Ship) - Berth A1\n2. MAERSK SEOUL (Container Ship) - Berth A2\n3. EVERGREEN MARINE (Bulk Carrier) - Berth B1\n\nTất cả đều có trạng thái 'BERTHED' và dự kiến hoàn thành vào ngày mai.",
  "intent": "ai_powered_query",
  "data": {
    "confidence": 0.85,
    "dataSources": ["ship_visits", "schedules"]
  }
}
```

### 2. Phân tích Conflict với AI

**Endpoint:** `GET /api/v1/chatbot/ai/analyze-conflict/:conflictId`

```bash
curl http://localhost:3000/api/v1/chatbot/ai/analyze-conflict/uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "**Phân tích Conflict:**\n\n**Root Cause:**\nXung đột lịch trình do 2 tàu cùng yêu cầu Berth A1 trong cùng khung giờ...\n\n**Giải pháp đề xuất:**\n1. Di chuyển tàu thứ 2 sang Berth A2 (khả thi 95%)\n2. Hoãn lịch tàu thứ 2 thêm 2 giờ (khả thi 80%)\n3. Tăng tốc độ xử lý tàu thứ 1 (khả thi 60%)",
  "confidence": 0.85,
  "dataSources": ["conflicts", "schedules"]
}
```

### 3. Tạo Đề xuất Tối ưu hóa

**Endpoint:** `GET /api/v1/chatbot/ai/optimize-all`

```bash
curl http://localhost:3000/api/v1/chatbot/ai/optimize-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 AI Service Architecture

```
User Query → ChatbotService → AIService
                                  ↓
                        1. Gather Project Data
                           - Ship Visits
                           - Schedules
                           - Conflicts
                           - Assets
                           - Tasks
                                  ↓
                        2. Build Context Prompt
                           - System Instructions
                           - Real Data
                           - User Query
                                  ↓
                        3. Call GitHub Models API
                           - OpenAI-compatible
                           - Streaming support
                                  ↓
                        4. Parse & Return Response
                           - Formatted answer
                           - Data sources used
                           - Confidence score
```

## 🔧 Tuning AI Behavior

### Thay đổi Model (trong .env):

```env
# Nhẹ, nhanh - tốt cho development
AI_MODEL=gpt-4o-mini

# Mạnh hơn - production
AI_MODEL=gpt-4o

# Open source models
AI_MODEL=Phi-3-medium-128k-instruct
AI_MODEL=Llama-3.1-405B-Instruct
```

### Tùy chỉnh System Prompt (ai.service.ts):

Sửa method `buildPrompt()` để thay đổi hành vi của AI:

```typescript
const systemPrompt = `You are an intelligent assistant for PortLink...
**Your Role:**
- Giúp users quản lý cảng...
- Luôn trả lời bằng tiếng Việt (hoặc English nếu user hỏi bằng English)
...`;
```

### Điều chỉnh Parameters:

Trong method `callAI()`:

```typescript
{
  temperature: 0.7,  // 0.0-1.0: Càng cao càng sáng tạo
  max_tokens: 1000,  // Độ dài response
  top_p: 0.95,       // Sampling method
}
```

## 🧪 Testing

### Test chat đơn giản:

```bash
# Login trước
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@catlai.com","password":"Admin@2025"}'

# Copy access_token từ response

# Test AI chat
curl -X POST http://localhost:3000/api/v1/chatbot/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Hãy tóm tắt tình hình cảng hiện tại"}'
```

### Test với Frontend:

1. Đăng nhập vào dashboard
2. Mở trang Chat/Chatbot
3. Hỏi các câu như:
   - "Có bao nhiêu tàu đang đợi?"
   - "Phân tích conflict cho tôi"
   - "Đề xuất cách tối ưu hóa"

## ⚠️ Lưu ý quan trọng

### Rate Limits (GitHub Models - Free Tier):
- **RPM (Requests per minute):** 15 requests/phút
- **TPM (Tokens per minute):** 150,000 tokens/phút
- **RPD (Requests per day):** 150 requests/ngày

→ Đủ cho development và demo, nhưng nên cache responses nếu production

### Security:
- ✅ Không commit `.env` lên GitHub
- ✅ Token có expiration date
- ✅ Revoke token ngay nếu bị lộ
- ✅ Sử dụng environment variables trong production

### Fallback:
- Nếu AI không khả dụng (hết quota, lỗi API), chatbot tự động fallback về logic cũ
- User vẫn nhận được response hữu ích

## 📚 Tài liệu tham khảo

- **GitHub Models:** https://github.com/marketplace/models
- **API Reference:** https://docs.github.com/en/rest/models
- **Model Catalog:** https://github.com/marketplace/models/catalog
- **OpenAI API Docs:** https://platform.openai.com/docs/api-reference

## 🎉 Kết quả

Sau khi cấu hình xong, chatbot sẽ:
1. ✅ Hiểu ngữ cảnh và trả lời chính xác dựa trên dữ liệu thực
2. ✅ Phân tích conflicts với AI và đề xuất giải pháp
3. ✅ Tự động gather data từ database khi cần
4. ✅ Hỗ trợ đa ngôn ngữ (Vietnamese & English)
5. ✅ Có fallback khi AI không khả dụng

**Demo queries bạn có thể thử:**
- "Tàu nào sẽ đến cảng hôm nay?"
- "Có conflict nào cần xử lý không?"
- "Đề xuất cách sử dụng berth hiệu quả hơn"
- "Phân tích performance của crane"
- "What are the current bottlenecks?"

---

**Happy coding! 🚀**

Nếu có vấn đề, check logs tại terminal backend để debug.

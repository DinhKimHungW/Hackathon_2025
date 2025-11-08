# 🤖 Quick Start: AI Integration

## 1️⃣ Get GitHub Token (1 minute)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `PortLink AI`
4. Check: ✅ **"Read access to models"**
5. Click "Generate token"
6. **Copy the token** (starts with `github_pat_...`)

## 2️⃣ Configure Backend

Edit `backend/.env`:

```env
AI_API_KEY=github_pat_YOUR_TOKEN_HERE
AI_MODEL=gpt-4o-mini
```

## 3️⃣ Test AI

Backend tự động reload. Test ngay:

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@catlai.com","password":"Admin@2025"}'

# Chat with AI (copy token from above)
curl -X POST http://localhost:3000/api/v1/chatbot/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Tóm tắt tình hình cảng hiện tại"}'
```

## 🎯 What AI Can Do

✅ Answer questions using real project data  
✅ Analyze conflicts and suggest solutions  
✅ Generate optimization recommendations  
✅ Support Vietnamese & English  
✅ Fallback to rule-based when API unavailable  

## 📝 Example Queries

- "Có bao nhiêu tàu đang đậu?"
- "Phân tích conflict cho tôi"
- "Đề xuất tối ưu hóa"
- "What ships are arriving today?"

## 🔗 New API Endpoints

- `POST /api/v1/chatbot/chat` - AI-powered chat
- `GET /api/v1/chatbot/ai/analyze-conflict/:id` - AI conflict analysis
- `GET /api/v1/chatbot/ai/optimize-all` - AI optimization suggestions

## ⚙️ Available Models

```env
AI_MODEL=gpt-4o-mini        # Fast & light (recommended)
AI_MODEL=gpt-4o             # More powerful
AI_MODEL=Phi-3-medium-128k-instruct  # Microsoft
AI_MODEL=Llama-3.1-405B-Instruct     # Meta
```

## 📖 Full Documentation

See [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md) for complete details.

---

**That's it! Your chatbot now has AI superpowers! 🚀**

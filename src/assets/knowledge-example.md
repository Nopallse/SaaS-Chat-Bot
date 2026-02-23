# Knowledge Base - Blastify Customer Service Bot

## 1. Produk dan Layanan

### A. Email Broadcasting
**Deskripsi:**
Layanan untuk mengirim email dalam jumlah besar ke daftar penerima email secara simultan atau terjadwal.

**Fitur Utama:**
- Pengiriman masal hingga 10,000+ penerima per campaign
- Penjadwalan pengiriman otomatis
- Template email yang dapat disesuaikan
- Analytics pengiriman dan pembukaan email

**Harga:**
- Paket Basic: 100 email/bulan - Rp 50,000
- Paket Pro: 1,000 email/bulan - Rp 250,000
- Paket Enterprise: Unlimited - Custom pricing

---

### B. WhatsApp Business Automation
**Deskripsi:**
Platform otomasi WhatsApp untuk customer service, broadcast, dan Group management.

**Fitur Utama:**
- Auto-reply messages dengan AI
- Broadcast ke multiple contacts
- Group management dan monitoring
- Contact segmentation
- Automation workflows

**Supported Features:**
- Mengirim pesan teks dan media (gambar, video, dokumen)
- Group broadcast dengan delay settings
- Delay: 1000-5000ms per pesan (recommended: 1500ms)
- Jitter: 400-1000ms untuk mencegah flagging

---

### C. AI Agent
**Deskripsi:**
Intelligent bot yang dapat memahami konteks dan memberikan respons otomatis.

**Capabilities:**
- Natural language understanding
- Multi-language support (English, Indonesian, etc)
- Knowledge base integration
- Custom system prompts
- Fallback replies untuk pertanyaan yang tidak dapat dijawab

**Configuration:**
- Model: GPT-4 / GPT-3.5-turbo (sesuai subscription)
- Temperature: 0.0-1.0 (default: 0.7)
- Max Tokens: 512-4096 (default: 1024)

---

## 2. Panduan Penggunaan

### Membuat WhatsApp Session
1. Buka menu WhatsApp di sidebar
2. Klik "New Session"
3. Scan QR code dengan ponsel (ponsel harus terkoneksi internet)
4. Tunggu session connected (status menjadi "Connected")

### Mengirim Broadcast WhatsApp
1. Buka WhatsApp > Broadcasts tab
2. Pilih Session yang sudah connected
3. Input nomor tujuan atau pilih dari Contacts
4. Tipe konten: Text, Image, atau Document
5. Atur delay (default: 1500ms) untuk mencegah rate limiting
6. Klik "Start Broadcast"

### Mengatur AI Agent
1. Buka menu AI > AI Agent
2. Klik "Buat Agent Baru"
3. Masukkan nama agent dan pilih WhatsApp session
4. Upload knowledge files (PDF) jika diperlukan
5. Atur mode: BOT (auto-reply) atau HUMAN (manual)

---

## 3. FAQ dan Troubleshooting

### Q: Kenapa QR code tidak muncul saat create session?
A: Pastikan:
- Browser sudah refresh
- Internet connection stabil
- WhatsApp di ponsel versi terbaru
- Tidak ada session aktif di perangkat lain dengan nomor yang sama

### Q: Broadcast lambat, kenapa?
A: Hal ini normal karena sistem sengaja memberikan delay untuk:
- Mencegah blocked nomor (rate limiting)
- Menghindari flag dari WhatsApp
- Memastikan delivery yang stabil
- Jangan ubah delay di bawah 500ms

### Q: AI Agent tidak merespons dengan akurat
A: Solusi:
- Upload knowledge files yang relevan
- Para-phrase system prompt lebih detail
- Gunakan temperature yang lebih rendah (0.3-0.5)
- Berikan contoh respons di knowledge base

### Q: Bagaimana cara backup nomor WhatsApp?
A: Silakan hubungi team support. Backup session dilakukan secara otomatis setiap 24 jam.

---

## 4. Best Practices

### Email Broadcasting:
- Minimal engagement rate 2% dianggap sukses
- Gunakan subject line yang menarik (max 50 chars)
- Mobile-friendly template HTML
- Jangan kirim ke bounced emails

### WhatsApp Broadcasting:
- Segment contacts berdasarkan kategori
- Gunakan personal touch (greeting dengan nama)
- Hindiri broadcast mass di jam 2-4 pagi
- Monitor delivery status dan adjust strategy

### AI Agent:
- Selalu provide knowledge base yang detail
- Test bot dengan pertanyaan umum dulu
- Monitor fallback rate dan improve knowledge
- Gunakan mode HUMAN di luar jam kerja

---

## 5. Pricing dan Subscription

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| WhatsApp Session | 1 | 5 | Unlimited |
| Email/Bulan | 100 | 1,000 | Unlimited |
| AI Agents | 1 | 5 | Unlimited |
| Knowledge Files | 2 | 10 | 100 |
| Priority Support | No | Yes | Yes |
| Custom Integration | No | No | Yes |

---

## 6. Contact & Support

**Customer Support:**
- WhatsApp: +62-xxx-xxxx-xxxx
- Email: support@blastify.com
- Live Chat: Available inside dashboard
- Response Time: Max 2 jam (business hours)

**Billing & Account:**
- Email: billing@blastify.com
- Hours: Monday-Friday, 09:00-17:00 WIB

---

*Last Updated: February 23, 2026*

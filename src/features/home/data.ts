import type { FeatureCard, UseCaseCard, FooterLinkGroup } from "./types";

/* ──────────────────────────────────────────────
 * Feature Cards – Fitur Utama section
 * ────────────────────────────────────────────── */
export const FEATURE_CARDS: FeatureCard[] = [
  {
    title: "AI Customer Service Agent",
    description:
      "Latih AI dengan data bisnis Anda — FAQ, produk, SOP, hingga kebijakan perusahaan. MITBIZ AI akan menjawab layaknya customer service profesional.",
    points: [
      "Respon otomatis 24/7",
      "Percakapan kontekstual & natural",
      "Handover ke human agent",
      "Mendukung multi-bahasa",
    ],
  },
  {
    title: "Integrasi WhatsApp",
    description:
      "Hubungkan WhatsApp Business dan kelola semua chat pelanggan dalam satu dashboard.",
    points: [
      "Inbox multi-agent",
      "AI reply & auto-reply",
      "Riwayat chat & tagging",
      "Monitoring SLA respon",
    ],
  },
  {
    title: "Integrasi Gmail",
    description:
      "Ubah email customer menjadi sistem customer support berbasis AI.",
    points: [
      "AI auto-reply email",
      "Inbox terpusat WhatsApp & Email",
      "Klasifikasi & prioritas email",
    ],
  },
  {
    title: "WhatsApp Broadcasting",
    description:
      "Kirim pesan promosi dan notifikasi ke ribuan pelanggan secara personal dan terukur.",
    points: [
      "Segmentasi pelanggan",
      "Penjadwalan broadcast",
      "Pesan dinamis (nama, produk, status)",
      "Analitik performa broadcast",
    ],
  },
];

/* ──────────────────────────────────────────────
 * Use-Case Cards
 * ────────────────────────────────────────────── */
export const USE_CASE_CARDS: UseCaseCard[] = [
  {
    title: "Untuk UMKM",
    points: [
      "Auto-reply chat pelanggan",
      "Follow-up & promosi via WhatsApp",
      "Mengurangi beban CS",
      "Tampil lebih profesional",
    ],
  },
  {
    title: "Untuk Enterprise",
    points: [
      "Customer support omnichannel",
      "AI dengan SLA & workflow kompleks",
      "Skalabilitas tinggi untuk traffic besar",
      "Integrasi CRM & sistem internal",
    ],
  },
];

/* ──────────────────────────────────────────────
 * Why Mitbiz – badges / pills
 * ────────────────────────────────────────────── */
export const WHY_MITBIZ_ITEMS: string[] = [
  "Dukungan teknis profesional",
  "AI dilatih khusus sesuai bisnis Anda",
  "Mudah dikembangkan (API ready)",
  "Cocok untuk UMKM & Enterprise",
  "Keamanan setara enterprise",
];

/* ──────────────────────────────────────────────
 * Problem Section items
 * ────────────────────────────────────────────── */
export const PROBLEM_ITEMS = [
  "Chat WhatsApp dibalas manual satu per satu",
  "Email customer sering terlambat ditangani",
  "Sulit mengelola komunikasi dalam skala besar",
  "Pertanyaan berulang menghabiskan waktu CS",
  "Broadcast WhatsApp tidak terpersonalisasi",
] as const;

/* ──────────────────────────────────────────────
 * Footer link groups
 * ────────────────────────────────────────────── */
export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Features",
    links: [
      { label: "Produk", href: "/#features" },
      { label: "Solusi", href: "/#solutions" },
      { label: "Harga", href: "/#pricing" },
      { label: "Keamanan", href: "/#security" },
      { label: "Kontak", href: "/#contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "Blog", href: "/#blog" },
    ],
  },
  {
    title: "Faq",
    links: [
      { label: "Careers", href: "/#careers" },
      { label: "Contact", href: "/#contact" },
    ],
  },
];

export const FOOTER_LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
] as const;

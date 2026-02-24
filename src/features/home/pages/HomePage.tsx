import { Typography, Button, Card, Row, Col, Space, Layout, theme } from "antd";
import {
  MessageOutlined,
  MailOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  CaretRightFilled,
} from "@ant-design/icons";

import heroImage from "@/assets/hero.png";
import caraKerjaImage from "@/assets/cara_kerja.png";
import logoImage from "@/assets/m_logo.png";

import {
  SectionLabel,
  SectionWrapper,
  CheckItem,
  CircleIcon,
} from "../components";
import {
  FEATURE_CARDS,
  USE_CASE_CARDS,
  WHY_MITBIZ_ITEMS,
  PROBLEM_ITEMS,
} from "../data";
import { SparkleIcon, PlayCircleIcon, ChatBubbleIcon } from "../icons";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;
const { useToken } = theme;

/* ──────────────────────────────────────────────
 * Shared card styles
 * ────────────────────────────────────────────── */
const CARD_GRADIENT =
  "linear-gradient(180deg, rgba(201, 216, 236, 0.52) -49.21%, #F2FBFF 52.67%, rgba(201, 216, 236, 0.52) 138.32%)";

const cardStyle: React.CSSProperties = {
  background: CARD_GRADIENT,
  border: "1px solid #C7DBF1",
  borderRadius: 14,
  height: "100%",
  minHeight: 380,
  width: "100%",
};

const cardBodyStyle: React.CSSProperties = { padding: "48px 40px" };

/** Icons for the Problem section – one per problem item */
const PROBLEM_ICONS: React.ReactNode[] = [
  <MessageOutlined key="msg1" />,
  <MailOutlined key="mail" />,
  <UploadOutlined key="upload" />,
  <CheckCircleOutlined key="check" />,
  <MessageOutlined key="msg2" />,
];

/* ──────────────────────────────────────────────
 * Page component
 * ────────────────────────────────────────────── */
const HomePage = () => {
  const { token } = useToken();

  return (
    <Content style={{ background: "#fff" }}>
      {/* ── Hero ─────────────────────────────── */}
      <div
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "72px 24px 360px",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Space
            direction="vertical"
            size={24}
            align="center"
            style={{ width: "100%", textAlign: "center" }}
          >
            <Title
              level={1}
              style={{
                margin: 0,
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.2,
                textShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <span style={{ color: token.colorPrimary }}>Otomatisasi</span>{" "}
              <span style={{ display: "inline-flex", verticalAlign: "middle" }}>
                <SparkleIcon />
              </span>{" "}
              <span>Komunikasi</span>
              <br />
              <span style={{ color: token.colorTextHeading }}>
                Bisnis Anda dengan AI
              </span>
            </Title>

            <Paragraph
              style={{
                fontSize: 16,
                color: "#595959",
                margin: 0,
                maxWidth: 800,
                textShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              Mitbiz membantu UMKM hingga perusahaan enterprise mengelola
              komunikasi WhatsApp dan Email dengan AI Customer Service Agent,
              fitur broadcast cerdas, dan integrasi yang seamless.
            </Paragraph>

            <Space size="middle" wrap style={{ justifyContent: "center" }}>
              <Button type="primary" size="large" icon={<PlayCircleIcon />}>
                Request Demo
              </Button>
              <Button
                size="large"
                icon={<ChatBubbleIcon />}
                style={{
                  color: token.colorPrimary,
                  borderColor: token.colorPrimary,
                }}
              >
                Hubungi Tim Sales
              </Button>
            </Space>
          </Space>
        </div>
      </div>

      {/* ── Problem ──────────────────────────── */}
      <SectionWrapper id="features" padding="64px 24px 40px">
        <Row gutter={[40, 32]} align="middle">
          <Col xs={24} lg={12}>
            <SectionLabel>PROBLEM SECTION</SectionLabel>
            <Title
              level={2}
              style={{ margin: "10px 0 14px", fontSize: 44, lineHeight: 1.18 }}
            >
              Komunikasi Pelanggan
              <br />
              Semakin{" "}
              <span style={{ color: token.colorPrimary }}>Kompleks</span>
            </Title>
            <Paragraph
              style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: "#5E5E5E" }}
            >
              Seiring pertumbuhan bisnis, pesan dari pelanggan melalui WhatsApp
              dan email semakin banyak. Tanpa sistem yang tepat, tim customer
              service kewalahan, respon menjadi lambat, dan peluang bisnis
              terlewatkan.
            </Paragraph>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={{
                background: "#E9F1F9",
                borderRadius: 16,
                padding: "8px 8px",
                boxShadow: "none",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Space direction="vertical" size={18} style={{ width: "100%" }}>
                {PROBLEM_ITEMS.map((text, i) => (
                  <Space key={text} size={14} align="center" style={{ width: "100%" }}>
                    <CircleIcon size={24}>{PROBLEM_ICONS[i]}</CircleIcon>
                    <Text style={{ color: "#5E5E5E", fontSize: 17, lineHeight: 1.5 }}>
                      {text}
                    </Text>
                  </Space>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </SectionWrapper>

      {/* ── Solusi ───────────────────────────── */}
      <SectionWrapper id="solutions" padding="32px 24px 52px">
        <Row gutter={[40, 24]} align="middle">
          <Col xs={24} lg={12}>
            <SectionLabel>SOLUSI</SectionLabel>
            <Title
              level={2}
              style={{ margin: "10px 0 0", fontSize: 46, lineHeight: 1.18 }}
            >
              <span style={{ color: token.colorPrimary }}>Satu Platform</span>{" "}
              untuk Semua Percakapan Bisnis
            </Title>
          </Col>
          <Col xs={24} lg={12}>
            <Paragraph
              style={{ margin: 0, fontSize: 18, lineHeight: 1.75, color: "#5E5E5E" }}
            >
              Mitbiz menggabungkan WhatsApp dan Gmail dalam satu platform cerdas
              yang didukung AI. AI Agent kami memahami bisnis Anda dan siap
              melayani pelanggan secara otomatis — cepat, konsisten, dan scalable.
              <br />
              <br />
              Dari pertanyaan pertama hingga after-sales support, semuanya
              ditangani AI dengan kontrol penuh dari tim Anda.
            </Paragraph>
          </Col>
        </Row>
      </SectionWrapper>

      {/* ── Fitur Utama ──────────────────────── */}
      <SectionWrapper padding="44px 24px 80px">
        <SectionLabel>FITUR UTAMA</SectionLabel>
        <Title
          level={2}
          style={{ margin: "10px 0 0", fontSize: 46, lineHeight: 1.18 }}
        >
          Powerful{" "}
          <span style={{ color: token.colorPrimary }}>Features One</span>
          <br />
          Smart Platform.
        </Title>

        <Row gutter={[20, 20]} style={{ marginTop: 28 }}>
          {FEATURE_CARDS.map((card) => (
            <Col xs={24} md={12} key={card.title} style={{ display: "flex" }}>
              <Card bordered={false} style={cardStyle} bodyStyle={cardBodyStyle}>
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <Space direction="vertical" size={6}>
                    <Title level={4} style={{ margin: 0, fontSize: 31 }}>
                      {card.title}
                    </Title>
                    <Paragraph
                      style={{ margin: 0, color: "#5E5E5E", lineHeight: 1.45 }}
                    >
                      {card.description}
                    </Paragraph>
                  </Space>

                  <Space direction="vertical" size={10} style={{ marginTop: 4 }}>
                    {card.points.map((point) => (
                      <CheckItem key={point} text={point} />
                    ))}
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </SectionWrapper>

      {/* ── Cara Kerja ───────────────────────── */}
      <SectionWrapper padding="64px 24px 80px" centered>
        <SectionLabel>CARA KERJA</SectionLabel>
        <Title
          level={2}
          style={{ margin: "8px 0 0", fontSize: 46, lineHeight: 1.2 }}
        >
          Mulai dalam{" "}
          <span style={{ color: token.colorPrimary }}>3 Langkah</span> Mudah
        </Title>

        <img
          src={caraKerjaImage}
          alt="Cara kerja Mitbiz"
          style={{ width: "100%", marginTop: 28 }}
        />
      </SectionWrapper>

      {/* ── Use Case ─────────────────────────── */}
      <SectionWrapper padding="36px 24px 92px">
        <Row gutter={[28, 20]} align="top">
          <Col xs={24} lg={8}>
            <SectionLabel>USE CASE</SectionLabel>
            <Title
              level={2}
              style={{ margin: "10px 0 0", fontSize: 52, lineHeight: 1.12 }}
            >
              <span style={{ color: token.colorPrimary }}>Satu</span> Platform.
            </Title>
          </Col>

          {USE_CASE_CARDS.map((card) => (
            <Col
              xs={24}
              md={12}
              lg={8}
              key={card.title}
              style={{ display: "flex" }}
            >
              <Card
                bordered={false}
                style={{ ...cardStyle, minHeight: 320, height: 320 }}
                bodyStyle={{ padding: "32px 24px" }}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <CircleIcon size={32}>
                    <img
                      src={logoImage}
                      alt="Mitbiz"
                      style={{ width: 16, height: 16 }}
                    />
                  </CircleIcon>

                  <Space direction="vertical" size={10}>
                    <Title level={5} style={{ margin: 0, fontSize: 24 }}>
                      {card.title}
                    </Title>
                    <Space direction="vertical" size={8}>
                      {card.points.map((point) => (
                        <CheckItem key={point} text={point} size={16} />
                      ))}
                    </Space>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </SectionWrapper>

      {/* ── Mengapa Mitbiz ───────────────────── */}
      <SectionWrapper padding="70px 24px 96px" centered>
        <SectionLabel>MENGAPA MITBIZ?</SectionLabel>
        <Title
          level={2}
          style={{ margin: "10px 0 0", fontSize: 52, lineHeight: 1.16 }}
        >
          <span style={{ color: token.colorPrimary }}>Platform AI</span> yang
          Dibangun
          <br />
          untuk Bisnis Nyata
        </Title>

        <Space
          direction="vertical"
          size={34}
          style={{ width: "100%", marginTop: 30 }}
        >
          {[WHY_MITBIZ_ITEMS.slice(0, 3), WHY_MITBIZ_ITEMS.slice(3)].map(
            (group, gi) => (
              <Row gutter={[20, 16]} justify="center" key={gi}>
                {group.map((item) => (
                  <Col xs={24} sm={12} lg={8} key={item}>
                    <div
                      style={{
                        background: "#DDE9F7",
                        borderRadius: 12,
                        minHeight: 58,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 16px 0 12px",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: token.colorPrimary,
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#1F1F1F",
                          lineHeight: 1.25,
                          textAlign: "left",
                        }}
                      >
                        {item}
                      </Text>
                    </div>
                  </Col>
                ))}
              </Row>
            ),
          )}
        </Space>
      </SectionWrapper>

      {/* ── Pricing ──────────────────────────── */}
      <SectionWrapper padding="78px 24px 110px" centered>
        <SectionLabel>PRICING</SectionLabel>
        <Title
          level={2}
          style={{ margin: "10px 0 0", fontSize: 58, lineHeight: 1.16 }}
        >
          <span style={{ color: token.colorPrimary }}>Harga Fleksibel</span>{" "}
          Sesuai
          <br />
          Skala Bisnis
        </Title>

        <Paragraph
          style={{
            margin: "24px auto 0",
            maxWidth: 760,
            fontSize: 20,
            lineHeight: 1.35,
            color: "#5E5E5E",
          }}
        >
          MITBIZ menyediakan paket harga yang dapat disesuaikan
          <br />
          dengan kebutuhan dan skala bisnis Anda.
        </Paragraph>

        <Space size={20} wrap style={{ marginTop: 52, justifyContent: "center" }}>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            style={{
              height: 74,
              minWidth: 280,
              borderRadius: 20,
              padding: "0 34px",
              fontSize: 18,
              fontWeight: 500,
              background:
                "linear-gradient(137deg, #0C73E0 15%, #2D8EF4 55%, #0C73E0 100%)",
              border: "none",
              boxShadow: "inset 0 -8px 20px rgba(255,255,255,0.35)",
            }}
          >
            Lihat Paket Harga
          </Button>

          <Button
            size="large"
            style={{
              height: 74,
              minWidth: 240,
              borderRadius: 20,
              borderColor: token.colorPrimary,
              color: "#1F1F1F",
              background: "#fff",
              fontSize: 18,
              fontWeight: 500,
              padding: "0 34px",
            }}
            icon={
              <CircleIcon size={30}>
                <MessageOutlined />
              </CircleIcon>
            }
          >
            Hubungi Sales
          </Button>
        </Space>
      </SectionWrapper>

      {/* ── Final CTA ────────────────────────── */}
      <div style={{ padding: "0 24px 84px", background: "#ffffff" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            borderRadius: 32,
            padding: "64px 24px 78px",
            textAlign: "center",
            background:
              "radial-gradient(69% 140% at 50% 50%, #2D8EF4 0%, #0C73E0 48%, #0A64C5 100%)",
          }}
        >
          <Title
            level={2}
            style={{
              margin: 0,
              fontSize: 56,
              lineHeight: 1.14,
              color: "#EAF1F9",
            }}
          >
            Siap Meningkatkan Layanan
            <br />
            Pelanggan dengan AI?
          </Title>

          <Paragraph
            style={{
              margin: "28px auto 0",
              maxWidth: 960,
              fontSize: 16,
              lineHeight: 1.35,
              color: "#EAF1F9",
            }}
          >
            Biarkan AI menangani percakapan rutin, sementara tim
            <br />
            Anda fokus pada pertumbuhan bisnis.
          </Paragraph>

          <Space size={20} wrap style={{ marginTop: 54, justifyContent: "center" }}>
            <Button
              size="large"
              style={{
                height: 62,
                minWidth: 290,
                borderRadius: 16,
                border: "none",
                background: "#EAF1F9",
                color: "#1F1F1F",
                fontSize: 16,
                fontWeight: 500,
                padding: "0 30px",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.16)",
              }}
              icon={
                <CircleIcon size={28}>
                  <CaretRightFilled />
                </CircleIcon>
              }
            >
              Request Demo Sekarang
            </Button>

            <Button
              size="large"
              style={{
                height: 62,
                minWidth: 260,
                borderRadius: 16,
                borderColor: "rgba(234, 241, 249, 0.75)",
                background: "transparent",
                color: "#EAF1F9",
                fontSize: 16,
                fontWeight: 500,
                padding: "0 30px",
              }}
              icon={
                <CircleIcon
                  size={28}
                  background="#EAF1F9"
                  color={token.colorPrimary}
                >
                  <MessageOutlined />
                </CircleIcon>
              }
            >
              Konsultasi Gratis
            </Button>
          </Space>
        </div>
      </div>
    </Content>
  );
};

export default HomePage;

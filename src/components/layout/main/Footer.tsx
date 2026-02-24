import { Layout, Row, Col, Space, Typography } from "antd";
import {
  FacebookFilled,
  LinkedinFilled,
  InstagramFilled,
} from "@ant-design/icons";
import logoImage from "@/assets/m_logo.png";
import { FOOTER_LINK_GROUPS, FOOTER_LEGAL_LINKS } from "@/features/home/data";

const { Footer: AntFooter } = Layout;
const { Text, Title } = Typography;

/* ──────────────────────────────────────────────
 * Shared styles
 * ────────────────────────────────────────────── */
const linkStyle: React.CSSProperties = { color: "#D7E9FB", fontSize: 14 };
const headingStyle: React.CSSProperties = {
  color: "#EAF1F9",
  marginBottom: 20,
  fontSize: 18,
};

const SOCIAL_LINKS = [
  { icon: <FacebookFilled />, label: "Facebook", href: "#" },
  { icon: <LinkedinFilled />, label: "LinkedIn", href: "#" },
  { icon: <InstagramFilled />, label: "Instagram", href: "#" },
] as const;

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */
const Footer = () => (
  <AntFooter
    style={{ background: "#0C73E0", color: "#fff", padding: "76px 24px 34px" }}
  >
    <div
      style={{
        maxWidth: 1500,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Top columns ── */}
      <Row gutter={[32, 32]}>
        {/* Brand */}
        <Col xs={24} md={9} lg={7}>
          <Space direction="vertical" size={18}>
            <Space align="center" size={10}>
              <img
                src={logoImage}
                alt="Mitbiz"
                style={{ width: 40, height: 40 }}
              />
              <Text
                style={{
                  color: "#EAF1F9",
                  fontWeight: 700,
                  fontSize: 40,
                  lineHeight: 1,
                }}
              >
                mitbiz
              </Text>
            </Space>
            <Text style={{ color: "#D7E9FB", fontSize: 15, lineHeight: 1.3 }}>
              AI Business
              <br />
              Communication Platform
            </Text>
          </Space>
        </Col>

        {/* Dynamic link groups */}
        {FOOTER_LINK_GROUPS.map((group) => (
          <Col xs={12} md={5} lg={4} key={group.title}>
            <Title level={5} style={headingStyle}>
              {group.title}
            </Title>
            <Space direction="vertical" size={12}>
              {group.links.map((link) => (
                <a key={link.href + link.label} href={link.href} style={linkStyle}>
                  {link.label}
                </a>
              ))}
            </Space>
          </Col>
        ))}

        {/* Socials */}
        <Col xs={12} md={8} lg={5}>
          <Title level={5} style={headingStyle}>
            Follow Our Socials:
          </Title>
          <Space size={20}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                style={{ color: "#EAF1F9", fontSize: 28 }}
              >
                {s.icon}
              </a>
            ))}
          </Space>
        </Col>
      </Row>

      {/* ── Watermark ── */}
      <div
        style={{
          marginTop: 58,
          textAlign: "center",
          lineHeight: 1,
          fontWeight: 500,
          fontSize: 220,
          letterSpacing: -6,
          color: "transparent",
          background:
            "linear-gradient(180deg, rgba(220,237,255,0.9) 0%, rgba(220,237,255,0.25) 74%, rgba(220,237,255,0) 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        AI Business
      </div>

      {/* ── Legal bar ── */}
      <div style={{ marginTop: 12 }}>
        <Row justify="space-between" align="middle" gutter={[16, 12]}>
          <Col xs={24} md="auto">
            <Text style={{ color: "#D7E9FB", fontSize: 14 }}>
              © {new Date().getFullYear()} Mitbiz. All rights reserved.
            </Text>
          </Col>
          <Col xs={24} md="auto">
            <Space size={28} wrap>
              {FOOTER_LEGAL_LINKS.map((link) => (
                <a key={link.href} href={link.href} style={linkStyle}>
                  {link.label}
                </a>
              ))}
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  </AntFooter>
);

export default Footer;

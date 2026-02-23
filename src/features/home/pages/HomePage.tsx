import {
  Typography,
  Button,
  Card,
  Row,
  Col,
  Space,
  Layout,
  theme,
} from "antd";
import {
  MessageOutlined,
  MailOutlined,
  UploadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import heroImage from "@/assets/hero.png";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;
const { useToken } = theme;

const HomePage = () => {
  const { token } = useToken();

  return (
    <Content style={{ background: "#fff" }}>
      {/* Hero */}
      <div
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "scroll",
          padding: "72px 24px 360px 24px",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Hero Title and Description - Center */}
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
                <svg
                  width="65"
                  height="58"
                  viewBox="0 0 65 58"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "0.95em", height: "0.85em" }}
                >
                  <path
                    d="M40.3815 11.7485C40.5738 11.2287 41.309 11.2287 41.5014 11.7485L45.4863 22.5177C46.6958 25.7862 49.2728 28.3633 52.5414 29.5727L63.3105 33.5577C63.8303 33.75 63.8303 34.4852 63.3105 34.6776L52.5414 38.6625C49.2728 39.872 46.6958 42.449 45.4863 45.7176L41.5014 56.4867C41.309 57.0066 40.5738 57.0066 40.3815 56.4867L36.3965 45.7176C35.1871 42.449 32.61 39.872 29.3415 38.6625L18.5723 34.6776C18.0525 34.4852 18.0525 33.75 18.5723 33.5577L29.3415 29.5727C32.61 28.3633 35.1871 25.7862 36.3965 22.5177L40.3815 11.7485Z"
                    fill="#0C73E0"
                  />
                  <path
                    d="M13.3271 0.864712C13.437 0.567678 13.8571 0.567679 13.967 0.864714L16.2442 7.01853C16.9353 8.88626 18.4079 10.3588 20.2756 11.05L26.4294 13.3271C26.7264 13.437 26.7264 13.8571 26.4294 13.967L20.2756 16.2442C18.4079 16.9353 16.9353 18.4079 16.2441 20.2756L13.967 26.4294C13.8571 26.7264 13.437 26.7264 13.3271 26.4294L11.05 20.2756C10.3588 18.4079 8.88626 16.9353 7.01853 16.2441L0.864712 13.967C0.567678 13.8571 0.567679 13.437 0.864714 13.3271L7.01853 11.05C8.88626 10.3588 10.3588 8.88626 11.05 7.01853L13.3271 0.864712Z"
                    fill="#0C73E0"
                  />
                </svg>
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
              <Button
                type="primary"
                size="large"
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.9702 2C6.45021 2 1.97021 6.48 1.97021 12C1.97021 17.52 6.45021 22 11.9702 22C17.4902 22 21.9702 17.52 21.9702 12C21.9702 6.48 17.5002 2 11.9702 2ZM14.9702 14.23L12.0702 15.9C11.7102 16.11 11.3102 16.21 10.9202 16.21C10.5202 16.21 10.1302 16.11 9.77022 15.9C9.05021 15.48 8.62021 14.74 8.62021 13.9V10.55C8.62021 9.72 9.05021 8.97 9.77022 8.55C10.4902 8.13 11.3502 8.13 12.0802 8.55L14.9802 10.22C15.7002 10.64 16.1302 11.38 16.1302 12.22C16.1302 13.06 15.7002 13.81 14.9702 14.23Z"
                      fill="#F2FBFF"
                    />
                  </svg>
                }
              >
                Request Demo
              </Button>
              <Button
                size="large"
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22C10.3822 22.0021 8.78829 21.6102 7.35601 20.858L3.06601 21.975C2.92266 22.0123 2.77205 22.0116 2.6291 21.9728C2.48615 21.934 2.35582 21.8585 2.25102 21.7538C2.14623 21.6491 2.07062 21.5188 2.03168 21.3759C1.99273 21.233 1.99181 21.0824 2.02901 20.939L3.14501 16.65C2.39085 15.2162 1.99782 13.6201 2.00001 12C2.00001 6.477 6.47701 2 12 2ZM13.252 13H8.75001L8.64801 13.007C8.4685 13.0317 8.304 13.1206 8.18492 13.2571C8.06584 13.3937 8.00024 13.5688 8.00024 13.75C8.00024 13.9312 8.06584 14.1063 8.18492 14.2429C8.304 14.3794 8.4685 14.4683 8.64801 14.493L8.75001 14.5H13.252L13.353 14.493C13.5325 14.4683 13.697 14.3794 13.8161 14.2429C13.9352 14.1063 14.0008 13.9312 14.0008 13.75C14.0008 13.5688 13.9352 13.3937 13.8161 13.2571C13.697 13.1206 13.5325 13.0317 13.353 13.007L13.252 13ZM15.25 9.5H8.75001L8.64801 9.507C8.4685 9.5317 8.304 9.62055 8.18492 9.75714C8.06584 9.89372 8.00024 10.0688 8.00024 10.25C8.00024 10.4312 8.06584 10.6063 8.18492 10.7429C8.304 10.8794 8.4685 10.9683 8.64801 10.993L8.75001 11H15.25L15.352 10.993C15.5315 10.9683 15.696 10.8794 15.8151 10.7429C15.9342 10.6063 15.9998 10.4312 15.9998 10.25C15.9998 10.0688 15.9342 9.89372 15.8151 9.75714C15.696 9.62055 15.5315 9.5317 15.352 9.507L15.25 9.5Z"
                      fill="#0C73E0"
                    />
                  </svg>
                }
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

      {/* Problem Section */}
      <div id="features" style={{ padding: "64px 24px 40px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row gutter={[40, 32]} align="middle">
            <Col xs={24} lg={12}>
              <Text
                style={{
                  color: token.colorPrimary,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                }}
              >
                PROBLEM SECTION
              </Text>
              <Title
                level={2}
                style={{ margin: "10px 0 14px", fontSize: 44, lineHeight: 1.18 }}
              >
                Komunikasi Pelanggan
                <br />
                Semakin <span style={{ color: token.colorPrimary }}>Kompleks</span>
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: "#5E5E5E" }}>
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
                  {[
                    { icon: <MessageOutlined />, text: "Chat WhatsApp dibalas manual satu per satu" },
                    { icon: <MailOutlined />, text: "Email customer sering terlambat ditangani" },
                    { icon: <UploadOutlined />, text: "Sulit mengelola komunikasi dalam skala besar" },
                    { icon: <CheckCircleOutlined />, text: "Pertanyaan berulang menghabiskan waktu CS" },
                    { icon: <MessageOutlined />, text: "Broadcast WhatsApp tidak terpersonalisasi" },
                  ].map((item, index) => (
                    <Space key={index} size={14} align="center" style={{ width: "100%" }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: token.colorPrimary,
                          color: "#fff",
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </span>
                      <Text style={{ color: "#5E5E5E", fontSize: 17, lineHeight: 1.5 }}>
                        {item.text}
                      </Text>
                    </Space>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Solusi Section */}
      <div id="solutions" style={{ padding: "32px 24px 52px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row gutter={[40, 24]} align="middle">
            <Col xs={24} lg={12}>
              <Text
                style={{
                  color: token.colorPrimary,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                }}
              >
                SOLUSI
              </Text>
              <Title
                level={2}
                style={{ margin: "10px 0 0", fontSize: 46, lineHeight: 1.18 }}
              >
                <span style={{ color: token.colorPrimary }}>Satu Platform</span> untuk
                Semua Percakapan Bisnis
              </Title>
            </Col>
            <Col xs={24} lg={12}>
              <Paragraph style={{ margin: 0, fontSize: 18, lineHeight: 1.75, color: "#5E5E5E" }}>
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
        </div>
      </div>

      {/* Fitur Utama Section */}
      <div style={{ padding: "44px 24px 80px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Text
            style={{
              color: token.colorPrimary,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            FITUR UTAMA
          </Text>
          <Title
            level={2}
            style={{ margin: "10px 0 0", fontSize: 46, lineHeight: 1.18 }}
          >
            Powerful <span style={{ color: token.colorPrimary }}>Features One</span>
            <br />
            Smart Platform.
          </Title>
        </div>
      </div>
    </Content>
  );
};

export default HomePage;

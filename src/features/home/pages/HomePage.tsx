import { Typography, Button, Card, Row, Col, Divider, Space, Avatar, Badge, Layout } from 'antd';
import { Link } from 'react-router-dom';
import {
	MessageOutlined,
	MailOutlined,
	UploadOutlined,
	CloudOutlined,
	ArrowRightOutlined,
	PlayCircleOutlined,
	CheckCircleOutlined,
	StarFilled,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const SectionHeader = ({ badge, title, description }: { badge: string; title: string; description: string }) => (
	<Space direction="vertical" size={8} align="center" style={{ width: '100%', marginBottom: 32 }}>
		<Badge color="blue" text={badge} />
		<Title level={2} style={{ textAlign: 'center', margin: 0 }}>{title}</Title>
		<Paragraph type="secondary" style={{ textAlign: 'center', fontSize: 16, maxWidth: 720 }}>{description}</Paragraph>
	</Space>
);

const HomePage = () => {
	const { isAuthenticated } = useAuth();

	return (
		<Content style={{ background: '#fff' }}>
			{/* Hero */}
			<div style={{ padding: '64px 24px', background: 'linear-gradient(to bottom right, #e6f7ff, #ffffff)' }}>
				<Row gutter={[48, 48]} align="middle" style={{ maxWidth: 1200, margin: '0 auto' }}>
					<Col xs={24} lg={12}>
						<Space direction="vertical" size={16} style={{ width: '100%' }}>
							<Badge color="blue" text="🚀 New: AI-powered message scheduling" />
							<Title style={{ margin: 0 }}>Automate WhatsApp & Gmail Broadcasts Effortlessly</Title>
							<Paragraph type="secondary" style={{ fontSize: 16 }}>
								Save time and reach more people — all from one smart dashboard. Connect your accounts and reach thousands instantly with smart automation tools.
							</Paragraph>
							<Space size="middle" wrap>
								{isAuthenticated ? (
									<Link to={ROUTES.USER_DASHBOARD}>
										<Button type="primary" size="large" icon={<ArrowRightOutlined />}>Go to Dashboard</Button>
									</Link>
								) : (
									<Link to={ROUTES.REGISTER}>
										<Button type="primary" size="large" icon={<ArrowRightOutlined />}>Start Free Trial</Button>
									</Link>
								)}
								<Button size="large" icon={<PlayCircleOutlined />}>Watch Demo</Button>
							</Space>
							<Space size={32}>
								<Space direction="vertical" size={4}>
									<Space>
										{Array.from({ length: 5 }).map((_, i) => (
											<StarFilled key={i} style={{ color: '#fadb14' }} />
										))}
									</Space>
									<Text type="secondary">4.9/5 from 2,000+ reviews</Text>
								</Space>
								<Divider type="vertical" style={{ height: 48 }} />
								<Space direction="vertical" size={0}>
									<Text strong style={{ fontSize: 18 }}>10M+</Text>
									<Text type="secondary">Messages sent</Text>
								</Space>
							</Space>
						</Space>
					</Col>
					<Col xs={24} lg={12}>
						<Card
							style={{ borderRadius: 16, boxShadow: '0 20px 60px rgba(24,144,255,0.15)' }}
							cover={
								<div style={{ padding: 48, textAlign: 'center', background: 'linear-gradient(135deg, #1890ff, #096dd9)', borderRadius: 16 }}>
									<MessageOutlined style={{ fontSize: 80, color: 'white', opacity: 0.9 }} />
									<Paragraph style={{ color: 'white', marginTop: 16 }}>Dashboard Preview</Paragraph>
								</div>
							}
						/>
					</Col>
				</Row>
			</div>

			{/* Features */}
			<div id="features" style={{ padding: '64px 24px', background: '#fff' }}>
				<div style={{ maxWidth: 1200, margin: '0 auto' }}>
					<SectionHeader
						badge="Features"
						title="Everything you need to automate your messaging"
						description="Powerful features designed to help you reach your audience efficiently and effectively."
					/>
					<Row gutter={[24, 24]}>
						{[
							{ icon: <MessageOutlined />, title: 'WhatsApp Automation', desc: 'Send personalized broadcast messages with smart delay control and group member extraction.' },
							{ icon: <MailOutlined />, title: 'Gmail Broadcast', desc: 'Bulk send emails with custom subjects, body templates, and attachment support.' },
							{ icon: <UploadOutlined />, title: 'Contact Management', desc: 'Easily import and validate WhatsApp numbers or email lists from CSV files.' },
							{ icon: <CloudOutlined />, title: 'Cloud-Based Platform', desc: 'Accessible anywhere with secure cloud storage and real-time synchronization.' },
						].map((f, i) => (
							<Col xs={24} md={12} lg={6} key={i}>
								<Card hoverable>
									<Space direction="vertical" size={12} style={{ width: '100%', textAlign: 'center' }}>
										<div style={{ fontSize: 28, color: '#1890ff' }}>{f.icon}</div>
										<Title level={4} style={{ margin: 0 }}>{f.title}</Title>
										<Paragraph type="secondary" style={{ margin: 0 }}>{f.desc}</Paragraph>
									</Space>
								</Card>
							</Col>
						))}
					</Row>
				</div>
			</div>

			{/* How it works */}
			<div id="how-it-works" style={{ padding: '64px 24px', background: 'linear-gradient(to bottom right, #e6f7ff, #ffffff)' }}>
				<div style={{ maxWidth: 1200, margin: '0 auto' }}>
					<SectionHeader
						badge="How It Works"
						title="Get started in 3 simple steps"
						description="Launch your first broadcast campaign in minutes, not hours."
					/>
					<Row gutter={[24, 24]}>
						{[
							{ icon: <MessageOutlined />, title: 'Connect WhatsApp or Gmail', desc: 'Link your accounts securely with our simple integration process.' },
							{ icon: <UploadOutlined />, title: 'Upload Your Contact List', desc: 'Import contacts from CSV files or extract from WhatsApp groups.' },
							{ icon: <CheckCircleOutlined />, title: 'Send and Track Broadcasts', desc: 'Launch campaigns and monitor delivery status in real-time.' },
						].map((s, i) => (
							<Col xs={24} md={8} key={i}>
								<Card>
									<Space direction="vertical" size={12} style={{ width: '100%', textAlign: 'center' }}>
										<div style={{ fontSize: 36, color: '#1890ff' }}>{s.icon}</div>
										<Title level={4} style={{ margin: 0 }}>{s.title}</Title>
										<Paragraph type="secondary" style={{ margin: 0 }}>{s.desc}</Paragraph>
									</Space>
								</Card>
							</Col>
						))}
					</Row>
				</div>
			</div>

			{/* Pricing */}
			<div id="pricing" style={{ padding: '64px 24px', background: '#fff' }}>
				<div style={{ maxWidth: 1100, margin: '0 auto' }}>
					<SectionHeader
						badge="Pricing"
						title="Choose the perfect plan for your needs"
						description="Start free, upgrade as you grow. No hidden fees."
					/>
					<Row gutter={[24, 24]}>
						{[
							{
								name: 'Free Trial', price: '$0', period: '/ 14 days', desc: 'Perfect for testing the platform', cta: 'Start Free Trial', popular: false,
								features: ['Up to 100 messages/day', 'Basic analytics', 'Email support', '1 connected account'],
							},
							{
								name: 'Pro', price: '$49', period: '/ per month', desc: 'For growing businesses', cta: 'Get Started', popular: true,
								features: ['Unlimited messages', 'Advanced analytics', 'Priority support', 'Unlimited accounts', 'Custom templates', 'API access'],
							},
							{
								name: 'Enterprise', price: 'Custom', period: '/ contact us', desc: 'For large organizations', cta: 'Contact Sales', popular: false,
								features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee', 'Team collaboration', 'White-label option'],
							},
						].map((plan, i) => (
							<Col xs={24} md={8} key={i}>
								<Card hoverable style={plan.popular ? { borderColor: '#1890ff', boxShadow: '0 4px 12px rgba(24,144,255,0.15)' } : {}}>
									<Space direction="vertical" size={16} style={{ width: '100%' }}>
										<div>
											<Title level={3} style={{ marginBottom: 4 }}>{plan.name}</Title>
											<Space align="baseline">
												<Text strong style={{ fontSize: 28 }}>{plan.price}</Text>
												<Text type="secondary">{plan.period}</Text>
											</Space>
											<Paragraph type="secondary" style={{ marginTop: 8 }}>{plan.desc}</Paragraph>
										</div>
										<Link to={ROUTES.REGISTER}>
											<Button type={plan.popular ? 'primary' : 'default'} block size="large">{plan.cta}</Button>
										</Link>
										<Divider style={{ margin: '8px 0' }} />
										<Space direction="vertical" size={8}>
											{plan.features.map((f: string, idx: number) => (
												<Space key={idx}>
													<CheckCircleOutlined style={{ color: '#52c41a' }} />
													<Text>{f}</Text>
												</Space>
											))}
										</Space>
									</Space>
								</Card>
							</Col>
						))}
					</Row>
				</div>
			</div>

			{/* Testimonials */}
			<div id="testimonials" style={{ padding: '64px 24px', background: 'linear-gradient(to bottom right, #e6f7ff, #ffffff)' }}>
				<div style={{ maxWidth: 1200, margin: '0 auto' }}>
					<SectionHeader
						badge="Testimonials"
						title="Loved by teams worldwide"
						description="See what our customers have to say about their experience with Blastify."
					/>
					<Row gutter={[24, 24]}>
						{[
							{
								quote: 'Blastify transformed our outreach campaigns. We reached 10,000+ customers in minutes with WhatsApp automation.',
								author: 'Sarah Johnson', role: 'Marketing Director, TechCorp Inc.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
							},
							{
								quote: "The best broadcasting platform we've used. Simple, powerful, and saves us hours every week.",
								author: 'Michael Chen', role: 'CEO, StartupHub', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
							},
							{
								quote: 'Game-changer for our sales team. We increased our response rates by 300% using personalized broadcasts.',
								author: 'Emily Rodriguez', role: 'Sales Manager, Global Solutions', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
							},
						].map((t, i) => (
							<Col xs={24} md={8} key={i}>
								<Card>
									<Space direction="vertical" size={12} style={{ width: '100%' }}>
										<Space>
											{Array.from({ length: 5 }).map((_, s) => (
												<StarFilled key={s} style={{ color: '#fadb14' }} />
											))}
										</Space>
										<Paragraph italic style={{ fontSize: 16 }}>
											“{t.quote}”
										</Paragraph>
										<Divider style={{ margin: 8 }} />
										<Space>
											<Avatar size={48} src={t.avatar} />
											<Space direction="vertical" size={0}>
												<Text strong>{t.author}</Text>
												<Text type="secondary" style={{ fontSize: 12 }}>{t.role}</Text>
											</Space>
										</Space>
									</Space>
								</Card>
							</Col>
						))}
					</Row>
				</div>
			</div>

			{/* CTA */}
			<div style={{ padding: '64px 24px', background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }}>
				<Space direction="vertical" size={8} align="center" style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
					<Title level={2} style={{ color: 'white', textAlign: 'center', margin: 0 }}>Ready to automate your messages?</Title>
					<Paragraph style={{ color: '#e6f7ff', textAlign: 'center' }}>
						Join thousands of businesses already using Blastify to streamline their communication.
					</Paragraph>
					<Link to={ROUTES.REGISTER}>
						<Button size="large" style={{ background: 'white', color: '#1890ff' }} icon={<ArrowRightOutlined />}>Start Free Trial</Button>
					</Link>
					<Text style={{ color: '#e6f7ff' }}>No credit card required • 14-day free trial • Cancel anytime</Text>
				</Space>
			</div>
		</Content>
	);
};

export default HomePage;

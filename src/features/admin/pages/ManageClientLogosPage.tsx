import { useState, useEffect } from 'react';
import {
    Typography,
    Card,
    Row,
    Col,
    Button,
    Upload,
    message,
    Popconfirm,
    Image,
    Empty,
    Spin,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { adminApi } from '../services/adminApi';
import type { ClientLogo } from '../types/admin';

const { Title } = Typography;

const API_URL = import.meta.env.VITE_API_URL || 'https://www.api-mitbiz.ybbal.dev';

const ManageClientLogosPage = () => {
    const [logos, setLogos] = useState<ClientLogo[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchLogos = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getClientLogos();
            setLogos(data);
        } catch (error) {
            message.error('Gagal memuat data logo');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogos();
    }, []);

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            await adminApi.createClientLogo(file);
            message.success('Logo berhasil diupload');
            fetchLogos();
        } catch (error) {
            message.error('Gagal upload logo');
        } finally {
            setUploading(false);
        }
        return false; // prevent default upload
    };

    const handleReplace = async (id: string, file: File) => {
        try {
            await adminApi.updateClientLogo(id, file);
            message.success('Logo berhasil diupdate');
            fetchLogos();
        } catch (error) {
            message.error('Gagal update logo');
        }
        return false;
    };

    const handleDelete = async (id: string) => {
        try {
            await adminApi.deleteClientLogo(id);
            message.success('Logo berhasil dihapus');
            fetchLogos();
        } catch (error) {
            message.error('Gagal menghapus logo');
        }
    };

    const getLogoUrl = (imageUrl: string) => {
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${API_URL}${imageUrl}`;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Manajemen Client Logo</Title>
                <Upload
                    showUploadList={false}
                    accept="image/*"
                    beforeUpload={(file) => {
                        handleUpload(file);
                        return false;
                    }}
                >
                    <Button type="primary" icon={<PlusOutlined />} loading={uploading}>
                        Tambah Logo
                    </Button>
                </Upload>
            </div>

            {logos.length === 0 ? (
                <Empty description="Belum ada logo" />
            ) : (
                <Row gutter={[16, 16]}>
                    {logos.map((logo) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={logo.id}>
                            <Card
                                hoverable
                                cover={
                                    <div
                                        style={{
                                            height: 160,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 16,
                                            background: '#fafafa',
                                        }}
                                    >
                                        <Image
                                            src={getLogoUrl(logo.imageUrl)}
                                            alt="Client Logo"
                                            style={{ maxHeight: 128, objectFit: 'contain' }}
                                            preview
                                        />
                                    </div>
                                }
                                actions={[
                                    <Upload
                                        key="replace"
                                        showUploadList={false}
                                        accept="image/*"
                                        beforeUpload={(file) => {
                                            handleReplace(logo.id, file);
                                            return false;
                                        }}
                                    >
                                        <Button type="link" icon={<UploadOutlined />} size="small">
                                            Ganti
                                        </Button>
                                    </Upload>,
                                    <Popconfirm
                                        key="delete"
                                        title="Hapus logo ini?"
                                        onConfirm={() => handleDelete(logo.id)}
                                        okText="Ya"
                                        cancelText="Batal"
                                    >
                                        <Button type="link" danger icon={<DeleteOutlined />} size="small">
                                            Hapus
                                        </Button>
                                    </Popconfirm>,
                                ]}
                            >
                                <Card.Meta
                                    description={`Ditambahkan: ${new Date(logo.createdAt).toLocaleDateString('id-ID')}`}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default ManageClientLogosPage;

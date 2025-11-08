import { useState, useEffect, useRef } from 'react';
import { Input, Tag, Space, Button, Card, Typography, Divider } from 'antd';
import { ContactsOutlined, DeleteOutlined, PlusOutlined, MailOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface EmailInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onSelectFromContacts?: () => void;
  allowClear?: boolean;
}

const EmailInput = ({
  value = [],
  onChange,
  placeholder = 'Masukkan alamat email',
  disabled = false,
  onSelectFromContacts,
  allowClear = true,
}: EmailInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [emails, setEmails] = useState<string[]>(value || []);
  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    setEmails(value || []);
  }, [value]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = (email: string) => {
    const trimmed = email.trim();
    if (trimmed && !emails.includes(trimmed)) {
      if (isValidEmail(trimmed)) {
        const newEmails = [...emails, trimmed];
        setEmails(newEmails);
        onChange?.(newEmails);
        return true;
      }
    }
    return false;
  };

  const removeEmail = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
    onChange?.(newEmails);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const lines = inputValue.split('\n');
      let added = false;
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed) {
          if (addEmail(trimmed)) {
            added = true;
          }
        }
      });
      if (added) {
        setInputValue('');
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedEmails = pastedText
      .split(/[\n,\s\t]+/)
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0);
    
    if (pastedEmails.length > 0) {
      const addedEmails: string[] = [];
      
      pastedEmails.forEach((email: string) => {
        if (email && !emails.includes(email)) {
          if (addEmail(email)) {
            addedEmails.push(email);
          }
        }
      });
      
      setInputValue('');
    }
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      const lines = inputValue.split('\n');
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed) {
          addEmail(trimmed);
        }
      });
      setInputValue('');
      textAreaRef.current?.focus();
    }
  };

  const handleClearAll = () => {
    setEmails([]);
    onChange?.([]);
    setInputValue('');
  };

  return (
    <div>
      {/* Emails Display */}
      {emails.length > 0 && (
        <Card
          size="small"
          style={{
            marginBottom: 12,
            background: '#fafafa',
            border: '1px solid #e8e8e8',
          }}
          bodyStyle={{ padding: '12px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Space>
              <MailOutlined style={{ color: '#1890ff' }} />
              <Text strong style={{ fontSize: 13 }}>
                {emails.length} Email Dipilih
              </Text>
            </Space>
            {allowClear && !disabled && (
              <Button
                type="link"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleClearAll}
                style={{ padding: 0, height: 'auto', fontSize: 12 }}
              >
                Hapus Semua
              </Button>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              maxHeight: '120px',
              overflowY: 'auto',
              padding: '4px',
            }}
          >
            {emails.map((email, index) => (
              <Tag
                key={`${email}-${index}`}
                closable={!disabled}
                onClose={() => removeEmail(index)}
                style={{
                  margin: 0,
                  padding: '4px 12px',
                  height: '32px',
                  lineHeight: '24px',
                  fontSize: '13px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#fff',
                  border: '1px solid #d9d9d9',
                }}
              >
                <code style={{ fontSize: '13px', fontFamily: 'monospace', color: '#1890ff' }}>
                  {email}
                </code>
              </Tag>
            ))}
          </div>
        </Card>
      )}

      {/* Input Area */}
      <Card
        size="small"
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          background: disabled ? '#f5f5f5' : '#fff',
        }}
        bodyStyle={{ padding: '12px' }}
      >
        <TextArea
          ref={textAreaRef}
          value={inputValue}
          onChange={handleTextAreaChange}
          onKeyDown={handleTextAreaKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          style={{
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            resize: 'none',
            fontSize: '14px',
          }}
          autoSize={{ minRows: 4, maxRows: 6 }}
        />
        
        <Divider style={{ margin: '12px 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tekan Enter untuk menambah email. Bisa paste beberapa email sekaligus.
          </Text>
          <Space>
            {inputValue.trim() && !disabled && (
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAddClick}
              >
                Tambah
              </Button>
            )}
            {onSelectFromContacts && (
              <Button
                type="default"
                size="small"
                icon={<ContactsOutlined />}
                onClick={onSelectFromContacts}
                disabled={disabled}
              >
                Pilih dari Contacts
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default EmailInput;


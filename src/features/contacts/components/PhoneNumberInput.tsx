import { useState, useEffect, useRef } from 'react';
import { Input, Tag, Space, Button, Card, Typography, Divider } from 'antd';
import { ContactsOutlined, DeleteOutlined, PlusOutlined, PhoneOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface PhoneNumberInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onSelectFromContacts?: () => void;
  allowClear?: boolean;
}

const PhoneNumberInput = ({
  value = [],
  onChange,
  placeholder = 'Masukkan nomor telepon',
  disabled = false,
  onSelectFromContacts,
  allowClear = true,
}: PhoneNumberInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [phones, setPhones] = useState<string[]>(value || []);
  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    setPhones(value || []);
  }, [value]);

  const addPhoneNumber = (phone: string) => {
    const trimmed = phone.trim();
    if (trimmed && !phones.includes(trimmed)) {
      const newPhones = [...phones, trimmed];
      setPhones(newPhones);
      onChange?.(newPhones);
      return true;
    }
    return false;
  };

  const removePhoneNumber = (index: number) => {
    const newPhones = phones.filter((_, i) => i !== index);
    setPhones(newPhones);
    onChange?.(newPhones);
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
          if (addPhoneNumber(trimmed)) {
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
    const pastedPhones = pastedText
      .split(/[\n,\s\t]+/)
      .map((phone: string) => phone.trim())
      .filter((phone: string) => phone.length > 0);
    
    if (pastedPhones.length > 0) {
      const addedPhones: string[] = [];
      
      pastedPhones.forEach((phone: string) => {
        if (phone && !phones.includes(phone)) {
          if (addPhoneNumber(phone)) {
            addedPhones.push(phone);
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
          addPhoneNumber(trimmed);
        }
      });
      setInputValue('');
      textAreaRef.current?.focus();
    }
  };

  const handleClearAll = () => {
    setPhones([]);
    onChange?.([]);
    setInputValue('');
  };

  return (
    <div>
      {/* Phone Numbers Display */}
      {phones.length > 0 && (
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
              <PhoneOutlined style={{ color: '#0c73e0' }} />
              <Text strong style={{ fontSize: 13 }}>
                {phones.length} Nomor Dipilih
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
            {phones.map((phone, index) => (
              <Tag
                key={`${phone}-${index}`}
                closable={!disabled}
                onClose={() => removePhoneNumber(index)}
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
                <code style={{ fontSize: '13px', fontFamily: 'monospace', color: '#0c73e0' }}>
                  {phone}
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
            Tekan Enter untuk menambah nomor. Bisa paste beberapa nomor sekaligus.
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

export default PhoneNumberInput;

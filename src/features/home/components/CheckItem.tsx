import { Space, Typography, theme } from "antd";
import { CheckOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { useToken } = theme;

interface CheckItemProps {
  text: string;
  /** Circle diameter in px – defaults to 18 */
  size?: number;
  /** Font size of the text – defaults to 14 */
  fontSize?: number;
  /** Text color – defaults to #1F1F1F */
  color?: string;
}

const CheckItem: React.FC<CheckItemProps> = ({
  text,
  size = 18,
  fontSize = 14,
  color = "#1F1F1F",
}) => {
  const { token } = useToken();

  return (
    <Space size={size > 16 ? 10 : 8} align="center">
      <span
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: token.colorPrimary,
          color: "#fff",
          fontSize: Math.round(size * 0.55),
          flexShrink: 0,
        }}
      >
        <CheckOutlined />
      </span>
      <Text style={{ fontSize, color, lineHeight: 1.3 }}>{text}</Text>
    </Space>
  );
};

export default CheckItem;

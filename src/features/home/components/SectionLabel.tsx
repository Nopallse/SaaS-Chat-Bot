import { Typography, theme } from "antd";
import type { CSSProperties } from "react";

const { Text } = Typography;
const { useToken } = theme;

interface SectionLabelProps {
  children: React.ReactNode;
  style?: CSSProperties;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ children, style }) => {
  const { token } = useToken();

  return (
    <Text
      style={{
        color: token.colorPrimary,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        ...style,
      }}
    >
      {children}
    </Text>
  );
};

export default SectionLabel;

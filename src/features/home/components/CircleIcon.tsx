import type { CSSProperties, ReactNode } from "react";
import { theme } from "antd";

const { useToken } = theme;

interface CircleIconProps {
  children: ReactNode;
  /** Diameter in px – defaults to 24 */
  size?: number;
  /** Background colour – defaults to theme primary */
  background?: string;
  /** Icon / content colour – defaults to #fff */
  color?: string;
  /** Extra style overrides */
  style?: CSSProperties;
}

const CircleIcon: React.FC<CircleIconProps> = ({
  children,
  size = 24,
  background,
  color = "#fff",
  style,
}) => {
  const { token } = useToken();

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: background ?? token.colorPrimary,
        color,
        fontSize: Math.round(size * 0.5),
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default CircleIcon;

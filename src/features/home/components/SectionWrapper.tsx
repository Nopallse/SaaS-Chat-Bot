import type { CSSProperties, ReactNode } from "react";

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  /** Extra padding override – defaults to "64px 24px 80px" */
  padding?: string;
  /** Background colour – defaults to #fff */
  background?: string;
  /** Max-width of the centered container – defaults to 1200 */
  maxWidth?: number;
  /** Centers text inside the container */
  centered?: boolean;
  /** Extra style on the outer wrapper */
  style?: CSSProperties;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  children,
  padding = "64px 24px 80px",
  background = "#fff",
  maxWidth = 1200,
  centered = false,
  style,
}) => (
  <div id={id} style={{ padding, background, ...style }}>
    <div
      style={{
        maxWidth,
        margin: "0 auto",
        ...(centered ? { textAlign: "center" as const } : {}),
      }}
    >
      {children}
    </div>
  </div>
);

export default SectionWrapper;

export function RumiosLogo({ size = 24, inverted = false }: { size?: number; inverted?: boolean }) {
  const bg = inverted ? "white" : "#18181b";
  const fg = inverted ? "#18181b" : "white";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill={bg} />
      <polygon points="10,8 10,16 17,12" fill={fg} />
    </svg>
  );
}

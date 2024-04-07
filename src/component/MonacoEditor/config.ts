export const fontSizeMap = {
  Small: 10,
  Normal: 12,
  Large: 14,
};
export function getFontSize(fontSizeType: string) {
  return fontSizeMap[fontSizeType] || 12;
}

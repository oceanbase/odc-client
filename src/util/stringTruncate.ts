/**
 * 字符串长度检查和裁剪函数
 * @param maxLength 允许的最大长度
 * @param text 要检查的字符串
 * @returns 处理后的字符串
 */
export function truncateString(maxLength: number, text: string): string {
  // 如果字符串为空或null/undefined，直接返回
  if (!text) {
    return '';
  }

  // 如果字符串长度小于等于最大长度，直接返回原字符串
  if (text.length <= maxLength) {
    return text;
  }

  // 如果最大长度小于等于3，无法添加省略号，直接裁剪
  if (maxLength <= 3) {
    return text.substring(0, maxLength);
  }

  // 裁剪字符串，保留前(maxLength-3)个字符，后三位替换为"..."
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * 字符串长度检查和裁剪函数（带类型检查）
 * @param maxLength 允许的最大长度
 * @param text 要检查的字符串
 * @returns 处理后的字符串
 */
export function safeTruncateString(maxLength: number, text: string | null | undefined): string {
  // 处理null/undefined情况
  if (text === null || text === undefined) {
    return '';
  }

  return truncateString(maxLength, text);
}

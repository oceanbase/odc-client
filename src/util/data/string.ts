export const invalidRegexpStr = /[°"§%()\[\]{}=\\?´`'#<>|,;.:+_-]/g;

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

export function encodeObjName(str: string) {
  return encodeURIComponent(str);
}

/**
 *  遵循 RFC 3986 标准
 */
export function fixedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

export function encodeRegexpStr(value: string) {
  return value.replace(invalidRegexpStr, '\\$&');
}

export function convertRegexpStr(value: string) {
  return value.replace(invalidRegexpStr, '');
}

/**
 * TIMESTAMP(10) WITH LOCAL TIME ZONE => TIMESTAMP_WITH_LOCAL_TIME_ZONE
 */
export function convertColumnType(columnType: string) {
  return columnType
    ?.replace(/\(\d+\)/g, '')
    .replace(/\s/g, '_')
    .toUpperCase();
}

export const stringSeparatorToCRLF = (separator: string) => {
  return separator?.replace(/\\r/g, '\r')?.replace(/\\n/g, '\n');
};

export const CRLFToSeparatorString = (separator: string) => {
  return separator?.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
};

export const valueFilter = (value: string) => {
  return value.replace(/[\n\r\v\t\f\s]/g, '');
};

export const maskAPIKey = (apiKey: string) => {
  if (apiKey.length <= 3) {
    return apiKey; // 如果长度小于等于3，直接返回原字符串
  }

  const firstPart = apiKey.slice(0, 2); // 取前两位
  const lastPart = apiKey.slice(-1); // 取最后一位
  const maskedPart = '*'.repeat(apiKey.length - 3); // 生成遮盖部分

  return `${firstPart}${maskedPart}${lastPart}`; // 拼接结果
};

export function getLanguageFromResourceType(type?: string): string {
  if (!type) return 'text';

  const lowerType = type.toLowerCase();
  if (lowerType.includes('java') || lowerType.includes('jar')) {
    return 'java';
  } else if (lowerType.includes('python') || lowerType.includes('py')) {
    return 'python';
  } else if (lowerType.includes('javascript') || lowerType.includes('js')) {
    return 'javascript';
  } else if (lowerType.includes('sql')) {
    return 'sql';
  } else if (lowerType.includes('xml')) {
    return 'xml';
  } else if (lowerType.includes('json')) {
    return 'json';
  }
  return 'text';
}

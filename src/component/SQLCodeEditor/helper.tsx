import { ConnectionMode, ConnectType } from '@/d.ts';
import { getDialectTypeFromConnectType } from '@/util/connection';

export function getLanguageFromConnectType(type: ConnectType) {
  const dialectType = getDialectTypeFromConnectType(type);
  switch (dialectType) {
    case ConnectionMode.OB_MYSQL: {
      return 'obmysql';
    }
    case ConnectionMode.OB_ORACLE: {
      return 'oboracle';
    }
    default: {
      return 'sql';
    }
  }
}

export function getFontFamily() {
  const DEFAULT_WINDOWS_FONT_FAMILY =
    "Consolas, 'Courier New', monospace, Microsoft YaHei, RareWord";
  const DEFAULT_MAC_FONT_FAMILY =
    "Menlo, Monaco, 'Courier New', monospace, Hiragino Sans GB, RareWord";
  const platform = navigator.platform;
  return platform?.indexOf('Mac') > -1 ? DEFAULT_MAC_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY;
}

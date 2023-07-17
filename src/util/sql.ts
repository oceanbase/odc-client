import { PLType } from '@/constant/plType';
import { ConnectionMode, IFormatPLSchema, IPLParam } from '@/d.ts';
import moment from 'moment';
import { Oracle } from './dataType';

/**
 * 把一段输入多行注释掉，并且在首行添加comment信息。
 * @param text 预处理的内容
 * @param userMsg 用户信息
 */
export function addComment(text = '', userMsg = '') {
  let isEndWithReline = false;
  if (text.endsWith('\n')) {
    text = text.substring(0, text.length - 1);
    isEndWithReline = true;
  }
  if (!text) {
    return '';
  }
  let lines = text.split('\n');
  const timeStr = moment(new Date()).format('YYYY/MM/DD');
  lines = lines.map((line: string) => {
    return `* ${line}`;
  });
  lines.unshift(`/* comment added by ${userMsg} ${timeStr}`);
  lines.push('*/');
  if (isEndWithReline) {
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * 获取 PL 脚本模板
 * @param userMsg 用户信息
 */
export function getPLScriptTemplate() {
  return `DECLARE
  -- Local variables here
  i NUMBER;
BEGIN
  -- Test statements here
  dbms_output.put_line('Hello World!');
END;`;
}

export function getPLDebugExecuteSql(plSchema: IFormatPLSchema) {
  const { plType, function: plfunction, procedure, packageName } = plSchema;
  const isFunction = PLType.FUNCTION === plType;
  const params = isFunction ? plfunction?.params : procedure?.params;
  const paramString = getParamString(params);
  const namePrefix = packageName ? `"${packageName}".` : '';
  const callExpr = `${namePrefix}"${
    isFunction ? plfunction?.funName : procedure?.proName
  }"(${paramString})`;
  const result = `  result ${getDataType(plfunction?.returnType)};`;
  return [
    'DECLARE',
    `${getParamDeclares(params)?.join('\n')}`,
    isFunction && result,
    'BEGIN',
    isFunction ? `  result := ${callExpr};` : `  ${callExpr};`,
    getParamEndExpr(params),
    'END;',
  ]
    .filter(Boolean)
    .join('\n');
}

export function getParamString(params: IPLParam[]) {
  return params?.map(({ paramName }) => `${paramName} => ${paramName}`)?.join(', ');
}

export function getDataType(type: string) {
  switch (type?.toUpperCase()) {
    case 'NCHAR':
    case 'NVARCHAR2':
    case 'VARCHAR2': {
      return `${type}(32767)`;
    }
    case 'VARCHAR': {
      return `${type}(4000)`;
    }
    default: {
      return type;
    }
  }
}

export function getParamDeclares(params: IPLParam[]) {
  return params?.map(({ dataType, paramName, defaultValue, paramMode }) => {
    if (!paramMode?.includes('IN')) {
      return `  ${paramName} ${getDataType(dataType)};`;
    }
    if (
      Oracle.string?.find((item) => {
        const typeName = typeof item === 'string' ? item : item[0];
        return typeName === dataType?.toUpperCase();
      })
    ) {
      /**
       * defaultValue 字符串形式需要包裹一层
       */
      defaultValue = defaultValue ? `'${defaultValue}'` : defaultValue;
    }
    return `  ${paramName} ${getDataType(dataType)} := ${defaultValue};`;
  });
}

export function getParamEndExpr(params: IPLParam[]) {
  return params
    ?.map(({ paramName, paramMode }) => {
      if (!paramMode?.includes('OUT')) {
        return null;
      }
      return `  ${paramName} := ${paramName};`;
    })
    .filter(Boolean)
    .join('\n');
}

export function removeComment(text = '') {
  /**
   * 最后一个是换行符的话需要特殊处理一下
   */
  let isEndWithReline = false;
  if (text.endsWith('\n')) {
    text = text.substring(0, text.length - 1);
    isEndWithReline = true;
  }
  if (!text || !text.startsWith('/*') || !text.endsWith('*/')) {
    return text;
  }
  let lines = text.split('\n');
  lines = lines.map((line, index) => {
    const isFirstLine = index === 0;
    const isEndLine = index == lines.length - 1;
    if (isFirstLine) {
      if (/^\/\*\s*comment\s+added\s+by/.test(line)) {
        /**
         * 这里是我们生成的注释，需要取出
         */
        return null;
      }
      line = line.substring(2);
    }
    if (isEndLine) {
      /**
       * 最后一行，需要判断去除我们push进去的注释尾巴
       */
      const trimLine = line.trim();
      if (trimLine == '*/') {
        /**
         * 只有注释尾巴的话，直接整行都删了
         */
        return null;
      }
      return line.substr(0, line.length - 2);
    }
    /**
     * 中间行处理
     */
    if (!isFirstLine && !isEndLine && line.startsWith('*')) {
      return line.replace(/^\*\s?/, '');
    }
    return line;
  });
  if (isEndWithReline) {
    lines.push('');
  }
  return lines.filter((v) => v != null).join('\n');
}
/**
 * 去除表名的引号，oracle中，表名可以用引号包裹来输入含大小写的字符，显示的时候我们需要去掉
 */
export function removeTableQuote(tableName: string) {
  if (!tableName || !tableName.trim()) {
    return '';
  }
  const tbReg = /^\"([^"]+)\"$/.exec(tableName) || /^\`([^"]+)\`$/.exec(tableName);
  return tbReg ? tbReg[1] : tableName;
}

/**
 * 获取数据库中真实存储的名字，比如 aBc = ABC, "aBc" = aBc。
 * @param name string
 */
export function getRealNameInDatabase(
  name: string,
  /**
   * 忽略大小写， aBc=>ABC
   */
  ignoreCase: boolean = false,
  /**
   * 忽略引号，“aBc” => ABC
   */
  ignoreQoute: boolean = false,
) {
  if (!name || !name.trim?.()) {
    return '';
  }
  const nameReg = /(\"([^"]+)\"|\`([^`]+)\`)$/.exec(name);
  if (nameReg) {
    const n = nameReg[2] || nameReg[3];
    return ignoreQoute && ignoreCase ? n.toUpperCase() : n;
  }
  return ignoreCase ? name.toUpperCase() : name;
}
/**
 * 生成查询SQL
 */
export function generateSelectSql(addRowId: boolean, isOracle: boolean, tableName: string) {
  let column = '*';
  let table = tableName;
  if (!isOracle) {
    // MySQL 用反引号包裹表名，避免用户使用关键词做表名
    // Oracle @see aone/issue/25346972
    table = `\`${encodeIdentifiers(tableName, true)}\``;
  } else {
    table = `"${encodeIdentifiers(tableName, false)}"`;
  }

  if (addRowId) {
    column = `${table}."ROWID", ${table}.*`;
  }
  return `select ${column} from ${table}`;
}

export function encodeIdentifiers(str, isMySQL: boolean) {
  if (!str) {
    return str;
  }
  return isMySQL ? str.replace(/`/g, '``') : str.replace(/"/g, '""');
}

export async function splitSql(
  sql: string,
  isOracle: boolean = false,
  delimiter,
): Promise<number[]> {
  const { SQLDocument } = await import('@alipay/ob-parser-js');
  const doc = new SQLDocument({
    text: sql,
    delimiter: delimiter,
  });
  return doc?.statements?.map((stmt) => {
    return stmt.stop + (stmt.delimiter?.length || 0);
  });
}

export function getRealTableName(tableName: string, isOracle: boolean = true) {
  return getRealNameInDatabase(tableName, isOracle, false);
}

/**
 * plsql
 * CnPlugin expaste
 */
export function textExpaste(text: string, dialectType?: ConnectionMode) {
  /**
   * `a b c
   * d e
   * f
   * `
   * =>
   * "a","b","c",
   * "d","e",
   * "f",
   * =>
   * ("a","b","c",
   * "d","e",
   * "f")
   */
  dialectType = dialectType || ConnectionMode.OB_ORACLE;
  return (text || '')
    .replace(/(\S+)[ \t]?/g, dialectType === ConnectionMode.OB_ORACLE ? "'$1'," : '"$1",')
    .replace(/,(\s*)$/, ')$1')
    .replace(/^(\s*)/, '$1(');
}

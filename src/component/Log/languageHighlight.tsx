import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';

// 目前支持的语言列表
export const languageMap = { java };

/**
 * 日期, 时间, 日志状态的匹配规则
 */

export const customRule = [
  {
    className: 'number date',
    begin: /\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/,
    relevance: 0,
  },
  {
    className: 'number time',
    begin: /\b\d{1,2}:\d{1,2}:\d{1,2}(?:[.,:]\d+)?(?:\s?[+-]\d{2}:?\d{2}|Z)?\b/,
    relevance: 0,
  },
  {
    className: 'important error',
    begin: /\b(?:ALERT|CRIT|CRITICAL|EMERG|EMERGENCY|ERR|ERROR|FAILURE|FATAL|SEVERE)\b/,
    relevance: 0,
  },
  {
    className: 'important warning',
    begin: /\b(?:WARN|WARNING|WRN)\b/,
    relevance: 0,
  },
  {
    className: 'keyword info',
    begin: /\b(?:DISPLAY|INF|INFO|NOTICE|STATUS)\b/,
    relevance: 0,
  },
  {
    className: 'keyword debug',
    begin: /\b(?:DBG|DEBUG|FINE)\b/,
    relevance: 0,
  },
  {
    className: 'comment trace',
    begin: /\b(?:FINER|FINEST|TRACE|TRC|VERBOSE|VRB)\b/,
    relevance: 0,
  },
];

// 自定义规则适配多语言
const withCustomRule = (fn, enableCustomRule) => (args) => {
  const { contains, ...rest } = fn(args);
  const rule = enableCustomRule ? customRule : [];
  return {
    ...rest,
    contains: [
      // 注入自定义规则(日期, 时间, 日志状态)
      ...rule,
      // 原始的规则定义
      ...contains,
    ],
  };
};

export const registerLanguage = (language: string, enableCustomRule: boolean) => {
  if (language && languageMap[language]) {
    hljs.registerLanguage(language, withCustomRule(languageMap[language], enableCustomRule));
  } else {
    Object.keys(languageMap).forEach((lan) => {
      hljs.registerLanguage(lan, withCustomRule(languageMap[lan], enableCustomRule));
    });
  }
};

export const renderHightlight = (language, content) => {
  const result = language ? hljs.highlight(language, content || '') : hljs.highlightAuto(content);
  return result;
};

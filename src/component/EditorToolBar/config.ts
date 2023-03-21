import { enablePackageDebug } from '@/constant';
import SQL_ACTIONS from '././actions/sql';
import PL_ACTIONS from './actions/pl';
import SCRIPT_ACTIONS from './actions/script';
import TEXT_ACTIONS from './actions/text';

// 合并文本、SQL、PL 操作集
export const ACTIONS = {
  ...TEXT_ACTIONS,
  ...SQL_ACTIONS,
  ...PL_ACTIONS,
  ...SCRIPT_ACTIONS,
};

// 文本操作集
export const TEXT_ACTION_GROUPS = [
  ['TEXT_FIND_OR_REPLACE', 'TEXT_UNDO', 'TEXT_REDO'],
  ['TEXT_FORMAT', 'TEXT_EXPASTE', 'TEXT_CASE', 'TEXT_INDENT_GROUP', 'TEXT_COMMENT_GROUP'],
];

// 各类操作集
export const ACTION_GROUPS = {
  // SQL 编辑器操作集
  SQL_DEFAULT_ACTION_GROUP: {
    left: [
      ['SQL_COMMIT', 'SQL_ROLLBACK'],
      ['SQL_EXEC', 'SQL_EXEC_SECTION', 'SQL_STOP', 'SQL_LINT', 'SQL_PLAN'],
      ...TEXT_ACTION_GROUPS,
    ],
    right: [['SQL_SAVE', 'SQL_CONFIG', 'SNIPPET']],
  },

  // 创建视图
  VIEW_CREATE_ACTION_GROUP: {
    left: [...TEXT_ACTION_GROUPS],
    right: [['VIEW_CREATE_LASR_STEP'], ['VIEW_CREATE_SQL_SUBMIT']],
  },

  // 新建 SNIPPET 的编辑器操作集
  SNIPPET_CREATE_ACTION_GROUP: {
    left: [...TEXT_ACTION_GROUPS, ['SNIPPET_SECTION_GROUP']],
    right: [],
  },

  // PL 新建对象的编辑器操作集
  PL_CREATE_ACTION_GROUP: {
    left: TEXT_ACTION_GROUPS,
    right: [],
  },

  // PL 编辑器操作集
  PL_DEFAULT_ACTION_GROUP: {
    left: [
      ['PL_SAVE', 'DOWNLOAD'],
      ['PL_EXEC', 'SQL_STOP', 'PL_COMPILE', 'PL_DEBUG'],
      ...TEXT_ACTION_GROUPS,
    ],
    right: [['SNIPPET']],
  },

  PL_PACKAGE_ACTION_GROUP: {
    left: [
      ['PL_COMPILE', 'PL_EXEC', 'SQL_STOP', enablePackageDebug ? 'PL_DEBUG' : null].filter(Boolean),
      ...TEXT_ACTION_GROUPS,
    ],
    right: [['DOWNLOAD', 'PL_SAVE']],
  },

  // PL 触发器编辑操作集
  PL_TRIGGER_TYPE_ACTION_GROUP: {
    left: [['PL_COMPILE'], ...TEXT_ACTION_GROUPS],
    right: [['DOWNLOAD', 'PL_TRIGGER_TYPE_SAVE']],
  },

  // PL 匿名对象编辑器操作集
  PL_ANONEYMOUS_DEFAULT_ACTION_GROUP: {
    left: [['PL_COMPILE', 'PL_EXEC', 'SQL_STOP', 'PL_DEBUG'], ...TEXT_ACTION_GROUPS],
    right: [['PL_SCRIPT_SAVE'], ['SNIPPET']],
  },

  // PL 调试编辑器操作集
  PL_DEBUG_ACTION_GROUP: {
    left: [
      ['PL_DEBUG_RETRY', 'PL_DEBUG_EXIT'],
      [
        'PL_DEBUG_AUTO',
        'PL_DEBUG_STEP_SKIP',
        'PL_DEBUG_STEP_IN',
        'PL_DEBUG_STEP_OUT',
        'PL_DEBUG_END',
      ],
    ],
    right: [],
  },
  COMMON_EDITOR_GROUP: {
    left: [...TEXT_ACTION_GROUPS],
  },
  EMPTY: {},
};

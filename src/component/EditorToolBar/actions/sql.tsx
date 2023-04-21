import DelimiterSelect from '@/component/DelimiterSelect';
import SQLConfig from '@/component/SQLConfig';
import { getConfirmTitle } from '@/component/SubmitConfirm';
import { IConStatus } from '@/component/Toolbar/statefulIcon';
import { TransState } from '@/d.ts';
import SQLPage from '@/page/Workspace/components/SQLPage';
import setting from '@/store/setting';
import sqlStore from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { SaveOutlined } from '@ant-design/icons';
import { ToolBarActions } from '..';

const sqlActions: ToolBarActions = {
  SQL_SAVE: {
    name: formatMessage({ id: 'odc.component.SaveSQLModal.SaveScript' }),
    icon: SaveOutlined,
    statusFunc: (ctx) => {
      const { pageKey } = ctx.props;
      if (ctx.state.isSavingScript) {
        return IConStatus.RUNNING;
      }
      if (sqlStore.runningPageKey.has(pageKey)) {
        return IConStatus.DISABLE;
      }
      return IConStatus.INIT;
    },
    async action(ctx: any) {
      await ctx.saveScript();
    },
  },

  SQL_PLAN: {
    name: formatMessage({ id: 'odc.EditorToolBar.actions.sql.Plan' }),
    icon: 'EXPAIN',
    isVisible(ctx: SQLPage) {
      return ctx.getSession()?.supportFeature.enableSQLExplain;
    },
    async action(ctx: any) {
      await ctx.handleExplain();
    },
  },

  SQL_EXEC: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.sql.RunF',
    }),

    icon: 'SQL_RUN',
    statusFunc: (ctx: SQLPage) => {
      const { pageKey, sqlStore } = ctx.props;
      const {
        runningPageKey,
        rollbackPageKey,
        stopingPageKey,
        commitingPageKey,
        isRunningSection,
      } = sqlStore;
      if (setting.enableMultiSession) {
        if (
          commitingPageKey.has(pageKey) ||
          !!rollbackPageKey.has(pageKey) ||
          !!stopingPageKey.has(pageKey)
        ) {
          return IConStatus.DISABLE;
        } else if (runningPageKey.has(pageKey) && !isRunningSection.has(pageKey)) {
          return IConStatus.RUNNING;
        }
        return IConStatus.INIT;
      } else {
        if (commitingPageKey?.size || !!rollbackPageKey?.size || !!stopingPageKey?.size) {
          return IConStatus.DISABLE;
        }
        if (runningPageKey.has(pageKey) && !isRunningSection.has(pageKey)) {
          return IConStatus.RUNNING;
        }
        if (runningPageKey?.size) {
          return IConStatus.DISABLE;
        }
        return IConStatus.INIT;
      }
    },

    async action(ctx: any) {
      await ctx.handleExecuteSQL();
    },
  },

  SQL_EXEC_SECTION: {
    name: formatMessage({
      id: 'odc.EditorToolBar.actions.sql.RunTheCurrentStatementF',
    }),

    icon: 'SQL_RUN_SECTION',
    statusFunc: (ctx) => {
      const { pageKey, sqlStore } = ctx.props;
      const {
        runningPageKey,
        rollbackPageKey,
        stopingPageKey,
        commitingPageKey,
        isRunningSection,
      } = sqlStore;
      if (setting.enableMultiSession) {
        if (
          commitingPageKey.has(pageKey) ||
          rollbackPageKey.has(pageKey) ||
          stopingPageKey.has(pageKey)
        ) {
          return IConStatus.DISABLE;
        } else if (runningPageKey.has(pageKey) && isRunningSection.has(pageKey)) {
          return IConStatus.RUNNING;
        }
        return IConStatus.INIT;
      } else {
        if (commitingPageKey?.size || !!rollbackPageKey?.size || !!stopingPageKey?.size) {
          return IConStatus.DISABLE;
        }
        if (runningPageKey.has(pageKey) && isRunningSection.has(pageKey)) {
          return IConStatus.RUNNING;
        }
        if (runningPageKey?.size) {
          return IConStatus.DISABLE;
        }
        return IConStatus.INIT;
      }
    },

    async action(ctx: any) {
      await ctx.handleExecuteSelectedSQL();
    },
  },

  SQL_COMMIT: {
    isShowText: true,
    name: formatMessage({ id: 'odc.EditorToolBar.actions.sql.Submitted' }), // 提交
    icon: 'SQL_COMMIT',
    confirmConfig: () => {
      if (!setting.enableMultiSession) {
        /**
         * 共享session下面需要提示会对其他窗口有影响
         */
        return {
          title: getConfirmTitle(),
        };
      }
      return null;
    },

    statusFunc: (ctx: SQLPage) => {
      const { pageKey, sqlStore } = ctx.props;
      const { runningPageKey, rollbackPageKey, stopingPageKey, commitingPageKey } = sqlStore;
      const transaction = ctx.session?.transState;
      if (transaction?.transState === TransState.IDLE) {
        return IConStatus.DISABLE;
      }
      if (setting.enableMultiSession) {
        if (
          runningPageKey.has(pageKey) ||
          rollbackPageKey.has(pageKey) ||
          stopingPageKey.has(pageKey)
        ) {
          return IConStatus.DISABLE;
        } else if (commitingPageKey.has(pageKey)) {
          return IConStatus.RUNNING;
        }
        return IConStatus.INIT;
      } else {
        if (runningPageKey?.size || !!rollbackPageKey?.size) {
          return IConStatus.DISABLE;
        }
        if (commitingPageKey.has(pageKey)) {
          return IConStatus.RUNNING;
        }
        if (commitingPageKey?.size) {
          return IConStatus.DISABLE;
        }
        return IConStatus.INIT;
      }
    },

    isVisible(ctx: SQLPage) {
      return !ctx.getSession()?.params?.autoCommit;
    },

    async action(ctx: SQLPage) {
      ctx.debounceHighlightSelectionLine();
      ctx.props.sqlStore.commit(
        ctx.props.pageKey,
        ctx.getSession()?.sessionId,
        ctx?.getSession()?.database?.dbName,
      );
    },
  },

  SQL_ROLLBACK: {
    isShowText: true,
    name: formatMessage({ id: 'odc.EditorToolBar.actions.sql.Rollback' }), // 回滚
    icon: 'SQL_ROLLBACK',
    confirmConfig: () => {
      if (!setting.enableMultiSession) {
        return {
          title: getConfirmTitle(true),
        };
      }
      return null;
    },
    statusFunc: (ctx: SQLPage) => {
      const { pageKey, sqlStore } = ctx.props;
      const { runningPageKey, rollbackPageKey, stopingPageKey, commitingPageKey } = sqlStore;
      const sessionId = ctx.getSession()?.sessionId;
      const transaction = ctx.session?.transState;
      if (transaction?.transState === TransState.IDLE) {
        return IConStatus.DISABLE;
      }
      if (setting.enableMultiSession) {
        if (
          runningPageKey.has(pageKey) ||
          commitingPageKey.has(pageKey) ||
          stopingPageKey.has(pageKey)
        ) {
          return IConStatus.DISABLE;
        } else if (rollbackPageKey.has(pageKey)) {
          return IConStatus.RUNNING;
        }
        return IConStatus.INIT;
      } else {
        if (runningPageKey?.size || commitingPageKey?.size) {
          return IConStatus.DISABLE;
        }
        if (rollbackPageKey.has(pageKey)) {
          return IConStatus.RUNNING;
        }
        if (rollbackPageKey?.size) {
          return IConStatus.DISABLE;
        }
        return IConStatus.INIT;
      }
    },

    isVisible(ctx: SQLPage) {
      return !ctx.getSession()?.params?.autoCommit;
    },

    async action(ctx: SQLPage) {
      ctx.debounceHighlightSelectionLine();
      sqlStore.rollback(
        ctx.props.pageKey,
        ctx.getSession()?.sessionId,
        ctx?.getSession()?.database?.dbName,
      );
    },
  },

  SQL_STOP: {
    name: formatMessage({ id: 'odc.EditorToolBar.actions.sql.Termination' }), // 终止
    icon: 'SQL_STOP',
    statusFunc: (ctx) => {
      const { pageKey } = ctx.props;
      if (sqlStore.stopingPageKey.has(pageKey)) {
        return IConStatus.RUNNING;
      }
      if (
        !sqlStore.runningPageKey?.has(ctx.props.pageKey) ||
        sqlStore.commitingPageKey.has(pageKey) ||
        sqlStore.rollbackPageKey.has(pageKey)
      ) {
        return IConStatus.DISABLE;
      }
      return IConStatus.INIT;
    },
    isVisible: (ctx: SQLPage) => {
      return ctx.getSession()?.supportFeature.enableKillQuery;
    },
    async action(ctx: any) {
      sqlStore.stopExec(ctx.props.pageKey);
    },
  },

  SQL_CONFIG: {
    Component: SQLConfig,
  },

  DELIMITER: {
    Component: DelimiterSelect,
  },

  VIEW_CREATE_SQL_SUBMIT: {
    isShowText: true,
    name: formatMessage({ id: 'odc.EditorToolBar.actions.sql.Create' }), // 创建
    icon: null,
    type: 'BUTTON_PRIMARY',
    async action(ctx: any) {
      await ctx.handleCreateView();
    },
  },

  VIEW_CREATE_LASR_STEP: {
    isShowText: true,
    name: formatMessage({ id: 'odc.EditorToolBar.actions.sql.PreviousStep' }), // 上一步
    icon: null,
    type: 'BUTTON',
    async action(ctx: any) {
      ctx.handleSwitchToSteps();
    },
  },

  SQL_LINT: {
    name: formatMessage({ id: 'odc.EditorToolBar.actions.sql.SqlCheck' }), //SQL 检查
    icon: 'LINT',
    async action(ctx: any) {
      await ctx.doSQLLint();
    },
  },
};

export default sqlActions;

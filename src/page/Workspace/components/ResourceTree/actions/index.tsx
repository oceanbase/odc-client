import { getExportObjects, getFunctionByFuncName, getProcedureByProName } from '@/common/network';
import { getType } from '@/common/network/type';
import { actionTypes } from '@/component/Acess';
import { PLType } from '@/constant/plType';
import {
  ConnectionMode,
  DbObjectType,
  PageType,
  ResourceTabKey,
  TriggerPropsTab,
  TriggerState,
  TypePropsTab,
} from '@/d.ts';
import connection from '@/store/connection'; // 树节点构造
import {
  openCreatePackageBodyPage,
  openFunctionEditPageByFuncName,
  openFunctionOrProcedureFromPackage,
  openFunctionViewPage,
  openPackageBodyPage,
  openPackageHeadPage,
  openPackageViewPage,
  openProcedureEditPageByProName,
  openProcedureViewPage,
  openTriggerEditPageByName,
  openTriggerViewPage,
  openTypeEditPageByName,
  openTypeViewPage,
} from '@/store/helper/page';
import modal from '@/store/modal';
import schema, { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { downloadPLDDL } from '@/util/sqlExport';
import { QuestionCircleFilled } from '@ant-design/icons';
import { message, Modal } from 'antd';
import EventBus from 'eventbusjs';
import { PropsTab, TopTab } from '../../FunctionPage';
import { PropsTab as ProcedurePropsTab, TopTab as ProcedureToptab } from '../../ProcedurePage';

const TREE_NODE_ACTIONS = {
  OVERVIEW: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.See',
    }),

    async action(ctx: any, node: any) {
      const { root } = node;
      const { title, type } = root;

      if (type === 'FUNCTION') {
        openFunctionViewPage(
          title,
          TopTab.PROPS,
          node.type === 'PARAM' ? PropsTab.PARAMS : PropsTab.DDL,
        );

        return;
      }

      if (type === 'PROCEDURE') {
        openProcedureViewPage(
          title,
          ProcedureToptab.PROPS,
          node.type === 'PARAM' ? ProcedurePropsTab.PARAMS : ProcedurePropsTab.DDL,
        );

        return;
      }

      let showCode = true;

      if (type === 'PACKAGE_ROOT') {
        if (['PACKAGE_BODY', 'PACKAGE_HEAD'].indexOf(node.type) > -1) {
          showCode = false;
        }
      }

      openPackageViewPage(title, node.topTab, showCode);
    },
  },

  EDIT: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Editing',
    }),

    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      const { topTab } = node;

      if (topTab === 'HEAD') {
        await TREE_NODE_ACTIONS.EDIT_PACKAGE_HEAD.action(ctx, node);
      }

      if (topTab === 'BODY') {
        await TREE_NODE_ACTIONS.EDIT_PACKAGE_BODY.action(ctx, node);
      }
    },
  },

  COMPILE: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Compile',
    }),

    isVisible(ctx: any) {
      const isMySQL = connection.connection.dbMode === ConnectionMode.OB_MYSQL;
      return !isMySQL;
    },

    async action(ctx: any, node: any) {
      const { schemaStore, sqlStore } = ctx.props;
      const { root } = node;

      let plSchema;
      const PLRunningStatus = sqlStore.getRunningPL(node.title);

      if (PLRunningStatus) {
        message.info(
          formatMessage(
            {
              id: 'odc.ResourceTree.config.treeNodesActions.PlrunningstatusCompilationIsNotSupported',
            },

            {
              PLRunningStatus,
            },
          ),
        );

        return;
      } // 单个子程序调试
      // 非 package 下面的子程序，plSchema 可以调用接口获取

      if (root.type !== 'PACKAGE_ROOT') {
        if (node.type === 'FUNCTION') {
          await openFunctionEditPageByFuncName(node.title);
        }

        if (node.type === 'PROCEDURE') {
          await openProcedureEditPageByProName(node.title);
        }
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: node.title,
            params: {
              action: 'COMPILE',
            },
          });
        });
      } else {
        // package 下面的子程序，plSchema 从 package Schema 获取
        const { packages = [] } = schemaStore;
        const packageName = root.title;
        const targetPackage = packages.find((pkg) => pkg.packageName === packageName);
        const { functions = [], procedures = [] } = targetPackage.packageBody;

        if (node.type === 'PACKAGE_BODY') {
          plSchema = {
            packageName,
            ddl: targetPackage.packageBody.basicInfo.ddl,
          };

          const pKey = await openPackageBodyPage(packageName, plSchema.ddl);
          setTimeout(() => {
            EventBus.dispatch('pageAction', null, {
              key: pKey,
              params: {
                action: 'COMPILE',
              },
            });
          });
          return;
        }

        if (node.type === 'FUNCTION') {
          plSchema = functions.find((func) => node.key.indexOf(func.key) !== -1);
        }

        if (node.type === 'PROCEDURE') {
          plSchema = procedures.find((pro) => node.key.indexOf(pro.key) !== -1);
        } // 修正 ddl 为 package body 的 ddl

        plSchema.ddl = targetPackage.packageBody.basicInfo.ddl; // 补充字段 packageName

        plSchema.packageName = packageName;
        const scriptId = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.funName || plSchema.proName,
          node.type,
          plSchema,
        );

        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: plSchema.key,
            params: {
              action: 'COMPILE',
            },
          });
        });
      }
    },
  },

  EXEC: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Run',
    }),

    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      const { schemaStore, sqlStore } = ctx.props;
      const { root } = node;

      if (node.plStatus === 'INVALID') {
        message.info(
          formatMessage({
            id: 'odc.ResourceTree.config.treeNodesActions.TheObjectIsInvalidAnd',
          }),
        );

        return;
      }

      let plSchema;
      const PLRunningStatus = sqlStore.getRunningPL(node.title);

      if (PLRunningStatus) {
        message.info(
          formatMessage(
            {
              id: 'odc.ResourceTree.config.treeNodesActions.PlrunningstatusDoesNotSupportRunning',
            },

            {
              PLRunningStatus,
            },
          ),
        );

        return;
      } // 单个子程序调试
      // 非 package 下面的子程序，plSchema 可以调用接口获取

      if (root.type !== 'PACKAGE_ROOT') {
        if (node.type === 'FUNCTION') {
          await openFunctionEditPageByFuncName(node.title);
        }

        if (node.type === 'PROCEDURE') {
          await openProcedureEditPageByProName(node.title);
        }
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: node.title,
            params: {
              action: 'EXEC',
            },
          });
        }); // package 下面的子程序，plSchema 从 package Schema 获取
      } else {
        const { packages = [] } = schemaStore;
        const packageName = root.title;
        const targetPackage = packages.find((pkg) => pkg.packageName === packageName);
        const { functions = [], procedures = [] } = targetPackage.packageBody;

        if (node.type === 'PACKAGE_BODY' || node.type === 'PACKAGE_PROGRAM') {
          /** 右键程序包子程序或者包体调试，要先选调试对象 */
          const plList = [];
          functions.forEach((func) => {
            plList.push({
              plName: func.funName,
              packageName: root.title,
              obDbObjectType: 'FUNCTION',
              key: func.key,
            });
          });
          procedures.forEach((pro) => {
            plList.push({
              plName: pro.proName,
              packageName: root.title,
              obDbObjectType: 'PROCEDURE',
              key: pro.key,
            });
          });

          if (!plList.length) {
            return;
          }

          ctx.setState({
            showModalSelectPL: true,
            plList,
            action: 'EXEC',
          });

          return;
        }
        /** 选择程序包直接对象调试 */

        if (node.type === 'FUNCTION') {
          plSchema = functions.find((func) => node.key.indexOf(func.key) !== -1);
        }

        if (node.type === 'PROCEDURE') {
          plSchema = procedures.find((pro) => node.key.indexOf(pro.key) !== -1);
        } // 修正 ddl 为 package body 的 ddl

        plSchema.ddl = targetPackage.packageBody.basicInfo.ddl; // 补充字段 packageName

        plSchema.packageName = packageName;
        const scriptId = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.funName || plSchema.proName,
          node.type,
          plSchema,
        );

        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: plSchema.key,
            params: {
              action: 'EXEC',
            },
          });
        });
      }
    },
  },

  DEBUG: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Debugging',
    }),

    isVisible(ctx: any) {
      const {
        schemaStore: { enablePLDebug },
      } = ctx.props;
      return !ctx.disableDebug && enablePLDebug;
    },

    async action(ctx: any, node: any) {
      const { schemaStore, sqlStore } = ctx.props;
      const { root } = node;

      if (node.plStatus === 'INVALID') {
        message.info(
          formatMessage({
            id: 'odc.ResourceTree.config.treeNodesActions.InvalidObjectDebuggingIsNot',
          }),
        );

        return;
      }

      let plSchema;
      const PLRunningStatus = sqlStore.getRunningPL(node.title);

      if (PLRunningStatus) {
        message.info(
          formatMessage(
            {
              id: 'odc.ResourceTree.config.treeNodesActions.DebuggingIsNotSupportedIn',
            },

            {
              PLRunningStatus,
            },
          ),
        );

        return;
      } // 子程序调试，和包体节点功能一样

      if (node.type === 'PACKAGE_PROGRAM' || node.type === 'PACKAGE_BODY') {
        await TREE_NODE_ACTIONS.DEBUG_PACKAGE_BODY.action(ctx, node);
        return;
      } // 单个子程序调试
      // 非 package 下面的子程序，plSchema 可以调用接口获取

      if (root.type !== 'PACKAGE_ROOT') {
        if (node.type === 'FUNCTION') {
          await openFunctionEditPageByFuncName(node.title);
        }

        if (node.type === 'PROCEDURE') {
          await openProcedureEditPageByProName(node.title);
        }
        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: node.title,
            params: {
              action: 'DEBUG',
            },
          });
        }); // package 下面的子程序，plSchema 从 package Schema 获取
      } else {
        const { packages = [] } = schemaStore;
        const packageName = root.title;
        const targetPackage = packages.find((pkg) => pkg.packageName === packageName);
        const { functions = [], procedures = [] } = targetPackage.packageBody;

        if (node.type === 'FUNCTION') {
          plSchema = functions.find((func) => node.key.indexOf(func.key) !== -1);
        }

        if (node.type === 'PROCEDURE') {
          plSchema = procedures.find((pro) => node.key.indexOf(pro.key) !== -1);
        } // 修正 ddl 为 package body 的 ddl

        plSchema.ddl = targetPackage.packageBody.basicInfo.ddl; // 补充字段 packageName

        plSchema.packageName = packageName;
        const scriptId = await openFunctionOrProcedureFromPackage(
          packageName,
          plSchema.funName || plSchema.proName,
          node.type,
          plSchema,
        );

        setTimeout(() => {
          EventBus.dispatch('pageAction', null, {
            key: plSchema.key,
            params: {
              action: 'DEBUG',
            },
          });
        });
      }
    },
  },

  REFRESH: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Refresh',
    }),

    async action(ctx: any, node: any) {
      const { schemaStore } = ctx.props;
      const { root } = node;
      const { type, title } = root;

      if (type === 'FUNCTION') {
        await schemaStore.loadFunction(title);
        return;
      }

      if (type === 'PROCEDURE') {
        await schemaStore.loadProcedure(title);
        return;
      }

      if (type === 'TYPE') {
        await schemaStore.loadType(title);
        return;
      }

      await schemaStore.loadPackage(title);
    },
  },

  CREATE_PACKAGE: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.CreateAPackage',
    }),

    actionType: actionTypes.create,
    async action(ctx: any, node: any) {
      ctx.props.handleAddTreeNode(ResourceTabKey.PACKAGE);
    },
  },

  EDIT_PACKAGE: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.EditThePackageHeader',
    }),

    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      const { schemaStore } = ctx.props;
      const { root } = node;
      const { title } = root;
      await schemaStore?.loadPackage(title);
      await TREE_NODE_ACTIONS.EDIT_PACKAGE_HEAD.action(ctx, node);
      await TREE_NODE_ACTIONS.EDIT_PACKAGE_BODY.action(ctx, node);
    },
  },

  DELETE_PACKAGE: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Delete',
    }),

    actionType: actionTypes.delete,
    async action(ctx: any, node: any) {
      const { root } = node;
      const { title: packageName } = root;
      const { schemaStore, pageStore } = ctx.props;
      Modal.confirm({
        title: formatMessage(
          {
            id: 'workspace.window.createPackage.modal.delete',
          },

          {
            name: packageName,
          },
        ),

        okText: formatMessage({
          id: 'app.button.ok',
        }),

        cancelText: formatMessage({
          id: 'app.button.cancel',
        }),

        centered: true,
        icon: <QuestionCircleFilled />,
        onOk: async () => {
          if (!(await schemaStore.deletePackage(packageName))) {
            return;
          }
          await schemaStore?.getPackageList();
          message.success(
            formatMessage({
              id: 'workspace.window.createPackage.modal.delete.success',
            }),
          );

          const openedPages = pageStore.pages.filter((p) => p.params.packageName === packageName);
          if (openedPages.length) {
            for (let p of openedPages) {
              await pageStore.close(p.key);
            }
          }
        },
      });
    },
  },

  OVERVIEW_PACKAGE_HEAD: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.See',
    }),

    async action(ctx: any, node: any) {
      const { root } = node;
      const { title } = root;
      openPackageViewPage(title, node.topTab, node.propsTab);
    },
  },

  EDIT_PACKAGE_HEAD: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Editing',
    }),

    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      const { schemaStore } = ctx.props;
      const { packages = [] } = schemaStore;
      const { root } = node;
      const { title } = root;
      const pkg = packages.find((packages: any) => packages.packageName === title);
      const sql = (pkg.packageHead && pkg.packageHead.basicInfo.ddl) || '';
      openPackageHeadPage(title, sql);
    },
  },

  CREATE_PACKAGE_BODY: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.CreateAPackage.1',
    }),

    actionType: actionTypes.create,
    async action(ctx: any, node: any) {
      const { schemaStore } = ctx.props;
      const packageName = node.title;
      const sql = await schemaStore?.getPackageBodyCreateSQL(packageName);
      openCreatePackageBodyPage(sql);
    },
  },

  OVERVIEW_PACKAGE_BODY: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.See',
    }),

    async action(ctx: any, node: any) {
      const { root } = node;
      const { title } = root;
      openPackageViewPage(title, node.topTab, node.propsTab);
    },
  },

  EDIT_PACKAGE_BODY: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Editing',
    }),

    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      const { schemaStore } = ctx.props;
      const { packages = [] } = schemaStore;
      const { root } = node;
      const { title } = root;
      const pkg = packages.find((packages: any) => packages.packageName === title);

      if (!pkg.packageBody) {
        return;
      }

      const sql = (pkg.packageBody && pkg.packageBody.basicInfo.ddl) || '';
      openPackageBodyPage(title, sql);
    },
  },

  DEBUG_PACKAGE_BODY: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Debugging',
    }),

    // 仅在 Oracle 模式下支持调试功能
    isVisible(ctx: any) {
      const {
        connectionStore: { connection },
      } = ctx.props;
      return !ctx.disableDebug && connection.dbMode === ConnectionMode.OB_ORACLE;
    },

    async action(ctx: any, node: any) {
      const { schemaStore } = ctx.props;
      const { packages = [] } = schemaStore;
      const { root } = node;
      const { title } = root;
      const pkg = packages.find((packages: any) => packages.packageName === title);

      if (!pkg.packageBody) {
        return;
      }

      const { functions = [], procedures = [] } = pkg.packageBody;
      const plList = [];
      functions.forEach((func) => {
        plList.push({
          plName: func.funName,
          packageName: title,
          obDbObjectType: 'FUNCTION',
          key: func.key,
        });
      });
      procedures.forEach((pro) => {
        plList.push({
          plName: pro.proName,
          packageName: title,
          obDbObjectType: 'PROCEDURE',
          key: pro.key,
        });
      });

      if (!plList.length) {
        return;
      }

      ctx.setState({
        showModalSelectPL: true,
        action: 'DEBUG',
        plList,
      });
    },
  },

  DELETE_PACKAGE_BODY: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Delete',
    }),

    actionType: actionTypes.delete,
    async action(ctx: any, node: any) {
      const { root } = node;
      const { title: packageName } = root;
      const { schemaStore } = ctx.props;
      Modal.confirm({
        title: formatMessage(
          {
            id: 'workspace.window.PackageBody.modal.delete',
          },

          {
            name: packageName,
          },
        ),

        okText: formatMessage({
          id: 'app.button.ok',
        }),

        cancelText: formatMessage({
          id: 'app.button.cancel',
        }),

        centered: true,
        icon: <QuestionCircleFilled />,
        onOk: async () => {
          if (!(await schemaStore.deletePackageBody(packageName))) {
            return;
          }
          message.success(
            formatMessage({
              id: 'workspace.window.PackageBody.modal.delete.success',
            }),
          );

          await schemaStore.getPackageList();
          if (
            schemaStore.packages.find((pkg) => {
              return pkg.packageName === packageName;
            })
          ) {
            await schemaStore?.loadPackage(packageName);
          }
        },
      });
    },
  },

  OVERVIEW_FUNCTION: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.See',
    }),

    async action(ctx: any, node: any) {
      const { title } = node;
      openFunctionViewPage(title, TopTab.PROPS, PropsTab.INFO);
    },
  },

  CREATE_FUNCTION: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.New',
    }),

    actionType: actionTypes.create,
    async action(ctx: any, node: any) {
      ctx.props.handleAddTreeNode(ResourceTabKey.FUNCTION);
    },
  },

  EDIT_FUNCTION: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Editing',
    }),

    isDisabled(ctx: any, node: any) {
      // MySQL模式下 不支持编辑
      return connection.connection.dbMode === ConnectionMode.OB_MYSQL;
    },
    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      const { title } = node.root;
      await openFunctionEditPageByFuncName(title);
    },
  },

  DELETE_FUNCTION: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Delete',
    }),

    actionType: actionTypes.delete,
    async action(ctx: any, node: any) {
      const { schemaStore, pageStore, sqlStore } = ctx.props;
      const { title: funName } = node.root;
      const PLRunningStatus = sqlStore.getRunningPL(node.title);

      if (PLRunningStatus) {
        message.info(
          formatMessage(
            {
              id: 'odc.ResourceTree.config.treeNodesActions.PlrunningstatusDoesNotSupportDeletion',
            },

            {
              PLRunningStatus,
            },
          ),
        );

        return;
      }

      Modal.confirm({
        title: formatMessage(
          {
            id: 'workspace.window.createFunction.modal.delete',
          },

          {
            name: funName,
          },
        ),

        okText: formatMessage({
          id: 'app.button.ok',
        }),

        cancelText: formatMessage({
          id: 'app.button.cancel',
        }),

        centered: true,
        icon: <QuestionCircleFilled />,
        onOk: async () => {
          await schemaStore?.deleteFunction(funName);
          ctx.setState({
            loading: true,
          });

          await schemaStore?.refreshFunctionList();
          ctx.setState({
            loading: false,
          });

          message.success(
            formatMessage({
              id: 'workspace.window.createFunction.delete.success',
            }),
          );

          // TODO：如果当前有视图详情页面，需要关闭

          const openedPages = pageStore?.pages.filter(
            (p) => p.title === funName && (p.type == PageType.FUNCTION || p.type == PageType.PL),
          );

          if (openedPages?.length) {
            for (let page of openedPages) {
              await pageStore.close(page.key);
            }
          }
        },
      });
    },
  },

  OVERVIEW_PROCEDURE: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.See',
    }),

    async action(ctx: any, node: any) {
      const { title } = node;
      openProcedureViewPage(title, ProcedureToptab.PROPS, ProcedurePropsTab.INFO);
    },
  },

  CREATE_PROCEDURE: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.New',
    }),

    actionType: actionTypes.create,
    async action(ctx: any, node: any) {
      ctx.props.handleAddTreeNode(ResourceTabKey.PROCEDURE);
    },
  },

  EDIT_PROCEDURE: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Editing',
    }),

    isDisabled(ctx: any, node: any) {
      // MySQL模式下 不支持编辑
      return connection.connection.dbMode === ConnectionMode.OB_MYSQL;
    },
    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      const { title } = node.root;
      openProcedureEditPageByProName(title);
    },
  },

  DELETE_PROCEDURE: {
    title: formatMessage({
      id: 'odc.ResourceTree.config.treeNodesActions.Delete',
    }),

    actionType: actionTypes.delete,
    async action(ctx: any, node: any) {
      const { schemaStore, pageStore, sqlStore } = ctx.props;
      const { title: proName } = node.root;
      const PLRunningStatus = sqlStore.getRunningPL(node.title);

      if (PLRunningStatus) {
        message.info(
          formatMessage(
            {
              id: 'odc.ResourceTree.config.treeNodesActions.PlrunningstatusDoesNotSupportDeletion',
            },

            {
              PLRunningStatus,
            },
          ),
        );

        return;
      }

      Modal.confirm({
        title: formatMessage(
          {
            id: 'workspace.window.createProcedure.modal.delete',
          },

          {
            name: proName,
          },
        ),

        okText: formatMessage({
          id: 'app.button.ok',
        }),

        cancelText: formatMessage({
          id: 'app.button.cancel',
        }),

        centered: true,
        icon: <QuestionCircleFilled />,
        onOk: async () => {
          await schemaStore.deleteProcedure(proName);
          ctx.setState({
            loading: true,
          });

          await schemaStore?.refreshProcedureList();
          ctx.setState({
            loading: false,
          });

          message.success(
            formatMessage({
              id: 'workspace.window.createProcedure.modal.delete.success',
            }),
          );

          const openedPages = pageStore.pages.filter(
            (p) => p.title === proName && (p.type === PageType.PROCEDURE || p.type === PageType.PL),
          );

          if (openedPages?.length) {
            for (let page of openedPages) {
              await pageStore.close(page.key);
            }
          }
        },
      });
    },
  },

  OVERVIEW_TRIGGER: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.ViewTriggers' }), //查看触发器
    async action(ctx: any, node: any) {
      const { title } = node;
      openTriggerViewPage(title, TriggerPropsTab.DDL, node.iconStatus);
    },
  },

  CREATE_TRIGGER: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.CreateATrigger' }), //新建触发器
    async action(ctx: any, node: any) {
      ctx.handleCreateTrigger();
    },
    actionType: actionTypes.create,
  },

  EDIT_TRIGGER: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Editing' }), //编辑
    async action(ctx: any, node: any) {
      const { title } = node.root;
      await openTriggerEditPageByName(title);
    },
    actionType: actionTypes.update,
  },

  COMPILE_TRIGGER: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Compile' }), //编译
    isDisabled(ctx: any, node: any, schemaStore: SchemaStore) {
      return !schemaStore?.enableTriggerCompile;
    },

    async action(ctx: any, node: any) {
      // 当前版本暂不支持该功能
      return false;
    },
  },

  ENABLE_TRIGGER: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Enable' }), //启用
    isDisabled(ctx: any, node: any, schemaStore: SchemaStore) {
      return !schemaStore?.enableTriggerAlterStatus || node.iconStatus === 'ENABLED';
    },
    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      ctx.handleStatusTrigger(node.title, TriggerState.enabled);
    },
  },

  DISABLE_TRIGGER: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Disable' }), //禁用
    isDisabled(ctx: any, node: any, schemaStore: SchemaStore) {
      return !schemaStore?.enableTriggerAlterStatus || node.iconStatus !== 'ENABLED';
    },
    isVisible(ctx: any, node: any, schemaStore: SchemaStore) {
      return schemaStore?.enableTriggerAlterStatus;
    },
    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      ctx.handleStatusTrigger(node.title, TriggerState.disabled);
    },
  },

  DELETE_TRIGGER: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Delete' }), //删除
    async action(ctx: any, node: any) {
      ctx.handleDeleteTrigger(node);
    },
    actionType: actionTypes.delete,
  },

  REFRESH_TRIGGER: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Refresh' }), //刷新
    async action(ctx: any, node: any) {
      ctx.handleRefreshTrigger();
    },
  },

  OVERVIEW_TYPE: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.ViewType' }), //查看类型
    async action(ctx: any, node: any) {
      const { root } = node;
      openTypeViewPage(root?.title, TypePropsTab.DDL);
    },
  },

  CREATE_TYPE: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.NewType' }), //新建类型
    async action(ctx: any, node: any) {
      ctx.handleCreateType();
    },
    actionType: actionTypes.create,
  },

  EDIT_TYPE: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.EditSubject' }), //编辑主体
    isDisabled(ctx: any, node: any) {
      // 仅当类型中包含"子程序"时才支持
      return !node?.children?.some((item) => item.type === 'PACKAGE_PROGRAM');
    },
    isVisible(ctx: any) {
      // 当前版本不支持 "类型编译功能"
      return false;
    },
    actionType: actionTypes.update,
    async action(ctx: any, node: any) {
      const { root } = node;
      await openTypeEditPageByName(root?.title);
    },
  },

  COMPILE_TYPE: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Compile' }), //编译
    isVisible(ctx: any, node: any) {
      // 当前版本暂不支持该功能
      return false;
    },

    async action(ctx: any, node: any) {
      return false;
    },
  },

  DELETE_TYPE: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Delete' }), //删除
    async action(ctx: any, node: any) {
      ctx.handleDeleteType(node);
    },
    actionType: actionTypes.delete,
  },

  DOWNLOAD: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Download' }), //下载
    async action(ctx: any, node: any) {
      const type = node?.type;
      let name = node?.title;
      let ddl;
      switch (type) {
        case PLType.FUNCTION: {
          const obj = await getFunctionByFuncName(node?.title);
          ddl = obj?.ddl;
          break;
        }
        case PLType.PROCEDURE: {
          const obj = await getProcedureByProName(node?.title);
          ddl = obj?.ddl;
          break;
        }
        case PLType.PKG_HEAD: {
          const obj = await schema.getPackage(node?.root?.title);
          ddl = obj?.packageHead?.basicInfo?.ddl;
          name = node?.root?.title + '.head';
          break;
        }
        case PLType.PKG_BODY: {
          const obj = await schema.getPackage(node?.root?.title);
          ddl = obj?.packageBody?.basicInfo?.ddl;
          name = node?.root?.title + '.body';
          break;
        }
        case PLType.TYPE: {
          const obj = await getType(name);
          ddl = obj?.ddl;
          break;
        }
        case PLType.TRIGGER: {
          const obj = await schema.getTrigger(node?.title);
          ddl = obj?.ddl;
          break;
        }
      }

      if (ddl) {
        downloadPLDDL(name, type, ddl);
      }
    },
  },

  EXPORT: {
    title: formatMessage({ id: 'odc.ResourceTree.actions.Export' }), //导出
    action: async (ctx: any, node: any) => {
      const type = node?.type;
      let name = node?.title;
      switch (type) {
        case PLType.FUNCTION: {
          modal.changeExportModal(true, {
            type: DbObjectType.function,
            name,
          });

          break;
        }
        case PLType.PROCEDURE: {
          modal.changeExportModal(true, {
            type: DbObjectType.procedure,
            name,
          });

          break;
        }
        case PLType.PACKAGE_ROOT: {
          const pkgBodyList = await getExportObjects(
            schema?.database?.name,
            DbObjectType.package_body,
          );
          modal.changeExportModal(true, {
            type: DbObjectType.package,
            name,
            exportPkgBody: !!pkgBodyList[DbObjectType.package_body]?.find((item) => item === name),
          });

          break;
        }
        case PLType.TYPE: {
          modal.changeExportModal(true, {
            type: DbObjectType.type,
            name,
          });

          break;
        }
        case PLType.TRIGGER: {
          modal.changeExportModal(true, {
            type: DbObjectType.trigger,
            name,
          });

          break;
        }
      }
    },
  },
};

export default TREE_NODE_ACTIONS;

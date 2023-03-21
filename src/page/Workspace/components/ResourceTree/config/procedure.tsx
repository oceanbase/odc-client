import { TriggerState } from '@/d.ts'; // @ts-ignore
import { formatMessage } from '@/util/intl';
import Icon, {
  CodepenOutlined,
  InfoCircleFilled,
  InfoOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { Tooltip, Typography } from 'antd';

import PackageSvg from '@/svgr/menuPkg.svg';

import PackageHeadSvg from '@/svgr/Package-header.svg'; // @ts-ignore

import PackageBodySvg from '@/svgr/Package-body.svg'; // @ts-ignore

import PackageTypeSvg from '@/svgr/Package-type.svg'; // @ts-ignore

import ParameterSvg from '@/svgr/Parameter.svg'; // @ts-ignore

import ProcedureSvg from '@/svgr/menuProcedure.svg';

import FunctionSvg from '@/svgr/menuFunc.svg';

import TriggerSvg from '@/svgr/menuTrigger.svg';

import plType from '@/constant/plType';
import TypeSvg from '@/svgr/menuType.svg';
import { isArray } from 'lodash';

enum THEME {
  PACKAGE = 'var(--icon-color-3)',
  FUNCTION = 'var(--icon-color-2)',
  PROCEDURE = 'var(--icon-color-2)',
  TRIGGER_ENABLE = 'var(--icon-color-3)',
  TRIGGER_DISABLE = 'var(--icon-color-disable)',
  TYPE = 'var(--icon-color-4)',
}

function getNodeTheme(node: any) {
  if (node.funName) {
    return THEME.FUNCTION;
  }

  if (node.proName) {
    return THEME.PROCEDURE;
  }

  if (node.procedures || node.functions) {
    return THEME.PACKAGE;
  }
  if (node.triggerName) {
    return node.enableState === TriggerState.enabled ? THEME.TRIGGER_ENABLE : THEME.TRIGGER_DISABLE;
  }

  return null;
}

function renderPLStatusIcon(node: any) {
  if (node.status !== 'INVALID') {
    return null;
  }

  return (
    <Tooltip
      placement="right"
      title={
        <Typography.Paragraph
          style={{ color: '#fff', marginBottom: 0 }}
          ellipsis={{
            rows: 5,
            expandable: true,
            symbol: formatMessage({
              id: 'odc.ResourceTree.config.procedure.More',
            }), // 更多
          }}
        >
          {node.errorMessage}
        </Typography.Paragraph>
      }
    >
      <InfoCircleFilled
        style={{
          color: '#FAAD14',
          marginLeft: 8,
        }}
      />
    </Tooltip>
  );
}

function renderTriggerStatusIcon(node: any) {
  const title =
    node.enableState === TriggerState.enabled
      ? formatMessage({ id: 'odc.ResourceTree.config.procedure.Enable' }) // 启用
      : formatMessage({ id: 'odc.ResourceTree.config.procedure.Disable' }); // 禁用
  return (
    <Tooltip placement="right" title={title}>
      <Icon
        component={TriggerSvg}
        style={{
          color: getNodeTheme(node),
        }}
      />
    </Tooltip>
  );
}

function getLeafActions(node: any) {
  const ACTION_GROUPS = {
    DEFAULT: [['OVERVIEW'], ['REFRESH']],
    TYPE: [['OVERVIEW_TYPE'], ['REFRESH']],
  };

  let actions = ACTION_GROUPS.DEFAULT;

  if (node?.rootType === plType.TYPE) {
    actions = ACTION_GROUPS.TYPE;
  }

  return actions;
} // 树节点构造

const TREE_NODES = {
  PACKAGE_ROOT: {
    getConfig(node: any, parent: any, pkg: any) {
      const r = {
        title: pkg.packageName,
        key: pkg.packageName,
        theme: THEME.PACKAGE,
        type: 'PACKAGE_ROOT',
        status: renderPLStatusIcon(node),
        icon: (
          <Icon
            component={PackageSvg}
            style={{
              color: THEME.PACKAGE,
            }}
          />
        ),

        actions: [
          ['CREATE_PACKAGE', 'CREATE_PACKAGE_BODY', 'EDIT_PACKAGE'],
          ['EXPORT'],
          ['DELETE_PACKAGE', 'REFRESH'],
        ],

        children: [],
      };

      if (pkg.packageHead) {
        r.children.push(TREE_NODES.PACKAGE_HEAD.getConfig(pkg.packageHead, pkg, pkg));
      } // 漠高：可以有包头没有包体
      // 漠高：如果没有 body，整个就是 null

      if (pkg.packageBody) {
        r.children.push(TREE_NODES.PACKAGE_BODY.getConfig(pkg.packageBody, r.key, pkg));
      }

      return r;
    },
  },

  PACKAGE_HEAD: {
    getConfig(node: any, parent: any, pkg: any) {
      const r = {
        title: formatMessage({
          id: 'workspace.tree.package.head',
        }),

        key: `${pkg.packageName || ''}:head`,
        type: 'PACKAGE_HEAD',
        topTab: 'HEAD',
        propsTab: 'PACKAGE_HEAD_INFO',
        theme: THEME.PACKAGE,
        icon: (
          <Icon
            component={PackageHeadSvg}
            style={{
              color: THEME.PACKAGE,
            }}
          />
        ),

        actions: [
          ['OVERVIEW_PACKAGE_HEAD', 'EDIT_PACKAGE_HEAD'],
          ['DOWNLOAD'],
          ['DELETE_PACKAGE', 'REFRESH'],
        ],

        children: [],
      };

      if (!node) {
        return r;
      }

      const rKey = r.key;

      if (node.types && node.types.length) {
        r.children.push(TREE_NODES.PACKAGE_TYPE.getConfig(node, rKey, pkg));
      }

      if (node.variables && node.variables.length) {
        r.children.push(TREE_NODES.PACKAGE_VARIBALE.getConfig(node, rKey, pkg));
      }

      if (
        (node.functions && node.functions.length) ||
        (node.procedures && node.procedures.length)
      ) {
        r.children.push(TREE_NODES.PACKAGE_PROGRAM.getConfig(node, rKey, pkg));
      }

      return r;
    },
  },

  PACKAGE_BODY: {
    getConfig(node: any, parent: any, pkg: any) {
      const r = {
        title: formatMessage({
          id: 'workspace.tree.package.body',
        }),

        key: `${pkg.packageName || ''}:body`,
        type: 'PACKAGE_BODY',
        theme: THEME.PACKAGE,
        propsTab: 'PACKAGE_BODY_INFO',
        topTab: 'BODY',
        icon: (
          <Icon
            component={PackageBodySvg}
            style={{
              color: THEME.PACKAGE,
            }}
          />
        ),

        actions: [
          ['OVERVIEW_PACKAGE_BODY'],
          ['EDIT_PACKAGE_BODY', 'COMPILE', 'DEBUG', 'EXEC'],
          ['DOWNLOAD'],
          ['DELETE_PACKAGE_BODY', 'REFRESH'],
        ],

        children: [],
      };

      const rKey = r.key;

      if (node.types && node.types.length) {
        r.children.push(TREE_NODES.PACKAGE_TYPE.getConfig(node, rKey, pkg));
      }

      if (node.variables && node.variables.length) {
        r.children.push(TREE_NODES.PACKAGE_VARIBALE.getConfig(node, rKey, pkg));
      }

      if (
        (node.functions && node.functions.length) ||
        (node.procedures && node.procedures.length)
      ) {
        r.children.push(TREE_NODES.PACKAGE_PROGRAM.getConfig(node, rKey, pkg));
      }

      if (r.children.length == 0) {
        delete r.children;
      }

      return r;
    },
  },

  PACKAGE_PROGRAM: {
    getConfig(node: any, parentKey: any, pkg: any, color?: string) {
      const ACTIONS = {
        BODY: [['OVERVIEW'], ['EDIT', 'DEBUG', 'EXEC'], ['REFRESH']],
        HEAD: [['OVERVIEW'], ['EDIT'], ['REFRESH']],
        TYPE: [['OVERVIEW_TYPE'], ['EDIT_TYPE'], ['REFRESH']],
      };

      let actions = parentKey.includes(':body') ? ACTIONS.BODY : ACTIONS.HEAD;

      if (node?.rootType === plType.TYPE) {
        actions = ACTIONS.TYPE;
      }

      const r = {
        title: formatMessage({
          id: 'workspace.tree.package.program',
        }),
        isLeaf: false,
        key: `${parentKey || ''}:function`,
        icon: (
          <CodepenOutlined
            style={{
              color: color || THEME.PACKAGE,
            }}
          />
        ),

        type: 'PACKAGE_PROGRAM',
        // 包头和包体操作不一样，包体才具备调试功能
        actions,
        children: [],
      };

      const rKey = r.key;

      if (node.procedures && node.procedures.length) {
        node.procedures.forEach((pro: any) => {
          r.children.push(
            TREE_NODES.PACKAGE_PROCEDURE.getConfig({ ...pro, rootType: node.rootType }, rKey, pkg),
          );
        });
      }

      if (node.functions && node.functions.length) {
        node.functions.forEach((func: any) => {
          r.children.push(
            TREE_NODES.PACKAGE_FUNCTION.getConfig({ ...func, rootType: node.rootType }, rKey, pkg),
          );
        });
      }
      if (!r.children?.length) {
        r.children = null;
        r.isLeaf = true;
      }

      return r;
    },
  },

  PACKAGE_FUNCTION: {
    getConfig(node: any, parentKey: any, pkg: any) {
      // 函数在单独展现，以及在程序包头和包体内，具备不同操作集
      const ACTION_GROUPS = {
        DEFAULT: [
          ['OVERVIEW_FUNCTION', 'CREATE_FUNCTION'],
          ['EDIT_FUNCTION', 'COMPILE', 'DEBUG', 'EXEC'],
          ['EXPORT', 'DOWNLOAD'],
          ['DELETE_FUNCTION', 'RENAME', 'REFRESH'],
        ],

        PACKAGE_HEAD: [['OVERVIEW', 'EDIT'], ['REFRESH']],
        PACKAGE_BODY: [['OVERVIEW'], ['EDIT', 'DEBUG', 'EXEC'], ['REFRESH']],
        TYPE: [['OVERVIEW_TYPE'], ['REFRESH']],
      };

      let actions = ACTION_GROUPS.DEFAULT;

      if (parentKey && parentKey.includes(':head:function')) {
        actions = ACTION_GROUPS.PACKAGE_HEAD;
      }

      if (parentKey && parentKey.includes(':body:function')) {
        actions = ACTION_GROUPS.PACKAGE_BODY;
      }

      if (node?.rootType === plType.TYPE) {
        actions = ACTION_GROUPS.TYPE;
      }

      const r = {
        title: node.funName,
        status: renderPLStatusIcon(node),
        plStatus: node.status,
        key: `${parentKey || ''}:${node.funName}:${node.key}`,
        theme: THEME.FUNCTION,
        type: plType.FUNCTION,
        icon: (
          <Icon
            component={FunctionSvg}
            style={{
              color: THEME.FUNCTION,
            }}
          />
        ),

        actions,
        children: [],
      };

      const rKey = r.key;
      const data = { ...node, rootType: node.rootType };

      if (node.params && node.params.length) {
        r.children.push(TREE_NODES.PACKAGE_PARAM.getConfig(data, rKey, pkg));
      }

      if (node.types && node.types.length) {
        r.children.push(TREE_NODES.PACKAGE_TYPE.getConfig(data, rKey, pkg));
      }

      if (node.variables && node.variables.length) {
        r.children.push(TREE_NODES.PACKAGE_VARIBALE.getConfig(data, rKey, pkg));
      }

      if (node.returnType) {
        r.children.push(TREE_NODES.PACKAGE_RETURN_VALUE.getConfig(data, rKey, pkg));
      }

      return r;
    },
  },

  PACKAGE_PROCEDURE: {
    getConfig(node: any, parentKey: any, pkg: any) {
      // 存储过程在单独展现，以及在程序包头和包体内，具备不同操作集
      const ACTION_GROUPS = {
        DEFAULT: [
          ['OVERVIEW_PROCEDURE', 'CREATE_PROCEDURE'],
          ['EDIT_PROCEDURE', 'COMPILE', 'DEBUG', 'EXEC'],
          ['EXPORT', 'DOWNLOAD'],
          ['DELETE_PROCEDURE', 'RENAME', 'REFRESH'],
        ],

        PACKAGE_HEAD: [['OVERVIEW', 'EDIT'], ['REFRESH']],
        PACKAGE_BODY: [['OVERVIEW'], ['EDIT', 'DEBUG', 'EXEC'], ['REFRESH']],
        TYPE: [['OVERVIEW_TYPE'], ['REFRESH']],
      };

      let actions = ACTION_GROUPS.DEFAULT;

      if (parentKey && parentKey.includes(':head:function')) {
        actions = ACTION_GROUPS.PACKAGE_HEAD;
      }

      if (parentKey && parentKey.includes(':body:function')) {
        actions = ACTION_GROUPS.PACKAGE_BODY;
      }

      if (node.rootType === plType.TYPE) {
        actions = ACTION_GROUPS.TYPE;
      }

      const r = {
        title: node.proName,
        status: renderPLStatusIcon(node),
        plStatus: node.status,
        key: `${parentKey || ''}:${node.proName}:${node.key}`,
        theme: THEME.PROCEDURE,
        type: plType.PROCEDURE,
        icon: (
          <Icon
            component={ProcedureSvg}
            style={{
              color: THEME.PROCEDURE,
            }}
          />
        ),

        actions,
        children: [],
      };

      const rKey = r.key;
      const data = { ...node, rootType: node.rootType };

      if (node.params && node.params.length) {
        r.children.push(TREE_NODES.PACKAGE_PARAM.getConfig(data, rKey, pkg));
      }

      if (node.types && node.types.length) {
        r.children.push(TREE_NODES.PACKAGE_TYPE.getConfig(data, rKey, pkg));
      }

      if (node.variables && node.variables.length) {
        r.children.push(TREE_NODES.PACKAGE_VARIBALE.getConfig(data, rKey, pkg));
      }
      /**
       * 这里后端数据有变化，两个都判断来防御一下
       */
      if (node.returnValue || node.returnType) {
        r.children.push(TREE_NODES.PACKAGE_RETURN_VALUE.getConfig(data, rKey, pkg));
      }

      return r;
    },
  },

  PACKAGE_TYPE: {
    getConfig(node: any, parentKey: any, pkg: any) {
      const key = `${parentKey || ''}:type`;
      const actions = getLeafActions(node);
      const children = node.types.map((type: any, index: number) =>
        TREE_NODES.PACKAGE_LEAF.getConfig(
          {
            title: `${type.typeName}:${type.typeVariable}`,
            key: type.typeName,
          },

          `${key}:${index}`,
          pkg,
        ),
      );

      return {
        title: formatMessage({
          id: 'workspace.tree.package.type',
        }),

        key,
        type: 'TYPE',
        icon: (
          <Icon
            component={PackageTypeSvg}
            style={{
              color: getNodeTheme(node),
            }}
          />
        ),

        actions,
        children,
      };
    },
  },

  PACKAGE_VARIBALE: {
    getConfig(node: any, parentKey: any, pkg: any, color?: string) {
      const key = `${parentKey}:varibale`;
      const actions = getLeafActions(node);
      const children = node.variables.map((varibale: any, index: number) =>
        TREE_NODES.PACKAGE_LEAF.getConfig(
          {
            title: `${varibale.varName}:${varibale.varType}`,
            key: varibale.varName,
          },

          `${key}:${index}`,
          pkg,
        ),
      );

      return {
        title: formatMessage({
          id: 'workspace.tree.package.program.varibale',
        }),

        key,
        type: 'VARIBALE',
        icon: (
          <InfoOutlined
            style={{
              color: color || getNodeTheme(node),
            }}
          />
        ),

        actions,
        children: children?.length ? children : null,
        isLeaf: children?.length ? false : true,
      };
    },
  },

  PACKAGE_PARAM: {
    getConfig(node: any, parentKey: any, pkg: any) {
      const key = `${parentKey}:param`;
      const actions = getLeafActions(node);
      const children = node.params.map((param: any, index: number) =>
        TREE_NODES.PACKAGE_LEAF.getConfig(
          {
            title: `${param.paramName}:${param.dataType}`,
            key: param.paramName,
          },

          `${key}:${index}`,
          pkg,
        ),
      );

      return {
        title: formatMessage({
          id: 'workspace.tree.package.param',
        }),

        key,
        type: 'PARAM',
        icon: (
          <Icon
            component={ParameterSvg}
            style={{
              color: getNodeTheme(node),
            }}
          />
        ),

        actions,
        children,
      };
    },
  },

  PACKAGE_RETURN_VALUE: {
    getConfig(node: any, parentKey: any, pkg: any) {
      const key = `${parentKey}:returnValue`;
      const actions = getLeafActions(node);
      const children = [
        TREE_NODES.PACKAGE_LEAF.getConfig(
          {
            title: node.returnType || node.returnValue,
            key: node.returnType || node.returnValue,
          },

          key,
          pkg,
        ),
      ];

      return {
        title: formatMessage({
          id: 'workspace.tree.package.program.returnValue',
        }),

        key,
        icon: (
          <NumberOutlined
            style={{
              color: getNodeTheme(node),
            }}
          />
        ),

        actions,
        children,
      };
    },
  },

  PACKAGE_LEAF: {
    getConfig(node: any, parentKey: any, pkg: any) {
      return {
        title: node.title,
        key: `${parentKey || ''}:${node.key}`,
        icon: node.icon || <span />,
        actions: [['REFRESH']],
        isLeaf: true,
      };
    },
  },

  TRIGGER: {
    getConfig(node: any) {
      return {
        title: node.triggerName,
        key: node.triggerName,
        status: renderPLStatusIcon(node),
        type: 'TRIGGER',
        isLeaf: true,
        icon: renderTriggerStatusIcon(node),
        iconStatus: node.enableState,
        actions: [
          ['OVERVIEW_TRIGGER', 'CREATE_TRIGGER'],
          ['EDIT_TRIGGER', 'COMPILE_TRIGGER', 'ENABLE_TRIGGER', 'DISABLE_TRIGGER'],
          ['EXPORT', 'DOWNLOAD'],
          ['DELETE_TRIGGER', 'REFRESH_TRIGGER'],
        ],
      };
    },
  },

  TYPE: {
    getConfig(node: any, parentKey: any, pkg: any) {
      const ACTION_GROUPS = {
        DEFAULT: [
          ['OVERVIEW_TYPE', 'CREATE_TYPE'],
          ['EDIT_TYPE', 'COMPILE_TYPE'],
          ['DOWNLOAD'],
          ['DELETE_TYPE', 'REFRESH'],
        ],
      };

      const actions = ACTION_GROUPS.DEFAULT;
      const r = {
        title: node.typeName,
        status: renderPLStatusIcon(node),
        plStatus: node.status,
        key: `${parentKey || ''}:${node.typeName}`,
        theme: THEME.PROCEDURE,
        type: plType.TYPE,
        icon: (
          <Icon
            component={TypeSvg}
            style={{
              color: THEME.TYPE,
            }}
          />
        ),

        actions,
        children: [],
      };

      const rKey = r.key;
      const data = node.typeDetail;

      if (isArray(data?.variables)) {
        r.children.push(
          TREE_NODES.PACKAGE_VARIBALE.getConfig(
            { ...data, rootType: plType.TYPE },
            rKey,
            pkg,
            THEME.TYPE,
          ),
        );
      }

      if (isArray(data?.functions) || isArray(data?.procedures)) {
        r.children.push(
          TREE_NODES.PACKAGE_PROGRAM.getConfig(
            { ...data, rootType: plType.TYPE },
            rKey,
            pkg,
            THEME.TYPE,
          ),
        );
      }

      return r;
    },
  },
};

export default TREE_NODES;

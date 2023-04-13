import { IDatabase, IProcedure } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';

import Icon, { FolderOpenFilled, InfoOutlined } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';

import ParameterSvg from '@/svgr/Parameter.svg';

import ProcedureSvg from '@/svgr/menuProcedure.svg';

const THEME = 'var(--icon-color-2)';

export function ProcedureTreeNodeData(
  proc: Partial<IProcedure>,
  dbSession: SessionStore,
  dbName: string,
  packageName?: string,
): TreeDataNode {
  const funcKey = `${packageName}-${dbName}-procedure-${proc.proName}`;
  let paramRoot: TreeDataNode;
  let variableRoot: TreeDataNode;

  if (proc.params?.length) {
    paramRoot = {
      title: '参数',
      key: `${funcKey}-param`,
      type: ResourceNodeType.ProcedureParamRoot,
      icon: (
        <Icon
          component={ParameterSvg}
          style={{
            color: THEME,
          }}
        />
      ),
      children: proc.params.map((p) => {
        return {
          title: p.paramName,
          key: `${funcKey}-param-${p.paramName}${p.seqNum}`,
          type: ResourceNodeType.ProcedureParam,
          isLeaf: true,
        };
      }),
    };
  }

  if (proc.variables?.length) {
    variableRoot = {
      title: '变量',
      key: `${funcKey}-variable`,
      icon: (
        <InfoOutlined
          style={{
            color: THEME,
          }}
        />
      ),
      type: ResourceNodeType.ProcedureVariableRoot,
      children: proc.variables.map((p) => {
        return {
          title: p.varName,
          key: `${funcKey}-variable-${p.varName}${p.varType}`,
          type: ResourceNodeType.ProcedureVariable,
          isLeaf: true,
        };
      }),
    };
  }

  return {
    title: proc.proName,
    key: funcKey,
    type: ResourceNodeType.Procedure,
    icon: (
      <Icon
        component={ProcedureSvg}
        style={{
          color: THEME,
        }}
      />
    ),
    sessionId: dbSession?.sessionId,
    packageName: packageName,
    data: proc,
    isLeaf: false,
    children: [paramRoot, variableRoot].filter(Boolean),
  };
}

export function ProcedureTreeData(
  dbSession: SessionStore,
  database: IDatabase,
  packageName: string = '',
): TreeDataNode {
  const dbName = database.name;
  const procedures = dbSession?.database?.procedures;
  const treeData: TreeDataNode = {
    title: '存储过程',
    key: `${packageName}-${dbName}-procedure`,
    type: ResourceNodeType.ProcedureRoot,
    data: database,
    icon: (
      <FolderOpenFilled
        style={{
          color: '#3FA3FF',
        }}
      />
    ),
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };

  if (procedures?.length) {
    treeData.children = procedures.map((proc) => {
      return ProcedureTreeNodeData(proc, dbSession, dbName, packageName);
    });
  }
  return treeData;
}

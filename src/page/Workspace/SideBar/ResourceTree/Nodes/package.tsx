import SessionStore from '@/store/sessionManager/session';
import PackageSvg from '@/svgr/menuPkg.svg';
import Icon, { InfoOutlined } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';
import { FunctionTreeNodeData } from './function';
import { ProcedureTreeNodeData } from './procedure';

import PackageHeadSvg from '@/svgr/Package-header.svg';

import PackageBodySvg from '@/svgr/Package-body.svg';

import { IDatabase } from '@/d.ts/database';
import ParameterSvg from '@/svgr/Parameter.svg';

const THEME = 'var(--icon-color-3)';

export function PackageTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;
  const packages = dbSession?.database?.packages;
  const treeData: TreeDataNode = {
    title: '程序包',
    key: `${database.id}-${dbName}-package`,
    type: ResourceNodeType.PackageRoot,
    data: database,
    sessionId: dbSession?.sessionId,
    isLeaf: false,
  };
  if (packages) {
    treeData.children = packages.map((pkg) => {
      const pkgKey = `${database.id}-${dbSession?.database?.packageVersion}-${dbName}-package-${pkg.packageName}`;

      const { packageHead, packageBody } = pkg;

      let headRoot: TreeDataNode, bodyRoot: TreeDataNode;

      if (packageHead) {
        let variablesRoot: TreeDataNode, programRoot: TreeDataNode;
        headRoot = {
          title: '包头',
          key: `${pkgKey}-head`,
          data: pkg,
          icon: (
            <Icon
              component={PackageHeadSvg}
              style={{
                color: THEME,
              }}
            />
          ),
          sessionId: dbSession?.sessionId,
          type: ResourceNodeType.PackageHead,
        };
        if (packageHead.variables?.length) {
          variablesRoot = {
            title: '变量',
            key: `${pkgKey}-head-variable`,
            type: ResourceNodeType.PackageHeadVariableRoot,
            icon: (
              <InfoOutlined
                style={{
                  color: THEME,
                }}
              />
            ),
            children: packageHead.variables?.map((v, i) => {
              return {
                title: `${v.varName}:${v.varType}`,
                key: `${pkgKey}-head-variable-${v.varName}-${v.varType}-${i}`,
                type: ResourceNodeType.PackageHeadVariable,
                isLeaf: true,
              };
            }),
          };
        }
        if (packageHead.functions?.length || packageHead.procedures?.length) {
          let functions = packageHead.functions || [];
          let procedures = packageHead.procedures || [];
          programRoot = {
            title: '子程序',
            key: `${pkgKey}-head-program`,
            type: ResourceNodeType.PackageHeadProgramRoot,
            data: pkg,
            icon: (
              <Icon
                component={ParameterSvg}
                style={{
                  color: THEME,
                }}
              />
            ),
            children: functions
              .map((func, i) => {
                return FunctionTreeNodeData(
                  func,
                  dbSession,
                  dbName,
                  `${pkgKey}-${i}`,
                  ResourceNodeType.PackageHeadFunction,
                );
              })
              .concat(
                procedures.map((proc, i) => {
                  return ProcedureTreeNodeData(
                    proc,
                    dbSession,
                    dbName,
                    `${pkgKey}-${i}`,
                    ResourceNodeType.PackageHeadProcedure,
                  );
                }),
              ),
          };
        }
        headRoot.children = [variablesRoot, programRoot].filter(Boolean);
      }

      if (packageBody) {
        let variablesRoot: TreeDataNode, programRoot: TreeDataNode;
        bodyRoot = {
          title: '包体',
          key: `${pkgKey}-body`,
          type: ResourceNodeType.PackageBody,
          sessionId: dbSession?.sessionId,
          data: pkg,
          icon: (
            <Icon
              component={PackageBodySvg}
              style={{
                color: THEME,
              }}
            />
          ),
        };
        if (packageBody.variables?.length) {
          variablesRoot = {
            title: '变量',
            key: `${pkgKey}-body-variable`,
            type: ResourceNodeType.PackageBodyVariableRoot,
            icon: (
              <InfoOutlined
                style={{
                  color: THEME,
                }}
              />
            ),
            children: packageBody.variables?.map((v, i) => {
              return {
                title: `${v.varName}:${v.varType}`,
                key: `${pkgKey}-body-variable-name${v.varName}-${v.varType}-${i}`,
                type: ResourceNodeType.PackageBodyVariable,
                isLeaf: true,
              };
            }),
          };
        }
        if (packageBody.functions?.length || packageBody.procedures?.length) {
          let functions = packageBody.functions || [];
          let procedures = packageBody.procedures || [];
          programRoot = {
            title: '子程序',
            key: `${pkgKey}-body-program`,
            type: ResourceNodeType.PackageBodyProgramRoot,
            icon: (
              <Icon
                component={ParameterSvg}
                style={{
                  color: THEME,
                }}
              />
            ),
            children: functions
              .map((func, i) => {
                return FunctionTreeNodeData(
                  func,
                  dbSession,
                  dbName,
                  pkgKey + '-body-' + i,
                  ResourceNodeType.PackageBodyFunction,
                  pkg,
                );
              })
              .concat(
                procedures.map((proc, i) => {
                  return ProcedureTreeNodeData(
                    proc,
                    dbSession,
                    dbName,
                    pkgKey + '-body-' + i,
                    ResourceNodeType.PackageBodyProcedure,
                    pkg,
                  );
                }),
              ),
          };
        }
        bodyRoot.children = [variablesRoot, programRoot].filter(Boolean);
      }

      let haveData = headRoot || bodyRoot;

      return {
        title: pkg.packageName,
        key: pkgKey,
        type: ResourceNodeType.Package,
        data: pkg,
        warning: pkg.status === 'INVALID' ? pkg.errorMessage : null,
        icon: (
          <Icon
            component={PackageSvg}
            style={{
              color: THEME,
            }}
          />
        ),
        sessionId: dbSession?.sessionId,
        isLeaf: false,
        children: haveData ? [headRoot, bodyRoot].filter(Boolean) : null,
      };
    });
  }

  return treeData;
}

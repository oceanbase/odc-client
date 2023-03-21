import { EnablePermission } from '@/constant';
import {
  actionTypes,
  IConnection,
  IConnectionType,
  IManagePagesKeys,
  IManagerResourceType as resourceTypes,
} from '@/d.ts';
import authStore, { AuthStore, AuthStoreContext } from '@/store/auth';
import connectionStore from '@/store/connection';
import { isString } from 'lodash';
import { observer } from 'mobx-react';
import React, { ReactElement, useContext } from 'react';

interface AcessParameter {
  // 'key value expression like resource_group:10',
  resourceIdentifier?: string;
  // 'query / create / update / delete / read / readandwrite'
  action: string;
}

interface AcessResult {
  accessible: boolean;
  systemPages?: Record<IManagePagesKeys, boolean>;
}

/**
 * 权限处理组件，children 参数为业务组件。当有权限时，会渲染业务组件，反之渲染 fallback 组件
 * 优先使用此组件
 */
const Acess = observer(
  (
    props: {
      fallback?: ReactElement;
      children?: ReactElement;
    } & AcessParameter,
  ) => {
    const { children, fallback = <NoAuth /> } = props;
    const { accessible } = useAcess(props);
    if (accessible) return children;
    return fallback;
  },
);

/**
 * hooks 获取权限信息
 */
function useAcess(permission: AcessParameter): AcessResult {
  const authState = useContext(AuthStoreContext);
  return getAcess(authState, permission);
}

/**
 * 高阶组件 获取权限信息
 */
function withAcess(permission: AcessParameter) {
  return function <P>(
    RenderComponent: React.ComponentType<P>,
  ): React.ComponentType<P & Partial<AcessResult>> {
    return observer((props: P) => {
      const authState = useAcess(permission);
      return <RenderComponent {...props} {...authState} />;
    });
  };
}

function isSubResource(parentResourceIdentifier: string, resourceIdentifier: string) {
  const [resourceType, resourceId] = parentResourceIdentifier?.split(':') ?? [];
  const [type, id] = resourceIdentifier?.split(':') ?? [];
  const isSameType = resourceType === type;
  if (resourceId === '*' || !resourceId) return isSameType;
  return isSameType && id === resourceId;
}

function getAcess(authState: AuthStore, permission: AcessParameter) {
  const { resourceIdentifier = '', action } = permission;
  if (!(isString(action) && isString(resourceIdentifier))) return { accessible: false };
  const { permissions } = authState;
  const hasPermission = permissions?.some((item) => {
    return isSubResource(item?.resourceType, resourceIdentifier) && item?.actions?.includes(action);
  });
  return {
    accessible: EnablePermission && hasPermission,
  };
}

function canAcess(permission: AcessParameter): AcessResult {
  return getAcess(authStore, permission);
}

function NoAuth(): JSX.Element {
  return null;
}

function createSystemPermission(
  resourceType: resourceTypes,
  action: actionTypes = actionTypes.read,
) {
  return {
    resourceIdentifier: `${resourceType}:*`,
    action,
  };
}

const systemReadPermissions = {
  // 资源管理权限
  [resourceTypes.public_connection]: createSystemPermission(resourceTypes.public_connection),
  [resourceTypes.resource_group]: createSystemPermission(resourceTypes.resource_group),
  [resourceTypes.user]: createSystemPermission(resourceTypes.user),
  [resourceTypes.role]: createSystemPermission(resourceTypes.role),
  // 系统操作权限
  [resourceTypes.flow_config]: createSystemPermission(resourceTypes.flow_config),
  [resourceTypes.odc_data_masking_rule]: createSystemPermission(
    resourceTypes.odc_data_masking_rule,
  ),
  [resourceTypes.odc_audit_event]: createSystemPermission(resourceTypes.odc_audit_event),
  [resourceTypes.auto_auth]: createSystemPermission(resourceTypes.auto_auth),
  [resourceTypes.system_config]: createSystemPermission(resourceTypes.system_config),
};

const systemUpdatePermissions = {
  // 资源管理权限
  [resourceTypes.public_connection]: createSystemPermission(
    resourceTypes.public_connection,
    actionTypes.update,
  ),
  [resourceTypes.resource_group]: createSystemPermission(
    resourceTypes.resource_group,
    actionTypes.update,
  ),
  [resourceTypes.user]: createSystemPermission(resourceTypes.user, actionTypes.update),
  [resourceTypes.role]: createSystemPermission(resourceTypes.role, actionTypes.update),
  // 系统操作权限
  [resourceTypes.flow_config]: createSystemPermission(
    resourceTypes.flow_config,
    actionTypes.update,
  ),
  [resourceTypes.odc_data_masking_rule]: createSystemPermission(
    resourceTypes.odc_data_masking_rule,
    actionTypes.update,
  ),
  [resourceTypes.odc_audit_event]: createSystemPermission(
    resourceTypes.odc_audit_event,
    actionTypes.update,
  ),
  [resourceTypes.auto_auth]: createSystemPermission(resourceTypes.auto_auth, actionTypes.update),
  [resourceTypes.system_config]: createSystemPermission(
    resourceTypes.system_config,
    actionTypes.update,
  ),
};

const systemCreatePermissions = {
  // 资源管理权限
  [resourceTypes.public_connection]: createSystemPermission(
    resourceTypes.public_connection,
    actionTypes.create,
  ),
  [resourceTypes.resource_group]: createSystemPermission(
    resourceTypes.resource_group,
    actionTypes.create,
  ),
  [resourceTypes.user]: createSystemPermission(resourceTypes.user, actionTypes.create),
  [resourceTypes.role]: createSystemPermission(resourceTypes.role, actionTypes.create),
};

const systemDeletePermissions = {
  // 资源管理权限
  [resourceTypes.public_connection]: createSystemPermission(
    resourceTypes.public_connection,
    actionTypes.delete,
  ),
  [resourceTypes.resource_group]: createSystemPermission(
    resourceTypes.resource_group,
    actionTypes.delete,
  ),
  [resourceTypes.user]: createSystemPermission(resourceTypes.user, actionTypes.delete),
  [resourceTypes.role]: createSystemPermission(resourceTypes.role, actionTypes.delete),
  // 系统操作权限
  [resourceTypes.flow_config]: createSystemPermission(
    resourceTypes.flow_config,
    actionTypes.delete,
  ),
  [resourceTypes.odc_data_masking_rule]: createSystemPermission(
    resourceTypes.odc_data_masking_rule,
    actionTypes.delete,
  ),
  [resourceTypes.odc_audit_event]: createSystemPermission(
    resourceTypes.odc_audit_event,
    actionTypes.delete,
  ),
  [resourceTypes.auto_auth]: createSystemPermission(resourceTypes.auto_auth, actionTypes.delete),
  [resourceTypes.system_config]: createSystemPermission(
    resourceTypes.system_config,
    actionTypes.delete,
  ),
};

/** 管控台入口权限控制 */
function withSystemAcess<P>(
  RenderComponent: React.ComponentType<P>,
): React.ComponentType<P & Partial<AcessResult>> {
  return observer((props: P) => {
    // 资源管理权限
    const { accessible: hasUser } = useAcess(systemReadPermissions[resourceTypes.user]);
    const { accessible: hasRole } = useAcess(systemReadPermissions[resourceTypes.role]);
    const { accessible: hasResourceGroup } = useAcess(
      systemReadPermissions[resourceTypes.resource_group],
    );
    const { accessible: hasPublicConnection } = useAcess(
      systemReadPermissions[resourceTypes.public_connection],
    );
    // 系统操作权限
    const { accessible: hasFlowConfig } = useAcess(
      systemReadPermissions[resourceTypes.flow_config],
    );
    const { accessible: hasDataMaskingRule } = useAcess(
      systemReadPermissions[resourceTypes.odc_data_masking_rule],
    );
    const { accessible: hasAuditEvent } = useAcess(
      systemReadPermissions[resourceTypes.odc_audit_event],
    );
    const { accessible: hasAutoAuth } = useAcess(systemReadPermissions[resourceTypes.auto_auth]);
    const { accessible: hasSystemConfig } = useAcess(
      systemReadPermissions[resourceTypes.system_config],
    );

    const accessibleResourceManagement = [hasUser, hasRole, hasResourceGroup, hasPublicConnection];
    const accessibleSystemOperation = [
      hasFlowConfig,
      hasDataMaskingRule,
      hasAuditEvent,
      hasAutoAuth,
      hasSystemConfig,
    ];
    const accessible = [...accessibleResourceManagement, ...accessibleSystemOperation]?.some(
      (accessible) => accessible,
    );
    const systemPages = {
      // 资源管理
      [IManagePagesKeys.INDEX]: hasUser,
      [IManagePagesKeys.USER]: hasUser,
      [IManagePagesKeys.ROLE]: hasRole,
      [IManagePagesKeys.CONNECTION]: hasPublicConnection,
      [IManagePagesKeys.RESOURCE]: hasResourceGroup,
      // 系统操作
      [IManagePagesKeys.TASK_FLOW]: hasFlowConfig,
      [IManagePagesKeys.MASK_DATA]: hasDataMaskingRule,
      [IManagePagesKeys.SECURITY_AUDIT]: hasAuditEvent,
      [IManagePagesKeys.SYSTEM_CONFIG]: hasSystemConfig,
    };
    return <RenderComponent {...props} accessible={accessible} systemPages={systemPages} />;
  });
}

/** 工作台权限控制组件 */
function withWorkspaceAcess(action: actionTypes) {
  return function <P>(
    RenderComponent: React.ComponentType<P>,
  ): React.ComponentType<P & Partial<AcessResult>> {
    return observer((props: P) => {
      const { connection } = connectionStore;
      const { accessible: hasWorkspaceAcess } = useAcess({
        action,
        resourceIdentifier: `${resourceTypes.workspace}:${connection.sid}`,
      });
      // 个人链接，无权限限制
      if (connection.visibleScope === IConnectionType.PRIVATE) {
        return <RenderComponent {...props} accessible={true} />;
      }
      return <RenderComponent {...props} accessible={hasWorkspaceAcess} />;
    });
  };
}

const withWorkspaceCreateAcess = withWorkspaceAcess(actionTypes.create);

type WorkspaceAcessProps = {
  fallback?: ReactElement;
  action: actionTypes;
  children: ReactElement;
};

const WorkspaceAcess = ({ fallback = <NoAuth />, children, action }: WorkspaceAcessProps) => {
  const Render = withWorkspaceAcess(action)((props: any) => {
    if (props.accessible) return children;
    return fallback;
  });
  return <Render />;
};

const canAcessWorkspace = (action: actionTypes, connectionType: IConnectionType): boolean => {
  if (!action) return true;
  return canAcess({
    resourceIdentifier: `${resourceTypes.workspace}:${connectionStore.connection.sid}`,
    action,
  }).accessible;
};
// 写权限
export function hasSourceWriteAuth(auths: string[] = []) {
  return auths?.includes('connect');
}
// 只读权限
export function hasSourceReadAuth(auths: string[] = []) {
  return auths?.includes('readonlyconnect') && !hasSourceWriteAuth(auths);
}
// 公共只读连接
export function isReadonlyPublicConnection(connection: Partial<IConnection>) {
  return (
    connection?.visibleScope === IConnectionType.ORGANIZATION &&
    hasSourceReadAuth(connection?.permittedActions)
  );
}

export {
  Acess,
  useAcess,
  canAcess,
  withAcess,
  withSystemAcess,
  resourceTypes,
  actionTypes,
  withWorkspaceCreateAcess,
  AcessResult,
  canAcessWorkspace,
  WorkspaceAcess,
  systemUpdatePermissions,
  systemDeletePermissions,
  systemReadPermissions,
  systemCreatePermissions,
};

import {
  actionTypes,
  IConnection,
  IManagePagesKeys,
  IManagerResourceType,
  IManagerResourceType as resourceTypes,
} from '@/d.ts';
import authStore, { AuthStore, AuthStoreContext } from '@/store/auth';
import { isString } from 'lodash';
import { observer } from 'mobx-react';
import { ReactElement, useContext } from 'react';

interface AcessParameter {
  // 'key value expression like project:10',
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
 * 存在一个权限，就可以返回
 */
const AcessMultiPermission = observer(
  (props: { fallback?: ReactElement; children?: ReactElement; permissions: AcessParameter[] }) => {
    const { children, permissions, fallback = <NoAuth /> } = props;
    const results = useMultiAcess(props.permissions);
    if (results?.find((item) => item.accessible)) return children;
    return fallback;
  },
);

/**
 * 存在指定资源类型的权限，就能返回
 * 和 AcessMultiPermission 需要精确匹配一个资源不同，这个只会检查是否有该资源类型的权限。
 */
const AccessResourceTypePermission = observer(
  (props: { fallback?: ReactElement; children?: ReactElement; permissions: AcessParameter[] }) => {
    const { children, permissions, fallback = <NoAuth /> } = props;
    const authState = useContext(AuthStoreContext);
    const isExist = !!permissions.find(({ resourceIdentifier, action }) => {
      const [resourceType, resourceId] = resourceIdentifier?.split(':') ?? [];
      const resourceIds = authState.getResourceByAction(
        resourceType as IManagerResourceType,
        action as actionTypes,
      );
      return !!resourceIds?.length;
    });
    if (isExist) return children;
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
 * hooks 获取权限信息
 */
function useMultiAcess(permissions: AcessParameter[]): AcessResult[] {
  const authState = useContext(AuthStoreContext);
  return permissions?.map((p) => getAcess(authState, p));
}

/**
 * 获取指定的资源是否有权限
 */
function getAcess(authState: AuthStore, permission: AcessParameter) {
  const { resourceIdentifier = '', action } = permission;
  if (!(isString(action) && isString(resourceIdentifier))) return { accessible: false };
  const [resourceType, resourceId] = resourceIdentifier?.split(':') ?? [];
  const actions = authState.getResourceActions(resourceId, resourceType as IManagerResourceType);
  return {
    accessible: actions.has(action as actionTypes),
  };
}

function canAcess(permission: AcessParameter): AcessResult {
  return getAcess(authStore, permission);
}

function NoAuth(): JSX.Element {
  return null;
}

function createPermission(
  resourceType: resourceTypes,
  action: actionTypes = actionTypes.read,
  resourceId?: any,
) {
  return {
    resourceIdentifier: `${resourceType}:${resourceId ?? '*'}`,
    action,
  };
}

const systemUpdatePermissions = {
  // 资源管理权限
  [resourceTypes.resource]: createPermission(resourceTypes.resource, actionTypes.update),
  [resourceTypes.project]: createPermission(resourceTypes.project, actionTypes.update),
  [resourceTypes.user]: createPermission(resourceTypes.user, actionTypes.update),
  [resourceTypes.role]: createPermission(resourceTypes.role, actionTypes.update),
  // 系统操作权限
  [resourceTypes.flow_config]: createPermission(resourceTypes.flow_config, actionTypes.update),
  [resourceTypes.odc_audit_event]: createPermission(
    resourceTypes.odc_audit_event,
    actionTypes.update,
  ),
  [resourceTypes.auto_auth]: createPermission(resourceTypes.auto_auth, actionTypes.update),
  [resourceTypes.integration]: createPermission(resourceTypes.integration, actionTypes.update),
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
  return hasSourceReadAuth(connection?.permittedActions);
}

export {
  Acess,
  AcessMultiPermission,
  AccessResourceTypePermission,
  canAcess,
  actionTypes,
  systemUpdatePermissions,
  createPermission,
};

import { EnablePermission } from '@/constant';
import {
  actionTypes,
  IConnection,
  IManagePagesKeys,
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
 * hooks 获取权限信息
 */
function useAcess(permission: AcessParameter): AcessResult {
  const authState = useContext(AuthStoreContext);
  return getAcess(authState, permission);
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

const systemUpdatePermissions = {
  // 资源管理权限
  [resourceTypes.resource]: createSystemPermission(resourceTypes.resource, actionTypes.update),
  [resourceTypes.project]: createSystemPermission(resourceTypes.project, actionTypes.update),
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
  [resourceTypes.integration]: createSystemPermission(
    resourceTypes.integration,
    actionTypes.update,
  ),
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

export { Acess, useAcess, canAcess, actionTypes, systemUpdatePermissions };

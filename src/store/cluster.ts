/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getClusterAndTenantList } from '@/common/network/connection';
import { getOBCloudClusterList, getOBCloudUserListByTenant } from '@/common/network/obcloud';
import type { IConnectionType } from '@/d.ts';
import { haveOCP } from '@/util/env';
import { action, observable } from 'mobx';
import React from 'react';

export interface ICluster {
  instanceName: string | React.ReactNode;
  instanceId?: string;
  vpcId?: string;
  version?: string;
  type: 'CLUSTER' | 'MYSQL_TENANT' | 'ORACLE_TENANT' | 'MYSQL_SERVERLESS' | 'ORACLE_SERVERLESS';
  status: 'ONLINE' | 'OTHERS';
}

export interface ITenant {
  tenantName: string | React.ReactNode;
  tenantId?: string;
  tenantCpu?: number;
  tenantMemory?: number;
  tenantMode?: 'MySQL' | 'ORACLE';
  tenantUnitNum?: number;
}

interface ICloudDBUser {
  userName: string;
  userType: 'Admin' | 'Normal';
}

const ODC_DEFAULT_CLUSTER_ID = 'ODC_DEFAULT_CLUSTER_ID';
export class ClusterStore {
  @observable.shallow
  public clusterList: ICluster[] = [];

  @observable.shallow
  public tenantListMap: Record<ICluster['instanceId'], ITenant[]> = {};

  @observable.shallow
  public userListMap: Record<ITenant['tenantId'], ICloudDBUser[]> = {};

  @action
  public async loadClusterList(visibleScope?: IConnectionType) {
    if (haveOCP()) {
      const result = await getOBCloudClusterList();
      if (result) {
        let newTenantMap = { ...this.tenantListMap };
        this.clusterList = result.map((item) => {
          switch (item.type) {
            case 'CLUSTER': {
              newTenantMap[item.id] = item.tenants?.map((tenant) => {
                return {
                  tenantName: tenant.name,
                  tenantId: tenant.id,
                  tenantMode: tenant.tenantMode,
                };
              });
              break;
            }
            default: {
              let tenants = newTenantMap[item.id] || [];
              tenants.push({
                tenantName: item.name,
                tenantId: item.id,
                tenantMode: ['MYSQL_TENANT', 'MYSQL_SERVERLESS'].includes(item.type)
                  ? 'MySQL'
                  : 'ORACLE',
              });
              newTenantMap[item.id] = tenants;
              break;
            }
          }
          return {
            instanceName: item.name,
            instanceId: item.id,
            type: item.type,
            status: item.state,
          };
        });
        this.tenantListMap = newTenantMap;
      }
    } else {
      const res = await getClusterAndTenantList(visibleScope);
      if (res) {
        this.clusterList = res?.clusterName?.distinct?.map((name) => {
          return {
            instanceName: name,
            instanceId: name,
            type: 'CLUSTER',
            status: 'ONLINE',
          };
        });

        this.tenantListMap = res?.tenantName?.distinct?.reduce(
          (map, name) => {
            map[ODC_DEFAULT_CLUSTER_ID].push({
              tenantId: name,
              tenantName: name,
            });
            return map;
          },
          { [ODC_DEFAULT_CLUSTER_ID]: [] },
        );
      }
    }
  }

  @action
  public async loadClusterTenants(clusterId: string) {
    if (haveOCP()) {
      // const tenants = await getOBCloudTenantListByCluster(clusterId);
      // if (tenants) {
      //   this.tenantListMap = {
      //     ...this.tenantListMap,
      //     [clusterId]: (tenants || []).map((item) => ({
      //       tenantName: item.name,
      //       tenantId: item.id,
      //       tenantMode: item.tenantMode,
      //     })),
      //   };
      // }
    }
  }

  @action
  public async loadTenantDBUsers(clusterId: string, tenantId: string) {
    if (haveOCP()) {
      const res = await getOBCloudUserListByTenant(clusterId, tenantId);
      if (res) {
        this.userListMap = {
          ...this.userListMap,
          [tenantId]: res,
        };
      }
    }
  }
}

export default new ClusterStore();

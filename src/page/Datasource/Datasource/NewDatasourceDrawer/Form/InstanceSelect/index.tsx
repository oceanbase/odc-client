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

import { ConnectType } from '@/d.ts';
import { ClusterStore } from '@/store/cluster';
import { formatMessage } from '@/util/intl';
import { Cascader, Form, Input, Space, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import DatasourceFormContext from '../context';

interface IProps {
  disabled?: boolean;
  clusterStore?: ClusterStore;
}

const RefInput = forwardRef<any, any>(function ({ value, onChange }, ref) {
  useImperativeHandle(
    ref,
    () => {
      return {
        onChange(v) {
          return onChange?.(v);
        },
      };
    },
    [onChange],
  );

  return <Input disabled style={{ display: 'none' }} value={value} onChange={onChange} />;
});

const InstanceSelect: React.FC<IProps> = function ({ clusterStore, disabled }) {
  const { clusterList, tenantListMap } = clusterStore;
  const clusterRef = useRef<any>();
  const tenantRef = useRef<any>();
  const { form } = useContext(DatasourceFormContext);

  useEffect(() => {
    clusterStore.loadClusterList();
  }, []);

  const options = useMemo(() => {
    let result = [];

    clusterList
      .filter((c) => c.status === 'ONLINE')
      .forEach((cluster) => {
        const tenants = tenantListMap[cluster.instanceId];
        if (cluster.type !== 'CLUSTER') {
          result.push({
            value: cluster.instanceId,
            label: cluster.instanceName,
            isLeaf: true,
          });
        } else {
          result.push({
            value: cluster.instanceId,
            label: cluster.instanceName,
            isLeaf: false,
            children: tenants?.map((tenant) => ({
              value: tenant.tenantId,
              label: tenant.tenantName,
            })),
          });
        }
      });
    return result;
  }, [clusterList, tenantListMap]);

  return (
    <>
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const mode = getFieldValue('type');
          const clusterName = getFieldValue('clusterName');
          let modeText = '';
          if (clusterName) {
            modeText =
              formatMessage({ id: 'odc.cloud.InstanceSelect.Mode' }) + //`模式：`
              (mode === ConnectType.OB_MYSQL ? 'MySQL' : 'Oracle');
          }
          return (
            <Form.Item help={modeText} shouldUpdate>
              {({ getFieldValue, getFieldsError }) => {
                const cluster = getFieldValue('clusterName');
                const tenant = getFieldValue('tenantName');
                const haveError = !!getFieldsError(['clusterName', 'tenantName'])
                  ?.map((e) => e.errors?.length)
                  .filter(Boolean)?.length;
                let innerValue = [];
                if (clusterList.find((c) => c.instanceId === tenant)) {
                  /**
                   * 租户实例的情况下，去除cluster
                   */
                  innerValue = [tenant].filter(Boolean);
                } else {
                  innerValue = [cluster, tenant].filter(Boolean);
                }
                function onChange({ tenantId, cluster }) {
                  const tenantMode = tenantListMap[cluster]?.find((t) => t.tenantId === tenantId)
                    ?.tenantMode;
                  form?.setFieldsValue({
                    clusterName: cluster,
                    tenantName: tenantId,
                    type: tenantMode === 'MySQL' ? ConnectType.OB_MYSQL : ConnectType.OB_ORACLE,
                    username: null,
                    password: '',
                  });
                }
                return (
                  <Space style={{ width: '100%' }} direction="vertical">
                    <Cascader
                      showSearch={{
                        filter: (inputValue, path) => {
                          return path.some(
                            (option) =>
                              (option.label as string)
                                .toLowerCase()
                                .indexOf(inputValue.toLowerCase()) > -1,
                          );
                        },
                      }}
                      options={options}
                      disabled={disabled}
                      value={innerValue}
                      loadData={(selectedOptions) => {
                        const clusterId = selectedOptions?.[0]?.value as string;
                        if (clusterId) {
                          clusterStore.loadClusterTenants(clusterId);
                        }
                      }}
                      onChange={(v) => {
                        if (!v) {
                          onChange({
                            tenantId: null,
                            cluster: null,
                          });

                          return;
                        }
                        let cluster, tenant;
                        if (v.length === 1) {
                          cluster = v[0];
                          tenant = v[0];
                        } else {
                          cluster = v[0];
                          tenant = v[1];
                        }
                        onChange({
                          cluster,
                          tenantId: tenant,
                        });

                        clusterStore.loadTenantDBUsers(cluster, tenant);
                      }}
                    />

                    {haveError ? (
                      <Typography.Text type="danger">
                        {
                          formatMessage({
                            id: 'odc.cloud.InstanceSelect.SelectAConnectionInstance',
                          }) /*请选择连接实例*/
                        }
                      </Typography.Text>
                    ) : null}
                  </Space>
                );
              }}
            </Form.Item>
          );
        }}
      </Form.Item>
      <Form.Item rules={[{ required: true, message: '' }]} name="clusterName" noStyle>
        <RefInput ref={clusterRef} />
      </Form.Item>
      <Form.Item rules={[{ required: true, message: '' }]} name="tenantName" noStyle>
        <RefInput ref={tenantRef} />
      </Form.Item>
    </>
  );
};

export default inject('clusterStore')(observer(InstanceSelect));

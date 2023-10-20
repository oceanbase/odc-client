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

import { getConnectionList } from '@/common/network/connection';
import { listDatabases } from '@/common/network/database';
import { listSensitiveRules } from '@/common/network/sensitiveRule';
import ProjectContext from '@/page/Project/ProjectContext';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';
import { formatMessage } from '@/util/intl';
import { Button, Divider, Form, Select } from 'antd';
import { useContext, useEffect, useState } from 'react';
import SensitiveContext from '../../../SensitiveContext';
import HelpDoc from '@/component/helpDoc';
import { ProjectRole } from '@/d.ts/project';
import { projectRoleTextMap } from '@/page/Project/User';
const ScanRule = ({ formRef, reset, setManageSensitiveRuleDrawerOpen }) => {
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const [dataSourceId, setDataSourceId] = useState<number>(-1);
  const [databaseId, setDatabaseId] = useState<number>(0);
  const [selectOpen, setSelectOpen] = useState<boolean>(false);
  const [dataSourceOptions, setDataSourceOptions] = useState<SelectItemProps[]>([]);
  const [databaseIdsOptions, setDatabaseIdsOptions] = useState<SelectItemProps[]>([]);
  const [sensitiveOptions, setSensitiveOptions] = useState<SelectItemProps[]>([]);
  const initDataSources = async () => {
    const rawData = await getConnectionList({
      projectId: sensitiveContext.projectId,
    });
    const resData = rawData?.contents?.map((content) => ({
      label: content.name,
      value: content.id,
    }));
    setDataSourceOptions(resData);
  };
  const initDatabases = async (
    projectId: number = context.projectId,
    id: number = dataSourceId,
  ) => {
    const rawData = await listDatabases(projectId, id);
    const resData =
      rawData?.contents?.map((content) => ({
        label: content.name,
        value: content.id,
      })) || [];
    setDatabaseIdsOptions(
      resData?.length > 0
        ? [
            {
              label: formatMessage({
                id: 'odc.SensitiveColumn.components.SacnRule.All',
              }),
              //全部
              value: -1,
            },
            ...resData,
          ]
        : [],
    );
    formRef.setFieldsValue({
      databaseIds: [],
      sensitiveRuleIds: [],
    });
  };
  const initDetectRules = async (projectId: number = context.projectId) => {
    const rawData = await listSensitiveRules(projectId, {
      enabled: [true],
    });
    const resData = rawData?.contents?.map((content) => ({
      label: content.name,
      value: content.id,
    }));
    setSensitiveOptions(
      resData?.length > 0
        ? [
            {
              label: formatMessage({
                id: 'odc.SensitiveColumn.components.SacnRule.All',
              }),
              //全部
              value: -1,
            },
            ...resData,
          ]
        : [],
    );
  };
  const handleDataSourceIdChange = async (v: number) => {
    setDataSourceId(v);
    reset();
    setDatabaseId(0);
  };
  const handleDatabaseIdsSelect = async (value: number) => {
    if (value === -1) {
      await formRef.setFieldsValue({
        databaseIds: [-1],
      });
    } else {
      const databaseIds = (await formRef.getFieldValue('databaseIds')) || [];
      if (databaseIds.includes(-1)) {
        await formRef.setFieldsValue({
          databaseIds: databaseIds.filter((v) => v != -1),
        });
      }
    }
    reset();
    setDatabaseId(value);
  };
  const handleSensitiveRuleIdsSelect = async (value: number) => {
    if (value === -1) {
      await formRef.setFieldsValue({
        sensitiveRuleIds: [-1],
      });
    } else {
      const sensitiveRuleIds = (await formRef.getFieldValue('sensitiveRuleIds')) || [];
      if (sensitiveRuleIds.includes(-1)) {
        await formRef.setFieldsValue({
          sensitiveRuleIds: sensitiveRuleIds.filter((v) => v != -1),
        });
      }
    }
    reset();
  };
  useEffect(() => {
    initDataSources();
    initDetectRules();
  }, []);
  useEffect(() => {
    if (dataSourceId !== -1) {
      initDatabases(context.projectId, dataSourceId);
    }
  }, [dataSourceId]);
  return (
    <div
      style={{
        display: 'flex',
        columnGap: '8px',
      }}
    >
      <Form.Item
        label={
          formatMessage({
            id: 'odc.SensitiveColumn.components.SacnRule.DataSource',
          }) //数据源
        }
        name="connectionId"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.SelectADataSource',
            }), //请选择数据源
          },
        ]}
      >
        <Select
          options={dataSourceOptions}
          onChange={handleDataSourceIdChange}
          placeholder={
            formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.PleaseSelect',
            }) //请选择
          }
          maxTagCount="responsive"
          style={{
            width: '170px',
          }}
        ></Select>
      </Form.Item>
      <Form.Item
        label={
          formatMessage({
            id: 'odc.SensitiveColumn.components.SacnRule.Database',
          }) //数据库
        }
        name="databaseIds"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.SelectADatabase',
            }), //请选择数据库
          },
        ]}
      >
        <Select
          mode="multiple"
          options={databaseIdsOptions}
          // onChange={handleDatabaseIdsChange}
          onSelect={handleDatabaseIdsSelect}
          placeholder={
            formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.PleaseSelect',
            }) //请选择
          }
          maxTagCount="responsive"
          disabled={
            databaseIdsOptions?.length === 1 ||
            dataSourceOptions?.length === 0 ||
            dataSourceId === -1
          }
          style={{
            width: '262px',
          }}
        />
      </Form.Item>
      <Form.Item
        label={
          formatMessage({
            id: 'odc.SensitiveColumn.components.SacnRule.IdentificationRules',
          }) //识别规则
        }
        tooltip={'可通过路径、正则或Groovy任意一种识别方式，进行脚本批量选择列'}
        name="sensitiveRuleIds"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.SelectAnIdentificationRule',
            }), //请选择识别规则
          },
        ]}
      >
        <Select
          mode="multiple"
          options={sensitiveOptions}
          onSelect={handleSensitiveRuleIdsSelect}
          disabled={
            databaseIdsOptions?.length === 1 || sensitiveOptions?.length === 1 || databaseId === 0
          }
          maxTagCount="responsive"
          placeholder={
            formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.PleaseSelect',
            }) //请选择
          }
          style={{
            width: '244px',
          }}
          open={selectOpen}
          onDropdownVisibleChange={(visible) => {
            initDetectRules();
            setSelectOpen(visible);
          }}
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider
                style={{
                  margin: '0px 0',
                }}
              />
              <Button
                type="link"
                block
                style={{
                  textAlign: 'left',
                }}
                onClick={() => {
                  setSelectOpen(false);
                  setManageSensitiveRuleDrawerOpen(true);
                }}
              >
                {
                  formatMessage({
                    id:
                      'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ManagementRecognitionRules.1',
                  }) /* 
                管理识别规则
               */
                }
              </Button>
            </>
          )}
        />
      </Form.Item>
    </div>
  );
};
export default ScanRule;

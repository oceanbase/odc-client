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

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import { getConnectionList } from '@/common/network/connection';
import { listSensitiveRules } from '@/common/network/sensitiveRule';
import ConnectionPopover from '@/component/ConnectionPopover';
import { IConnection, IResponseData } from '@/d.ts';
import ProjectContext from '@/page/Project/ProjectContext';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Button, Divider, Form, Popover, Select } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import { useContext, useEffect, useState } from 'react';
import SensitiveContext from '../../../SensitiveContext';
import MultipleDatabaseSelect from '@/component/Task/component/MultipleDatabaseSelect/index';
import { isConnectTypeBeFileSystemGroup } from '@/util/database/connection';

const ScanRule = ({ formRef, reset, setManageSensitiveRuleDrawerOpen }) => {
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const [dataSourceId, setDataSourceId] = useState<number>(-1);
  const databaseIds = useWatch('databaseIds', formRef);
  const [selectOpen, setSelectOpen] = useState<boolean>(false);
  const [dataSourceOptions, setDataSourceOptions] = useState<SelectItemProps[]>([]);
  const [sensitiveOptions, setSensitiveOptions] = useState<SelectItemProps[]>([]);
  const [rawData, setRawData] = useState<IResponseData<IConnection>>();
  const initDataSources = async () => {
    const rawData = await getConnectionList({
      projectId: sensitiveContext.projectId,
    });
    setRawData(rawData);
    const resData = rawData?.contents
      ?.filter((item) => !isConnectTypeBeFileSystemGroup(item.type))
      ?.map((content) => ({
        label: content.name,
        value: content.id,
        type: content.type,
      }));
    setDataSourceOptions(resData);
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
                defaultMessage: '全部',
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
  };
  const handleSelect = async (Ids) => {
    await formRef.setFieldsValue({
      databaseIds: Ids,
    });
    reset();
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
      formRef.setFieldsValue({
        databaseIds: [],
        sensitiveRuleIds: [],
      });
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
        label={formatMessage({
          id: 'odc.SensitiveColumn.components.SacnRule.DataSource',
          defaultMessage: '数据源',
        })}
        name="connectionId"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.SelectADataSource',
              defaultMessage: '请选择数据源',
            }),
          },
        ]}
      >
        <Select
          showSearch
          onChange={handleDataSourceIdChange}
          placeholder={formatMessage({
            id: 'odc.SensitiveColumn.components.SacnRule.PleaseSelect',
            defaultMessage: '请选择',
          })}
          maxTagCount="responsive"
          style={{ width: 170 }}
          filterOption={(input, option) => {
            return (
              // @ts-ignore
              option.children?.props?.children?.[1]?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
          }}
        >
          {dataSourceOptions.map((option, index) => {
            const icon = getDataSourceStyleByConnectType(option.type);
            const connection = rawData?.contents?.find((item) => item.id === option.value);
            return (
              <Select.Option key={index} value={option.value}>
                <Popover
                  overlayStyle={{ zIndex: 10000 }}
                  placement="right"
                  content={<ConnectionPopover connection={connection} showType={false} />}
                >
                  <Icon
                    component={icon?.icon?.component}
                    style={{
                      color: icon?.icon?.color,
                      fontSize: 16,
                      marginRight: 4,
                    }}
                  />
                  {option.label}
                </Popover>
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
      <MultipleDatabaseSelect
        name="databaseIds"
        label={
          formatMessage({
            id: 'odc.SensitiveColumn.components.SacnRule.Database',
            defaultMessage: '数据库',
          }) //数据库
        }
        dataSourceId={dataSourceId === -1 ? undefined : dataSourceId}
        projectId={context.projectId}
        onSelect={handleSelect}
        disabled={dataSourceId === -1}
        isAdaptiveWidth
      />
      <Form.Item
        label={
          formatMessage({
            id: 'odc.SensitiveColumn.components.SacnRule.IdentificationRules',
            defaultMessage: '识别规则',
          }) //识别规则
        }
        tooltip={
          formatMessage({
            id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.YouCanUseThePath',
            defaultMessage: '可通过路径、正则或 Groovy 任意一种识别方式，进行脚本批量选择列',
          }) //'可通过路径、正则或Groovy任意一种识别方式，进行脚本批量选择列'
        }
        name="sensitiveRuleIds"
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.SelectAnIdentificationRule',
              defaultMessage: '请选择识别规则',
            }), //请选择识别规则
          },
        ]}
      >
        <Select
          mode="multiple"
          options={sensitiveOptions}
          onSelect={handleSensitiveRuleIdsSelect}
          disabled={
            dataSourceId === -1 || databaseIds?.length === 0 || sensitiveOptions?.length === 1
          }
          maxTagCount="responsive"
          placeholder={
            formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.PleaseSelect',
              defaultMessage: '请选择',
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
                    id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ManagementRecognitionRules.1',
                    defaultMessage: '\n                管理识别规则\n              ',
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

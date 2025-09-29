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
import { IConnection, IResponseData, ConnectType } from '@/d.ts';
import { SensitiveRuleType } from '@/d.ts/sensitiveRule';
import ProjectContext from '@/page/Project/ProjectContext';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';
import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Button, Divider, Form, Popover, Radio, Select } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import { useContext, useEffect, useState } from 'react';
import SensitiveContext from '../../../SensitiveContext';
import MultipleDatabaseSelect from '@/component/Task/component/MultipleDatabaseSelect/index';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';
import { isAIAvailable } from '@/common/network/ai';

const ScanRule = ({ formRef, reset, setManageSensitiveRuleDrawerOpen }) => {
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const [dataSourceId, setDataSourceId] = useState<number>(-1);
  const databaseIds = useWatch('databaseIds', formRef);
  const scanningMode = useWatch('scanningMode', formRef);
  const connectionId = useWatch('connectionId', formRef);
  const [selectOpen, setSelectOpen] = useState<boolean>(false);
  const [dataSourceOptions, setDataSourceOptions] = useState<SelectItemProps[]>([]);
  const [sensitiveOptions, setSensitiveOptions] = useState<SelectItemProps[]>([]);
  const [rawData, setRawData] = useState<IResponseData<IConnection>>();
  const [aiAvailable, setAiAvailable] = useState<boolean>(true);
  // 检查AI功能状态
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const available = await isAIAvailable();
        setAiAvailable(available);

        // 如果AI不可用且当前选择的是AI增强识别，自动切换到传统规则识别
        if (!available && scanningMode === 'JOINT_RECOGNITION') {
          await formRef.setFieldsValue({
            scanningMode: 'RULES_ONLY',
          });
        }
      } catch (error) {
        console.warn('检查AI状态失败:', error);
        setAiAvailable(false);

        // AI检查失败时也切换到传统规则识别
        if (scanningMode === 'JOINT_RECOGNITION') {
          await formRef.setFieldsValue({
            scanningMode: 'RULES_ONLY',
          });
        }
      }
    };
    checkAIStatus();
  }, []);

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

    // 根据扫描模式禁用相应的规则类型
    const resData = rawData?.contents?.map((content) => ({
      label: content.name,
      value: content.id,
      disabled: scanningMode === 'RULES_ONLY' && content.type === SensitiveRuleType.AI,
      type: content.type, // 保存类型信息用于后续判断
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

  const handleScanningModeChange = async () => {
    // 重新加载规则列表
    await initDetectRules();

    const currentValues = formRef.getFieldValue('sensitiveRuleIds') || [];
    let filteredValues = currentValues;

    // 如果切换到传统规则识别模式，需要移除已选择的AI规则
    if (scanningMode === 'RULES_ONLY') {
      filteredValues = currentValues.filter((id) => {
        const option = sensitiveOptions.find((opt) => opt.value === id);
        return option && (!option.type || option.type !== SensitiveRuleType.AI);
      });
    }

    if (filteredValues.length !== currentValues.length) {
      await formRef.setFieldsValue({
        sensitiveRuleIds: filteredValues,
      });
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

  useEffect(() => {
    if (scanningMode) {
      handleScanningModeChange();
    }
  }, [scanningMode]);

  useEffect(() => {
    if (connectionId) {
      setDataSourceId(connectionId);
    } else {
      setDataSourceId(-1);
    }
  }, [connectionId]);

  return (
    <div>
      {/* 第一行：数据源和数据库选择 */}
      <div
        style={{
          display: 'flex',
          columnGap: '8px',
          marginBottom: '16px',
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
                option.children?.props?.children?.[1]?.toLowerCase().indexOf(input.toLowerCase()) >=
                0
              );
            }}
          >
            {dataSourceOptions.map((option, index) => {
              const icon = getDataSourceStyleByConnectType(option.type as ConnectType);
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
      </div>

      {/* 第二行：扫描模式 */}
      <div
        style={{
          marginBottom: '16px',
        }}
      >
        <Form.Item
          label={formatMessage({
            id: 'odc.SensitiveColumn.components.SacnRule.ScanningMode',
            defaultMessage: '扫描模式',
          })}
          name="scanningMode"
          initialValue="RULES_ONLY"
          tooltip={formatMessage({
            id: 'odc.SensitiveColumn.components.SacnRule.ScanningModeTooltip',
            defaultMessage:
              '传统规则识别：仅使用路径、正则、Groovy规则；AI增强识别：结合AI和传统规则进行识别',
          })}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.SensitiveColumn.components.SacnRule.SelectScanningMode',
                defaultMessage: '请选择扫描模式',
              }),
            },
          ]}
        >
          <Radio.Group>
            <Radio value="RULES_ONLY">
              {formatMessage({
                id: 'odc.SensitiveColumn.components.SacnRule.TraditionalRules',
                defaultMessage: '传统规则识别',
              })}
            </Radio>
            <Radio value="JOINT_RECOGNITION" disabled={!aiAvailable}>
              {formatMessage({
                id: 'odc.SensitiveColumn.components.SacnRule.AIEnhanced',
                defaultMessage: 'AI增强识别',
              })}
              {!aiAvailable && <span style={{ color: '#999', marginLeft: 8 }}>(AI功能未开启)</span>}
            </Radio>
          </Radio.Group>
        </Form.Item>
      </div>

      {/* 第三行：识别规则 */}
      <div>
        <Form.Item
          label={
            formatMessage({
              id: 'odc.SensitiveColumn.components.SacnRule.IdentificationRules',
              defaultMessage: '识别规则',
            }) //识别规则
          }
          tooltip={
            <div>
              {formatMessage({
                id: 'odc.SensitiveColumn.components.SacnRule.YouCanUseThePath',
                defaultMessage: '可选择路径、正则、Groovy和AI识别方式',
              })}
              <div style={{ marginTop: '8px', color: '#faad14' }}>
                {formatMessage({
                  id: 'odc.SensitiveColumn.components.SacnRule.AIPerformanceNote',
                  defaultMessage: '性能提示：建议适量使用AI规则',
                })}
              </div>
            </div>
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
                    setManageSensitiveRuleDrawerOpen(true);
                    setSelectOpen(false);
                  }}
                >
                  {formatMessage({
                    id: 'odc.SensitiveColumn.components.SacnRule.ManageIdentificationRules',
                    defaultMessage: '管理识别规则',
                  })}
                </Button>
              </>
            )}
          />
        </Form.Item>
      </div>
    </div>
  );
};
export default ScanRule;

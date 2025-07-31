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

import {
  deleteSensitiveRule,
  listSensitiveRules,
  setEnabled,
} from '@/common/network/sensitiveRule';
import CommonTable from '@/component/CommonTable';
import {
  IOperationOptionType,
  ITableInstance,
  ITableLoadOptions,
} from '@/component/CommonTable/interface';
import StatusSwitch from '@/component/StatusSwitch';
import TooltipContent from '@/component/TooltipContent';
import { IResponseData } from '@/d.ts';
import { ISensitiveRule, SensitiveRuleType } from '@/d.ts/sensitiveRule';
import { maskRuleTypeMap } from '@/page/Secure/MaskingAlgorithm';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { message, Modal, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useContext, useEffect, useRef, useState } from 'react';
import { DetectRuleTypeMap, FilterItemProps } from '../../interface';
import SensitiveContext from '../../SensitiveContext';
import { PopoverContainer } from '../SensitiveColumn';
import FormDrawer from './components/FormSensitiveRuleDrawer';
import ViewDrawer from './components/ViewSensitiveRuleDrawer';
import styles from './index.less';
const getColumns: (columnsFunction: {
  handleViewDrawerOpen;
  hanldeEditDrawerOpen;
  handleDelete;
  maskingAlgorithms;
  maskingAlgorithmFilters;
  handleStatusSwitch;
  maskingAlgorithmIdMap;
}) => ColumnsType<ISensitiveRule> = ({
  handleViewDrawerOpen,
  hanldeEditDrawerOpen,
  handleDelete,
  maskingAlgorithms,
  maskingAlgorithmFilters,
  handleStatusSwitch,
  maskingAlgorithmIdMap,
}) => {
  return [
    {
      title: formatMessage({
        id: 'odc.components.SensitiveRule.RuleName',
        defaultMessage: '规则名称',
      }),
      //规则名称
      width: 170,
      dataIndex: 'name',
      key: 'name',
      onCell: () => {
        return {
          style: {
            maxWidth: '170px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text) => <TooltipContent content={text} />,
    },
    {
      title: formatMessage({
        id: 'odc.components.SensitiveRule.IdentificationMethod',
        defaultMessage: '识别方式',
      }),
      //识别方式
      width: 170,
      dataIndex: 'type',
      key: 'type',
      filters: [
        {
          text: formatMessage({
            id: 'odc.components.SensitiveRule.Path',
            defaultMessage: '路径',
          }),
          //路径
          value: SensitiveRuleType.PATH,
        },
        {
          text: formatMessage({
            id: 'odc.components.SensitiveRule.Regular',
            defaultMessage: '正则',
          }),
          //正则
          value: SensitiveRuleType.REGEX,
        },
        {
          text: formatMessage({
            id: 'odc.components.SensitiveRule.Script',
            defaultMessage: '脚本',
          }),
          //脚本
          value: SensitiveRuleType.GROOVY,
        },
        {
          text: formatMessage({
            id: 'odc.components.SensitiveRule.AI',
            defaultMessage: 'AI',
          }),
          //AI
          value: SensitiveRuleType.AI,
        },
      ],

      onCell: () => {
        return {
          style: {
            maxWidth: '170px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text, record) => <TooltipContent content={DetectRuleTypeMap[record?.type] || '-'} />,
    },
    {
      title: formatMessage({
        id: 'odc.components.SensitiveRule.DesensitizationAlgorithm',
        defaultMessage: '脱敏算法',
      }),
      //脱敏算法
      width: 156,
      dataIndex: 'maskingAlgorithmId',
      key: 'maskingAlgorithmId',
      filters: maskingAlgorithmFilters,
      onCell: () => {
        return {
          style: {
            maxWidth: '156px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        };
      },
      render: (text, record, index) => {
        // AI规则的脱敏算法显示为"-"
        if (record?.type === SensitiveRuleType.AI) {
          return <TooltipContent content="-" />;
        }

        const target = maskingAlgorithms?.find(
          (maskingAlgorithm) => maskingAlgorithm?.id === record?.maskingAlgorithmId,
        );
        return (
          <PopoverContainer
            key={index}
            title={maskingAlgorithmIdMap[record?.maskingAlgorithmId] || '-'}
            descriptionsData={[
              {
                label: formatMessage({
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveRule.DesensitizationMethod',
                  defaultMessage: '脱敏方式',
                }) /* 脱敏方式 */,
                value: maskRuleTypeMap?.[target?.type],
              },
              {
                label: formatMessage({
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveRule.TestData',
                  defaultMessage: '测试数据',
                }) /* 测试数据 */,
                value: target?.sampleContent,
              },
              {
                label: formatMessage({
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveRule.Preview',
                  defaultMessage: '结果预览',
                }) /* 结果预览 */,
                value: target?.maskedContent,
              },
            ]}
            children={() => (
              <div className={styles.hover}>
                {maskingAlgorithmIdMap[record?.maskingAlgorithmId] || '-'}
              </div>
            )}
          />
        );
      },
    },
    {
      title: formatMessage({
        id: 'odc.components.SensitiveRule.EnableStatus',
        defaultMessage: '启用状态',
      }),
      //启用状态
      width: 80,
      dataIndex: 'enabled',
      key: 'enabled',
      filters: [
        {
          text: formatMessage({
            id: 'odc.components.SensitiveRule.Enable',
            defaultMessage: '启用',
          }),
          //启用
          value: true,
        },
        {
          text: formatMessage({
            id: 'odc.components.SensitiveRule.Disable',
            defaultMessage: '禁用',
          }),
          //禁用
          value: false,
        },
      ],

      render: (_, { id, enabled }, index) => (
        <StatusSwitch
          checked={enabled}
          onConfirm={() => handleStatusSwitch(id, !enabled)}
          onCancel={() => handleStatusSwitch(id, !enabled)}
        />
      ),
    },
    {
      title: formatMessage({
        id: 'odc.components.SensitiveRule.Operation',
        defaultMessage: '操作',
      }),
      //操作
      width: 154,
      key: 'action',
      render: (_, record, index) => (
        <>
          <Space>
            <a onClick={() => handleViewDrawerOpen(record)}>
              {
                formatMessage({
                  id: 'odc.components.SensitiveRule.View',
                  defaultMessage: '查看',
                }) /*查看*/
              }
            </a>
            <a onClick={() => hanldeEditDrawerOpen(record)}>
              {
                formatMessage({
                  id: 'odc.components.SensitiveRule.Edit',
                  defaultMessage: '编辑',
                }) /*编辑*/
              }
            </a>
            <a onClick={() => handleDelete(record)}>
              {
                formatMessage({
                  id: 'odc.components.SensitiveRule.Delete',
                  defaultMessage: '删除',
                }) /*删除*/
              }
            </a>
          </Space>
        </>
      ),
    },
  ];
};
const SensitiveRule = ({ projectId }) => {
  const tableRef = useRef<ITableInstance>();
  const { maskingAlgorithmIdMap, maskingAlgorithms, setSensitiveRuleIdMap } =
    useContext(SensitiveContext);
  const [selectedRecord, setSelectedRecord] = useState<ISensitiveRule>();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [formDrawerVisible, setFormDrawerVisible] = useState<boolean>(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState<boolean>(false);
  const [sensitiveRules, setSensitiveRules] = useState<IResponseData<ISensitiveRule>>(null);
  const [maskingAlgorithmFilters, setMaskingAlgorithmFilters] = useState<FilterItemProps[]>();
  useEffect(() => {
    tracert.expo('a3112.b64002.c330864');
  }, []);
  const initSensitiveRule = () => {
    setMaskingAlgorithmFilters(
      maskingAlgorithms?.map((d) => ({
        text: d.name,
        value: d.id,
      })),
    );
  };
  const handleViewDrawerOpen = (record: any) => {
    setIsEdit(false);
    setSelectedRecord(record);
    setViewDrawerVisible(true);
  };
  const hanldeEditDrawerOpen = (record: any) => {
    setIsEdit(true);
    setSelectedRecord(record);
    setFormDrawerVisible(true);
  };
  const handleCreateClick = () => {
    setIsEdit(false);
    setFormDrawerVisible(true);
  };
  const initData = async (args?: ITableLoadOptions) => {
    const { searchValue, filters, sorter, pagination, pageSize } = args ?? {};
    const { enabled, type, maskingAlgorithmId } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const wrapArgs = (args) => {
      if (Array.isArray(args)) {
        return args;
      }
      return [args];
    };
    const data = {
      name: searchValue,
      enabled: wrapArgs(enabled),
      type: type,
      maskingAlgorithm: wrapArgs(maskingAlgorithmId),
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };
    data.enabled = enabled?.length ? enabled : undefined;
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const rawData = await listSensitiveRules(projectId, data);
    const map = {};
    rawData?.contents?.forEach((d) => {
      map[d.id] = d.name;
    });
    setSensitiveRuleIdMap(map);
    setSensitiveRules(rawData);
  };
  const handleFormDrawerClose = (fn?: () => void) => {
    setFormDrawerVisible(false);
    fn?.();
    tableRef.current?.reload?.();
  };
  const handleViewDrawerClose = () => {
    setViewDrawerVisible(false);
  };
  const handleDelete = async (record: any) => {
    return Modal.confirm({
      title: formatMessage({
        id: 'odc.components.SensitiveRule.AreYouSureYouWant',
        defaultMessage: '是否确认删除敏感列？',
      }),
      //确认要删除敏感列吗？
      onOk: async () => {
        const result = await deleteSensitiveRule(projectId, record?.id);
        if (result) {
          message.success(
            formatMessage({
              id: 'odc.components.SensitiveRule.DeletedSuccessfully',
              defaultMessage: '删除成功',
            }), //删除成功
          );
        } else {
          message.error(
            formatMessage({
              id: 'odc.components.SensitiveRule.FailedToDelete',
              defaultMessage: '删除失败',
            }), //删除失败
          );
        }

        tableRef.current?.reload?.();
      },
      onCancel: () => {},
      okText: formatMessage({
        id: 'odc.components.SensitiveRule.Ok',
        defaultMessage: '确定',
      }),
      //确定
      cancelText: formatMessage({
        id: 'odc.components.SensitiveRule.Cancel',
        defaultMessage: '取消',
      }), //取消
    });
  };

  const handleStatusSwitch = async (id: number, enabled: boolean) => {
    const result = await setEnabled(projectId, id, enabled);
    if (result) {
      message.success(
        formatMessage({
          id: 'odc.components.SensitiveRule.UpdatedSuccessfully',
          defaultMessage: '更新成功',
        }), //更新成功
      );
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.SensitiveRule.UpdateFailed',
          defaultMessage: '更新失败',
        }), //更新失败
      );
    }

    tableRef.current?.reload?.();
  };
  const columns = getColumns({
    handleViewDrawerOpen,
    hanldeEditDrawerOpen,
    handleDelete,
    maskingAlgorithms,
    maskingAlgorithmIdMap,
    maskingAlgorithmFilters,
    handleStatusSwitch,
  });
  const operationOptions = [];
  operationOptions.push({
    type: IOperationOptionType.button,
    content: formatMessage({
      id: 'odc.components.SensitiveRule.CreateAnIdentificationRule',
      defaultMessage: '新建识别规则',
    }),
    //新建识别规则
    otherContent: formatMessage({
      id: 'odc.components.SensitiveRule.IdentificationRulesCanBeUsed',
      defaultMessage: '识别规则可用于扫描添加敏感列',
    }),
    //识别规则可用于扫描添加敏感列 //新建流程
    isPrimary: true,
    onClick: handleCreateClick,
  });
  useEffect(() => {
    initSensitiveRule();
  }, [maskingAlgorithms]);
  return (
    <>
      <CommonTable
        ref={tableRef}
        titleContent={null}
        showToolbar={true}
        filterContent={{
          searchPlaceholder: formatMessage({
            id: 'odc.components.SensitiveRule.EnterARuleName',
            defaultMessage: '请输入规则名称',
          }), //请输入规则名称
        }}
        operationContent={{
          options: operationOptions,
        }}
        onLoad={initData}
        onChange={initData}
        tableProps={{
          columns: columns,
          dataSource: sensitiveRules?.contents,
          rowKey: 'id',
          pagination: {
            current: sensitiveRules?.page?.number,
            total: sensitiveRules?.page?.totalElements,
          },
        }}
      />

      <FormDrawer
        {...{
          isEdit,
          selectedRecord,
          formDrawerVisible,
          handleFormDrawerClose,
          projectId,
        }}
      />

      <ViewDrawer
        {...{
          projectId: projectId,
          sensitiveRuleId: selectedRecord?.id,
          maskingAlgorithmIdMap,
          viewDrawerVisible,
          handleViewDrawerClose,
          selectedRecord,
        }}
      />
    </>
  );
};
export default SensitiveRule;

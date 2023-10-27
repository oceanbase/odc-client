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

import { formatMessage } from '@/util/intl';
import ExportCard from '@/component/ExportCard';
import {
  Button,
  Collapse,
  Drawer,
  Empty,
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tooltip,
  Tree,
  message,
} from 'antd';
import styles from './index.less';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import SensitiveContext from '../../../SensitiveContext';
import { SelectItemProps } from '../../../interface';
import { useForm } from 'antd/lib/form/Form';
import { listDatabases } from '@/common/network/database';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { batchCreateSensitiveColumns, listColumns } from '@/common/network/sensitiveColumn';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import DBSvg from '@/svgr/database_outline.svg';
import TableOutlined from '@/svgr/menuTable.svg';
import ViewSvg from '@/svgr/menuView.svg';
import { ESensitiveColumnType } from '@/d.ts/sensitiveColumn';
import ProjectContext from '@/page/Project/ProjectContext';
import { MaskRyleTypeMap } from '@/d.ts';
import { debounce, cloneDeep, merge } from 'lodash';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import {
  TreeNode,
  SelectNode,
  DatabaseColumn,
  ManualFormProps,
  SelectNodeChild,
} from './interface';
import { PopoverContainer } from '..';
import { fieldIconMap } from '@/constant';
import { convertDataTypeToDataShowType } from '@/util/utils';
const ManualForm: React.FC<ManualFormProps> = ({ modalOpen, setModalOpen, callback }) => {
  const [formRef] = useForm();
  const _formRef = useRef<any>(null);
  const sensitiveContext = useContext(SensitiveContext);
  const projectContext = useContext(ProjectContext);
  const { project } = projectContext;
  const { maskingAlgorithms, maskingAlgorithmOptions, projectId } = sensitiveContext;
  const [databaseIds, setDatabaseIds] = useState<number[]>([]);
  const [databaseOptions, setDatabaseOptions] = useState<
    (SelectItemProps & {
      environment?: {
        style: string;
        content: string;
      };
      dataSourceName?: string;
    })[]
  >([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const initDatabases = async () => {
    const rawData = await listDatabases(projectId);
    const resData = rawData?.contents?.map((content) => {
      return {
        label: content?.name,
        value: content?.id,
        environment: {
          style: content?.environment?.style,
          content: content?.environment?.name,
        },
        dataSourceName: content?.dataSource?.name,
      };
    });
    setDatabaseOptions(resData);
  };
  const handleDatabaseSelect = debounce(async (value: number, args) => {
    if (value === -1) {
      setDatabaseIds(databaseOptions?.map((option) => option.value as number));
      return;
    }
    if (!databaseIds?.includes(value)) {
      setDatabaseIds(databaseIds.concat(value));
    }
  }, 500);
  const handleDatabaseDeselect = debounce(async (value: number) => {
    setDatabaseIds(databaseIds.filter((id) => id !== value));
  }, 500);
  const submit = () => {
    _formRef.current?.submit(setModalOpen, callback);
  };
  const onClose = () => {
    return Modal.confirm({
      title: formatMessage({
        id:
          'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DoYouConfirmThatYou',
      }), //'确认要取消手动添加敏感列吗？'
      onOk: async () => {
        setModalOpen(false);
      },
      onCancel: () => {},
      okText: formatMessage({
        id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Sure',
      }), //'确定'
      cancelText: formatMessage({
        id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Cancel',
      }), //'取消'
    });
  };
  useEffect(() => {
    initDatabases();
  }, []);
  return (
    <Drawer
      width={800}
      title={
        formatMessage({
          id:
            'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ManuallyAddSensitiveColumns',
        }) /* 手动添加敏感列 */
      }
      open={modalOpen}
      destroyOnClose
      onClose={onClose}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Space>
            <Button onClick={onClose}>
              {
                formatMessage({
                  id:
                    'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Cancel.1',
                }) /* 取消 */
              }
            </Button>
            <Button disabled={checkedKeys?.length === 0} type="primary" onClick={submit}>
              {
                formatMessage({
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Submit',
                }) /* 
              提交
             */
              }
            </Button>
          </Space>
        </div>
      }
      className={styles.manualForm}
    >
      <div className={styles.manualFormContent}>
        <Form layout="vertical" form={formRef} className={styles.form}>
          <Form.Item
            label={
              formatMessage({
                id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Database',
              }) /* 数据库 */
            }
            name="database"
            style={{
              marginBottom: '4px',
            }}
          >
            <Select
              className={styles.select}
              mode="multiple"
              maxTagCount="responsive"
              placeholder={
                formatMessage({
                  id:
                    'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.PleaseChoose.1',
                }) /* 请选择 */
              }
              onSelect={handleDatabaseSelect}
              onDeselect={handleDatabaseDeselect}
              optionLabelProp="label"
              allowClear={true}
            >
              {databaseOptions?.map((option, index) => {
                return (
                  <Select.Option
                    key={index}
                    value={option?.value}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                    label={option?.label}
                  >
                    <Tooltip
                      title={
                        formatMessage(
                          {
                            id:
                              'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DataSourceOptiontatasourcename',
                          },
                          {
                            optionDataSourceName: option?.dataSourceName,
                          },
                        ) //`数据源：${option?.dataSourceName}`
                      }
                      placement="right"
                    >
                      <div
                        style={{
                          display: 'flex',
                        }}
                      >
                        <RiskLevelLabel
                          content={option?.environment?.content}
                          color={option?.environment?.style}
                        />
                        <div
                          style={{
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {option?.label}
                        </div>
                      </div>
                    </Tooltip>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <div className={styles.currentProject}>
            {
              formatMessage({
                id:
                  'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.CurrentProject',
              }) /* 当前项目： */
            }
            {project?.name}
          </div>
        </Form>
        <SelectedSensitiveColumn
          ref={_formRef}
          projectId={projectId}
          databaseIds={databaseIds}
          maskingAlgorithms={maskingAlgorithms}
          maskingAlgorithmOptions={maskingAlgorithmOptions}
          checkedKeys={checkedKeys}
          setCheckedKeys={setCheckedKeys}
        />
      </div>
    </Drawer>
  );
};
export default ManualForm;

const SelectedSensitiveColumn = forwardRef<any, any>(function (
  {
    projectId,
    databaseIds,
    maskingAlgorithms,
    maskingAlgorithmOptions,
    checkedKeys,
    setCheckedKeys,
  }: {
    projectId: number;
    databaseIds: number[];
    maskingAlgorithms: IMaskingAlgorithm[];
    maskingAlgorithmOptions: SelectItemProps[];
    checkedKeys: string[];
    setCheckedKeys: React.Dispatch<React.SetStateAction<string[]>>;
  },
  ref,
) {
  const [_formRef] = useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [databaseColumns, setDatabaseColumns] = useState<DatabaseColumn[]>();
  // 左侧Tree展示数据
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  // 左侧Tree展示数据，用于在搜索后还原数据
  const [originTreeData, setOriginTreeData] = useState<TreeNode[]>([]);
  // 右侧Collapse展示数据
  const [data, setData] = useState<SelectNode[]>([]);
  // 右侧Collapse展示备份数据，用于在搜索后还原数据
  const [originData, setOriginData] = useState<SelectNode[]>([]);
  // allColumns 左侧敏感列总数、checkedColumns 已勾选的敏感列总数
  const [allColumns, setAllColumns] = useState<number>(0);
  const [checkedColumns, setCheckedColumns] = useState<number>(0);
  // formData 用于记录右侧表单数据，确保搜索前后已选择的表单值不丢失。
  const [formData, setFormData] = useState<
    {
      [key in string]: any;
    }
  >({});
  useImperativeHandle(ref, () => {
    return {
      submit: async (
        setModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
        callback: () => void,
      ) => {
        await _formRef.validateFields().catch();
        const rawData = await _formRef.getFieldsValue();
        const _data = [];
        Object.keys(rawData).forEach((databaseId) => {
          Object.keys(rawData[databaseId]).forEach((type) => {
            Object.keys(rawData[databaseId][type]).forEach((tableName) => {
              Object.keys(rawData[databaseId][type][tableName]).forEach((columnName) => {
                _data.push({
                  enabled: true,
                  columnName,
                  tableName,
                  database: {
                    id: databaseId && parseInt(databaseId),
                  },
                  type,
                  maskingAlgorithmId: rawData[databaseId][type][tableName][columnName],
                });
              });
            });
          });
        });
        const successful = await batchCreateSensitiveColumns(projectId, _data);
        if (successful) {
          message.success(
            formatMessage({
              id:
                'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.SubmittedSuccessfully',
            }), //'提交成功'
          );
          setModalOpen(false);
          callback?.();
        } else {
          message.error(
            formatMessage({
              id:
                'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.SubmissionFailed',
            }), //'提交失败'
          );
        }
      },
    };
  });
  const getColumns = async () => {
    setLoading(true);
    const { contents: databaseColumns } = await listColumns(projectId, databaseIds);
    setDatabaseColumns(databaseColumns);
    const treeData = [];
    let allColumns = 0;
    databaseColumns?.forEach((databaseColumn, index) => {
      const tables = [];
      const views = [];
      let tableViewIndex = 0;
      for (const key in databaseColumn?.table2Columns) {
        const leaves = databaseColumn?.table2Columns?.[key].map((tableColumn, _index) => ({
          title: tableColumn?.name,
          key: `0-${index}-${tableViewIndex}-${_index}`,
          icon: (
            <span className={styles.icon}>
              <Icon
                component={
                  fieldIconMap[
                    convertDataTypeToDataShowType(
                      tableColumn?.typeName,
                      databaseColumn?.dataTypeUnits,
                    )
                  ]
                }
              />
            </span>
          ),
          type: ESensitiveColumnType.TABLE_COLUMN,
        }));
        allColumns = allColumns + leaves?.length;
        tables.push({
          title: key,
          key: `0-${index}-${tableViewIndex}`,
          icon: (
            <span className={styles.icon}>
              <Icon component={TableOutlined} />
            </span>
          ),
          children: leaves,
          type: ESensitiveColumnType.TABLE_COLUMN,
        });
        tableViewIndex++;
      }
      for (const key in databaseColumn?.view2Columns) {
        const leaves = databaseColumn?.view2Columns?.[key].map((viewColumn, _index) => ({
          title: viewColumn?.name,
          key: `0-${index}-${tableViewIndex}-${_index}`,
          icon: (
            <span className={styles.icon}>
              <Icon
                component={
                  fieldIconMap[
                    convertDataTypeToDataShowType(
                      viewColumn?.typeName,
                      databaseColumn?.dataTypeUnits,
                    )
                  ]
                }
              />
            </span>
          ),
          type: ESensitiveColumnType.VIEW_COLUMN,
        }));
        allColumns = allColumns + leaves?.length;
        views.push({
          title: key,
          key: `0-${index}-${tableViewIndex}`,
          icon: (
            <span className={styles.icon}>
              <Icon component={ViewSvg} />
            </span>
          ),
          children: leaves,
          type: ESensitiveColumnType.VIEW_COLUMN,
        });
        tableViewIndex++;
      }
      treeData.push({
        title: databaseColumn?.databaseName,
        key: `0-${index}`,
        databaseId: databaseColumn?.databaseId,
        icon: (
          <span className={styles.icon}>
            <Icon component={DBSvg} />
          </span>
        ),
        children: [...tables, ...views],
      });
    });
    setLoading(false);
    setTreeData(treeData);
    setOriginTreeData(treeData);
    setAllColumns(allColumns);
  };
  // 插入库表信息到叶节点
  const parseTreeData = (treeData) => {
    let result = [];
    treeData?.forEach((node) => {
      let data = node?.children?.map((child) => ({
        databaseId: node?.databaseId,
        databaseKey: node?.key,
        databaseTitle: node?.title,
        tableKey: child?.key,
        tableTitle: child.title,
        type: child?.type,
        children: child?.children,
      }));
      result = result?.concat(data);
    });
    return result;
  };
  // 解析数据为表单数据
  const parseDataToFields = (data) => {
    const result = {};
    data?.forEach((d) => {
      d?.children?.forEach((child) => {
        if (result?.[d.databaseId]?.[d.type]) {
          result[d.databaseId][d.type] = {
            ...result[d.databaseId]?.[d.type],
            [d.tableTitle]: {
              ...result[d.databaseId]?.[d.type]?.[d.tableTitle],
              [child.title]: maskingAlgorithmOptions?.[0]?.value || null,
            },
          };
        } else {
          result[d.databaseId] = {
            TABLE_COLUMN: {},
            VIEW_COLUMN: {},
            [d.type]: {
              ...result?.[d.databaseId]?.[d.type],
              [d.tableTitle]: {
                [child.title]: maskingAlgorithmOptions?.[0]?.value || null,
              },
            },
          };
        }
      });
    });
    return result;
  };
  const handleCheckedKeysChange = async () => {
    const treeData = [];
    let checkedColumns = 0;
    databaseColumns?.forEach((databaseColumn, index) => {
      const tables = [];
      const views = [];
      let tableViewIndex = 0;
      for (const key in databaseColumn?.table2Columns) {
        const leaves = databaseColumn?.table2Columns?.[key]
          .map((tableColumn, _index) => ({
            title: tableColumn?.name,
            key: `0-${index}-${tableViewIndex}-${_index}`,
            type: ESensitiveColumnType.TABLE_COLUMN,
            columnType: tableColumn?.typeName,
            dataTypeUnits: databaseColumn?.dataTypeUnits,
          }))
          ?.filter((leaf) => checkedKeys?.includes(leaf?.key));
        checkedColumns = checkedColumns + leaves?.length;
        if (leaves?.length > 0) {
          tables.push({
            title: key,
            key: `0-${index}-${tableViewIndex}`,
            children: leaves,
            type: ESensitiveColumnType.TABLE_COLUMN,
          });
        }
        tableViewIndex++;
      }
      for (const key in databaseColumn?.view2Columns) {
        const leaves = databaseColumn?.view2Columns?.[key]
          .map((viewColumn, _index) => ({
            title: viewColumn?.name,
            key: `0-${index}-${tableViewIndex}-${_index}`,
            type: ESensitiveColumnType.VIEW_COLUMN,
            columnType: viewColumn?.typeName,
            dataTypeUnits: databaseColumn?.dataTypeUnits,
          }))
          ?.filter((view) => checkedKeys?.includes(view?.key));
        checkedColumns = checkedColumns + leaves?.length;
        if (leaves?.length > 0) {
          views.push({
            title: key,
            key: `0-${index}-${tableViewIndex}`,
            children: leaves,
            type: ESensitiveColumnType.VIEW_COLUMN,
          });
        }
        tableViewIndex++;
      }
      if (tables?.length > 0 || views?.length > 0) {
        treeData.push({
          title: databaseColumn?.databaseName,
          key: `0-${index}`,
          databaseId: databaseColumn?.databaseId,
          children: [...tables, ...views],
        });
      }
    });
    setCheckedColumns(checkedColumns);
    const data = parseTreeData(treeData);
    setData(data);
    setOriginData(data);
    setFormData(parseDataToFields(data));
    await _formRef.setFieldsValue(parseDataToFields(data));
  };
  const collapseSearch = async function (searchValue: string) {
    const values = await _formRef.getFieldsValue();
    if (!searchValue) {
      setData(originData);
      await _formRef.setFieldsValue(formData);
      return;
    }
    const newData = [];
    const D = cloneDeep(originData);
    D?.forEach((d) => {
      if (
        d?.databaseTitle?.toLowerCase()?.includes(searchValue?.toLowerCase()) ||
        d?.tableTitle?.toLowerCase()?.includes(searchValue?.toLowerCase())
      ) {
        newData.push(d);
      } else {
        d.children = d?.children?.filter((child) =>
          child?.title?.toLowerCase()?.includes(searchValue?.toLowerCase()),
        );
        if (d?.children?.length > 0) {
          newData.push(d);
        }
      }
    });
    await _formRef.setFieldsValue(merge(formData, values));
    setData(newData);
  };
  const treeSearch = async function (searchValue: string) {
    if (!searchValue) {
      setTreeData(originTreeData);
      return;
    }
    const newTreeData = [];
    const copyTreeData = cloneDeep(originTreeData);
    copyTreeData?.forEach((td) => {
      if (td?.title?.toLowerCase()?.includes(searchValue?.toLowerCase())) {
        newTreeData.push(td);
      } else {
        td.children = td?.children?.filter((table) => {
          if (table?.title?.toLowerCase()?.includes(searchValue?.toLowerCase())) {
            return true;
          }
          table.children = table?.children?.filter((column) =>
            column?.title?.toLowerCase()?.includes(searchValue?.toLowerCase()),
          );
          if (table?.children?.length > 0) {
            return true;
          }
          return false;
        });
        if (td?.children?.length > 0) {
          newTreeData.push(td);
        }
      }
    });
    setTreeData(newTreeData);
  };
  const renderEmptyOrTree = () => {
    if (databaseIds?.length > 0 && treeData?.length === 0) {
      return originTreeData?.length === 0 ? (
        <div className={styles.centerContainer}>
          <Empty
            description={'所选数据库中没有可选的敏感列'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className={styles.centerContainer}>
          <Empty
            description={'可选的敏感列中不包含搜索关键字'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }
    if (databaseIds?.length === 0) {
      return (
        <div className={styles.centerContainer}>
          <Empty description={'尚未选择数据库'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      );
    }
    // if databaseIds?.length > 0 && treeData?.length > 0
    return (
      <Tree
        checkable
        showIcon
        treeData={treeData}
        checkedKeys={checkedKeys}
        defaultExpandAll
        onCheck={function (checkedKeys, e) {
          setCheckedKeys(checkedKeys as string[]);
        }}
        className={styles.tree}
      />
    );
  };
  const colleageValueFromEvent = (e: string | number, root: SelectNode, leaf: SelectNodeChild) => {
    setFormData(
      merge(parseDataToFields(originData), {
        [root?.databaseId]: {
          [root?.type]: {
            [root?.tableTitle]: {
              [leaf?.title]: e,
            },
          },
        },
      }),
    );
    return e;
  };
  function handleCollapseDelete(root, leaf) {
    const target = data.find(
      (_data) => _data?.databaseKey === root.databaseKey && _data.tableKey === root.tableKey,
    );
    if (target) {
      if (target.children.length === 1) {
        const newCheckedKeys = checkedKeys.filter(
          (checkedKey) => ![root.tableKey, leaf.key]?.includes(checkedKey),
        );
        setCheckedKeys(newCheckedKeys);
      } else {
        const newCheckedKeys = checkedKeys.filter(
          (checkedKey) => ![root.tableKey, leaf.key]?.includes(checkedKey),
        );
        setCheckedKeys(newCheckedKeys);
      }
    }
  }
  useEffect(() => {
    setAllColumns(0);
    setCheckedColumns(0);
    setCheckedKeys([]);
    setDatabaseColumns([]);
    if (databaseIds?.length > 0) {
      setData([]);
      setOriginData([]);
      setFormData({});
      getColumns();
    } else {
      setTreeData([]);
      setOriginTreeData([]);
      setData([]);
      setOriginData([]);
      setFormData({});
    }
  }, [databaseIds]);
  useEffect(() => {
    handleCheckedKeysChange();
  }, [checkedKeys]);
  return (
    <div className={styles.exportCard}>
      <div className={styles.label}>
        {
          formatMessage({
            id:
              'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ChooseSensitiveLandscape',
          }) /* 选择敏感列 */
        }
      </div>
      <div className={styles.doubleExportCardContainer}>
        <div className={styles.content}>
          <ExportCard
            title={
              formatMessage(
                {
                  id:
                    'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.SelectColumnCheckColumns',
                },
                {
                  checkedColumns: checkedColumns,
                  allColumns: allColumns,
                },
              ) //`选择列 (${checkedColumns}/${allColumns})`
            }
            onSearch={treeSearch}
          >
            {loading ? (
              <div className={styles.centerContainer}>
                <Spin spinning={loading} />
              </div>
            ) : (
              renderEmptyOrTree()
            )}
          </ExportCard>
        </div>
        <div className={styles.content}>
          <ExportCard
            title={
              formatMessage(
                {
                  id:
                    'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.SelectedCheckColumnsItem',
                },
                {
                  checkedColumns: checkedColumns,
                },
              ) //`已选 ${checkedColumns} 项`
            }
            onSearch={collapseSearch}
            extra={
              <Popconfirm
                onConfirm={() => {
                  setCheckedKeys([]);
                }}
                placement="left"
                title={
                  formatMessage({
                    id:
                      'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.AreYouSureYouWant',
                  }) //'确定要清空已选对象吗？'
                }
              >
                <a>
                  {
                    formatMessage({
                      id:
                        'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Empty',
                    }) /* 清空 */
                  }
                </a>
              </Popconfirm>
            }
            disabled
          >
            {data?.length > 0 ? (
              <Form layout="vertical" form={_formRef}>
                <Collapse
                  defaultActiveKey={data?.map((d) => `${d?.databaseId}/${d?.tableTitle}`)}
                  ghost
                  className={styles.wrapCollapse}
                >
                  {data?.map((d) => {
                    return (
                      <Collapse.Panel
                        header={
                          <span className={styles.panelHeader}>
                            <span className={styles.headerIcon}>
                              <Icon
                                component={
                                  d?.type === ESensitiveColumnType.TABLE_COLUMN
                                    ? TableOutlined
                                    : ViewSvg
                                }
                              />
                            </span>

                            {`${d?.databaseTitle}/${d?.tableTitle}`}
                          </span>
                        }
                        key={`${d?.databaseId}/${d?.tableTitle}`}
                      >
                        {d?.children?.map((child, index) => {
                          return (
                            <div className={styles.panelContent} key={index}>
                              <div className={styles.checkedTable}>
                                <div className={styles.checkedTableColumn}>
                                  <span className={styles.checkedTableColumnIcon}>
                                    <Icon
                                      component={
                                        fieldIconMap[
                                          convertDataTypeToDataShowType(
                                            child?.columnType,
                                            child?.dataTypeUnits,
                                          )
                                        ]
                                      }
                                    />
                                  </span>
                                  <Tooltip title={child?.title} placement="left">
                                    <div className={styles.checkedTableColumnTooltip}>
                                      {child?.title}
                                    </div>
                                  </Tooltip>
                                </div>
                                <Space align="baseline">
                                  <Form.Item
                                    name={[d?.databaseId, d?.type, d?.tableTitle, child?.title]}
                                    rules={[
                                      {
                                        required: true,
                                        message: formatMessage({
                                          id:
                                            'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.PleaseChoose',
                                        }), //'请选择'
                                      },
                                    ]}
                                    getValueFromEvent={(e) => colleageValueFromEvent(e, d, child)}
                                  >
                                    <Select
                                      style={{
                                        width: '165px',
                                      }}
                                      optionLabelProp="label"
                                    >
                                      {maskingAlgorithmOptions?.map((option, index) => {
                                        const target = maskingAlgorithms?.find(
                                          (maskingAlgorithm) =>
                                            maskingAlgorithm?.id === option?.value,
                                        );
                                        return (
                                          <Select.Option
                                            value={option?.value}
                                            key={index}
                                            label={option?.label}
                                          >
                                            <PopoverContainer
                                              key={index}
                                              title={option?.label}
                                              descriptionsData={[
                                                {
                                                  label: formatMessage({
                                                    id:
                                                      'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DesensitizationMethod',
                                                  }) /* 脱敏方式 */,
                                                  value: MaskRyleTypeMap?.[target?.type],
                                                },
                                                {
                                                  label: formatMessage({
                                                    id:
                                                      'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TestData',
                                                  }) /* 测试数据 */,
                                                  value: target?.sampleContent,
                                                },
                                                {
                                                  label: formatMessage({
                                                    id:
                                                      'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Preview',
                                                  }) /* 结果预览 */,
                                                  value: target?.maskedContent,
                                                },
                                              ]}
                                              children={() => <div>{option?.label}</div>}
                                            />
                                          </Select.Option>
                                        );
                                      })}
                                    </Select>
                                  </Form.Item>
                                  <DeleteOutlined onClick={() => handleCollapseDelete(d, child)} />
                                </Space>
                              </div>
                            </div>
                          );
                        })}
                      </Collapse.Panel>
                    );
                  })}
                </Collapse>
              </Form>
            ) : originData?.length === 0 ? (
              <div className={styles.centerContainer}>
                <Empty description={'尚未勾选敏感列'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            ) : (
              <div className={styles.centerContainer}>
                <Empty
                  description={'已勾选的敏感列中不包含搜索关键字'}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </ExportCard>
        </div>
      </div>
    </div>
  );
});

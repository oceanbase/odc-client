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
  Descriptions,
  Drawer,
  Empty,
  Form,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Space,
  Spin,
  Tooltip,
  Tree,
  message,
} from 'antd';
import styles from './index.less';
import { useCallback, useContext, useEffect, useState } from 'react';
import SensitiveContext from '../../../SensitiveContext';
import { EColumnType, SelectItemProps } from '../../../interface';
import { useForm } from 'antd/lib/form/Form';
import { listDatabases } from '@/common/network/database';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { batchCreateSensitiveColumns, listColumns } from '@/common/network/sensitiveColumn';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import DBSvg from '@/svgr/database_outline.svg';
import binarySvg from '@/svgr/Field-Binary.svg';
import numberSvg from '@/svgr/Field-number.svg';
import stringSvg from '@/svgr/Field-String.svg';
import TableOutlined from '@/svgr/menuTable.svg';
import ViewSvg from '@/svgr/menuView.svg';
import timeSvg from '@/svgr/Field-time.svg'; // 同步 OCP 等保三密码强度要求
import { ESensitiveColumnType } from '@/d.ts/sensitiveColumn';
import ProjectContext from '@/page/Project/ProjectContext';
import { MaskRyleTypeMap } from '@/d.ts';
const ManualForm = ({ modalOpen, setModalOpen, callback }) => {
  const [formRef] = useForm();
  const [_formRef] = useForm();
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
  const [loading, setLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<any>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [data, setData] = useState<any>([]);
  const [databaseColumns, setDatabaseColumns] = useState<any>();
  const [allColumns, setAllColumns] = useState<number>(0);
  const [checkedColumns, setCheckedColumns] = useState<number>(0);
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
  const handleDatabaseSelect = async (value: number, args) => {
    if (value === -1) {
      setDatabaseIds(databaseOptions?.map((option) => option.value as number));
      return;
    }
    if (!databaseIds?.includes(value)) {
      setDatabaseIds(databaseIds.concat(value));
    }
  };
  const handleDatabaseDeselect = async (value: number) => {
    setDatabaseIds(databaseIds.filter((id) => id !== value));
  };
  const getIconByColumnType = (columnType: string) => {
    switch (columnType) {
      case EColumnType.NUMBER:
        return numberSvg;
      case EColumnType.VARCHAR2:
      case EColumnType.NCHAR:
      case EColumnType.CHAR:
      case EColumnType.RAW:
      case EColumnType.INTERVAL_DAY_TO_SECOND:
      case EColumnType.INTERVAL_YEAR_TO_MONTH:
        return stringSvg;
      case EColumnType.DATE:
      case EColumnType.TIMESTAMP:
      case EColumnType.TIMESTAMP_WITH_TIME_ZONE:
      case EColumnType.TIMESTAMP_WITH_LOCAL_TIME_ZONE:
        return timeSvg;
      case EColumnType.BLOB:
      case EColumnType.CLOB:
        return binarySvg;
      default:
        return stringSvg;
    }
  };
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
              <Icon component={getIconByColumnType(tableColumn?.typeName)} />
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
              <Icon component={getIconByColumnType(viewColumn?.typeName)} />
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
    setAllColumns(allColumns);
  };
  const WrapCollapse = useCallback(
    () => (
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
                        d?.type === ESensitiveColumnType.TABLE_COLUMN ? TableOutlined : ViewSvg
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
                          <Icon component={getIconByColumnType(child?.columnType)} />
                        </span>
                        <Tooltip title={child?.title} placement="left">
                          <div className={styles.checkedTableColumnTooltip}>{child?.title}</div>
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
                        >
                          <Select
                            style={{
                              width: '165px',
                            }}
                          >
                            {maskingAlgorithmOptions?.map((option, index) => {
                              const target = maskingAlgorithms?.find(
                                (maskingAlgorithm) => maskingAlgorithm?.id === option?.value,
                              );
                              return (
                                <Select.Option value={option?.value} key={index}>
                                  <Popover
                                    placement="left"
                                    title={option?.label}
                                    content={
                                      <Descriptions
                                        column={1}
                                        style={{
                                          width: '250px',
                                        }}
                                      >
                                        <Descriptions.Item
                                          label={
                                            formatMessage({
                                              id:
                                                'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DesensitizationMethod',
                                            }) /* 脱敏方式 */
                                          }
                                        >
                                          {MaskRyleTypeMap?.[target?.type]}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                          label={
                                            formatMessage({
                                              id:
                                                'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TestData',
                                            }) /* 测试数据 */
                                          }
                                        >
                                          {target?.sampleContent}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                          label={
                                            formatMessage({
                                              id:
                                                'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Preview',
                                            }) /* 结果预览 */
                                          }
                                        >
                                          {target?.maskedContent}
                                        </Descriptions.Item>
                                      </Descriptions>
                                    }
                                  >
                                    {option?.label}
                                  </Popover>
                                </Select.Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                        <DeleteOutlined
                          onClick={() => {
                            const target = data.find(
                              (_data) =>
                                _data?.databaseKey === d.databaseKey &&
                                _data.tableKey === _data.tableKey,
                            );
                            if (target) {
                              if (target.children.length === 1) {
                                const newCheckedKeys = checkedKeys.filter(
                                  (checkedKey) => ![d.tableKey, child.key]?.includes(checkedKey),
                                );
                                setCheckedKeys(newCheckedKeys);
                              } else {
                                const newCheckedKeys = checkedKeys.filter(
                                  (checkedKey) => ![d.tableKey, child.key]?.includes(checkedKey),
                                );
                                setCheckedKeys(newCheckedKeys);
                              }
                            }
                          }}
                        />
                      </Space>
                    </div>
                  </div>
                );
              })}
            </Collapse.Panel>
          );
        })}
      </Collapse>
    ),
    [data],
  );
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
  const parseData = (data) => {
    const result = {};
    data?.forEach((d) => {
      d?.children?.forEach((child) => {
        if (result?.[d.databaseId]?.[d.type]) {
          result[d.databaseId][d.type] = {
            ...result[d.databaseId]?.[d.type],
            [d.tableTitle]: {
              ...result[d.databaseId]?.[d.type]?.[d.tableTitle],
              [child.title]: 1,
            },
          };
        } else {
          result[d.databaseId] = {
            TABLE_COLUMN: {},
            VIEW_COLUMN: {},
            [d.type]: {
              ...result?.[d.databaseId]?.[d.type],
              [d.tableTitle]: {
                [child.title]: 1,
              },
            },
          };
        }
      });
    });
    return result;
  };
  const submit = async () => {
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
  };
  const handleCheckedKeysChange = () => {
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
    _formRef.setFieldsValue(parseData(data));
  };
  const collapseSearch = async function (searchValue: string) {
    if (!searchValue) {
      handleCheckedKeysChange();
      return;
    }
    const newData = [];
    data?.forEach((d) => {
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
    setData(newData);
    await _formRef.setFieldsValue(parseData(data));
  };
  const treeSearch = async function (searchValue: string) {
    if (!searchValue) {
      await getColumns();
      return;
    }
    const newTreeData = [];
    treeData?.forEach((td) => {
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
  useEffect(() => {
    if (databaseIds?.length > 0) {
      setCheckedKeys([]);
      setAllColumns(0);
      setCheckedColumns(0);
      getColumns();
    } else {
      setTreeData([]);
      setCheckedKeys([]);
      setAllColumns(0);
      setCheckedColumns(0);
    }
  }, [databaseIds]);
  useEffect(() => {
    handleCheckedKeysChange();
  }, [checkedKeys]);
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
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                          }}
                        >
                          {option?.label}
                        </div>
                      </Tooltip>
                    </div>
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
                ) : databaseIds?.length > 0 && treeData?.length === 0 && !loading ? (
                  <div className={styles.centerContainer}>
                    <Empty />
                  </div>
                ) : (
                  <Tree
                    checkable
                    showIcon
                    treeData={treeData}
                    checkedKeys={checkedKeys}
                    onCheck={function (checkedKeys, e) {
                      setCheckedKeys(checkedKeys as string[]);
                    }}
                  />
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
                <Form layout="vertical" form={_formRef}>
                  <WrapCollapse />
                </Form>
              </ExportCard>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
export default ManualForm;

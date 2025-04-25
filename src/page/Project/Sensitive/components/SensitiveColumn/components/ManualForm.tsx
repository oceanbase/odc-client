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

import { listDatabases } from '@/common/network/database';
import { batchCreateSensitiveColumns, listColumns } from '@/common/network/sensitiveColumn';
import ExportCard from '@/component/ExportCard';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { fieldIconMap } from '@/constant';
import { IDatabase } from '@/d.ts/database';
import { IMaskingAlgorithm } from '@/d.ts/maskingAlgorithm';
import { ESensitiveColumnType } from '@/d.ts/sensitiveColumn';
import ProjectContext from '@/page/Project/ProjectContext';
import { maskRuleTypeMap } from '@/page/Secure/MaskingAlgorithm';
import { ReactComponent as DBSvg } from '@/svgr/database_outline.svg';
import { ReactComponent as TableOutlined } from '@/svgr/menuTable.svg';
import { ReactComponent as ViewSvg } from '@/svgr/menuView.svg';
import { formatMessage } from '@/util/intl';
import { convertDataTypeToDataShowType } from '@/util/utils';
import MultipleDatabaseSelect from '@/component/Task/component/MultipleDatabaseSelect/index';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Drawer,
  Empty,
  Form,
  message,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Space,
  Spin,
  Tooltip,
  Tree,
  Typography,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { cloneDeep, debounce, merge } from 'lodash';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { PopoverContainer } from '..';
import { SelectItemProps } from '../../../interface';
import SensitiveContext from '../../../SensitiveContext';
import styles from './index.less';
import {
  DatabaseColumn,
  ManualFormProps,
  SelectNode,
  SelectNodeChild,
  TreeNode,
} from './interface';

const { Text } = Typography;
const ManualForm: React.FC<ManualFormProps> = ({ modalOpen, setModalOpen, callback }) => {
  const [formRef] = useForm();
  const _formRef = useRef<any>(null);
  const sensitiveContext = useContext(SensitiveContext);
  const projectContext = useContext(ProjectContext);
  const { project } = projectContext;
  const { maskingAlgorithms, maskingAlgorithmOptions, projectId } = sensitiveContext;
  const [databaseIds, setDatabaseIds] = useState<number[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  const handleDatabaseClear = () => {
    setDatabaseIds([]);
  };

  const handleDatabaseSelect = async (Ids) => {
    await formRef.setFieldsValue({
      database: Ids,
    });
    setDatabaseIds(Ids);
  };

  const handleDatabaseChange = debounce((Ids) => {
    setDatabaseIds(Ids);
  }, 300);

  const submit = () => {
    _formRef.current?.submit(setModalOpen, callback);
  };
  const onClose = () => {
    return Modal.confirm({
      title: formatMessage({
        id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DoYouConfirmThatYou',
        defaultMessage: '是否确定取消手动添加敏感列？',
      }),
      //'确认要取消手动添加敏感列吗？'
      onOk: async () => {
        setModalOpen(false);
      },
      onCancel: () => {},
      okText: formatMessage({
        id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Sure',
        defaultMessage: '确定',
      }),
      //'确定'
      cancelText: formatMessage({
        id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Cancel',
        defaultMessage: '取消',
      }), //'取消'
    });
  };

  return (
    <Drawer
      width={800}
      title={
        formatMessage({
          id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ManuallyAddSensitiveColumns',
          defaultMessage: '手动添加敏感列',
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
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Cancel.1',
                  defaultMessage: '取消',
                }) /* 取消 */
              }
            </Button>
            <Button disabled={checkedKeys?.length === 0} type="primary" onClick={submit}>
              {
                formatMessage({
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Submit',
                  defaultMessage: '\n              提交\n            ',
                }) /* 
            提交
            */
              }
            </Button>
          </Space>
        </div>
      }
      rootClassName={styles.manualForm}
    >
      <div className={styles.manualFormContent}>
        <Form layout="vertical" form={formRef} className={styles.form}>
          <MultipleDatabaseSelect
            name="database"
            label={
              formatMessage({
                id: 'odc.SensitiveColumn.components.SacnRule.Database',
                defaultMessage: '数据库',
              }) //数据库
            }
            projectId={projectId}
            onSelect={handleDatabaseSelect}
            onChange={handleDatabaseChange}
            onClear={handleDatabaseClear}
            selectWidth={320}
          />
          <div className={styles.currentProject}>
            {
              formatMessage({
                id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.CurrentProject',
                defaultMessage: '当前项目：',
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
  const [defaultActiveKey, setDefaultActiveKey] = useState<string[]>([]);
  // formData 用于记录右侧表单数据，确保搜索前后已选择的表单值不丢失。
  const [formData, setFormData] = useState<{ [key in string]: any }>({});
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
              id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.SubmittedSuccessfully',
              defaultMessage: '提交成功',
            }), //'提交成功'
          );

          setModalOpen(false);
          callback?.();
        } else {
          message.error(
            formatMessage({
              id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.SubmissionFailed',
              defaultMessage: '提交失败',
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
      for (const key in databaseColumn?.externalTable2Columns) {
        const leaves = databaseColumn?.externalTable2Columns?.[key].map(
          (externalTableColumn, _index) => ({
            title: externalTableColumn?.name,
            key: `0-${index}-${tableViewIndex}-${_index}`,
            icon: (
              <span className={styles.icon}>
                <Icon
                  component={
                    fieldIconMap[
                      convertDataTypeToDataShowType(
                        externalTableColumn?.typeName,
                        databaseColumn?.dataTypeUnits,
                      )
                    ]
                  }
                />
              </span>
            ),

            type: ESensitiveColumnType.TABLE_COLUMN,
          }),
        );
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
      for (const key in databaseColumn?.materializedView2Columns) {
        const leaves = databaseColumn?.materializedView2Columns?.[key]?.map(
          (materializedViewColumn, _index) => ({
            title: materializedViewColumn.name,
            key: `0-${index}-${tableViewIndex}-${_index}`,
            icon: (
              <span className={styles.icon}>
                <Icon
                  component={
                    fieldIconMap[
                      convertDataTypeToDataShowType(
                        materializedViewColumn?.typeName,
                        databaseColumn?.dataTypeUnits,
                      )
                    ]
                  }
                />
              </span>
            ),
            type: ESensitiveColumnType.VIEW_COLUMN,
          }),
        );
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
    const values = await _formRef.getFieldsValue();
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
      for (const key in databaseColumn?.externalTable2Columns) {
        const leaves = databaseColumn?.externalTable2Columns?.[key]
          .map((externalTableColumn, _index) => ({
            title: externalTableColumn?.name,
            key: `0-${index}-${tableViewIndex}-${_index}`,
            type: ESensitiveColumnType.TABLE_COLUMN,
            columnType: externalTableColumn?.typeName,
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
      for (const key in databaseColumn?.materializedView2Columns) {
        const leaves = databaseColumn?.materializedView2Columns?.[key]
          ?.map((materializedViewColumn, _index) => ({
            title: materializedViewColumn?.name,
            key: `0-${index}-${tableViewIndex}-${_index}`,
            type: ESensitiveColumnType.TABLE_COLUMN,
            columnType: materializedViewColumn?.typeName,
            dataTypeUnits: databaseColumn?.dataTypeUnits,
          }))
          ?.filter((leaf) => checkedKeys?.includes(leaf?.key));
        checkedColumns = checkedColumns + leaves?.length;
        if (leaves?.length > 0) {
          views.push({
            title: key,
            key: `0-${index}-${tableViewIndex}`,
            children: leaves,
            type: ESensitiveColumnType.TABLE_COLUMN,
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
    const rawData = parseTreeData(treeData);
    setData(rawData);
    setDefaultActiveKey(rawData?.map((d) => `${d?.databaseId}/${d?.tableTitle}`));
    setOriginData(rawData);
    // 避免删除时丢失已选择的项的值
    setFormData(merge(merge(parseDataToFields(rawData), formData), values));
    await _formRef.setFieldsValue(merge(merge(parseDataToFields(rawData), formData), values));
  };
  const collapseSearch = async function (searchValue: string) {
    const values = await _formRef.getFieldsValue();
    if (!searchValue) {
      setData(originData);
      setDefaultActiveKey(originData?.map((d) => `${d?.databaseId}/${d?.tableTitle}`));
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
    setDefaultActiveKey(newData?.map((d) => `${d?.databaseId}/${d?.tableTitle}`));
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
            description={
              formatMessage({
                id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ThereIsNoOptionalSensitive',
                defaultMessage: '所选数据库中没有可选的敏感列',
              }) //'所选数据库中没有可选的敏感列'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div className={styles.centerContainer}>
          <Empty
            description={
              formatMessage({
                id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.OptionalSensitiveColumnsDoNot',
                defaultMessage: '可选的敏感列中不包含搜索关键字',
              }) //'可选的敏感列中不包含搜索关键字'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }
    if (databaseIds?.length === 0) {
      return (
        <div className={styles.centerContainer}>
          <Empty
            description={
              formatMessage({
                id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.NoChoiceDatabase',
                defaultMessage: '尚未选择数据库',
              }) //'尚未选择数据库'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
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
  const handleCollapseDelete = (root: SelectNode, leaf: SelectNodeChild) => {
    const newCheckedKeys = checkedKeys.filter(
      (checkedKey) => ![root.databaseKey, root.tableKey, leaf.key]?.includes(checkedKey),
    );
    setCheckedKeys(newCheckedKeys);
  };
  // 需要及时更新data以及defaultActiveKey，确保新增勾选项时Collapse能正常展开。
  const WrapCollapse = useCallback(() => {
    return (
      <Collapse defaultActiveKey={defaultActiveKey} ghost className={styles.wrapCollapse}>
        {data?.map((root) => {
          return (
            <Collapse.Panel
              header={
                <span className={styles.panelHeader}>
                  <span className={styles.headerIcon}>
                    <Icon
                      component={
                        root?.type === ESensitiveColumnType.TABLE_COLUMN ? TableOutlined : ViewSvg
                      }
                    />
                  </span>

                  {`${root?.databaseTitle}/${root?.tableTitle}`}
                </span>
              }
              key={`${root?.databaseId}/${root?.tableTitle}`}
            >
              {root?.children?.map((child, index) => {
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
                          <div className={styles.checkedTableColumnTooltip}>{child?.title}</div>
                        </Tooltip>
                      </div>
                      <Space align="baseline">
                        <Form.Item
                          name={[root?.databaseId, root?.type, root?.tableTitle, child?.title]}
                          rules={[
                            {
                              required: true,
                              message: formatMessage({
                                id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.PleaseChoose',
                                defaultMessage: '请选择',
                              }), //'请选择'
                            },
                          ]}
                          getValueFromEvent={(e) => colleageValueFromEvent(e, root, child)}
                        >
                          <Select
                            style={{
                              width: '165px',
                            }}
                            optionLabelProp="label"
                          >
                            {maskingAlgorithmOptions?.map((option, index) => {
                              const target = maskingAlgorithms?.find(
                                (maskingAlgorithm) => maskingAlgorithm?.id === option?.value,
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
                                          id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.DesensitizationMethod',
                                          defaultMessage: '脱敏方式',
                                        }) /* 脱敏方式 */,
                                        value: maskRuleTypeMap?.[target?.type],
                                      },
                                      {
                                        label: formatMessage({
                                          id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TestData',
                                          defaultMessage: '测试数据',
                                        }) /* 测试数据 */,
                                        value: target?.sampleContent,
                                      },
                                      {
                                        label: formatMessage({
                                          id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Preview',
                                          defaultMessage: '结果预览',
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
                        <DeleteOutlined onClick={() => handleCollapseDelete(root, child)} />
                      </Space>
                    </div>
                  </div>
                );
              })}
            </Collapse.Panel>
          );
        })}
      </Collapse>
    );
  }, [defaultActiveKey, data]);
  const handleDatabaseChange = debounce(() => {
    setAllColumns(0);
    setCheckedColumns(0);
    setCheckedKeys([]);
    setDatabaseColumns([]);
    if (databaseIds?.length > 0) {
      setData([]);
      setDefaultActiveKey([]);
      setOriginData([]);
      setFormData({});
      getColumns();
    } else {
      setTreeData([]);
      setOriginTreeData([]);
      setData([]);
      setDefaultActiveKey([]);
      setOriginData([]);
      setFormData({});
    }
  }, 500);
  useEffect(() => {
    handleDatabaseChange();
  }, [databaseIds]);
  useEffect(() => {
    handleCheckedKeysChange();
  }, [checkedKeys]);
  return (
    <div className={styles.exportCard}>
      <div className={styles.label}>
        {
          formatMessage({
            id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ChooseSensitiveLandscape',
            defaultMessage: '选择敏感列',
          }) /* 选择敏感列 */
        }
      </div>
      <div className={styles.doubleExportCardContainer}>
        <div className={styles.content}>
          <ExportCard
            title={
              formatMessage(
                {
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.SelectColumnCheckColumns',
                  defaultMessage: '选择列 ({checkedColumns}/{allColumns})',
                },
                { checkedColumns, allColumns },
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
                  id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.SelectedCheckColumnsItem',
                  defaultMessage: '已选 {checkedColumns} 项',
                },
                { checkedColumns },
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
                    id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.AreYouSureYouWant',
                    defaultMessage: '是否确定清空已选对象？',
                  }) //'确定要清空已选对象吗？'
                }
              >
                <a>
                  {
                    formatMessage({
                      id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.Empty',
                      defaultMessage: '清空',
                    }) /* 清空 */
                  }
                </a>
              </Popconfirm>
            }
            disabled
          >
            {data?.length > 0 ? (
              <Form layout="vertical" form={_formRef}>
                <WrapCollapse />
              </Form>
            ) : originData?.length === 0 ? (
              <div className={styles.centerContainer}>
                <Empty
                  description={
                    formatMessage({
                      id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.HaveNotCheckedTheSensitive',
                      defaultMessage: '尚未勾选敏感列',
                    }) //'尚未勾选敏感列'
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <div className={styles.centerContainer}>
                <Empty
                  description={
                    formatMessage({
                      id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.TheSelectedSensitiveColumnsDo',
                      defaultMessage: '已勾选的敏感列中不包含搜索关键字',
                    }) //'已勾选的敏感列中不包含搜索关键字'
                  }
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

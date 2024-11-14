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

import { getTableListByDatabaseName } from '@/common/network/table';
import {
  getShadowSyncAnalysisResult,
  getTaskDetail,
  startShadowSyncAnalysis,
} from '@/common/network/task';
import ExportCard from '@/component/ExportCard';
import HelpDoc from '@/component/helpDoc';
import { DbObjsIcon } from '@/constant';
import { ShadowSyncTaskParams, TaskDetail, TaskType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { useUnmountedRef } from 'ahooks';
import { Checkbox, Col, Form, Input, message, Radio, Row, Select, Space } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { clone, cloneDeep } from 'lodash';
import { inject, observer } from 'mobx-react';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { List as VirtualList } from 'react-virtualized';
import DatabaseSelect from '../../../component/DatabaseSelect';
import { IContentProps, IShaodwSyncData } from '../interface';
import styles from './index.less';

const Option = Select.Option;

interface IProps extends IContentProps {
  modalStore: ModalStore;
}

const SelectPanel = forwardRef<any, IProps>(function (
  { modalStore, databaseId, schemaName, connectionId, sessionId, projectId, data, setData },
  ref,
) {
  const { shadowSyncData } = modalStore;
  const [tables, setTables] = useState([]);
  const [sourceSearchValue, setSourceSearchValue] = useState(null);
  const [targetSearchValue, setTargetSearchValue] = useState(null);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [form] = Form.useForm<IShaodwSyncData>();
  const loopRef = useRef<any>();
  const unmountedRef = useUnmountedRef();

  const [selectDestTableNames, setSelectDestTableNames] = useState([]);

  const sourceDisplayTables = useMemo(() => {
    if (!sourceSearchValue) {
      return tables?.map((t) => ({ label: t.tableName, value: t.tableName }));
    }
    return tables
      .filter((table) => {
        return table.tableName?.toLowerCase().indexOf(sourceSearchValue?.toLowerCase()) > -1;
      })
      ?.map((t) => ({ label: t.tableName, value: t.tableName }));
  }, [tables, sourceSearchValue]);

  const targetDisplayTables = useMemo(() => {
    let targetTables = [];
    if (!targetSearchValue) {
      targetTables = Array.from(data.originTableNames);
    } else {
      targetTables = Array.from(data.originTableNames)?.filter(
        (name) => name?.toLowerCase().indexOf(targetSearchValue) > -1,
      );
    }
    return targetTables?.map((name) => ({
      label: data.prefix ? `${data.name}${name}` : `${name}${data.name}`,
      value: name,
    }));
  }, [targetSearchValue, data.originTableNames, data.prefix, data.name]);
  const [sourceSelectCount, sourceCount] = useMemo(() => {
    let _sourceSelectCount = sourceDisplayTables?.filter((t) => {
      return data.originTableNames.has(t.value);
    })?.length;
    return [_sourceSelectCount ?? 0, sourceDisplayTables?.length ?? 0];
  }, [sourceDisplayTables, data.originTableNames]);

  useImperativeHandle(
    ref,
    () => {
      return {
        next: async () => {
          const values = await form.validateFields();
          if (!values) {
            return;
          }
          let originTableNames = Array.from(data.originTableNames);
          if (values.syncAll) {
            /**
             * 同步全部的情况下，需要再更新一次表获取最新的全量数据
             */
            const tables = await updateTables();
            originTableNames = tables?.map((table) => table.tableName);
          }
          if (!originTableNames?.length) {
            message.warning(
              formatMessage({
                id: 'odc.CreateShadowSyncModal.SelectPanel.SelectASynchronizationObject',
                defaultMessage: '请选择同步对象',
              }),

              //请选择同步对象
            );
            return;
          }
          const destTableNames = originTableNames?.map((name) => {
            return values.prefix ? `${values.name}${name}` : `${name}${values.name}`;
          });
          const taskId = await startShadowSyncAnalysis(
            databaseId,
            connectionId,
            originTableNames,
            destTableNames,
          );

          if (!taskId) {
            return;
          }
          return new Promise((resolve) => {
            async function getResult() {
              const result = await getShadowSyncAnalysisResult(taskId);
              if (!result || unmountedRef.current) {
                resolve(false);
                return;
              }
              if (!result.completed) {
                loopRef.current = setTimeout(() => {
                  getResult();
                }, 3000);
              } else {
                if (selectDestTableNames.length) {
                  setSelectDestTableNames([]);
                }
                setData({
                  ...data,
                  originTableNames: new Set([]),
                  shadowAnalysisData: result,
                });

                resolve(true);
                return;
              }
            }
            getResult();
          });
        },
      };
    },
    [data],
  );

  async function updateTables() {
    if (!schemaName) {
      return;
    }
    const tables = await getTableListByDatabaseName(sessionId, schemaName);
    setTables(tables);
    setData({
      ...data,
      originTableNames: selectDestTableNames.length
        ? clone(new Set(selectDestTableNames))
        : new Set(),
    });

    return tables;
  }

  useEffect(() => {
    updateTables();
    return () => {
      clearTimeout(loopRef.current);
      loopRef.current = null;
    };
  }, [schemaName]);

  const TableIcon = DbObjsIcon.TABLE;

  function handleSelect(
    event: CheckboxChangeEvent,
    index: number = -1,
    requestTable?: { value: string }[],
  ) {
    const checked = requestTable ? true : event.target.checked;
    if (index !== -1) {
      // index不等于-1时，说明是VirtualList中的checkbox;
      if (checked) {
        data.originTableNames.add(sourceDisplayTables[index]?.value);
      } else {
        data.originTableNames.delete(sourceDisplayTables[index]?.value);
      }
      setIndeterminate(
        !!data.originTableNames.size && data.originTableNames.size < sourceDisplayTables.length,
      );
      setCheckAll(data.originTableNames.size === sourceDisplayTables.length);
    } else {
      if (checked) {
        data.originTableNames = new Set<string>(sourceDisplayTables.map((item) => item.value));
      } else {
        data.originTableNames.clear();
      }
      setIndeterminate(false);
      setCheckAll(checked);
    }
    setData({
      ...data,
      originTableNames: clone(data.originTableNames),
    });
  }

  useEffect(() => {
    const databaseId = shadowSyncData?.databaseId;
    const taskId = shadowSyncData?.taskId;

    if (databaseId) {
      form.setFieldsValue({ databaseId });
      setData({
        ...data,
        databaseId,
      });
    }

    if (taskId) {
      getTaskDetailValue(taskId, databaseId);
    }
  }, [shadowSyncData?.databaseId]);

  const getTaskDetailValue = async (taskId: number, databaseId: number) => {
    const detailRes = (await getTaskDetail(taskId)) as TaskDetail<ShadowSyncTaskParams>;

    const res = await getShadowSyncAnalysisResult(detailRes.parameters.comparingTaskId.toString());

    const newDataObj = {
      ...data,
      originTableNames: clone(new Set<string>(res?.tables?.map((item) => item.originTableName))),
    };

    if (!data.originTableNames.size) {
      newDataObj.originTableNames = new Set();
    }

    if (databaseId) {
      newDataObj.databaseId = databaseId;
    }

    setSelectDestTableNames(res?.tables?.map((item) => item.originTableName));
    setData(newDataObj);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={data}
      onValuesChange={(changedValues, values) => {
        if (changedValues.hasOwnProperty('prefix')) {
          values.name = changedValues.prefix ? '_test_' : '_t';
          form.setFieldsValue({
            name: values.name,
          });
        }
        setData({
          ...data,
          ...values,
        });
      }}
    >
      <DatabaseSelect projectId={projectId} type={TaskType.SHADOW} />
      <Form.Item
        extra={formatMessage({
          id: 'odc.CreateShadowSyncModal.SelectPanel.OnlyTheStructureOfThe',
          defaultMessage: '仅同步源表的结构，不同步数据',
        })}
        /*仅同步源表的结构，不同步数据*/ name="syncAll"
        label={formatMessage({
          id: 'odc.CreateShadowSyncModal.SelectPanel.SynchronizationRange',
          defaultMessage: '同步范围',
        })}

        /*同步范围*/
      >
        <Radio.Group
          onChange={() => {
            setData({
              ...data,
              originTableNames: new Set(),
            });
          }}
        >
          <Radio value={false}>
            {
              formatMessage({
                id: 'odc.CreateShadowSyncModal.SelectPanel.PartialTable',
                defaultMessage: '部分表',
              })

              /*部分表*/
            }
          </Radio>
          <Radio value={true}>
            {
              formatMessage({
                id: 'odc.CreateShadowSyncModal.SelectPanel.AllTables',
                defaultMessage: '全部表',
              })

              /*全部表*/
            }
          </Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        shouldUpdate
        label={
          <HelpDoc doc="shadowSyncTableName" leftText>
            {
              formatMessage({
                id: 'odc.CreateShadowSyncModal.SelectPanel.ShadowTableName',
                defaultMessage: '影子表名',
              })

              /*影子表名*/
            }
          </HelpDoc>
        }
      >
        <Space>
          <Form.Item noStyle name="prefix">
            <Select style={{ width: 120 }}>
              <Option value={false}>
                {
                  formatMessage({
                    id: 'odc.CreateShadowSyncModal.SelectPanel.AddSuffix',
                    defaultMessage: '添加后缀',
                  })

                  /*添加后缀*/
                }
              </Option>
              <Option value={true}>
                {
                  formatMessage({
                    id: 'odc.CreateShadowSyncModal.SelectPanel.AddPrefix',
                    defaultMessage: '添加前缀',
                  })

                  /*添加前缀*/
                }
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            name="name"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.CreateShadowSyncModal.SelectPanel.EnterAShadowTableName',
                  defaultMessage: '请输入影子表名',
                }),

                //请输入影子表名
              },
              {
                pattern: /^[\w]*$/,
                message: formatMessage({
                  id: 'odc.CreateShadowSyncModal.SelectPanel.OnlyEnglishNumbersAndUnderscores',
                  defaultMessage: '仅支持英文/数字/下划线',
                }),

                //仅支持英文/数字/下划线
              },
              {
                max: 32,
                message: formatMessage({
                  id: 'odc.CreateShadowSyncModal.SelectPanel.NoMoreThanCharacters',
                  defaultMessage: '不超过 32 个字符',
                }),

                //不超过 32 个字符
              },
            ]}
          >
            <Input style={{ width: 185 }} />
          </Form.Item>
        </Space>
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          if (getFieldValue('syncAll')) {
            return null;
          }
          return (
            <Form.Item
              shouldUpdate
              label={formatMessage({
                id: 'odc.CreateShadowSyncModal.SelectPanel.SynchronizeObjects',
                defaultMessage: '同步对象',
              })}

              /*同步对象*/
            >
              <Row className={styles.objectTrees}>
                <Col span={12}>
                  <ExportCard
                    onSearch={(v) => setSourceSearchValue(v)}
                    hasSelectAll={true}
                    onSelectAll={handleSelect}
                    indeterminate={indeterminate}
                    checkAll={checkAll}
                    title={
                      formatMessage({
                        id: 'odc.CreateShadowSyncModal.SelectPanel.SelectSourceTable',
                        defaultMessage: '选择源表',
                      }) +
                      //`选择源表`
                      `(${sourceSelectCount}/${sourceCount})`
                    }
                  >
                    <VirtualList
                      height={304}
                      width={315}
                      rowHeight={22}
                      overscanRowCount={25}
                      rowCount={sourceDisplayTables?.length}
                      rowRenderer={({ key, index, style: _style }) => {
                        return (
                          <Row key={key} style={{ height: 22, ..._style }}>
                            <Checkbox
                              checked={data.originTableNames.has(sourceDisplayTables[index]?.value)}
                              key={sourceDisplayTables[index]?.value}
                              onChange={(e: CheckboxChangeEvent) => handleSelect(e, index)}
                            >
                              <span
                                style={{ whiteSpace: 'nowrap' }}
                                title={sourceDisplayTables[index].label}
                              >
                                {sourceDisplayTables[index]?.label}
                              </span>
                            </Checkbox>
                          </Row>
                        );
                      }}
                    />
                  </ExportCard>
                </Col>
                <Col span={12}>
                  <ExportCard
                    onSearch={(v) => setTargetSearchValue(v)}
                    title={
                      formatMessage({
                        id: 'odc.CreateShadowSyncModal.SelectPanel.ShadowTable',
                        defaultMessage: '影子表',
                      }) +
                      //`影子表`
                      `(${targetDisplayTables?.length ?? 0})`
                    }
                    extra={
                      <a
                        onClick={() => {
                          setCheckAll(false);
                          setIndeterminate(false);
                          setData({
                            ...data,
                            originTableNames: new Set(),
                          });
                        }}
                      >
                        {
                          formatMessage({
                            id: 'odc.CreateShadowSyncModal.SelectPanel.Clear',
                            defaultMessage: '清空',
                          }) /*清空*/
                        }
                      </a>
                    }
                    disabled
                  >
                    <VirtualList
                      height={304}
                      width={315}
                      rowHeight={22}
                      overscanRowCount={25}
                      rowCount={targetDisplayTables?.length}
                      rowRenderer={({ key, index, style: _style }) => (
                        <Space
                          title={targetDisplayTables[index]?.label}
                          key={key}
                          style={{ height: 22, ..._style }}
                        >
                          <Icon component={TableIcon} />
                          <span
                            style={{ whiteSpace: 'nowrap' }}
                            title={targetDisplayTables[index]?.label}
                          >
                            {targetDisplayTables[index]?.label}
                          </span>
                          <a
                            className={styles.delete}
                            onClick={() => {
                              let newNames = cloneDeep(data.originTableNames);
                              if (newNames.size === targetDisplayTables.length) {
                                // 源表 全选时，影子表 单选删除。
                                setCheckAll(false);
                              }
                              newNames.delete(targetDisplayTables[index]?.value);
                              setIndeterminate(!!newNames.size); // newNames中元素个数大于零时，indeterminate为true; 当元素个数等于零时为false;
                              setData({
                                ...data,
                                originTableNames: newNames,
                              });
                            }}
                          >
                            <DeleteOutlined />
                          </a>
                        </Space>
                      )}
                    />
                  </ExportCard>
                </Col>
              </Row>
            </Form.Item>
          );
        }}
      </Form.Item>
    </Form>
  );
});

export default inject('modalStore')(observer(SelectPanel));

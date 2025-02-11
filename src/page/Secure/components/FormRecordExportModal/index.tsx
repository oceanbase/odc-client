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

import { exportAudit, getConnectionOptionList, getUserOptionList } from '@/common/network/manager';
import ConnectionPopover from '@/component/ConnectionPopover';
import { AuditEventActionMap } from '@/constant/record';
import type { IManagerPublicConnection, IManagerUser } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { downloadFile, getPreTime } from '@/util/utils';
import { Button, DatePicker, Drawer, Form, Popover, Select, Space, TreeSelect } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import type { DataNode } from 'antd/lib/tree';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';

const { Option } = Select;

const RangePicker = DatePicker.RangePicker;

interface IProps {
  visible: boolean;
  eventOptions: DataNode[];
  event: string[];
  onClose: () => void;
}

interface IEventTreeNode {
  title?: string;
  value?: string;
  key?: React.Key;
  children?: IEventTreeNode[];
}

const FormResourceGroupModal: React.FC<IProps> = (props) => {
  const { visible, event, eventOptions, onClose } = props;
  const [users, setUsers] = useState<IManagerUser[]>();
  const [publicConnections, setPublicConnections] = useState<IManagerPublicConnection[]>();
  const formRef = useRef<FormInstance>(null);

  const authorOptions: {
    label: string;
    value: number;
  }[] =
    users?.map((item) => {
      return {
        label: `${item.name} (${item.accountName})`,
        value: item.id,
      };
    }) ?? [];

  const getUserList = async () => {
    const users = await getUserOptionList();
    setUsers(users?.contents);
  };

  const getConnectionList = async () => {
    const connections = await getConnectionOptionList();
    setPublicConnections(connections?.contents);
  };

  const handleClose = () => {
    formRef.current?.resetFields();
    onClose();
  };

  const handleExport = async (data) => {
    const fileUrl = await exportAudit(data);
    if (fileUrl) {
      downloadFile(fileUrl);
      handleClose();
    }
  };

  const handleSubmit = () => {
    formRef.current
      .validateFields()
      .then((values) => {
        const { userIds, connectionIds, format, results, event, dateRange } = values;
        const eventActions = event?.filter((item) =>
          Object.keys(AuditEventActionMap).includes(item),
        );

        const data = {
          userIds,
          connectionIds,
          format,
          results,
          eventActions,
          startTime: dateRange?.[0]?.valueOf(),
          endTime: dateRange?.[1]?.valueOf(),
        };

        handleExport(data);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  useEffect(() => {
    getUserList();
    getConnectionList();
  }, []);

  return (
    <>
      <Drawer
        width={520}
        title={formatMessage({
          id: 'odc.components.FormRecordExportModal.ExportOperationRecords',
          defaultMessage: '导出操作记录',
        })}
        /*导出操作记录*/
        rootClassName={styles.exportModal}
        footer={
          <Space>
            <Button onClick={handleClose}>
              {
                formatMessage({
                  id: 'odc.components.FormRecordExportModal.Cancel',
                  defaultMessage: '取消',
                })

                /*取消*/
              }
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {
                formatMessage({
                  id: 'odc.components.FormRecordExportModal.Export',
                  defaultMessage: '导出',
                })

                /*导出*/
              }
            </Button>
          </Space>
        }
        destroyOnClose
        open={visible}
        onClose={handleClose}
      >
        <Form
          ref={formRef}
          layout="vertical"
          requiredMark="optional"
          initialValues={{
            event,
            format: 'CSV',
            dateRange: [dayjs(getPreTime(7)), dayjs()],
          }}
        >
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormRecordExportModal.ExecutionTimeRange',
              defaultMessage: '执行时间范围',
            })}
            /*执行时间范围*/ name="dateRange"
            required
            style={{ width: '360px' }}
          >
            <RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormRecordExportModal.EventAction',
              defaultMessage: '事件操作',
            })}
            /*事件操作*/ name="event"
          >
            <TreeSelect
              treeCheckable
              placeholder={formatMessage({
                id: 'odc.components.FormRecordExportModal.SelectAllByDefault',
                defaultMessage: '默认选择全部',
              })}
              /*默认选择全部*/ treeData={eventOptions}
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'src.page.Secure.components.FormRecordExportModal.2906C216',
              defaultMessage: '所属公共数据源',
            })}
            name="connectionIds"
          >
            <Select
              placeholder={formatMessage({
                id: 'odc.components.FormRecordExportModal.SelectAllByDefault',
                defaultMessage: '默认选择全部',
              })}
              /*默认选择全部*/
              mode="multiple"
              filterOption={(value, option) => {
                return option?.title?.toLowerCase()?.indexOf(value?.toLowerCase()) >= 0;
              }}
            >
              {publicConnections?.map((item: IManagerPublicConnection) => {
                const { name: labelName, id } = item;
                return (
                  <Option value={id} title={labelName} key={id}>
                    <Popover
                      overlayClassName={styles.connectionPopover}
                      placement="left"
                      content={<ConnectionPopover connection={item} />}
                    >
                      <div className={styles.labelName}>{labelName}</div>
                    </Popover>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormRecordExportModal.Executor',
              defaultMessage: '执行人',
            })}
            /*执行人*/ name="userIds"
          >
            <Select
              placeholder={formatMessage({
                id: 'odc.components.FormRecordExportModal.SelectAllByDefault',
                defaultMessage: '默认选择全部',
              })}
              /*默认选择全部*/
              mode="multiple"
              options={authorOptions}
              filterOption={(value, option) => {
                return (option?.label as string)?.toLowerCase()?.indexOf(value?.toLowerCase()) >= 0;
              }}
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormRecordExportModal.ExecutionResult',
              defaultMessage: '执行结果',
            })}
            /*执行结果*/ name="results"
            style={{ width: '340px' }}
          >
            <Select
              placeholder={formatMessage({
                id: 'odc.components.FormRecordExportModal.SelectAllByDefault',
                defaultMessage: '默认选择全部',
              })}
              /*默认选择全部*/
              mode="multiple"
              options={[
                {
                  label: formatMessage({
                    id: 'odc.components.FormRecordExportModal.Successful',
                    defaultMessage: '成功',
                  }),

                  //成功
                  value: 'SUCCESS',
                },

                {
                  label: formatMessage({
                    id: 'odc.components.FormRecordExportModal.Failed',
                    defaultMessage: '失败',
                  }),

                  //失败
                  value: 'FAILED',
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormRecordExportModal.ExportFormat',
              defaultMessage: '导出格式',
            })}
            /*导出格式*/ name="format"
            style={{ width: '160px' }}
            required
          >
            <Select
              options={[
                {
                  label: formatMessage({
                    id: 'odc.components.FormRecordExportModal.ExcelFormat',
                    defaultMessage: 'Excel 格式',
                  }),

                  //Excel 格式
                  value: 'EXCEL',
                },

                {
                  label: formatMessage({
                    id: 'odc.components.FormRecordExportModal.CsvFormat',
                    defaultMessage: 'CSV 格式',
                  }),

                  //CSV 格式
                  value: 'CSV',
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
export default FormResourceGroupModal;

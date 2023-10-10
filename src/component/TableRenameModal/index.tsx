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

import { ConnectionMode } from '@/d.ts';
import { ITableModel } from '@/page/Workspace/components/CreateTable/interface';
import { formatMessage } from '@/util/intl';
import { getQuoteTableName } from '@/util/utils';
import { Form, FormInstance, Input, message, Modal } from 'antd';
import React, { Component } from 'react';

interface IProps {
  model: Partial<ITableModel>;
  onSave: (values: Partial<ITableModel>) => void;
  visible: boolean;
  onCancel: () => void;
  dbMode: ConnectionMode;
}

class TableRenameModal extends Component<IProps> {
  form = React.createRef<FormInstance>();
  public save = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const { onSave, model, dbMode } = this.props;
    const data = await this.form.current.validateFields();
    if (!data) {
      return;
    }
    if (getQuoteTableName(model.info.tableName, dbMode) === data.tableName) {
      message.error(
        formatMessage({
          id: 'odc.component.TableRenameModal.TheTableNameHasNot',
        }),
        // 表名称未修改
      );
      return;
    }
    const newData = Object.assign({}, this.props.model, {
      info: {
        ...model.info,
        tableName: data.tableName,
      },
    });
    onSave(newData);
  };

  public render() {
    const { visible, onCancel, model, dbMode } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    return (
      <Modal
        destroyOnClose={true}
        title={formatMessage({ id: 'workspace.tree.table.rename.modal.title' })}
        open={visible}
        onOk={this.save}
        onCancel={onCancel}
        centered={true}
      >
        <Form
          ref={this.form}
          initialValues={{ tableName: getQuoteTableName(model?.info?.tableName, dbMode) }}
          {...formItemLayout}
        >
          <Form.Item
            extra={formatMessage({
              id: 'odc.component.TableRenameModal.TheContentInQuotationMarks',
            })} /*引号中内容区分大小写*/
            label={formatMessage({
              id: 'workspace.window.createTable.baseInfo.tableName',
            })}
            name="tableName"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'workspace.window.createTable.baseInfo.tableName.validation',
                }),
              },
            ]}
          >
            <Input
              placeholder={formatMessage({
                id: 'workspace.window.createTable.baseInfo.tableName.placeholder',
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default TableRenameModal;

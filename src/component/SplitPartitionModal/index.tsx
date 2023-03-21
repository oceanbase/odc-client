import { IPartitionType, ITablePartition } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Modal } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { Component } from 'react';

// @ts-ignore
import { getTitleByPartType } from '@/page/Workspace/components/CreateTablePartitionForm';
import { IFormPartition } from '@/page/Workspace/components/CreateTablePartitionRuleForm';
import PartitionRange from '../PartitionRange';
import styles from './index.less';

interface IProps {
  model: Partial<ITablePartition>;
  onSave: (partitions: Array<Partial<ITablePartition>>, source: Partial<ITablePartition>) => void;
  visible: boolean;
  onCancel: () => void;
}

export enum CheckOption {
  NONE = 'NONE',
}

class SplitPartitionModal extends Component<IProps> {
  public formRef = React.createRef<FormInstance>();

  public save = () => {
    const { onSave, model } = this.props;
    this.formRef.current
      .validateFields()
      .then((data) => {
        const partition: IFormPartition = {
          ...data,
        };
        if (
          partition.partType === IPartitionType.RANGE &&
          !partition.expression &&
          partition.columnName
        ) {
          partition.expression = partition.columnName;
          delete partition.columnName;
        }

        const partitions: Array<Partial<ITablePartition>> = partition.partitions.map(
          ({ name, value }) => ({
            partType: partition.partType,
            expression: partition.expression,
            partName: name, // 分区名称
            partValues: value,
          }),
        );
        onSave(partitions, model);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  public render() {
    const { visible, onCancel, model } = this.props;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 },
    };
    const initialValues = {
      partitions: [{ name: '', value: '' }],
    };

    return (
      <Modal
        width={1000}
        destroyOnClose={true}
        title={formatMessage({
          id: 'workspace.window.createTable.partition.split.title',
        })}
        visible={visible}
        onOk={this.save}
        onCancel={onCancel}
      >
        <Form {...formItemLayout} initialValues={initialValues} ref={this.formRef}>
          <Form.Item
            label={formatMessage({
              id: 'workspace.window.createTable.partition.split.source',
            })}
            className={styles.row}
          >
            <span className={styles.col}>
              {formatMessage({
                id: 'workspace.window.createTable.partition.name',
              })}
              ：{model.partName}
            </span>
            <span className={styles.col}>
              {getTitleByPartType(model.partType || IPartitionType.RANGE)}：{model.partValues}
            </span>
          </Form.Item>
          {(model.partType === IPartitionType.RANGE ||
            model.partType === IPartitionType.RANGE_COLUMNS ||
            model.partType === IPartitionType.LIST ||
            model.partType === IPartitionType.LIST_COLUMNS) && (
            <Form.Item
              name="partitions"
              label={formatMessage({
                id: 'workspace.window.createTable.partition.split.target',
              })}
            >
              <PartitionRange
                partitionType={model.partType}
                partitionValuePlaceholder={this.getPartitionValuePlaceholder(model.partType)}
                partitionValueLabel={this.getPartitionValueLabel(model.partType)}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  }

  private getPartitionValuePlaceholder(partitionType: IPartitionType) {
    if (partitionType === IPartitionType.LIST) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.list.placelholder',
      });
    } else if (partitionType === IPartitionType.LIST_COLUMNS) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.listColumns.placelholder',
      });
    } else if (partitionType === IPartitionType.RANGE) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.range.placelholder',
      });
    } else if (partitionType === IPartitionType.RANGE_COLUMNS) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.rangeColumns.placelholder',
      });
    }
    return '';
  }

  private getPartitionValueLabel(partitionType: IPartitionType) {
    if (partitionType === IPartitionType.LIST || partitionType === IPartitionType.LIST_COLUMNS) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.list',
      });
    } else if (
      partitionType === IPartitionType.RANGE_COLUMNS ||
      partitionType === IPartitionType.RANGE
    ) {
      return formatMessage({
        id: 'workspace.window.createTable.partition.value.range',
      });
    }
    return '';
  }
}

export default SplitPartitionModal;

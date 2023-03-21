import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react'; // compatible
import { Component } from 'react';

import { deleteConnectionLabel, updateConnectionLabel } from '@/common/network/connection';
import { labelColorsMap } from '@/constant';
import { IConnectionLabel } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Popconfirm, Space } from 'antd';
import LabelForm from '../LabelForm';
import styles from './index.less';
interface IProps {
  connectionStore?: ConnectionStore;
  label: IConnectionLabel;
  containerDOM: HTMLElement;
  labelsDOM: HTMLElement;
  updateEditList: (id: number, isEdit: boolean) => void;
}

@inject('connectionStore')
@observer
class LabelManageCell extends Component<
  IProps,
  {
    /**
     * 是否是编辑态
     */
    isEdit: boolean;
  }
> {
  public readonly state = {
    isEdit: false,
  };
  private handleEdit = () => {
    const { label, updateEditList } = this.props;
    updateEditList(label.id, true);
    this.setState({
      isEdit: true,
    });
  };
  private handleDelete = async () => {
    const { label, connectionStore, updateEditList } = this.props;
    await deleteConnectionLabel(label.id);
    await connectionStore.getLabelList();
    updateEditList(label.id, false);
  };
  private handleCancel = () => {
    const { label, updateEditList } = this.props;
    updateEditList(label.id, false);
    this.setState({
      isEdit: false,
    });
  };
  private handleUpdate = async (values, id: number) => {
    const { connectionStore, label, updateEditList } = this.props;
    await updateConnectionLabel({ ...values, id });
    await connectionStore.getLabelList();
    updateEditList(label.id, false);
  };

  public render() {
    const { label, containerDOM, labelsDOM } = this.props;
    const { isEdit } = this.state;
    const labelColor = labelColorsMap[label.labelColor];
    const labelStyle = {
      color: `${labelColor?.color}`,
      backgroundColor: `${labelColor?.bgColor}`,
    };
    return (
      <>
        {isEdit ? (
          <LabelForm
            label={label}
            onCancel={this.handleCancel}
            onOK={this.handleUpdate}
            labelsDOM={labelsDOM}
          />
        ) : (
          <div className={styles.label}>
            <span className={styles.labelTag} style={labelStyle}>
              {label.labelName}
            </span>
            <Space className={styles.labelOperator} size={12}>
              <EditOutlined
                style={{
                  fontSize: '14px',
                  color: 'var(--text-color-primary)',
                }}
                onClick={this.handleEdit}
              />
              <Popconfirm
                title={formatMessage({
                  id: 'odc.components.LabelManageCell.AfterTheTagIsDeleted',
                })}
                /*删除后，标签会在连接上消失，确定删除？*/
                onConfirm={this.handleDelete}
                getPopupContainer={() => containerDOM}
              >
                <DeleteOutlined
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-color-primary)',
                  }}
                />
              </Popconfirm>
            </Space>
          </div>
        )}
      </>
    );
  }
}

export default LabelManageCell;

import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react'; // compatible
import React, { Component } from 'react';

import { createConnectionLabel } from '@/common/network/connection';
import { IConnection, IConnectionLabel } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Popconfirm, Space } from 'antd';
import LabelForm from '../LabelForm';
import LabelManageCell from '../LabelManageCell';
import styles from './index.less';

interface IProps {
  connectionStore?: ConnectionStore;
  visible: boolean;
  activeConnection: IConnection;
  labels: IConnectionLabel[];
  containerDOM: HTMLElement;
  changeVisible: (e: boolean) => void;
  onChangeLabel: (connection: IConnection, labelId?: string | number) => void;
}

@inject('connectionStore')
@observer
class LabelManage extends Component<
  IProps,
  {
    /**
     * 默认情况下只有连接名称为必填，但是测试连接时需要填
     */
    isCreate: boolean;
    editList: number[];
  }
> {
  public labelsRef = React.createRef<HTMLDivElement>();

  public readonly state = {
    isCreate: false,
    editList: [],
  };

  componentDidUpdate(prevProps) {
    const { activeConnection } = this.props;
    if (prevProps?.activeConnection?.id !== activeConnection?.id) {
      this.setState({
        isCreate: !!activeConnection,
      });
    }
  }

  private handleConfirm = () => {
    const { editList } = this.state;
    this.props.changeVisible(false);
    if (editList.length) {
      this.setState({
        editList: [],
      });
    }
  };

  private handleCreateLabel = (isCreate: boolean) => {
    this.setState({
      isCreate,
    });
  };

  private handleOK = async (values) => {
    const { connectionStore, activeConnection } = this.props;
    const res = await createConnectionLabel(values);
    await connectionStore.getLabelList();
    if (activeConnection?.id) {
      this.props.onChangeLabel(activeConnection, res.id);
    }
  };

  private updateEditList = (id: number, isEdit: boolean) => {
    const editList = [...this.state.editList];
    if (isEdit) {
      editList.push(id);
    } else {
      editList.splice(
        editList.findIndex((item) => item === id),
        1,
      );
    }
    this.setState({
      editList,
    });
  };

  public render() {
    const { visible, labels } = this.props;
    const { isCreate, editList } = this.state;
    return (
      <Modal
        closable={false}
        title={formatMessage({ id: 'odc.components.LabelMange.TagManagement' })}
        /* 标签管理 */
        width={360}
        visible={visible}
        destroyOnClose
        centered
        footer={
          isCreate || editList.length ? (
            <Popconfirm
              title={formatMessage({
                id: 'odc.components.LabelMange.AfterTheTagIsClosed',
              })} /* 关闭后，未提交的标签不会生效，确定关闭？ */
              cancelText={formatMessage({
                id: 'odc.components.LabelMange.Cancel',
              })} /* 取消 */
              okText={formatMessage({
                id: 'odc.components.LabelMange.Determine',
              })} /* 确定 */
              onConfirm={this.handleConfirm}
              getPopupContainer={() => this.props.containerDOM}
            >
              <Button type="primary">
                {
                  formatMessage({
                    id: 'odc.components.LabelMange.Closed',
                  }) /* 关闭 */
                }
              </Button>
            </Popconfirm>
          ) : (
            <Button onClick={this.handleConfirm} type="primary">
              {
                formatMessage({
                  id: 'odc.components.LabelMange.Closed',
                }) /* 关闭 */
              }
            </Button>
          )
        }
        bodyStyle={{
          padding: '10px 16px',
        }}
        getContainer={() => this.props.containerDOM}
      >
        <div className={styles.manageWrapper}>
          <header>
            {isCreate ? (
              <LabelForm
                labelsDOM={this.labelsRef.current}
                onCancel={() => {
                  return this.handleCreateLabel(false);
                }}
                onOK={this.handleOK}
              />
            ) : (
              <Button
                block
                type="dashed"
                onClick={() => {
                  return this.handleCreateLabel(true);
                }}
              >
                <Space>
                  <PlusOutlined />
                  <span>
                    {
                      formatMessage({
                        id: 'odc.components.LabelMange.CreateTag',
                      }) /* 新建标签 */
                    }
                  </span>
                </Space>
              </Button>
            )}
          </header>
          <div className={styles.labelContent} ref={this.labelsRef}>
            {labels.map((item) => {
              return (
                <div className={styles.labelItemCell} key={item.id}>
                  <LabelManageCell
                    label={item}
                    containerDOM={this.props.containerDOM}
                    labelsDOM={this.labelsRef.current}
                    updateEditList={this.updateEditList}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    );
  }
}

export default LabelManage;

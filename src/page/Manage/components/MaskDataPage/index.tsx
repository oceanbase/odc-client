import {
  deleteMaskRule,
  getMaskRule,
  getMaskRuleList,
  setMaskRuleEnable,
} from '@/common/network/manager';
import { Acess, actionTypes, canAcess, systemUpdatePermissions } from '@/component/Acess';
import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import type { IMaskRule, IResponseData } from '@/d.ts';
import { IManagerResourceType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import type { FixedType } from 'rc-table/lib/interface';
import React from 'react';
import { ManageContext } from '../../context';
import CommonDetailModal from '../CommonDetailModal';
import Status from '../CommonStatus';
import FormMaskDataModal from '../FormMaskDataModal';
import { maskOptions } from '../FormMaskDataModal/config';
import { MaskRuleDetail } from './component';

import styles from './index.less';
interface IProps {}

interface IState {
  maskingRules: IResponseData<IMaskRule>;
  editId: number;
  detailId: number;
  formModalVisible: boolean;
  detailModalVisible: boolean;
}

export const maskFilters = maskOptions.map(({ label, value }) => {
  return {
    text: label,
    value,
  };
});

export const getMaskTypesMap = () => {
  const types = {};
  maskOptions.forEach(({ label, value }) => {
    types[value] = label;
  });
  return types;
};

class MaskDataPage extends React.PureComponent<IProps, IState> {
  static contextType = ManageContext;

  private tableRef = React.createRef<ITableInstance>();

  private maskTypesMap = getMaskTypesMap();

  readonly state = {
    editId: null,
    detailId: null,
    formModalVisible: false,
    detailModalVisible: false,
    maskingRules: null,
  };

  private getPageColumns = (canAcessDelete: boolean) => {
    return [
      {
        title: formatMessage({ id: 'odc.components.MaskDataPage.RuleName' }), //规则名称
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        fixed: 'left' as FixedType,
      },

      {
        title: formatMessage({
          id: 'odc.components.MaskDataPage.DesensitizationMethod',
        }), //脱敏方式
        width: 115,
        dataIndex: 'type',
        className: styles.title,
        key: 'type',
        ellipsis: true,
        filters: maskFilters,
        render: (type) => {
          return <span>{this.maskTypesMap[type]}</span>;
        },
      },

      {
        title: formatMessage({ id: 'odc.components.MaskDataPage.Status' }), //状态
        width: 115,
        ellipsis: true,
        key: 'enabled',
        dataIndex: 'enabled',
        filters: [
          {
            text: formatMessage({ id: 'odc.components.MaskDataPage.Enable' }), //启用
            value: true,
          },

          {
            text: formatMessage({ id: 'odc.components.MaskDataPage.Disable' }), //停用
            value: false,
          },
        ],

        render: (enabled) => <Status enabled={enabled} />,
      },

      {
        title: formatMessage({ id: 'odc.components.MaskDataPage.UpdateTime' }), //更新时间
        width: 190,
        ellipsis: true,
        key: 'updateTime',
        dataIndex: 'updateTime',
        sorter: true,
        render: (updateTime) => getLocalFormatDateTime(updateTime),
      },

      {
        title: formatMessage({ id: 'odc.components.MaskDataPage.Operation' }), //操作
        width: 124,
        key: 'action',
        fixed: 'right' as FixedType,
        render: (value, record) => (
          <Action.Group>
            <Action.Link
              onClick={async () => {
                this.openDetailModal(record.id);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.MaskDataPage.View',
                }) /*查看*/
              }
            </Action.Link>
            <Acess {...systemUpdatePermissions[IManagerResourceType.odc_data_masking_rule]}>
              <Action.Group size={1}>
                <Action.Link
                  disabled={record.builtIn}
                  onClick={async () => {
                    this.openFormModal(record.id);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.components.MaskDataPage.Edit',
                    }) /*编辑*/
                  }
                </Action.Link>
                {record.enabled ? (
                  <Action.Link
                    onClick={async () => {
                      this.handleStatusChange(false, record);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.MaskDataPage.Disable',
                      }) /*停用*/
                    }
                  </Action.Link>
                ) : (
                  <Action.Link
                    onClick={async () => {
                      this.handleStatusChange(true, record);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.MaskDataPage.Enable',
                      }) /*启用*/
                    }
                  </Action.Link>
                )}
                {canAcessDelete && (
                  <Action.Link
                    disabled={record.builtIn}
                    onClick={async () => {
                      this.handleDelete(record.id);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.components.MaskDataPage.Delete',
                      }) /*删除*/
                    }
                  </Action.Link>
                )}
              </Action.Group>
            </Acess>
          </Action.Group>
        ),
      },
    ];
  };

  private openFormModal = (id: number = null) => {
    this.setState({
      formModalVisible: true,
      editId: id,
    });
  };

  private openDetailModal = (detailId: number) => {
    this.setState({
      detailModalVisible: true,
      detailId,
    });
  };

  private handleStatusChange = (enabled: boolean, maskRule: IMaskRule, callback = () => {}) => {
    if (!enabled) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.MaskDataPage.AreYouSureYouWant',
        }), //确定要停用脱敏规则吗？
        content: (
          <>
            <div>
              {
                formatMessage({
                  id: 'odc.components.MaskDataPage.TheDesensitizationRuleAfterBeing',
                }) /*被停用后的脱敏规则，可能导致引用规则的敏感数据识别策略失效*/
              }
            </div>
            <div>
              {
                formatMessage({
                  id: 'odc.components.MaskDataPage.DisabledDesensitizationRulesAreStill',
                }) /*被停用的脱敏规则仍保留，支持启用*/
              }
            </div>
          </>
        ),

        cancelText: formatMessage({ id: 'odc.components.MaskDataPage.Cancel' }), //取消
        okText: formatMessage({ id: 'odc.components.MaskDataPage.Ok' }), //确定
        centered: true,
        onOk: () => {
          if (maskRule) {
            this.handleEnable({
              enabled,
              maskRule,
            });
          }
        },
        onCancel: callback,
      });
    } else {
      this.handleEnable({
        enabled,
        maskRule,
      });
    }
  };

  private handleDelete = (param: React.Key | React.Key[]) => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.MaskDataPage.AreYouSureYouWant.1',
      }), //确认要删除脱敏规则吗？
      icon: <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />,
      content: formatMessage({
        id: 'odc.components.MaskDataPage.AfterTheDesensitizationRuleIs',
      }), //删除脱敏规则后，可能导致引用规则的敏感数据识别策略失效
      cancelText: formatMessage({ id: 'odc.components.MaskDataPage.Cancel' }), //取消
      okText: formatMessage({ id: 'odc.components.MaskDataPage.Ok' }), //确定
      centered: true,
      onOk: () => {
        this.handleConfirmDelete(param as number);
      },
    });
  };

  private handleConfirmDelete = async (id: number) => {
    const res = await deleteMaskRule(id);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.MaskDataPage.DeletedSuccessfully',
        }), //删除成功
      );
      this.reloadData();
    }
  };

  private handleCloseDetailModal = () => {
    this.setState({
      detailModalVisible: false,
    });
  };

  private handleEnable = async (data: { maskRule: IMaskRule; enabled: boolean }) => {
    const { maskRule, enabled } = data;
    const res = await setMaskRuleEnable({
      id: maskRule.id,
      enabled,
    });

    if (res) {
      message.success(
        enabled
          ? formatMessage({ id: 'odc.components.MaskDataPage.Enabled' }) //启用成功
          : formatMessage({
              id: 'odc.components.MaskDataPage.DisabledSuccessfully',
            }), //停用成功
      );
      this.reloadData();
    } else {
      message.error(
        enabled
          ? formatMessage({ id: 'odc.components.MaskDataPage.FailedToEnable' }) //启用失败
          : formatMessage({ id: 'odc.components.MaskDataPage.DisableFailed' }), //停用失败
      );
    }
  };

  private loadData = async (args: ITableLoadOptions) => {
    const { searchValue = '', filters, sorter, pagination, pageSize } = args ?? {};
    const { enabled, type } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};

    const data = {
      name: searchValue,
      enabled: enabled,
      ruleTypes: type,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };

    // enabled filter
    data.enabled = enabled?.length ? enabled : undefined;
    // ruleTypes filter
    data.ruleTypes = type?.length ? type : undefined;
    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const maskingRules = await getMaskRuleList(data);
    this.setState({
      maskingRules,
    });
  };

  private reloadData = () => {
    this.tableRef.current.reload();
  };

  private handleCreate = () => {
    this.openFormModal();
  };

  render() {
    const { formModalVisible, detailModalVisible, editId, detailId, maskingRules } = this.state;
    const canAcessCreate = canAcess({
      resourceIdentifier: IManagerResourceType.odc_data_masking_rule,
      action: actionTypes.create,
    }).accessible;
    const canAcessDelete = canAcess({
      resourceIdentifier: IManagerResourceType.odc_data_masking_rule,
      action: actionTypes.delete,
    }).accessible;

    return (
      <>
        <CommonTable
          ref={this.tableRef}
          titleContent={{
            title: formatMessage({
              id: 'odc.components.MaskDataPage.DesensitizationRules',
            }), //脱敏规则
          }}
          filterContent={{
            searchPlaceholder: formatMessage({
              id: 'odc.components.MaskDataPage.EnterARuleName',
            }), //请输入规则名称
          }}
          operationContent={
            canAcessCreate
              ? {
                  options: [
                    {
                      type: IOperationOptionType.button,
                      content: (
                        <span>
                          {
                            formatMessage({
                              id: 'odc.components.MaskDataPage.CreateADesensitizationRule',
                            }) /*新建脱敏规则*/
                          }
                        </span>
                      ),
                      isPrimary: true,
                      onClick: this.handleCreate,
                    },
                  ],
                }
              : null
          }
          onLoad={this.loadData}
          onChange={this.loadData}
          tableProps={{
            columns: this.getPageColumns(canAcessDelete),
            dataSource: maskingRules?.contents,
            rowKey: 'id',
            pagination: {
              current: maskingRules?.page?.number,
              total: maskingRules?.page?.totalElements,
            },
          }}
        />

        <CommonDetailModal
          visible={detailModalVisible}
          className={styles.detail}
          title={formatMessage({
            id: 'odc.components.MaskDataPage.DetailsOfDesensitizationRules',
          })} /*脱敏规则详情*/
          detailId={detailId}
          tabs={[]}
          footer={
            <Button onClick={this.handleCloseDetailModal}>
              {
                formatMessage({
                  id: 'odc.components.MaskDataPage.Close',
                }) /*关闭*/
              }
            </Button>
          }
          onClose={this.handleCloseDetailModal}
          getDetail={() => getMaskRule(detailId)}
          renderContent={(key, data) => <MaskRuleDetail data={data} />}
        />

        <FormMaskDataModal
          editId={editId}
          visible={formModalVisible}
          handleStatusChange={this.handleStatusChange}
          reloadData={this.reloadData}
          onClose={() => {
            this.setState({
              formModalVisible: false,
              editId: null,
            });
          }}
        />
      </>
    );
  }
}

export default MaskDataPage;

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

import {
  deleteAutoRule,
  getAutoRule,
  getAutoRuleList,
  setAutoRuleEnable,
} from '@/common/network/manager';
import { Acess, actionTypes, canAcess, createPermission } from '@/component/Acess';
import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import CommonDetailModal from '@/component/Manage/DetailModal';
import SearchFilter from '@/component/SearchFilter';
import type { IAutoAuthRule, IResponseData } from '@/d.ts';
import { IManagerResourceType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { ExclamationCircleFilled, SearchOutlined } from '@ant-design/icons';
import { Button, message, Modal, Switch } from 'antd';
import type { FixedType } from 'rc-table/es/interface';
import React from 'react';
import { ResourceContext } from '../context';
import DetailContent from './component/DetailContent';
import FormModal from './component/FormModal';
import styles from './index.less';
import tracert from '@/util/tracert';
interface IProps {}
export const actionLabelMap = {
  BindRole: formatMessage({
    id: 'odc.components.AutoAuthPage.GrantRoles',
  }),
  //授予角色
  BindProjectRole: formatMessage({
    id: 'odc.src.page.Auth.Autoauth.AwardedProjectRole',
  }), //'授予项目角色'
};
interface IState {
  maskingRules: IResponseData<IAutoAuthRule>;
  editId: number;
  detailId: number;
  formModalVisible: boolean;
  detailModalVisible: boolean;
}
class AutoAuthPage extends React.PureComponent<IProps, IState> {
  private tableRef = React.createRef<ITableInstance>();
  static contextType = ResourceContext;
  readonly state = {
    editId: null,
    detailId: null,
    formModalVisible: false,
    detailModalVisible: false,
    maskingRules: null,
  };
  private getPageColumns = () => {
    return [
      {
        title: formatMessage({
          id: 'odc.components.AutoAuthPage.RuleName',
        }),
        //规则名称
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        fixed: 'left' as FixedType,
      },
      {
        title: formatMessage({
          id: 'odc.components.AutoAuthPage.Founder',
        }),
        //创建人
        width: 200,
        dataIndex: 'creatorName',
        className: styles.title,
        key: 'creatorName',
        ellipsis: true,
        filterDropdown: (props) => {
          return (
            <SearchFilter
              {...props}
              placeholder={formatMessage({
                id: 'odc.components.RecordPage.EnterTheExecutor',
              })}

              /*请输入执行人*/
            />
          );
        },

        filterIcon: (filtered) => (
          <SearchOutlined
            style={{
              color: filtered ? 'var(--icon-color-focus)' : undefined,
            }}
          />
        ),
        filters: [],
      },
      {
        title: formatMessage({
          id: 'odc.components.AutoAuthPage.CreationTime',
        }),
        //创建时间
        width: 160,
        ellipsis: true,
        key: 'updateTime',
        dataIndex: 'updateTime',
        sorter: true,
        render: (updateTime) => getFormatDateTime(updateTime),
      },
      {
        title: formatMessage({
          id: 'odc.Auth.Autoauth.EnableStatus',
        }),
        //启用状态
        width: 100,
        ellipsis: true,
        key: 'enabled',
        dataIndex: 'enabled',
        filters: [
          {
            text: formatMessage({
              id: 'odc.components.AutoAuthPage.Enable',
            }),
            //启用
            value: true,
          },
          {
            text: formatMessage({
              id: 'odc.components.AutoAuthPage.Disable',
            }),
            //停用
            value: false,
          },
        ],
        render: (enabled, record) => (
          <Switch
            size="small"
            checked={enabled}
            onChange={() => {
              this.handleStatusChange(!enabled, record);
            }}
          />
        ),
      },
      {
        title: formatMessage({
          id: 'odc.components.AutoAuthPage.Operation',
        }),
        //操作
        width: 132,
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
                  id: 'odc.components.AutoAuthPage.View',
                }) /*查看*/
              }
            </Action.Link>
            <Action.Group>
              <Acess {...createPermission(IManagerResourceType.auto_auth, actionTypes.update)}>
                <Action.Link
                  disabled={record.builtIn}
                  onClick={async () => {
                    this.openFormModal(record.id);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.components.AutoAuthPage.Edit',
                    }) /*编辑*/
                  }
                </Action.Link>
              </Acess>
              <Acess {...createPermission(IManagerResourceType.auto_auth, actionTypes.delete)}>
                <Action.Link
                  disabled={record.builtIn}
                  onClick={async () => {
                    this.handleDelete(record.id);
                  }}
                >
                  {
                    formatMessage({
                      id: 'odc.components.AutoAuthPage.Delete',
                    }) /*删除*/
                  }
                </Action.Link>
              </Acess>
            </Action.Group>
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
  private handleStatusChange = (enabled: boolean, maskRule: IAutoAuthRule, callback = () => {}) => {
    if (!enabled) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.AutoAuthPage.AreYouSureYouWant',
        }),
        //确定要停用自动授权规则吗？
        cancelText: formatMessage({
          id: 'odc.components.AutoAuthPage.Cancel',
        }),
        //取消
        okText: formatMessage({
          id: 'odc.components.AutoAuthPage.Ok',
        }),
        //确定
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
        id: 'odc.components.AutoAuthPage.AreYouSureYouWant.1',
      }),
      //确认要删除自动授权规则吗？
      icon: (
        <ExclamationCircleFilled
          style={{
            color: 'var(--icon-orange-color)',
          }}
        />
      ),
      cancelText: formatMessage({
        id: 'odc.components.AutoAuthPage.Cancel',
      }),
      //取消
      okText: formatMessage({
        id: 'odc.components.AutoAuthPage.Ok',
      }),
      //确定
      centered: true,
      onOk: () => {
        this.handleConfirmDelete(param as number);
      },
    });
  };
  private handleConfirmDelete = async (id: number) => {
    const res = await deleteAutoRule(id);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.AutoAuthPage.DeletedSuccessfully',
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
  private handleEnable = async (data: { maskRule: IAutoAuthRule; enabled: boolean }) => {
    const { maskRule, enabled } = data;
    const res = await setAutoRuleEnable({
      id: maskRule.id,
      enabled,
    });
    if (res) {
      message.success(
        enabled
          ? formatMessage({
              id: 'odc.components.AutoAuthPage.Enabled',
            }) //启用成功
          : formatMessage({
              id: 'odc.components.AutoAuthPage.DisabledSuccessfully',
            }), //停用成功
      );

      this.reloadData();
    } else {
      message.error(
        enabled
          ? formatMessage({
              id: 'odc.components.AutoAuthPage.FailedToEnable',
            }) //启用失败
          : formatMessage({
              id: 'odc.components.AutoAuthPage.DisableFailed',
            }), //停用失败
      );
    }
  };

  private loadData = async (args: ITableLoadOptions) => {
    const { searchValue = '', filters, sorter, pagination, pageSize } = args ?? {};
    const { enabled, creatorName } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const data = {
      name: searchValue,
      enabled: enabled,
      creatorName: creatorName,
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };

    // enabled filter
    data.enabled = enabled?.length ? enabled : undefined;
    // creatorName filter
    data.creatorName = creatorName?.length ? creatorName : undefined;
    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const maskingRules = await getAutoRuleList(data);
    this.setState({
      maskingRules,
    });
  };
  private reloadData = () => {
    this.tableRef.current.reload();
  };
  private handleCreate = () => {
    this.openFormModal();
    tracert.click('a3112.b64007.c330920.d367470');
  };
  componentDidMount() {
    this.context.loadConnections();
    this.context.loadRoles();
    this.context.loadProjectRoles();
    this.context.loadProjects();
    tracert.expo('a3112.b64007.c330920');
  }
  render() {
    const { formModalVisible, detailModalVisible, editId, detailId, maskingRules } = this.state;
    const canAcessCreate = canAcess({
      resourceIdentifier: IManagerResourceType.auto_auth,
      action: actionTypes.create,
    }).accessible;
    return (
      <>
        <CommonTable
          ref={this.tableRef}
          titleContent={null}
          filterContent={{
            searchPlaceholder: formatMessage({
              id: 'odc.components.AutoAuthPage.EnterARuleName',
            }), //请输入规则名称
          }}
          operationContent={
            canAcessCreate
              ? {
                  options: [
                    {
                      type: IOperationOptionType.button,
                      content: formatMessage({
                        id: 'odc.components.AutoAuthPage.CreateARule',
                      }),
                      //新建规则
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
            columns: this.getPageColumns(),
            dataSource: maskingRules?.contents,
            rowKey: 'id',
            pagination: {
              current: maskingRules?.page?.number,
              total: maskingRules?.page?.totalElements,
            },
          }}
        />

        <CommonDetailModal
          width={720}
          visible={detailModalVisible}
          className={styles.detail}
          title={formatMessage({
            id: 'odc.components.AutoAuthPage.RuleInformation',
          })}
          /*规则信息*/ detailId={detailId}
          tabs={[]}
          footer={
            <Button onClick={this.handleCloseDetailModal}>
              {
                formatMessage({
                  id: 'odc.components.AutoAuthPage.Close',
                }) /*关闭*/
              }
            </Button>
          }
          onClose={this.handleCloseDetailModal}
          getDetail={() => getAutoRule(detailId)}
          renderContent={(key, data) => <DetailContent data={data} />}
        />

        <FormModal
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
export default AutoAuthPage;

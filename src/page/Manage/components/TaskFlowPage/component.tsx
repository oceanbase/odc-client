import DisplayTable from '@/component/DisplayTable';
import MultiLineOverflowText from '@/component/MultiLineOverflowText';
import UserPopover from '@/component/UserPopover';
import { IManagerDetailTabs, IManagerResourceType, TaskSubType, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Space, Tabs, Timeline } from 'antd';
import React, { useContext } from 'react';
import { ManageContext } from '../../context';
import type { ITaskFlowConfig } from '../../interface';
import { EnabledRiskData } from '../FormTaskModal/component';
import { seconds2Hour, TaskSubTypeMap, TaskTypeMap } from './index';
import styles from './index.less';

const { TabPane } = Tabs;

const getColumns = () => {
  return [
    {
      dataIndex: 'resourceType',
      title: formatMessage({
        id: 'odc.components.TaskFlowPage.component.ObjectType',
      }), //对象类型
      ellipsis: true,
      width: 160,
      filters: [
        {
          text: formatMessage({
            id: 'odc.components.TaskFlowPage.component.PublicConnection',
          }), //公共连接
          value: IManagerResourceType.public_connection,
        },

        {
          text: formatMessage({
            id: 'odc.components.TaskFlowPage.component.ResourceGroup',
          }), //资源组
          value: IManagerResourceType.resource_group,
        },
      ],

      onFilter: (value, record) => record?.resourceType === value,
      render: (resourceType) => {
        return (
          <span>
            {
              resourceType === IManagerResourceType.public_connection
                ? formatMessage({
                    id: 'odc.components.TaskFlowPage.component.PublicConnection',
                  }) //公共连接
                : formatMessage({
                    id: 'odc.components.TaskFlowPage.component.ResourceGroup',
                  }) //资源组
            }
          </span>
        );
      },
    },

    {
      dataIndex: 'name',
      title: formatMessage({
        id: 'odc.components.TaskFlowPage.component.ObjectName',
      }), //对象名称
      ellipsis: true,
    },
  ];
};

export const TaskLabel: React.FC<{
  type: TaskType;
  subTypes: TaskSubType[];
}> = (props) => {
  const { type, subTypes } = props;
  const subTypeLabels = subTypes?.map((key) => TaskSubTypeMap[key]) ?? [];
  const subTypesContent = subTypeLabels.length ? `(${subTypeLabels.join(', ')})` : '';
  return (
    <>{type !== TaskType.ASYNC ? TaskTypeMap[type] : `${TaskTypeMap[type]}${subTypesContent}`}</>
  );
};

export const TaskDetail: React.FC<{
  data: ITaskFlowConfig;
}> = ({ data }) => {
  const { roles } = useContext(ManageContext);
  const {
    id,
    name,
    builtIn,
    creator,
    taskType,
    subTypes,
    description,
    createTime,
    riskLevelConfigs = [],
    approvalExpirationIntervalSeconds,
    waitExecutionExpirationIntervalSeconds,
    executionExpirationIntervalSeconds,
  } = data;
  return (
    <Descriptions column={1}>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.TaskFlowPage.component.TaskFlowName',
        })}
        /*任务流程名称*/ className={styles.statusBar}
      >
        <span>{name}</span>
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.TaskFlowPage.component.TaskType',
        })}

        /*任务类型*/
      >
        <TaskLabel type={taskType} subTypes={subTypes} />
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.TaskFlowPage.component.RiskLevels',
        })}

        /*风险等级数*/
      >
        {riskLevelConfigs.length}
        {
          formatMessage({
            id: 'odc.components.TaskFlowPage.component.Level',
          })

          /*级*/
        }
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.TaskFlowPage.component.ApprovalValidityPeriod',
        })}

        /*审批有效期*/
      >
        {seconds2Hour(approvalExpirationIntervalSeconds)}
        {
          formatMessage({
            id: 'odc.components.TaskFlowPage.component.Hours',
          })

          /*小时*/
        }
      </Descriptions.Item>
      {taskType !== TaskType.PERMISSION_APPLY && (
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.TaskFlowPage.component.WaitForValidityPeriod',
          })}

          /*执行等待有效期*/
        >
          {seconds2Hour(waitExecutionExpirationIntervalSeconds)}
          {
            formatMessage({
              id: 'odc.components.TaskFlowPage.component.Hours',
            })

            /*小时*/
          }
        </Descriptions.Item>
      )}
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.TaskFlowPage.component.ValidityPeriod',
        })}

        /*执行有效期*/
      >
        {seconds2Hour(executionExpirationIntervalSeconds)}
        {
          formatMessage({
            id: 'odc.components.TaskFlowPage.component.Hours',
          })

          /*小时*/
        }
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.TaskFlowPage.component.Remarks',
        })}

        /*备注*/
      >
        {description || '-'}
      </Descriptions.Item>
      <Descriptions.Item
        className={styles.processConfig}
        contentStyle={{ display: 'flex', flexDirection: 'column' }}
      >
        <Divider />
        <Tabs>
          {riskLevelConfigs.map((config, index) => {
            const {
              subTypes,
              isContainsRiskData,
              minAffectedRows,
              maxAffectedRows,
              approvalNodes,
              approvalRoleIdToInnerUserMap,
            } = config;
            const level = index + 1;
            return (
              <TabPane
                tab={
                  formatMessage(
                    {
                      id: 'odc.components.TaskFlowPage.component.LevelLevel',
                    },

                    { level: level },
                  )
                  //`等级${level}`
                }
                key={index}
              >
                <Descriptions column={1}>
                  {taskType === TaskType.ASYNC && (
                    <Descriptions.Item
                      label={formatMessage({
                        id: 'odc.components.TaskFlowPage.component.TaskSubclass',
                      })}

                      /*任务子类*/
                    >
                      {subTypes?.map((key) => TaskSubTypeMap[key])?.join(', ')}
                    </Descriptions.Item>
                  )}

                  {index > 0 && (
                    <>
                      {EnabledRiskData && (
                        <Descriptions.Item
                          label={formatMessage({
                            id: 'odc.components.TaskFlowPage.component.RiskData',
                          })}

                          /*风险数据*/
                        >
                          {
                            isContainsRiskData
                              ? formatMessage({
                                  id: 'odc.components.TaskFlowPage.component.Include',
                                })
                              : //包含
                                formatMessage({
                                  id: 'odc.components.TaskFlowPage.component.NotIncluded',
                                })

                            //不包含
                          }
                        </Descriptions.Item>
                      )}

                      <Descriptions.Item
                        label={formatMessage({
                          id: 'odc.components.TaskFlowPage.component.NumberOfChangedSqlStatements',
                        })}

                        /*变更的 SQL 数量范围*/
                      >
                        {`${minAffectedRows || 0}-${maxAffectedRows || 0}`}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
                {taskType === TaskType.ASYNC && <Divider />}
                <Timeline className={styles.timeLine}>
                  {approvalNodes?.map(({ roleId, autoApprove, roleName }, i) => {
                    const level = i + 1;
                    return (
                      <Timeline.Item key={`${id}-${i}`}>
                        <Descriptions column={1}>
                          <span className={styles.title}>
                            {
                              formatMessage(
                                {
                                  id: 'odc.components.TaskFlowPage.component.ApprovalNodeLevel',
                                },

                                { level: level },
                              )
                              //`审批节点${level}`
                            }
                          </span>
                          <Descriptions.Item
                            label={formatMessage({
                              id: 'odc.components.TaskFlowPage.component.ApprovalRole',
                            })}

                            /*审批角色*/
                          >
                            <Space>
                              <span>{roleName ?? '-'}</span>
                              {autoApprove && (
                                <span className={styles.description}>
                                  {
                                    formatMessage({
                                      id: 'odc.components.TaskFlowPage.component.AutomaticApproval',
                                    }) /*(自动审批)*/
                                  }
                                </span>
                              )}
                            </Space>
                          </Descriptions.Item>
                          <Descriptions.Item
                            className={styles.userList}
                            label={formatMessage({
                              id: 'odc.components.TaskFlowPage.component.Approver',
                            })}

                            /*可审批人*/
                          >
                            <MultiLineOverflowText
                              className={styles.approverWrapper}
                              isShowMore
                              content={
                                approvalRoleIdToInnerUserMap?.[roleId]?.map((item, index) => (
                                  <>
                                    <span>
                                      <UserPopover
                                        name={item?.name}
                                        accountName={item?.accountName}
                                        roles={item?.roleNames}
                                      />
                                    </span>
                                    {index < approvalRoleIdToInnerUserMap[roleId].length - 1 && (
                                      <span className={styles.split}>|</span>
                                    )}
                                  </>
                                )) ?? '-'
                              }
                            />
                          </Descriptions.Item>
                        </Descriptions>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
              </TabPane>
            );
          })}
        </Tabs>
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.TaskFlowPage.component.Created',
        })}

        /*创建人*/
      >
        <UserPopover
          name={creator?.name}
          accountName={creator?.accountName}
          roles={creator?.roleNames}
        />
      </Descriptions.Item>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.TaskFlowPage.component.Created.1',
        })}

        /*创建时间*/
      >
        {getFormatDateTime(createTime)}
      </Descriptions.Item>
    </Descriptions>
  );
};

const ResourcDetail: React.FC<{
  data: ITaskFlowConfig;
}> = ({ data }) => {
  const { associateAll, relatedResources } = data;
  const columns = getColumns();

  return (
    <Descriptions column={1}>
      <Descriptions.Item
        label={formatMessage({
          id: 'odc.components.TaskFlowPage.component.AssociatedConnection',
        })} /*关联连接*/
      >
        <span>
          {
            associateAll
              ? formatMessage({
                  id: 'odc.components.TaskFlowPage.component.AllPublicConnections',
                }) //全部公共连接
              : formatMessage({
                  id: 'odc.components.TaskFlowPage.component.PartialPublicConnection',
                }) //部分公共连接
          }
        </span>
      </Descriptions.Item>
      {!associateAll && (
        <Descriptions.Item>
          <Descriptions column={1} layout="vertical">
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.components.TaskFlowPage.component.ConnectionList',
              })} /*连接列表*/
              labelStyle={{
                paddingBottom: '8px',
              }}
            >
              <DisplayTable
                rowKey="id"
                columns={columns}
                dataSource={relatedResources}
                scroll={{
                  y: 500,
                }}
                disablePagination
              />
            </Descriptions.Item>
          </Descriptions>
        </Descriptions.Item>
      )}
    </Descriptions>
  );
};

const DetailContents = {
  [IManagerDetailTabs.DETAIL]: TaskDetail,
  [IManagerDetailTabs.RESOURCE]: ResourcDetail,
};

export const RecordContent: React.FC<{
  activeKey: IManagerDetailTabs;
  data: ITaskFlowConfig;
}> = ({ activeKey, ...rest }) => {
  const DetailContent = DetailContents[activeKey];
  return <DetailContent {...rest} />;
};

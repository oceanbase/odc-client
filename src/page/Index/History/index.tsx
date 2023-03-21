import { getMetaStoreInstance } from '@/common/metaStore';
import DisplayTable from '@/component/DisplayTable';
import type { IPage } from '@/d.ts';
import { UserStore } from '@/store/login';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Divider, Popover, Space, Tag } from 'antd';
import { isNaN } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Title from '../Title';
import styles from './index.less';

interface IProps {
  userStore?: UserStore;
}

const TabHistory: React.FC<IProps> = function ({ userStore }) {
  const [sessionSearchName, setSessionSearchName] = useState(null);
  const [historyTabs, setHistoryTabs] = useState<
    {
      tabKey: string;
      sessionId: string;
      sessionName: string;
      databaseName: string;
      initDate: number;
      pages: IPage[];
    }[]
  >([]);

  useEffect(() => {
    updateHistoryTabs();
  }, [userStore.user?.id, sessionSearchName]);

  async function updateHistoryTabs() {
    const result: [string, any][] = await getMetaStoreInstance().getAllItem();
    const expiredMap = result?.find(([key, value]) => {
      return key === 'expiredMap';
    })?.[1];
    setHistoryTabs(
      result
        ?.reverse()
        ?.map(([key, value]) => {
          let tabUserId = value?.userId;
          if (key === 'expiredMap') {
            return null;
          }
          if (!value?.sessionName && !value?.databaseName) {
            return null;
          }
          if (isNaN(new Date(value?.initDate).getTime())) {
            return null;
          }
          if (sessionSearchName && value?.sessionName?.indexOf(sessionSearchName) === -1) {
            /**
             * 连接名筛选
             */
            return null;
          }
          if (expiredMap?.[key]?.expiredTime && Date.now() > expiredMap[key].expiredTime) {
            /**
             * 过期了不展示
             */
            return null;
          }
          if (tabUserId && tabUserId != userStore.user?.id) {
            /**
             * 存在 userId 的 tab，我们需要校验是否为当前用户的tab
             * 但是假如不存在 userId, 说明是老的数据，默认为当前用户的tab
             */
            return null;
          }
          return {
            tabKey: key,
            ...value,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.initDate - a.initDate),
    );
  }

  const updateHistoryDate = useCallback(async (tabKey: string) => {
    const oldData = await getMetaStoreInstance().getItem(tabKey);
    if (oldData) {
      await getMetaStoreInstance().setItem(tabKey, {
        ...oldData,
        initDate: Date.now(),
      });

      updateHistoryTabs();
    }
  }, []);

  const columns = useMemo(() => {
    return [
      {
        title: formatMessage({
          id: 'odc.components.TabHistory.ConnectionName',
        }),

        // 连接名
        dataIndex: 'sessionName',
        width: 150,
      },

      {
        title: formatMessage({
          id: 'odc.components.TabHistory.DatabaseNameSchema',
        }),

        // 库名/Schema
        dataIndex: 'databaseName',
        ellipsis: true,
        width: 100,
      },

      {
        title: formatMessage({ id: 'odc.components.TabHistory.SqlPlWindow' }), // SQL/PL 窗口
        dataIndex: 'pages',
        render(pages: IPage[]) {
          return (
            <Space style={{ paddingTop: 5 }} size={[5, 5]} wrap>
              {pages
                ?.filter((r) => ['SQL', 'PL'].includes(r.type))
                .slice(0, 15)
                ?.map((page) => {
                  const scriptText: string =
                    page?.params?.scriptText ||
                    formatMessage({
                      id: 'odc.components.TabHistory.NoContent',
                    });

                  // 无内容
                  return (
                    <Popover
                      placement="bottomRight"
                      title={page.title}
                      content={
                        <div
                          style={{
                            maxWidth: 600,
                            wordBreak: 'break-all',
                          }}
                        >
                          {scriptText?.substring?.(0, 300) +
                            (scriptText?.length > 300 ? '...' : '')}
                        </div>
                      }
                    >
                      <Tag>
                        <span
                          style={{
                            maxWidth: 75,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          {page.title}
                        </span>
                      </Tag>
                    </Popover>
                  );
                })}
              {pages?.length > 15 ? '...' : ''}
            </Space>
          );
        },
      },

      {
        title: formatMessage({ id: 'odc.components.TabHistory.LastOpenTime' }), // 最近打开时间
        dataIndex: 'initDate',
        width: 200,
        sorter: (a, b) => a?.initDate - b?.initDate,
        render(t) {
          return getLocalFormatDateTime(t);
        },
      },

      {
        title: formatMessage({ id: 'odc.components.TabHistory.Operation' }), // 操作
        dataIndex: '_tools',
        width: 80,
        render(_, record) {
          return (
            <a
              onClick={async () => {
                await updateHistoryDate(record.tabKey);
                window.open(
                  `#/workspace/session/${record.tabKey}/sid:${record?.sessionId}:d:${record?.databaseName}`,
                  record.tabKey,
                );
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.TabHistory.Open',
                })
                /* 打开 */
              }
            </a>
          );
        },
      },
    ];
  }, []);

  return (
    <div className={styles.box}>
      <Title
        tip={formatMessage({
          id: 'odc.components.TabHistory.NoteTheHistoryWindowRecords',
        })}
      >
        {
          formatMessage({
            id: 'odc.Index.History.HistoricalConversation',
          }) /*历史会话*/
        }
      </Title>
      <Divider style={{ margin: 0 }} />
      <DisplayTable dataSource={historyTabs} columns={columns} />
    </div>
  );
};

export default inject('userStore')(observer(TabHistory));

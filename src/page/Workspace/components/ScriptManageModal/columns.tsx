import { deleteScript, downloadScript, syncScript } from '@/common/network';
import { IScriptMeta } from '@/d.ts';
import { closePageByScriptIdAndType, openSQLPageByScript } from '@/store/helper/page';
import modalStore from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { formatBytes, getLocalFormatDateTime } from '@/util/utils';
import { Button, Dropdown, Menu, message, Popconfirm, Space, Tooltip } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useCallback } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export function useColumns(
  setEditingScriptId,
  maxScriptEditLength,
  fetchScriptList,
): ColumnType<IScriptMeta>[] {
  const download = useCallback((scriptId: string | number) => {
    downloadScript(scriptId);
  }, []);
  const copy = useCallback(async (scriptId: string | number) => {
    const res = await syncScript(scriptId);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.OBClientPage.ScriptManageModal.CopiedSuccessfully',
        }),
        // `复制成功！`
      );
    } else {
      message.error(
        formatMessage({ id: 'odc.components.ScriptManageModal.columns.ReplicationFailed' }), //复制失败
      );
    }
  }, []);
  const onDelete = useCallback(
    (scriptId: string | number) => {
      deleteScript([scriptId]).then((isSuccess) => {
        if (isSuccess) {
          message.success(
            formatMessage({
              id: 'odc.components.ScriptManageModal.columns.Deleted',
            }),
            //删除成功
          );
          closePageByScriptIdAndType(scriptId);
          fetchScriptList();
        }
      });
    },
    [fetchScriptList],
  );

  return [
    {
      title: formatMessage({
        id: 'odc.components.OBClientPage.ScriptManageModal.ScriptName',
      }),

      // 脚本名称
      dataIndex: 'objectName',
      width: 120,
      ellipsis: true,
      render(t, _) {
        const maxLimitText = formatBytes(maxScriptEditLength);
        if (_.contentLength >= maxScriptEditLength) {
          return (
            <Tooltip
              title={
                formatMessage(
                  {
                    id: 'odc.components.ScriptManageModal.columns.CurrentlyYouCannotEditFiles',
                  },
                  { maxLimitText: maxLimitText },
                )
                //`暂不支持超过 ${maxLimitText} 的文件编辑`
              }
            >
              {t}
            </Tooltip>
          );
        }
        return (
          <a
            onClick={() => {
              openSQLPageByScript(_.id);
              modalStore.changeScriptManageModalVisible(false);
            }}
          >
            {t}
          </a>
        );
      },
    },

    {
      title: formatMessage({
        id: 'odc.components.ScriptManageModal.columns.ScriptContent',
      }),
      //脚本内容
      dataIndex: 'contentAbstract',
      ellipsis: true,
    },

    {
      title: formatMessage({
        id: 'odc.components.ScriptManageModal.columns.UpdateTime',
      }),
      //更新时间
      dataIndex: 'updateTime',
      width: 180,
      sorter: (a, b) => a.updateTime - b.updateTime,
      render: (t) => {
        return getLocalFormatDateTime(t);
      },
    },

    {
      title: formatMessage({
        id: 'odc.components.OBClientPage.ScriptManageModal.Operation',
      }),

      // 操作
      dataIndex: 'actions',
      width: 120,
      render: (_, t) => {
        const maxLimitText = formatBytes(maxScriptEditLength);
        /**
         * path 就是 objectId + '.' +文件后缀
         */
        const nameArr = t.objectName.split('.');
        const path = nameArr.length > 1 ? `${t.objectId}.${nameArr.pop()}` : t.objectId;
        return (
          <Space>
            <CopyToClipboard key="copy" text={path} onCopy={() => copy(t.id)}>
              <a>
                {
                  formatMessage({
                    id: 'odc.components.OBClientPage.ScriptManageModal.CopyPath',
                  })

                  /* 复制路径 */
                }
              </a>
            </CopyToClipboard>
            {t.contentLength >= maxScriptEditLength ? (
              <Tooltip
                title={
                  formatMessage(
                    {
                      id: 'odc.components.ScriptManageModal.columns.CurrentlyYouCannotEditFiles',
                    },
                    { maxLimitText: maxLimitText },
                  )
                  //`暂不支持超过 ${maxLimitText} 的文件编辑`
                }
              >
                <span>
                  {
                    formatMessage({
                      id: 'odc.components.ScriptManageModal.columns.Edit',
                    })
                    /*编辑*/
                  }
                </span>
              </Tooltip>
            ) : (
              <a
                onClick={() => {
                  setEditingScriptId(t.id);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.ScriptManageModal.columns.Edit',
                  })
                  /*编辑*/
                }
              </a>
            )}

            <Dropdown
              placement="bottomRight"
              overlay={
                <Menu>
                  <Menu.Item key="1">
                    <Button
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        download(t.id);
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.components.ScriptManageModal.columns.Download',
                        })
                        /*下载*/
                      }
                    </Button>
                  </Menu.Item>
                  <Menu.Item key="2">
                    <Popconfirm
                      title={formatMessage({
                        id: 'odc.components.OBClientPage.ScriptManageModal.AreYouSureYouWant',
                      })}
                      /* 确认删除已上传文件？ */
                      onConfirm={onDelete.bind(null, t.id)}
                    >
                      <Button type="link">
                        {
                          formatMessage({
                            id: 'odc.components.OBClientPage.ScriptManageModal.Delete',
                          })

                          /* 删除 */
                        }
                      </Button>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>
              }
            >
              <a>...</a>
            </Dropdown>
          </Space>
        );
      },
    },
  ];
}

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

import Action from '@/component/Action';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { message, Modal, Tooltip } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

import { deleteScript, downloadScript, syncScript } from '@/common/network';
import { ReactComponent as ConsoleSQLSvg } from '@/svgr/Console-SQL.svg';
import { formatMessage } from '@/util/intl';
import { useCallback } from 'react';

import { IScriptMeta } from '@/d.ts';
import { closePageByScriptIdAndType } from '@/store/helper/page';
import login from '@/store/login';
import setting from '@/store/setting';
import { formatBytes } from '@/util/utils';
import copyToCB from 'copy-to-clipboard';
import { toString } from 'lodash';

interface IProps {
  name: string;
  script?: IScriptMeta;
  uploading?: boolean;
  errorMsg?: string;
  onClick?: () => void;
  removeUploadFile?: () => void;
  editFile?: () => void;
}

export default function Item({
  uploading,
  removeUploadFile,
  editFile,
  errorMsg,
  name,
  script,
  onClick,
}: IProps) {
  const isSuccess = !uploading && !errorMsg;

  const copy = useCallback(async (script: IScriptMeta) => {
    const res = await syncScript(script?.id);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.OBClientPage.ScriptManageModal.CopiedSuccessfully',
          defaultMessage: '复制成功！',
        }),
        // `复制成功！`
      );
      const nameArr = script.objectName.split('.');
      const path = nameArr.length > 1 ? `${script.objectId}.${nameArr.pop()}` : script.objectId;
      copyToCB(toString(path));
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.ScriptManageModal.columns.ReplicationFailed',
          defaultMessage: '复制失败',
        }), //复制失败
      );
    }
  }, []);

  const onDelete = (script: IScriptMeta) => {
    Modal.confirm({
      title: formatMessage({
        id: 'odc.ScriptFile.Item.OkDeleteScript',
        defaultMessage: '确定删除脚本',
      }), //确定删除脚本
      onOk() {
        return deleteScript([script?.id]).then((isSuccess) => {
          if (isSuccess) {
            message.success(
              formatMessage({
                id: 'odc.components.ScriptManageModal.columns.Deleted',
                defaultMessage: '删除成功',
              }),
              //删除成功
            );
            closePageByScriptIdAndType(script.id);
            login.scriptStore.getScriptList();
          }
        });
      },
    });
  };

  const maxScriptEditLength = setting.serverSystemInfo?.maxScriptEditLength;

  return (
    <Tooltip title={errorMsg}>
      <div
        onClick={onClick}
        className={classNames(styles.item, {
          [styles.error]: !!errorMsg,
          [styles.uploading]: uploading,
        })}
      >
        <div className={styles.icon}>
          <Icon
            component={ConsoleSQLSvg}
            style={{
              color: isSuccess ? 'var(--icon-color-1)' : 'var(--icon-color-disable)',
              fontSize: 14,
            }}
          />
        </div>
        <div className={styles.label}>{name}</div>
        <div className={styles.action}>
          {isSuccess ? (
            <Action.Group ellipsisIcon="vertical" size={0}>
              <Action.Link
                onClick={() => {
                  copy(script);
                }}
                key={'copy'}
              >
                {
                  formatMessage({
                    id: 'odc.ScriptFile.Item.CopyPath',
                    defaultMessage: '复制路径',
                  }) /*复制路径*/
                }
              </Action.Link>
              {script?.contentLength >= maxScriptEditLength ? (
                <Tooltip
                  title={
                    formatMessage(
                      {
                        id: 'odc.components.ScriptManageModal.columns.CurrentlyYouCannotEditFiles',
                        defaultMessage: '暂不支持超过 {maxLimitText} 的文件编辑',
                      },
                      { maxLimitText: formatBytes(maxScriptEditLength) },
                    )
                    //`暂不支持超过 ${maxLimitText} 的文件编辑`
                  }
                >
                  <Action.Link key="edit" disabled>
                    {
                      formatMessage({
                        id: 'odc.components.ScriptManageModal.columns.Edit',
                        defaultMessage: '编辑',
                      })
                      /*编辑*/
                    }
                  </Action.Link>
                </Tooltip>
              ) : (
                <Action.Link key="edit" onClick={editFile}>
                  {
                    formatMessage({
                      id: 'odc.components.ScriptManageModal.columns.Edit',
                      defaultMessage: '编辑',
                    })
                    /*编辑*/
                  }
                </Action.Link>
              )}

              <Action.Link onClick={() => downloadScript(script.id)} key="download">
                {
                  formatMessage({
                    id: 'odc.ScriptFile.Item.Download',
                    defaultMessage: '下载',
                  }) /*下载*/
                }
              </Action.Link>
              <Action.Link onClick={() => onDelete(script)} key="delete">
                {
                  formatMessage({
                    id: 'odc.ScriptFile.Item.Delete',
                    defaultMessage: '删除',
                  }) /*删除*/
                }
              </Action.Link>
            </Action.Group>
          ) : (
            <DeleteOutlined
              onClick={() => {
                removeUploadFile?.();
              }}
            />
          )}
        </div>
      </div>
    </Tooltip>
  );
}

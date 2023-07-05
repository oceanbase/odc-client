import Action from '@/component/Action';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { message, Modal, Tooltip } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

import { deleteScript, downloadScript, syncScript } from '@/common/network';
import ConsoleSQLSvg from '@/svgr/Console-SQL.svg';
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
        }),
        // `复制成功！`
      );
      const nameArr = script.objectName.split('.');
      const path = nameArr.length > 1 ? `${script.objectId}.${nameArr.pop()}` : script.objectId;
      copyToCB(toString(path));
    } else {
      message.error(
        formatMessage({ id: 'odc.components.ScriptManageModal.columns.ReplicationFailed' }), //复制失败
      );
    }
  }, []);

  const onDelete = (script: IScriptMeta) => {
    Modal.confirm({
      title: '确定删除脚本',
      onOk() {
        return deleteScript([script?.id]).then((isSuccess) => {
          if (isSuccess) {
            message.success(
              formatMessage({
                id: 'odc.components.ScriptManageModal.columns.Deleted',
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
                复制路径
              </Action.Link>
              {script?.contentLength >= maxScriptEditLength ? (
                <Tooltip
                  title={
                    formatMessage(
                      {
                        id: 'odc.components.ScriptManageModal.columns.CurrentlyYouCannotEditFiles',
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
                    })
                    /*编辑*/
                  }
                </Action.Link>
              )}
              <Action.Link onClick={() => downloadScript(script.id)} key="download">
                下载
              </Action.Link>
              <Action.Link onClick={() => onDelete(script)} key="delete">
                删除
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

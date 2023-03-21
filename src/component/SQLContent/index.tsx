import { getCycleTaskFile, getTaskFile } from '@/common/network/task';
import { SQLCodeEditor } from '@/component/SQLCodeEditor';
import { TaskType } from '@/d.ts';
import type { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { downloadFile } from '@/util/utils';
import type { IEditor } from '@alipay/ob-editor';
import { Button, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';

@inject('settingStore')
@observer
export class SQLContent extends React.PureComponent<{
  type?: TaskType;
  sqlObjectIds: string[];
  sqlObjectNames: string[];
  sqlContent: string;
  taskId: number;
  isMySQL: boolean;
  settingStore?: SettingStore;
}> {
  public editor: IEditor;

  handleDownloadFile = async (index: number) => {
    const { taskId, sqlObjectIds, type = '' } = this.props;
    const getFile = type === TaskType.SQL_PLAN ? getCycleTaskFile : getTaskFile;
    const fileUrl = await getFile(taskId, [sqlObjectIds?.[index]]);
    fileUrl?.forEach((url) => {
      url && downloadFile(url);
    });
  };

  render() {
    const { sqlObjectNames, sqlContent, isMySQL, settingStore } = this.props;
    return (
      <div className={styles.sqlContent}>
        {sqlObjectNames ? (
          <div className={styles.files}>
            {sqlObjectNames?.map((file, index) => (
              <Space key={index}>
                <span>{file}</span>
                {settingStore.enableDataExport && (
                  <Button
                    type="link"
                    download
                    onClick={() => {
                      this.handleDownloadFile(index);
                    }}
                  >
                    {
                      formatMessage({
                        id: 'odc.AsyncTask.components.Download',
                      }) /* 下载 */
                    }
                  </Button>
                )}
              </Space>
            ))}
          </div>
        ) : (
          <div className={styles.content}>
            <SQLCodeEditor
              readOnly
              initialValue={sqlContent}
              language={`sql-oceanbase-${isMySQL ? 'mysql' : 'oracle'}`}
              onEditorCreated={async (e: IEditor) => {
                this.editor = e;
                await this.editor.doFormat();
              }}
            />
          </div>
        )}
      </div>
    );
  }
}

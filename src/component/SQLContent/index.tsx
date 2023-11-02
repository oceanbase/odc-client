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

import { getCycleTaskFile, getTaskFile } from '@/common/network/task';
import { TaskType } from '@/d.ts';
import type { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { downloadFile } from '@/util/utils';
import { Button, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import MonacoEditor, { IEditor } from '../MonacoEditor';
import styles from './index.less';

@inject('settingStore')
@observer
export class SQLContent extends React.PureComponent<{
  type?: TaskType;
  sqlObjectIds: string[];
  sqlObjectNames: string[];
  sqlContent: string;
  taskId: number;
  language: string;
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
    const { sqlObjectNames, sqlContent, language, settingStore } = this.props;
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
            <MonacoEditor
              readOnly
              defaultValue={sqlContent}
              language={language}
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

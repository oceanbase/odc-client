import { formatMessage } from '@/util/intl';
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

import { Button, Drawer, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { SQLCodePreviewer } from '@/component/SQLCodePreviewer';
import styles from './index.less';

interface IProps {
  visible: boolean;
  previewData: {
    tableName: string;
    sqls: string[];
  }[];
  onClose: () => void;
}
const PreviewSQLModal: React.FC<IProps> = (props) => {
  const { visible, previewData, onClose } = props;
  const [activeKey, setActiveKey] = useState(previewData?.[0]?.tableName);
  const activePreview = previewData?.find((item) => item.tableName === activeKey);
  const sql = activePreview?.sqls?.join('\n') ?? '';

  const handleChange = (key) => {
    setActiveKey(key);
  };

  useEffect(() => {
    if (previewData?.length) {
      setActiveKey(previewData?.[0]?.tableName);
    }
  }, [previewData]);

  return (
    <Drawer
      title={
        formatMessage({
          id: 'src.component.Task.component.PartitionPolicyFormTable.PreviewSQLModal.C02356A3',
        }) /*"SQL 预览"*/
      }
      open={visible}
      width={840}
      onClose={onClose}
      footer={
        <Button style={{ float: 'right' }} onClick={onClose}>
          {
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.PreviewSQLModal.7E1FC0D5' /*关闭*/,
            }) /* 关闭 */
          }
        </Button>
      }
    >
      <Tabs
        className={styles.tabs}
        type="card"
        activeKey={activeKey}
        items={previewData?.map(({ tableName }) => {
          return {
            label: tableName,
            key: tableName,
          };
        })}
        onChange={handleChange}
      />

      <div className={styles.wrapper}>
        <SQLCodePreviewer readOnly language="sql" value={sql} />
      </div>
    </Drawer>
  );
};

export default PreviewSQLModal;

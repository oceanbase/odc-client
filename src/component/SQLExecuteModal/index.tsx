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

import { executeSQL } from '@/common/network/sql';
import { ConnectionMode, ISqlExecuteResultStatus } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { message, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import CommonIDE from '../CommonIDE';
import { getDataSourceModeConfig } from '@/common/datasource';

function SQLExecuteModal(props: {
  isPL?: boolean;
  sql?: string;
  visible?: boolean;
  session: SessionStore;
  onClose: () => void;
  onSuccess: (innerSQL: string) => void;
}) {
  const { session, sql, visible, onClose, onSuccess } = props;
  const [innerSQL, setInnerSQL] = useState(sql);

  useEffect(() => {
    setInnerSQL(sql);
  }, [sql]);

  const doExecuteSQL = useCallback(async () => {
    try {
      const result = await executeSQL(innerSQL, session.sessionId, session.database?.dbName);
      if (!result) {
        return;
      }
      if (result?.invalid) {
        onClose();
      } else if (result?.executeResult?.[0]?.status === ISqlExecuteResultStatus.SUCCESS) {
        onSuccess(innerSQL);
        message.success(
          formatMessage({
            id: 'odc.component.SQLExecuteModal.ExecutionSucceeded',
          }), // 执行成功
        );
      } else {
        notification.error(result?.executeResult?.[0]);
      }
    } catch (e) {
      //
    }
  }, [innerSQL, onSuccess]);

  return (
    <Modal
      title={formatMessage({
        id: 'odc.component.SQLExecuteModal.SqlConfirmation',
      })} /* SQL 确认 */
      width={600}
      bodyStyle={{
        height: 400,
      }}
      open={visible}
      destroyOnClose
      okButtonProps={{
        disabled: !innerSQL,
      }}
      onCancel={onClose}
      onOk={doExecuteSQL}
    >
      <CommonIDE
        session={session}
        bordered={true}
        language={getDataSourceModeConfig(session?.connection?.type)?.sql?.language}
        initialSQL={sql}
        onSQLChange={(sql) => {
          setInnerSQL(sql);
        }}
      />
    </Modal>
  );
}
export default SQLExecuteModal;

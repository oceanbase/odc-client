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

import { Modal } from 'antd';
import { SQLCodePreviewer } from '@/component/SQLCodePreviewer';

function SQLPreviewModal(props: {
  sql?: string;
  visible?: boolean;
  onClose: () => void;
  onOk: () => void;
}) {
  const { sql, visible, onClose, onOk } = props;

  return (
    <Modal
      destroyOnClose
      title={
        <span style={{ fontWeight: 400 }}>
          {formatMessage({
            id: 'src.component.Task.component.SQLPreviewModal.9967DB7D' /*归档 SQL 预览（变量以当前时间代入，具体执行按实际配置替换），点击"确认"按钮继续提交申请*/,
          })}
        </span>
      }
      width={760}
      bodyStyle={{
        height: 400,
      }}
      open={visible}
      onCancel={onClose}
      onOk={onOk}
    >
      <div
        style={{
          height: '100%',
          position: 'relative',
          border: '1px solid var(--odc-border-color)',
        }}
      >
        <SQLCodePreviewer readOnly language="sql" value={sql} />
      </div>
    </Modal>
  );
}
export default SQLPreviewModal;

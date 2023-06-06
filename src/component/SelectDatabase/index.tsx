import Icon, { DatabaseFilled } from '@ant-design/icons';
import { message, Modal, Select } from 'antd';

export default async function SelectDatabase(): Promise<[number, string]> {
  return new Promise((resolve) => {
    let db = null;
    Modal.confirm({
      title: '数据库',
      icon: <Icon component={DatabaseFilled} style={{ color: 'var(--icon-color-1)' }} />,
      content: (
        <Select
          style={{ width: 180 }}
          onChange={(v) => {
            db = v;
          }}
        >
          {/* {sessionManager.getMasterSession()?.databases?.map((db) => {
            return <Select.Option key={db.name}>{db.name}</Select.Option>;
          })} */}
        </Select>
      ),
      okText: '选择数据库',
      onOk() {
        if (!db) {
          message.warn('请选择数据库');
          return new Promise((_, reject) => reject(false));
        }
        // resolve([sessionManager?.getMasterSession()?.connection?.id, db]);
      },
      onCancel() {
        resolve([null, null]);
      },
    });
  });
}

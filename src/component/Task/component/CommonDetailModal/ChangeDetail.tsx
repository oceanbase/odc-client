import { formatMessage } from '@/util/intl';
import React, { useEffect, useState } from 'react';
import { Modal, Descriptions, Spin } from 'antd';
import { getOperationDetail } from '@/common/network/task';
import { Operation } from '@/d.ts';
import DiffEditor from '@/component/MonacoEditor/DiffEditor';
import styles from './index.less';
import { useRequest } from 'ahooks';

interface ChangeDetailProps {
  scheduleId: number;
  scheduleChangeLogId: number;
  visible: boolean;
  onClose: () => void;
}

const ChangeDetail: React.FC<ChangeDetailProps> = (props) => {
  const { visible, onClose, scheduleId, scheduleChangeLogId } = props;
  const [data, setData] = useState<Operation>();

  useEffect(() => {
    if (scheduleId && scheduleChangeLogId) {
      loadData();
    }
  }, [scheduleId, scheduleChangeLogId]);

  const { run: fetchOperationDetail, loading } = useRequest(getOperationDetail, {
    manual: true,
  });

  const loadData = async () => {
    setData(null);
    const data = await fetchOperationDetail(scheduleId, scheduleChangeLogId);
    setData(data);
  };

  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={onClose}
      title={formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.58B347B9',
        defaultMessage: '变更详情',
      })}
      width={900}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <div>
          <Descriptions column={2}>
            <Descriptions.Item span={1}>
              {formatMessage({
                id: 'src.component.Task.component.CommonDetailModal.AF00DE0E',
                defaultMessage: '变更前：',
              })}
            </Descriptions.Item>
            <Descriptions.Item span={1}>
              {formatMessage({
                id: 'src.component.Task.component.CommonDetailModal.1CF173E7',
                defaultMessage: '变更后：',
              })}
            </Descriptions.Item>
          </Descriptions>
          {data && (
            <div
              key={data?.scheduleId}
              style={{ position: 'relative', height: '600px' }}
              className={styles.diffEditor}
            >
              <DiffEditor
                source={
                  data?.previousParameters
                    ? JSON.stringify(JSON.parse(data?.previousParameters), null, '\t')
                    : ''
                }
                modifie={
                  data?.newParameter
                    ? JSON.stringify(JSON.parse(data?.newParameter), null, '\t')
                    : ''
                }
                language="json"
              />
            </div>
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default ChangeDetail;

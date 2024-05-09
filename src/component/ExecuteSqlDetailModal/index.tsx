import React, { useCallback, useEffect, useRef, useState } from 'react';
import modal from '@/store/modal';
import { Alert, Button, message, Modal } from 'antd';
import styles from './index.less';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import { getSQLExplain } from '@/common/network/sql';

interface IProps {
  modalStore?: ModalStore;
}

const ExecuteSQLDetailModal: React.FC<IProps> = ({ modalStore }: IProps) => {
  const [data, setData] = useState(null);
  const handleSubmit = () => {
    onCancel();
  };
  const onCancel = () => {
    modal.changeExecuteSqlDetailModalVisible(false);
  };

  const getDetail = async () => {
    const explain = await getSQLExplain(
      modalStore.executeSqlDetailData?.selectedSQL,
      modalStore.executeSqlDetailData?.session?.sessionId,
      modalStore.executeSqlDetailData?.session?.database?.dbName,
    );
    console.log(explain);
    // todo 图的api未更新
    setData(explain);
  };
  useEffect(() => {
    if (modalStore.executeSqlDetailModalVisible) {
      getDetail();
    }
  }, [modalStore.executeSqlDetailModalVisible]);
  return (
    <>
      <Modal
        zIndex={1002}
        width={840}
        destroyOnClose={true}
        title={`Trace ID 为 "${modalStore?.executeSqlDetailData?.traceId}" 的执行画像`}
        open={modalStore.executeSqlDetailModalVisible}
        onOk={handleSubmit}
        onCancel={onCancel}
        footer={[].filter(Boolean)}
        className={styles.executeSqlModal}
      >
        {JSON.stringify(data)}
      </Modal>
    </>
  );
};

export default inject('modalStore')(observer(ExecuteSQLDetailModal));

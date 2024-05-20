import React, { useCallback, useEffect, useRef, useState } from 'react';
import modal from '@/store/modal';
import { Tabs, Button, message, Modal, Radio, Space } from 'antd';
import styles from './index.less';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import { getSQLExecuteProfile, getSQLExplain } from '@/common/network/sql';
import Flow from '@/component/Flow';
import SQLExplain from '@/page/Workspace/components/SQLExplain';
import { getSQLExecuteExplain } from '@/common/network/sql';
import Trace from '@/page/Workspace/components/Trace';
import { ReactComponent as List } from '@/svgr/List.svg';
import { ReactComponent as Tree } from '@/svgr/Tree.svg';
import { ReactComponent as Text } from '@/svgr/Text.svg';
import Icon from '@ant-design/icons';
interface IProps {
  modalStore?: ModalStore;
}

const TypeMap = {
  TREE: 'TREE',
  LIST: 'LIST',
  TEXT: 'TEXT',
};
const ExecuteSQLDetailModal: React.FC<IProps> = ({ modalStore }: IProps) => {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState<EXECUTE_KAY>(EXECUTE_KAY.EXECUTE_DETAIL);
  const [viewType, setViewType] = useState(TypeMap.TREE);
  const [sqlExplainToShow, setSqlExplainToShow] = useState(null);

  const fetchExecPlan = async () => {
    // debugger
    const explain = await getSQLExecuteExplain(
      modalStore?.executeSqlDetailData?.sql,
      null,
      modalStore?.executeSqlDetailData?.session?.sessionId,
      modalStore?.executeSqlDetailData?.session?.database?.dbName,
    );
    if (explain) {
      setSqlExplainToShow(explain);
    }
  };
  // useEffect(() => {
  //   if (tab === EXECUTE_KAY.EXECUTE_PLAN) {
  //     fetchExecPlan();
  //   }
  // }, [tab])

  const handleSubmit = () => {
    onCancel();
  };
  const onCancel = () => {
    modal.changeExecuteSqlDetailModalVisible(false);
  };

  const getDetail = async () => {
    const explain = await getSQLExecuteProfile(
      modalStore?.executeSqlDetailData?.traceId,
      modalStore?.executeSqlDetailData?.session?.sessionId,
      modalStore?.executeSqlDetailData?.session?.database?.dbName,
    );
    // debugger
    console.log(explain);
    // todo 图的api未更新
    setData(explain);
  };
  useEffect(() => {
    if (modalStore.executeSqlDetailModalVisible) {
      getDetail();
    }
  }, [modalStore.executeSqlDetailModalVisible]);

  const enum EXECUTE_KAY {
    EXECUTE_DETAIL = 'EXECUTE_DETAIL',
    FULL_TRACE = 'FULL_TRACE',
  }

  const SqlProfileMap = {
    [TypeMap.TREE]: <Flow dataSource={data?.graph} />,
    [TypeMap.LIST]: 'list',
    [TypeMap.TEXT]: 'text',
  };
  const EXECUTE_MAP = {
    [EXECUTE_KAY.EXECUTE_DETAIL]: {
      label: '执行详情',
      key: EXECUTE_KAY.EXECUTE_DETAIL,
      children: SqlProfileMap[viewType],
    },
    [EXECUTE_KAY.FULL_TRACE]: {
      label: '全链路诊断',
      key: EXECUTE_KAY.FULL_TRACE,
      children: '全链路诊断',
      // <Trace
      //   key={'trace' + modalStore?.executeSqlDetailData?.session?.sessionId}
      //   open={true}
      //   sql={modalStore?.executeSqlDetailData?.sql}
      //   session={modalStore?.executeSqlDetailData?.session}
      //   traceId={modalStore?.executeSqlDetailData?.traceId}
      //   setOpen={() =>{}}
      // />
    },
  };

  const TypeOptions = [
    { value: TypeMap.TREE, icon: <Icon component={Tree} /> },
    { value: TypeMap.LIST, icon: <Icon component={List} /> },
    { value: TypeMap.TEXT, icon: <Icon component={Text} /> },
  ];
  return (
    <>
      <Modal
        zIndex={1002}
        width={'calc(100% - 80px)'}
        destroyOnClose={true}
        title={`Trace ID 为 "${modalStore?.executeSqlDetailData?.traceId}" 的执行画像`}
        open={modalStore.executeSqlDetailModalVisible}
        onOk={handleSubmit}
        onCancel={onCancel}
        footer={false}
        className={styles.executeSqlModal}
      >
        <div className={styles.executeSqlDetailBox}>
          <span
            title={modalStore?.executeSqlDetailData?.sql}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            SQL: {modalStore?.executeSqlDetailData?.sql}
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Radio.Group
              value={tab}
              onChange={(e) => {
                setTab(e?.target?.value);
              }}
              style={{ padding: '8px 0' }}
            >
              <Radio.Button value={EXECUTE_KAY.EXECUTE_DETAIL}>
                {EXECUTE_MAP.EXECUTE_DETAIL.label}
              </Radio.Button>
              <Radio.Button value={EXECUTE_KAY.FULL_TRACE}>
                {EXECUTE_MAP.FULL_TRACE.label}
              </Radio.Button>
            </Radio.Group>
            <Space>
              <Button>导出 Json</Button>
              <Radio.Group
                defaultValue={TypeMap.TREE}
                size="small"
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
              >
                {TypeOptions.map((i) => {
                  return <Radio.Button value={i.value}>{i?.icon}</Radio.Button>;
                })}
              </Radio.Group>
            </Space>
          </div>
          {EXECUTE_MAP?.[tab]?.children}
        </div>
      </Modal>
    </>
  );
};

export default inject('modalStore')(observer(ExecuteSQLDetailModal));

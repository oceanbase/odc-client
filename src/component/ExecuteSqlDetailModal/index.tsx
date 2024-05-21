import React, { useCallback, useEffect, useRef, useState } from 'react';
import modal from '@/store/modal';
import { Tabs, Button, message, Modal, Radio, Space, Tooltip, Input } from 'antd';
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
import DisplayTable from '@/component/DisplayTable';
import { getSqlExplainColumns } from '@/page/Workspace/components/SQLExplain/column';
import TraceTreeTable from '@/page/Workspace/components/Trace/TraceTable';
import TraceList from '@/page/Workspace/components/Trace/TraceList';
import { ExpandTraceSpan } from '@/page/Workspace/components/Trace';
import { formatMessage } from '@/util/intl';
import { ReactComponent as TraceSvg } from '@/svgr/Trace.svg';
import { getFullLinkTrace, getFullLinkTraceDownloadUrl } from '@/common/network/sql';
import { downloadFile, formatTimeTemplatMicroSeconds } from '@/util/utils';

interface IProps {
  modalStore?: ModalStore;
}

const TypeMap = {
  TREE: 'TREE',
  LIST: 'LIST',
  TEXT: 'TEXT',
  TRACE: 'TRACE',
};
const ExecuteSQLDetailModal: React.FC<IProps> = ({ modalStore }: IProps) => {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState<EXECUTE_KAY>(EXECUTE_KAY.EXECUTE_DETAIL);
  const [viewType, setViewType] = useState(TypeMap.TREE);
  const [sqlExplainToShow, setSqlExplainToShow] = useState(null);
  const [innerTreeData, setInnerTreeData] = useState([]);
  const [treeData, setTreeData] = useState<ExpandTraceSpan[]>([]);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);

  const fetchExecPlan = async () => {
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
  const handleShowOutputFilter = (filterContent: string) => {
    Modal.info({
      width: 720,
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.output',
      }),
      content: (
        <div
          style={{
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
          }}
        >
          {filterContent}
        </div>
      ),
      maskClosable: true,
      okText: formatMessage({
        id: 'app.button.ok',
      }),
    });
  };

  function injectKey2TreeData(root) {
    if (Array.isArray(root)) {
      root.forEach((node) => {
        if (node?.children) {
          if (Array.isArray(node?.children)) {
            injectKey2TreeData(node?.children);
            node.key = Math.random();
          } else {
            node.key = Math.random();
          }
        } else {
          node.key = Math.random();
        }
      });
    } else {
      root.key = Math.random();
    }
    return root;
  }

  const formatSQLExplainTree = (data: any) => {
    const formatted = {
      ...data,
      rowCount: Number(data.rowCount),
      cost: Number(data.cost),
    };
    const children = [];

    if (data.children) {
      Object.keys(data.children).forEach((key) => {
        children.push(formatSQLExplainTree(data.children[key]));
      }); // @ts-ignore

      formatted.children = children.length && children;
    }

    return formatted;
  };

  const onSearch = (value: string) => {
    let newInnerTreeData = [];
    if (value) {
      newInnerTreeData = innerTreeData.map((itd) => {
        if (itd.title.toLowerCase().includes(value.toLowerCase())) {
          itd.isSearch = true;
        } else {
          itd.isSearch = false;
        }
        return itd;
      });
    } else {
      newInnerTreeData = innerTreeData.map((itd) => {
        itd.isSearch = false;
        return itd;
      });
    }
    setInnerTreeData(newInnerTreeData);
  };

  async function handleJsonDownload() {
    setDownloadLoading(true);
    const url = await getFullLinkTraceDownloadUrl(
      modalStore?.executeSqlDetailData?.session?.sessionId,
      modalStore?.executeSqlDetailData?.session?.database?.dbName,
      {
        sql: modalStore?.executeSqlDetailData?.sql,
        tag: modalStore?.executeSqlDetailData?.traceId,
      },
    );
    if (url) {
      await downloadFile(url);
    }
    setDownloadLoading(false);
  }

  const SqlProfileMap = {
    [TypeMap.TREE]: <Flow dataSource={data?.graph} />,
    [TypeMap.LIST]: (
      <DisplayTable
        key={modalStore?.executeSqlDetailData?.sql}
        rowKey="key"
        bordered={true}
        expandable={{
          defaultExpandAllRows: true,
        }}
        scroll={{
          x: 1400,
          y: '100%',
        }}
        columns={getSqlExplainColumns({
          handleShowOutputFilter: handleShowOutputFilter,
        })}
        dataSource={
          data && data?.expTree
            ? injectKey2TreeData([formatSQLExplainTree(JSON.parse(data?.expTree))])
            : []
        }
        disablePagination={true}
      />
    ),
    [TypeMap.TEXT]: (
      <pre
        style={{
          padding: 12,
          height: 'calc(100vh - 158px)',
          backgroundColor: 'var(--background-tertraiy-color)',
          color: 'var(--text-color-primary)',
          overflow: 'auto',
          marginBottom: 0,
        }}
      >
        {data?.originalText}
      </pre>
    ),
  };

  const executeViewOptions = [
    { value: TypeMap.TREE, icon: <Icon component={Tree} />, message: '树视图' },
    { value: TypeMap.LIST, icon: <Icon component={List} />, message: '列表视图' },
    { value: TypeMap.TEXT, icon: <Icon component={Text} />, message: '文本视图' },
  ];

  const traceViewOptions = [
    { value: TypeMap.TRACE, icon: <Icon component={TraceSvg} />, message: 'Trace 视图' },
    { value: TypeMap.LIST, icon: <Icon component={List} />, message: '列表视图' },
  ];

  const EXECUTE_MAP = {
    [EXECUTE_KAY.EXECUTE_DETAIL]: {
      label: '执行详情',
      key: EXECUTE_KAY.EXECUTE_DETAIL,
      children: SqlProfileMap[viewType],
      toolBar: (
        <>
          <Tooltip title={'导出符合 OpenTracing 规范的 Json 文件，可导入 Jaeger 查看'}>
            <Button>导出 Json</Button>
          </Tooltip>
          <Radio.Group
            defaultValue={TypeMap.TREE}
            size="small"
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
          >
            {executeViewOptions.map((i) => {
              return (
                <Radio.Button value={i.value}>
                  <Tooltip title={i?.message}>{i?.icon}</Tooltip>
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </>
      ),
    },
    [EXECUTE_KAY.FULL_TRACE]: {
      label: '全链路诊断',
      key: EXECUTE_KAY.FULL_TRACE,
      children: '全链路诊断',
      // (
      // <>
      //   {tab === TypeMap.TRACE && (
      //     <TraceTreeTable
      //       innerTreeData={innerTreeData}
      //       treeData={treeData}
      //       totalElapseMicroSeconds={totalElapseMicroSeconds}
      //       totalEndTimestamp={totalEndTimestamp}
      //       totalStartTimestamp={totalStartTimestamp}
      //       handleNodeExpand={handleNodeExpand}
      //       countStepBySameParentKey={countStepBySameParentKey}
      //     />
      //   )}
      //   {tab === TypeMap.LIST && <TraceList innerTreeData={treeData} />}
      // </>
      // ),
      toolBar: (
        <>
          <Input.Search
            style={{
              width: '256px',
            }}
            placeholder={
              formatMessage({
                id: 'odc.src.page.Workspace.components.Trace.SearchForTheKeyword',
              }) /* 搜索关键字 */
            }
            onSearch={onSearch}
            size="small"
          />
          <Tooltip title={'导出符合 OpenTracing 规范的 Json 文件，可导入 Jaeger 查看'}>
            <Button
              loading={downloadLoading}
              disabled={downloadLoading}
              onClick={handleJsonDownload}
            >
              导出 Json
            </Button>
          </Tooltip>
          <Radio.Group
            defaultValue={TypeMap.TREE}
            size="small"
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
          >
            {traceViewOptions.map((i) => {
              return (
                <Radio.Button value={i.value}>
                  <Tooltip title={i?.message}>{i?.icon}</Tooltip>
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </>
      ),
    },
  };

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
            <Space>{EXECUTE_MAP?.[tab]?.toolBar}</Space>
          </div>
          {EXECUTE_MAP?.[tab]?.children}
        </div>
      </Modal>
    </>
  );
};

export default inject('modalStore')(observer(ExecuteSQLDetailModal));

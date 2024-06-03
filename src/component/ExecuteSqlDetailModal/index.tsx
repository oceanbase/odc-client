import React, { useCallback, useEffect, useRef, useState } from 'react';
import modal from '@/store/modal';
import { Tabs, Button, message, Modal, Radio, Space, Tooltip, Input, Spin } from 'antd';
import styles from './index.less';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import { getSQLExecuteProfile, getSQLExplain } from '@/common/network/sql';
import Flow from '@/component/ProfileFlow';
import DisplayTable from '@/component/DisplayTable';
import { getSqlExplainColumns } from '@/page/Workspace/components/SQLExplain/column';
import { formatMessage } from '@/util/intl';
import { getFullLinkTraceDownloadUrl } from '@/common/network/sql';
import { downloadFile } from '@/util/utils';
import TraceComp from '@/page/Workspace/components/Trace/TraceComp';
import { TraceTabsType } from '@/page/Workspace/components/Trace';
import {
  ProfileType,
  TypeMap,
  EXECUTE_PAGE_TYPE,
  PLAN_PAGE_TYPE,
  initConfig,
  traceViewOptions,
  executeViewOptions,
  executeViewOptionsInPlan,
  initTabViewConfig,
  executeRadioOption,
  planRadioOption,
} from './constant';

import CopyToClipboard from 'react-copy-to-clipboard';
import { CopyOutlined } from '@ant-design/icons';

interface IProps {
  modalStore?: ModalStore;
}

const ExecuteSQLDetailModal: React.FC<IProps> = ({ modalStore }: IProps) => {
  const profileType = modalStore?.executeSqlDetailData?.profileType;

  const [data, setData] = useState(null);
  const [tab, setTab] = useState<EXECUTE_PAGE_TYPE | PLAN_PAGE_TYPE>(null);
  const [viewType, setViewType] = useState(null);

  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>(null);

  function viewContentConfig(type) {
    const config = {
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
          dataSource={data && data?.tree ? injectKey2TreeData(data?.tree) : []}
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
          <CopyToClipboard
            text={data?.originalText}
            onCopy={(_, result: boolean) => {
              if (data?.originalText?.length) {
                if (result) {
                  message.success(
                    formatMessage({ id: 'odc.component.Log.CopiedSuccessfully' }), //复制成功
                  );
                } else {
                  message.error(
                    formatMessage({ id: 'odc.component.Log.ReplicationFailed' }), //复制失败
                  );
                }
              }
            }}
          >
            <div style={{ textAlign: 'end' }}>
              <Tooltip title="复制">
                <CopyOutlined style={{ cursor: 'pointer' }} />
              </Tooltip>
            </div>
          </CopyToClipboard>
          {data?.originalText}
        </pre>
      ),
      [TypeMap.TRACE]: (
        <TraceComp
          tabName={TraceTabsType.Trace}
          traceId={modalStore?.executeSqlDetailData?.traceId}
          sql={modalStore?.executeSqlDetailData?.sql}
          session={modalStore?.executeSqlDetailData?.session}
          searchValue={searchValue}
        />
      ),
      [TypeMap.TRACE_LIST]: (
        <TraceComp
          tabName={TraceTabsType.List}
          traceId={modalStore?.executeSqlDetailData?.traceId}
          sql={modalStore?.executeSqlDetailData?.sql}
          session={modalStore?.executeSqlDetailData?.session}
          searchValue={searchValue}
        />
      ),
    };
    return config[type];
  }

  function getDownloadBtn() {
    return (
      <Tooltip
        placement="top"
        title={
          formatMessage({
            id: 'odc.src.page.Workspace.components.Trace.ExportTheJSONFileThat',
          }) //'导出符合 OpenTracing 规范的 Json 文件，可导入 Jaeger 查看'
        }
      >
        <Button loading={downloadLoading} disabled={downloadLoading} onClick={handleJsonDownload}>
          {
            formatMessage({
              id: 'odc.src.page.Workspace.components.Trace.ExportJson',
            }) /* 
            导出 Json
           */
          }
        </Button>
      </Tooltip>
    );
  }

  function getExecuteProfile(isPlan: boolean = false) {
    const option = isPlan ? executeViewOptionsInPlan : executeViewOptions;
    return (
      <>
        {!isPlan && getDownloadBtn()}
        <Radio.Group
          defaultValue={TypeMap.TREE}
          size="small"
          value={viewType}
          onChange={(e) => setViewType(e.target.value)}
        >
          {option?.map((i) => {
            return (
              <Radio.Button value={i.value}>
                <Tooltip title={i?.message}>{i?.icon}</Tooltip>
              </Radio.Button>
            );
          })}
        </Radio.Group>
      </>
    );
  }
  const EXECUTE_PAGE_CONFIG = {
    [EXECUTE_PAGE_TYPE.EXECUTE_DETAIL]: {
      label: '执行详情',
      key: EXECUTE_PAGE_TYPE.EXECUTE_DETAIL,
      children: viewContentConfig(viewType),
      toolBar: <></>,
    },
    [EXECUTE_PAGE_TYPE.EXECUTE_PLAN]: {
      label: '执行计划',
      key: EXECUTE_PAGE_TYPE.EXECUTE_PLAN,
      children: viewContentConfig(viewType),
      toolBar: getExecuteProfile(),
    },
    [EXECUTE_PAGE_TYPE.FULL_TRACE]: {
      label: '全链路诊断',
      key: EXECUTE_PAGE_TYPE.FULL_TRACE,
      children: viewContentConfig(viewType),
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
            onSearch={(e) => setSearchValue(e)}
          />
          {getDownloadBtn()}
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

  const PLAN_PAGE_CONFIG = {
    [PLAN_PAGE_TYPE.PLAN_DETAIL]: {
      label: '计划统计',
      key: PLAN_PAGE_TYPE.PLAN_DETAIL,
      children: viewContentConfig(viewType),
      toolBar: getExecuteProfile(true),
    },
  };

  const executeInfo = {
    [ProfileType.Execute]: {
      title: `Trace ID 为 "${modalStore?.executeSqlDetailData?.traceId}" 的执行画像`,
      sql: modalStore?.executeSqlDetailData?.sql,
      session: modalStore?.executeSqlDetailData?.session,
      traceId: modalStore?.executeSqlDetailData?.traceId,
      getDetail: getExecuteDetail,
      pageConfig: EXECUTE_PAGE_CONFIG,
      radioOption: executeRadioOption,
    },
    [ProfileType.Plan]: {
      title: '执行计划详情',
      sql: modalStore?.executeSqlDetailData?.sql,
      session: modalStore?.executeSqlDetailData?.session,
      traceId: modalStore?.executeSqlDetailData?.traceId,
      getDetail: getPlanDetail,
      pageConfig: PLAN_PAGE_CONFIG,
      radioOption: planRadioOption,
    },
  };

  const page = executeInfo[profileType];

  useEffect(() => {
    if (modalStore.executeSqlDetailModalVisible) {
      page?.getDetail();
      setTab(initConfig?.[profileType]?.tab);
      setViewType(initConfig?.[profileType]?.viewType);
    }
  }, [modalStore.executeSqlDetailModalVisible]);

  return (
    <>
      <Modal
        zIndex={1002}
        width={'calc(100% - 80px)'}
        destroyOnClose={true}
        title={page?.title}
        open={modalStore.executeSqlDetailModalVisible}
        onOk={handleSubmit}
        onCancel={onCancel}
        footer={false}
        className={styles.executeSqlModal}
      >
        {pageLoading ? (
          <div className={styles.executeSqlDetailBox}>
            <Spin className={styles.spin} />
          </div>
        ) : (
          <div className={styles.executeSqlDetailBox}>
            <Tooltip title={page?.sql}>
              <span className={styles.sql}>SQL: {page?.sql}</span>
            </Tooltip>
            <div className={styles.flexBetween}>
              <Radio.Group
                value={tab}
                onChange={(e) => {
                  setTab(e?.target?.value);
                  setViewType(initTabViewConfig[e?.target?.value]);
                }}
                style={{ padding: '12px 0' }}
              >
                {page?.radioOption.map((i) => {
                  return <Radio.Button value={i.value}>{i.label}</Radio.Button>;
                })}
              </Radio.Group>
              <Space>{page?.pageConfig?.[tab]?.toolBar}</Space>
            </div>
            {page?.pageConfig?.[tab]?.children}
          </div>
        )}
      </Modal>
    </>
  );
  function handleShowOutputFilter(filterContent: string) {
    Modal.info({
      width: 720,
      title: formatMessage({
        id: 'workspace.window.sql.explain.tab.summary.columns.output',
      }),
      zIndex: 2000,
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
  }

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

  function handleSubmit() {
    onCancel();
  }
  function onCancel() {
    modal.changeExecuteSqlDetailModalVisible(false);
  }

  async function getExecuteDetail() {
    setPageLoading(true);
    const explain = await getSQLExecuteProfile(
      modalStore?.executeSqlDetailData?.traceId,
      modalStore?.executeSqlDetailData?.session?.sessionId,
      modalStore?.executeSqlDetailData?.session?.database?.dbName,
    );
    setData(explain);
    setPageLoading(false);
  }
  async function getPlanDetail() {
    setPageLoading(true);
    const explain = await getSQLExplain(
      modalStore?.executeSqlDetailData?.sql,
      modalStore?.executeSqlDetailData?.session?.sessionId,
      modalStore?.executeSqlDetailData?.session?.database?.dbName,
    );
    setData(explain);
    setPageLoading(false);
  }
};

export default inject('modalStore')(observer(ExecuteSQLDetailModal));

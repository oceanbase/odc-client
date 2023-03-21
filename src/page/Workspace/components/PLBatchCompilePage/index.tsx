import StatusBar from '@/component/StatusBar';
import { SQL_PAGE_RESULT_HEIGHT } from '@/constant';
import { IPage, ResourceTabKey } from '@/d.ts';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { debounce } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import SplitPane from 'react-split-pane';
import CompileResult from './components/CompileResult';
import HeaderToolbar from './components/HeaderToolbar';
import PLTable from './components/PLTable';

import {
  openFunctionEditPageByFuncName,
  openFunctionViewPage,
  openPackageBodyPage,
  openPackageHeadPage,
  openPackageViewPage,
  openProcedureEditPageByProName,
  openProcedureViewPage,
  openTriggerEditPageByName,
  openTriggerViewPage,
  openTypeEditPageByName,
  openTypeViewPage,
} from '@/store/helper/page';

import { setTimeout } from 'timers';
import styles from './index.less';

const TOOLBAR_HEIGHT = 38;
const STATUS_BAR_HEIGHT = 32;
const TABLE_HEADER_HEIGHT = 25;
const TAB_HEADER_HEIGHT = 34;

export enum CompileType {
  ALL = 'ALL',
  INVALID = 'INVALID',
}

export enum CompileStatus {
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
}

interface IProps {
  schemaStore?: SchemaStore;
  sqlStore?: SQLStore;
  pageStore?: PageStore;
  params: {
    resourceKey: ResourceTabKey;
  };

  pageKey: string;
  page: IPage;
  onSetUnsavedModalTitle: (title: string) => void;
  onSetUnsavedModalContent: (title: string) => void;
  onSetUnsavedModalSaveButtonText: (text: string) => void;
  onSetDisableUnsavedModalCloseUnsaveButton: (disabled: boolean) => void;
  onSetCloseImmediately: (isImmediately: boolean) => void;
}

const PLBatchCompilePage: React.FC<IProps> = (props) => {
  const {
    schemaStore: { functions, types, packages, procedures, triggers },
    sqlStore,
    pageStore,
    pageKey,
    params: { resourceKey },
  } = props;
  const [compileStatus, setCompileStatus] = useState<CompileStatus>();
  const [compileTime, setCompileTime] = useState<{
    startTime: number;
    endTime: number;
  }>(null);
  const [result, setResult] = useState();
  const [plWrapperHeight, setPlWrapperHeight] = useState(null);
  const [resultTableHeight, setResultTableHeight] = useState<number>(null);
  const timeRef = useRef(null);
  const pageWrapper = useRef(null);
  const compileId = useRef(null);
  const { startTime, endTime } = compileTime ?? {};

  const PL_ResourceMap = {
    [ResourceTabKey.FUNCTION]: {
      label: formatMessage({
        id: 'odc.components.PLBatchCompilePage.Function',
      }), //函数,
      dataSource: functions.map(({ funName, status, errorMessage }) => {
        return {
          name: funName,
          status,
          errorMessage,
        };
      }),
      openViewPage: openFunctionViewPage,
      openEditPage: openFunctionEditPageByFuncName,
      loadData: () => {
        props.schemaStore.getFunctionList();
      },
    },

    [ResourceTabKey.PACKAGE]: {
      label: formatMessage({ id: 'odc.components.PLBatchCompilePage.Bag' }), //包
      dataSource: packages.map(({ packageName, status, errorMessage }) => {
        return {
          name: packageName,
          status,
          errorMessage,
        };
      }),
      openViewPage: openPackageViewPage,
      openEditPage: async (title: string, type: string) => {
        await props.schemaStore?.loadPackage(title);
        const pkg = packages.find((packages: any) => packages.packageName === title);
        if (pkg?.packageHead) {
          const headSql = pkg.packageHead?.basicInfo?.ddl || '';
          openPackageHeadPage(title, headSql);
        }
        if (pkg?.packageBody) {
          const bodySql = pkg.packageBody?.basicInfo?.ddl || '';
          openPackageBodyPage(title, bodySql);
        }
      },
      loadData: () => {
        props.schemaStore.getPackageList();
      },
    },

    [ResourceTabKey.PROCEDURE]: {
      label: formatMessage({
        id: 'odc.components.PLBatchCompilePage.StoredProcedure',
      }), //存储过程
      dataSource: procedures.map(({ proName, status, errorMessage }) => {
        return {
          name: proName,
          status,
          errorMessage,
        };
      }),
      openViewPage: openProcedureViewPage,
      openEditPage: openProcedureEditPageByProName,
      loadData: () => {
        props.schemaStore.getProcedureList();
      },
    },

    [ResourceTabKey.TRIGGER]: {
      label: formatMessage({ id: 'odc.components.PLBatchCompilePage.Trigger' }), //触发器
      dataSource: triggers.map(({ triggerName, status, errorMessage }) => {
        return {
          name: triggerName,
          status,
          errorMessage,
        };
      }),
      openViewPage: openTriggerViewPage,
      openEditPage: openTriggerEditPageByName,
      loadData: () => {
        props.schemaStore.getTriggerList();
      },
    },

    [ResourceTabKey.TYPE]: {
      label: formatMessage({ id: 'odc.components.PLBatchCompilePage.Type' }), //类型
      dataSource: types.map(({ typeName, status, errorMessage }) => {
        return {
          name: typeName,
          status,
          errorMessage,
        };
      }),
      openViewPage: openTypeViewPage,
      openEditPage: openTypeEditPageByName,
      loadData: () => {
        props.schemaStore.getTypeList();
      },
    },
  };

  const plResource = PL_ResourceMap[resourceKey];
  const { label, dataSource, openViewPage, openEditPage, loadData } = plResource;

  const setCompileId = (id: number) => {
    compileId.current = id;
  };

  const loadResult = async () => {
    if (timeRef.current) {
      clearTimeout(timeRef.current);
    }
    const res = await sqlStore.getBatchCompilePLResult(compileId.current);
    if (res) {
      setResult(res);
      setCompileStatus(res?.status);
    }
    if (res?.status === CompileStatus.RUNNING) {
      timeRef.current = setTimeout(() => {
        if (compileId.current) {
          loadResult();
        }
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
      }
    };
  }, []);

  const handleCompile = async (type: CompileType) => {
    const params = {
      scope: type,
      objectType: resourceKey,
    };
    setCompileStatus(CompileStatus.RUNNING);
    setCompileTime({
      startTime: Date.now(),
      endTime: 0,
    });

    const res = await sqlStore.batchCompilePL(params);
    if (res) {
      setCompileId(res);
      loadResult();
    }
  };

  const handleCancelCompile = async (isDestory: boolean = false) => {
    if (!compileId.current) {
      return;
    }
    const res = await sqlStore.deleteBatchCompilePL(compileId.current);
    if (res && !isDestory) {
      await loadResult();
      setCompileStatus(CompileStatus.TERMINATED);
    }
  };

  const handleSetConfirmModal = () => {
    props.onSetUnsavedModalTitle(
      formatMessage({
        id: 'odc.components.PLBatchCompilePage.AreYouSureYouWant',
      }), //正在编译中，确定终止编译吗？
    );
    props.onSetUnsavedModalSaveButtonText(
      formatMessage({ id: 'odc.components.PLBatchCompilePage.Ok' }), //确定
    );
    props.onSetDisableUnsavedModalCloseUnsaveButton(true);
    props.onSetCloseImmediately(true);
  };

  useEffect(() => {
    loadData();
    handleSetConfirmModal();
    return () => {
      if (compileId.current) {
        handleCancelCompile(true);
      }
    };
  }, []);

  useEffect(() => {
    if ([CompileStatus.COMPLETED, CompileStatus.TERMINATED].includes(compileStatus)) {
      setCompileTime({
        startTime,
        endTime: Date.now(),
      });
    }
  }, [compileStatus, startTime]);

  useEffect(() => {
    const pageWrapperHeight = pageWrapper.current.offsetHeight;
    if (!compileStatus) {
      setPlWrapperHeight(pageWrapperHeight - TOOLBAR_HEIGHT - TABLE_HEADER_HEIGHT);
    } else if (!resultTableHeight) {
      setPlWrapperHeight(
        pageWrapperHeight - TOOLBAR_HEIGHT - SQL_PAGE_RESULT_HEIGHT - STATUS_BAR_HEIGHT,
      );

      setResultTableHeight(
        SQL_PAGE_RESULT_HEIGHT - TAB_HEADER_HEIGHT - TABLE_HEADER_HEIGHT - STATUS_BAR_HEIGHT,
      );
    }
  }, [compileStatus]);

  const handleChangeSplitPane = debounce((size: number) => {
    const pageWrapperHeight = pageWrapper.current.offsetHeight;
    setPlWrapperHeight(pageWrapperHeight - TOOLBAR_HEIGHT - size - TABLE_HEADER_HEIGHT);
    setResultTableHeight(size - STATUS_BAR_HEIGHT - TAB_HEADER_HEIGHT - TABLE_HEADER_HEIGHT);
  }, 20);

  useEffect(() => {
    if (compileStatus === CompileStatus.RUNNING) {
      pageStore.updatePage(
        pageKey,
        {
          isSaved: false,
        },

        {
          batchCompileId: compileId.current,
        },
      );
      setCompileId(compileId.current);
    } else {
      pageStore.updatePage(
        pageKey,
        {
          isSaved: true,
          startSaving: false,
        },

        {
          batchCompileId: null,
        },
      );
      setCompileId(null);
      loadData();
    }
  }, [compileStatus]);

  return (
    <div ref={pageWrapper} className={styles.pageWrapper}>
      <SplitPane
        split="horizontal"
        primary={'second'}
        minSize={compileStatus ? 66 : 0}
        maxSize={-100}
        defaultSize={compileStatus ? SQL_PAGE_RESULT_HEIGHT : 0}
        onChange={handleChangeSplitPane}
      >
        <div className={styles.plWrapper}>
          <HeaderToolbar
            status={compileStatus}
            handleCompile={handleCompile}
            handleCancelCompile={handleCancelCompile}
          />

          <PLTable
            data={dataSource}
            label={label}
            openViewPage={openViewPage}
            tableHeight={plWrapperHeight}
          />
        </div>
        {compileStatus && (
          <div className={styles.resultWrapper}>
            <CompileResult
              tableHeight={resultTableHeight}
              status={compileStatus}
              data={result}
              label={label}
              openEditPage={openEditPage}
            />

            <StatusBar
              statusBar={{
                type: 'COMPILE',
                status: compileStatus,
                startTime: startTime,
                endTime: endTime,
              }}
            />
          </div>
        )}
      </SplitPane>
    </div>
  );
};

export default inject('schemaStore', 'sqlStore', 'pageStore')(observer(PLBatchCompilePage));

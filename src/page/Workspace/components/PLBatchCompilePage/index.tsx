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

import StatusBar from '@/component/StatusBar';
import { SQL_PAGE_RESULT_HEIGHT } from '@/constant';
import { DbObjectType, IPage } from '@/d.ts';
import { PageStore } from '@/store/page';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { debounce } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
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

import { BatchCompilePage } from '@/store/helper/page/pages';
import { SessionManagerStore } from '@/store/sessionManager';
import { setTimeout } from 'timers';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
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
  sessionManagerStore?: SessionManagerStore;
  sqlStore?: SQLStore;
  pageStore?: PageStore;
  params: BatchCompilePage['pageParams'];
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
    sessionManagerStore,
    sqlStore,
    pageStore,
    pageKey,
    params: { dbObjectType },
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

  const { session } = useContext(SessionContext);

  const dbName = session?.odcDatabase?.name;

  const PL_ResourceMap = {
    [DbObjectType.function]: {
      label: formatMessage({
        id: 'odc.components.PLBatchCompilePage.Function',
        defaultMessage: '函数',
      }), //函数,
      dataSource: session?.database?.functions.map(({ funName, status, errorMessage }) => {
        return {
          name: funName,
          status,
          errorMessage,
        };
      }),
      openViewPage: (name) => {
        openFunctionViewPage(name, undefined, undefined, session?.odcDatabase?.id, dbName);
      },
      openEditPage: (name, type) => {
        openFunctionEditPageByFuncName(name, session?.sessionId, dbName, session?.odcDatabase?.id);
      },
      loadData: () => {
        session?.database?.getFunctionList();
      },
    },

    [DbObjectType.package]: {
      label: formatMessage({ id: 'odc.components.PLBatchCompilePage.Bag', defaultMessage: '包' }), //包
      dataSource: session?.database?.packages.map(({ packageName, status, errorMessage }) => {
        return {
          name: packageName,
          status,
          errorMessage,
        };
      }),
      openViewPage: (name) => {
        openPackageViewPage(name, undefined, true, session?.odcDatabase?.id);
      },
      openEditPage: async (title: string, type: string) => {
        await session?.database?.loadPackage(title);
        const pkg = session?.database?.packages.find(
          (packages: any) => packages.packageName === title,
        );
        if (pkg?.packageHead) {
          const headSql = pkg.packageHead?.basicInfo?.ddl || '';
          openPackageHeadPage(title, headSql, session?.odcDatabase?.id);
        }
        if (pkg?.packageBody) {
          const bodySql = pkg.packageBody?.basicInfo?.ddl || '';
          openPackageBodyPage(title, bodySql, session?.odcDatabase?.id);
        }
      },
      loadData: () => {
        session?.database?.getPackageList();
      },
    },

    [DbObjectType.procedure]: {
      label: formatMessage({
        id: 'odc.components.PLBatchCompilePage.StoredProcedure',
        defaultMessage: '存储过程',
      }), //存储过程
      dataSource: session?.database?.procedures.map(({ proName, status, errorMessage }) => {
        return {
          name: proName,
          status,
          errorMessage,
        };
      }),
      openViewPage: (name) => {
        openProcedureViewPage(name, undefined, undefined, session?.odcDatabase?.id, dbName);
      },
      openEditPage: (name, type) => {
        openProcedureEditPageByProName(name, session?.sessionId, dbName, session?.odcDatabase?.id);
      },
      loadData: () => {
        session?.database?.getProcedureList();
      },
    },

    [DbObjectType.trigger]: {
      label: formatMessage({
        id: 'odc.components.PLBatchCompilePage.Trigger',
        defaultMessage: '触发器',
      }), //触发器
      dataSource: session?.database?.triggers.map(({ triggerName, status, errorMessage }) => {
        return {
          name: triggerName,
          status,
          errorMessage,
        };
      }),
      openViewPage: (name) => {
        openTriggerViewPage(
          name,
          undefined,
          undefined,
          undefined,
          session?.odcDatabase?.id,
          dbName,
        );
      },
      openEditPage: (name, type) => {
        openTriggerEditPageByName(name, session?.sessionId, dbName, session?.odcDatabase?.id);
      },
      loadData: () => {
        session?.database?.getTriggerList();
      },
    },

    [DbObjectType.type]: {
      label: formatMessage({
        id: 'odc.components.PLBatchCompilePage.Type',
        defaultMessage: '类型',
      }), //类型
      dataSource: session?.database?.types.map(({ typeName, status, errorMessage }) => {
        return {
          name: typeName,
          status,
          errorMessage,
        };
      }),
      openViewPage: (name) => {
        openTypeViewPage(name, undefined, session?.odcDatabase?.id, dbName);
      },
      openEditPage: (name, type) => {
        openTypeEditPageByName(name, session?.sessionId, session?.odcDatabase?.id, dbName);
      },
      loadData: () => {
        session?.database?.getTypeList();
      },
    },
  };

  const plResource = PL_ResourceMap[dbObjectType];
  const { label, dataSource, openViewPage, openEditPage, loadData } = plResource;

  const setCompileId = (id: number) => {
    compileId.current = id;
  };

  const loadResult = async () => {
    if (timeRef.current) {
      clearTimeout(timeRef.current);
    }
    const res = await sqlStore.getBatchCompilePLResult(
      compileId.current,
      session?.sessionId,
      dbName,
    );
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
      objectType: dbObjectType,
      sessionId: session?.sessionId,
      dbName,
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
    const res = await sqlStore.deleteBatchCompilePL(
      compileId.current,
      session?.sessionId,
      session?.database?.dbName,
    );
    if (res && !isDestory) {
      await loadResult();
      setCompileStatus(CompileStatus.TERMINATED);
    }
  };

  const handleSetConfirmModal = () => {
    props.onSetUnsavedModalTitle(
      formatMessage({
        id: 'odc.components.PLBatchCompilePage.AreYouSureYouWant',
        defaultMessage: '正在编译中，是否确定终止编译？',
      }), //正在编译中，确定终止编译吗？
    );
    props.onSetUnsavedModalSaveButtonText(
      formatMessage({ id: 'odc.components.PLBatchCompilePage.Ok', defaultMessage: '确定' }), //确定
    );
    props.onSetDisableUnsavedModalCloseUnsaveButton(true);
    props.onSetCloseImmediately(true);
  };

  useEffect(() => {
    handleSetConfirmModal();
    return () => {
      if (compileId.current) {
        handleCancelCompile(true);
      }
    };
  }, []);

  useEffect(() => {
    loadData();
  }, [session]);

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

export default WrapSessionPage(
  inject('sessionManagerStore', 'sqlStore', 'pageStore')(observer(PLBatchCompilePage)),
);

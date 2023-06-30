import { isReadonlyPublicConnection } from '@/component/Acess';
import { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useMemo, useRef, useState } from 'react';
import { ErrorStrategy, IShaodwSyncData } from './interface';
import SelectPanel from './SelectPanel';
import StructConfigPanel from './StructConfigPanel';

import { createTask } from '@/common/network/task';
import { ConnectionMode, TaskExecStrategy, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import styles from './index.less';

interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}

enum StepKeys {
  SELECT,
  CONFIG,
}

const steps = [
  {
    key: StepKeys.SELECT,
    name: formatMessage({
      id: 'odc.components.CreateShadowSyncModal.SelectObject',
    }), //选择对象
    Component: SelectPanel,
  },

  {
    key: StepKeys.CONFIG,
    name: formatMessage({
      id: 'odc.components.CreateShadowSyncModal.StructuralAnalysis',
    }), //结构分析
    Component: StructConfigPanel,
  },
];

const defaultData: IShaodwSyncData = {
  schemaName: '',
  syncAll: false,
  prefix: true,
  name: '_test_',
  originTableNames: new Set(),
  executionStrategy: TaskExecStrategy.AUTO,
  executionTime: null,
  errorStrategy: ErrorStrategy.ABORT,
};

const CreateModal: React.FC<IProps> = function ({ modalStore, projectId }) {
  const [isChanged, setIsChanged] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [nextLoading, setNextLoading] = useState(false);
  const [data, _setData] = useState({
    ...defaultData,
  });
  const { session, database } = useDBSession(data?.databaseId);
  const schemaName = database?.name;
  const sessionId = session?.sessionId;
  const connection = database?.dataSource;
  const connectionId = connection?.id;
  const isReadonlyPublicConn = isReadonlyPublicConnection(connection);
  const connectionMode =
    connection?.dialectType === ConnectionMode.OB_MYSQL ? 'obmysql' : 'oboracle';

  function setData(v) {
    _setData(v);
    if (!isChanged) {
      setIsChanged(true);
    }
  }
  const contentRef = useRef<{
    next: () => Promise<boolean>;
  }>();

  const [prevStep, currentStep, nextStep] = useMemo(() => {
    return [steps[stepIdx - 1], steps[stepIdx], steps[stepIdx + 1]];
  }, [stepIdx]);
  const Content = currentStep?.Component;
  const nextStepName = nextStep?.name;
  const prevStepName = prevStep?.name;

  function close(force: boolean = false) {
    if (isChanged && !force) {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.CreateShadowSyncModal.AreYouSureYouWant',
        }), //确认取消影子表同步吗？
        centered: true,
        onOk: () => {
          modalStore.changeShadowSyncVisible(false);
        },
      });
    } else {
      modalStore.changeShadowSyncVisible(false);
    }
  }
  async function submit() {
    const taskId = data.shadowAnalysisData?.id;
    if (!taskId) {
      return false;
    }
    const isSuccess = await createTask({
      taskType: TaskType.SHADOW,
      projectId,
      executionStrategy: data.executionStrategy,
      executionTime:
        data.executionStrategy === TaskExecStrategy.TIMER ? data.executionTime : undefined,
      // databaseName: schemaName,
      // connectionId: connection?.connection?.id,
      description: data.description,
      parameters: {
        errorStrategy: data.errorStrategy,
        connectionId,
        schemaName: data.schemaName,
        comparingTaskId: data.shadowAnalysisData?.id,
      },
    });

    if (!isSuccess) {
      return;
    }
    close(true);
    openTasksPage(TaskPageType.SHADOW, TaskPageScope.CREATED_BY_CURRENT_USER);
  }
  return (
    <Drawer
      className={styles.drawer}
      visible={modalStore.addShadowSyncVisible}
      onClose={() => close()}
      width={720}
      title={formatMessage({
        id: 'odc.components.CreateShadowSyncModal.CreateAShadowTableSynchronization',
      })} /*新建影子表同步*/
      footer={
        <Space>
          <Button
            onClick={() => {
              if (prevStep) {
                setStepIdx(stepIdx - 1);
              } else {
                close();
              }
            }}
          >
            {
              prevStep
                ? formatMessage(
                    {
                      id: 'odc.components.CreateShadowSyncModal.PreviousStepPrevstepname',
                    },
                    { prevStepName: prevStepName },
                  ) //`上一步: ${prevStepName}`
                : formatMessage({
                    id: 'odc.components.CreateShadowSyncModal.Cancel',
                  }) //取消
            }
          </Button>
          <Button
            type="primary"
            loading={nextLoading}
            onClick={async () => {
              setNextLoading(true);
              try {
                const isSuccess = await contentRef.current.next();
                if (!isSuccess) {
                  return;
                }
                if (nextStep) {
                  setStepIdx(stepIdx + 1);
                } else {
                  submit();
                }
              } catch (e) {
                console.error(e);
              } finally {
                setNextLoading(false);
              }
            }}
          >
            {
              nextStep
                ? formatMessage(
                    {
                      id: 'odc.components.CreateShadowSyncModal.NextStepNextstepname',
                    },
                    { nextStepName: nextStepName },
                  ) //`下一步: ${nextStepName}`
                : formatMessage({
                    id: 'odc.components.CreateShadowSyncModal.Submit',
                  }) //提交
            }
          </Button>
        </Space>
      }
    >
      <Content
        schemaName={schemaName}
        connectionId={connectionId}
        isReadonlyPublicConn={isReadonlyPublicConn}
        sessionId={sessionId}
        data={data}
        connectionMode={connectionMode as ConnectionMode}
        setData={setData}
        ref={contentRef}
      />
    </Drawer>
  );
};

export default inject('modalStore')(observer(CreateModal));

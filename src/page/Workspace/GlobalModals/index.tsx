import AddConnectionDrawer from '@/component/AddConnectionDrawer';
import ApplyPermission from '@/component/ApplyPermission';
import CreateFunctionModal from '@/component/CreateFunctionModal';
import CreatePackageModal from '@/component/CreatePackageModal';
import CreateProcedureModal from '@/component/CreateProcedureModal';
import CreateSynonymModal from '@/component/CreateSynonymModal';
import CreateTypeModal from '@/component/CreateTypeModal';
import DataMockerDrawer from '@/component/DataMockerDrawer';
import { IConnectionType } from '@/d.ts';
import PartitionDrawer from '@/page/Workspace/components/PartitionDrawer';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import React from 'react';
import CreateAsyncTaskModal from '../components/CreateAsyncTaskModal';
import CreateSequenceModal from '../components/CreateSequenceModal';
import CreateShadowSyncModal from '../components/CreateShadowSyncModal';
import CreateSQLPlanTaskModal from '../components/CreateSQLPlanTaskModal';
import ExportDrawer from '../components/ExportDrawer';
import ImportDrawer from '../components/ImportDrawer';
import ScriptManageModal from '../components/ScriptManageModal';

interface IProps {
  modalStore?: ModalStore;
}

const GlobalModals: React.FC<IProps> = function ({ modalStore }) {
  return (
    <>
      <CreatePackageModal />
      {modalStore.createSynonymModalVisible && <CreateSynonymModal />}
      <CreateTypeModal />
      <CreateFunctionModal />
      <CreateProcedureModal />
      <ExportDrawer key={`${modalStore.exportModalVisible}export`} />
      <ImportDrawer key={`${modalStore.importModalVisible}import`} />
      <AddConnectionDrawer
        connectionType={IConnectionType.ORGANIZATION}
        onlySys
        key={`${modalStore.addConnectionVisible}connection`}
      />

      <DataMockerDrawer />
      <ApplyPermission />
      <CreateAsyncTaskModal key={`${modalStore.createAsyncTaskVisible}async`} />
      <CreateSequenceModal key={`${modalStore.createSequenceModalVisible}sequence`} />
      <ScriptManageModal />
      <PartitionDrawer />
      <CreateShadowSyncModal key={`${modalStore.addShadowSyncVisible}shadowSync`} />
      <CreateSQLPlanTaskModal />
    </>
  );
};

export default inject('modalStore')(observer(GlobalModals));

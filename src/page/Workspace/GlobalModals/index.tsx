import AddConnectionDrawer from '@/component/AddConnectionDrawer';
import CreateFunctionModal from '@/component/CreateFunctionModal';
import CreatePackageModal from '@/component/CreatePackageModal';
import CreateProcedureModal from '@/component/CreateProcedureModal';
import CreateSynonymModal from '@/component/CreateSynonymModal';
import CreateTypeModal from '@/component/CreateTypeModal';
import { IConnectionType } from '@/d.ts';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import React from 'react';
import CreateSequenceModal from '../components/CreateSequenceModal';
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
      <AddConnectionDrawer
        connectionType={IConnectionType.ORGANIZATION}
        onlySys
        key={`${modalStore.addConnectionVisible}connection`}
      />
      <CreateSequenceModal key={`${modalStore.createSequenceModalVisible}sequence`} />
      <ScriptManageModal />
    </>
  );
};

export default inject('modalStore')(observer(GlobalModals));

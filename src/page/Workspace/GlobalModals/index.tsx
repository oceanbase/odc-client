import CreateFunctionModal from '@/component/CreateFunctionModal';
import CreatePackageModal from '@/component/CreatePackageModal';
import CreateProcedureModal from '@/component/CreateProcedureModal';
import CreateSynonymModal from '@/component/CreateSynonymModal';
import CreateTypeModal from '@/component/CreateTypeModal';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import React from 'react';
import CreateSequenceModal from '../components/CreateSequenceModal';

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
      <CreateSequenceModal key={`${modalStore.createSequenceModalVisible}sequence`} />
    </>
  );
};

export default inject('modalStore')(observer(GlobalModals));

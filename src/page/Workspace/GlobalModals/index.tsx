import CreateFunctionModal from '@/component/CreateFunctionModal';
import CreatePackageModal from '@/component/CreatePackageModal';
import CreateProcedureModal from '@/component/CreateProcedureModal';
import CreateSynonymModal from '@/component/CreateSynonymModal';
import CreateTypeModal from '@/component/CreateTypeModal';
import AsyncTaskCreateModal from '@/component/Task/AsyncTask';
import DataMockerTaskCreateModal from '@/component/Task/DataMockerTask';
import ExportTaskCreateModal from '@/component/Task/ExportTask';
import ImportTaskCreateModal from '@/component/Task/ImportTask';
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
      <DataMockerTaskCreateModal />
      <ExportTaskCreateModal />
      <ImportTaskCreateModal />
      <AsyncTaskCreateModal />
    </>
  );
};

export default inject('modalStore')(observer(GlobalModals));

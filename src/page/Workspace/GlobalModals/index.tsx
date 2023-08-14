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

import CreateFunctionModal from '@/component/CreateFunctionModal';
import CreatePackageModal from '@/component/CreatePackageModal';
import CreateProcedureModal from '@/component/CreateProcedureModal';
import CreateSynonymModal from '@/component/CreateSynonymModal';
import CreateTypeModal from '@/component/CreateTypeModal';
import AsyncTaskCreateModal from '@/component/Task/AsyncTask';
import DataMockerTaskCreateModal from '@/component/Task/DataMockerTask';
import ExportTaskCreateModal from '@/component/Task/ExportTask';
import ImportTaskCreateModal from '@/component/Task/ImportTask';
import ResultSetExportTaskCreateModal from '@/component/Task/ResultSetExportTask';
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
      <ResultSetExportTaskCreateModal />
    </>
  );
};

export default inject('modalStore')(observer(GlobalModals));

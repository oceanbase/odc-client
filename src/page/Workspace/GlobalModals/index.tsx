import CreatePackageModal from '@/component/CreatePackageModal';
import { ModalStore } from '@/store/modal';
import { inject, observer } from 'mobx-react';
import React from 'react';

interface IProps {
  modalStore?: ModalStore;
}

const GlobalModals: React.FC<IProps> = function ({ modalStore }) {
  return (
    <>
      <CreatePackageModal />
    </>
  );
};

export default inject('modalStore')(observer(GlobalModals));

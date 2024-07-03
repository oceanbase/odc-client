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

import { ModalStore } from '@/store/modal';
import React from 'react';
import { Button, Space } from 'antd';
import type { ButtonProps } from 'antd/lib/button';
import { inject, observer } from 'mobx-react';
import ApplyTablePermissionCreateModal from './CreateModal';

interface IProps extends ButtonProps {
  label: React.ReactNode;
  projectId?: number;
  modalStore?: ModalStore;
}

const ApplyTablePermissionButton: React.FC<IProps> = inject('modalStore')(
  observer((props) => {
    const { label, projectId, modalStore, ...rest } = props;

    const handleApplyTablePermission = () => {
      modalStore.changeApplyTablePermissionModal(true);
    };

    return (
      <>
        <Button {...rest} onClick={handleApplyTablePermission}>
          <Space size={4}>{label}</Space>
        </Button>
        <ApplyTablePermissionCreateModal projectId={projectId} />
      </>
    );
  }),
);

export default ApplyTablePermissionButton;

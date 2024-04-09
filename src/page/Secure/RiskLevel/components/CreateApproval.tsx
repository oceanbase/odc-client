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

import { getIntegrationList, getResourceRoles } from '@/common/network/manager';
import { IManagerResourceType, IntegrationType } from '@/d.ts';
import { projectRoleTextMap } from '@/page/Project/User';
import { useEffect, useState } from 'react';
import FormModal from '../../Approval/component/FormModal';
import { formatMessage } from '@/util/intl';
interface ICreateApprovalProps {
  editId: number;
  formModalVisible: boolean;
  setFormModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  reloadData: () => void;
}
/**
 * 数据库类型的Role文本映射
 */
const databaseRoleTextMap = {
  OWNER: '数据库管理员',
};
const CreateApproval: React.FC<ICreateApprovalProps> = ({
  editId,
  formModalVisible,
  setFormModalVisible,
  reloadData,
}) => {
  const [roles, setRoles] = useState([]);
  const [integrations, setIntegrations] = useState([]);

  const loadRoles = async () => {
    const res = await getResourceRoles({
      resourceType: [IManagerResourceType.project, IManagerResourceType.database],
    });
    const roles = res?.contents.map(({ roleName, id, resourceType }) => {
      const textMap =
        resourceType === IManagerResourceType.database ? databaseRoleTextMap : projectRoleTextMap;
      return {
        name: textMap?.[roleName],
        id,
      };
    });
    setRoles(roles);
  };
  const loadIntegrations = async () => {
    const integrations = await getIntegrationList({
      type: IntegrationType.APPROVAL,
    });
    setIntegrations(integrations?.contents);
  };

  useEffect(() => {
    if (formModalVisible) {
      loadRoles();
      loadIntegrations();
    }
  }, [formModalVisible]);
  return (
    <>
      <FormModal
        roles={roles}
        integrations={integrations}
        editId={editId}
        visible={formModalVisible}
        reloadData={reloadData}
        onClose={() => {
          setFormModalVisible(false);
        }}
      />
    </>
  );
};

export default CreateApproval;

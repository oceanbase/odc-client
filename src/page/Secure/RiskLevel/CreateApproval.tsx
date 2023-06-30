import { getIntegrationList, getRoleList } from '@/common/network/manager';
import { useEffect, useState } from 'react';
import FormModal from '../Approval/component/FormModal';

const CreateApproval = ({ createApprovalDrawerOpen, setCreateApprovalDrawerOpen, reloadData }) => {
  const [roles, setRoles] = useState([]);
  const [integrations, setIntegrations] = useState([]);

  const loadRoles = async () => {
    const roles = await getRoleList();
    setRoles(roles?.contents);
  };
  const loadIntegrations = async () => {
    const integrations = await getIntegrationList();
    setIntegrations(integrations?.contents);
  };

  useEffect(() => {
    if (createApprovalDrawerOpen) {
      loadRoles();
      loadIntegrations();
    }
  }, [createApprovalDrawerOpen]);
  return (
    <>
      <FormModal
        roles={roles}
        integrations={integrations}
        editId={null}
        visible={createApprovalDrawerOpen}
        reloadData={reloadData}
        onClose={() => {
          setCreateApprovalDrawerOpen(false);
        }}
      />
    </>
  );
};

export default CreateApproval;

import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useContext, useMemo } from 'react';
import { Select } from 'antd';
import { ApprovalStatus } from '@/component/Schedule/interface';
import { ApprovalStatusTextMap } from '@/constant/schedule';

const ApprovalStatusFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};
  const { approveStatus } = params || {};

  const handleSelectApprovalStatus = (value) => {
    setParams?.({ approveStatus: value });
  };

  const ApprovalStatusOptions = useMemo(() => {
    return Object.keys(ApprovalStatus).map((item) => {
      return {
        label: ApprovalStatusTextMap?.[item],
        value: item,
      };
    });
  }, []);

  return (
    <>
      <div style={{ marginTop: '16px' }}>审批状态</div>
      <Select
        showSearch
        placeholder="请输入"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        mode="multiple"
        options={ApprovalStatusOptions || []}
        style={{ width: '100%' }}
        value={approveStatus}
        allowClear
        onChange={handleSelectApprovalStatus}
      />
    </>
  );
};

export default ApprovalStatusFilter;

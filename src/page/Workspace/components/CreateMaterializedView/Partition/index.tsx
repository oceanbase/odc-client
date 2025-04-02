import CreateTablePartitionRuleForm from '@/page/Workspace/components/CreateTable/Partition/CreateTablePartitionRuleForm';
import MViewContext from '../context/MaterializedViewContext';
import { useContext, useEffect, useMemo } from 'react';

const Partition = () => {
  const mviewContext = useContext(MViewContext);
  const { columns, session, setPartitions } = mviewContext;

  const optionColumns = useMemo(() => {
    return columns
      ?.filter((item) => {
        return !!item.aliasName;
      })
      ?.map((item: any) => ({
        ...item,
        name: item.aliasName,
      }));
  }, [JSON.stringify(columns)]);

  return (
    <CreateTablePartitionRuleForm
      columns={optionColumns}
      session={session}
      dataTypes={session?.dataTypes}
      onSave={(partitions) => {
        setPartitions(partitions);
      }}
    />
  );
};

export default Partition;

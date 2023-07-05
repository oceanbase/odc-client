import React, { useContext } from 'react';
import TableContext from '../TableContext';
import CreateTablePartitionRuleForm from './CreateTablePartitionRuleForm';

interface IProps {}

const Partition: React.FC<IProps> = function ({}) {
  const tableContext = useContext(TableContext);
  return (
    <CreateTablePartitionRuleForm
      columns={tableContext.columns}
      session={tableContext.session}
      dataTypes={tableContext.session?.dataTypes}
      onSave={(partitions) => {
        tableContext.setPartitions(partitions);
      }}
    />
  );
};

export default Partition;

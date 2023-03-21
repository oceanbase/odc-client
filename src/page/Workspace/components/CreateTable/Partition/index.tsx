import { SchemaStore } from '@/store/schema';
import { inject, observer } from 'mobx-react';
import React, { useContext } from 'react';
import TableContext from '../TableContext';
import CreateTablePartitionRuleForm from './CreateTablePartitionRuleForm';

interface IProps {
  schemaStore?: SchemaStore;
}

const Partition: React.FC<IProps> = function ({ schemaStore }) {
  const tableContext = useContext(TableContext);
  return (
    <CreateTablePartitionRuleForm
      columns={tableContext.columns}
      dataTypes={schemaStore.dataTypes}
      onSave={(partitions) => {
        tableContext.setPartitions(partitions);
      }}
    />
  );
};

export default inject('schemaStore')(observer(Partition));

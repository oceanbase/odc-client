import { formatMessage } from '@/util/intl';
import { Modal } from 'antd';
import { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { TablePartition } from '../../../CreateTable/interface';
import CreateTablePartitionRuleForm from '../../../CreateTable/Partition/CreateTablePartitionRuleForm';
import TablePageContext from '../../context';

interface IProps {
  ref?: IRef;
}

interface IRef {
  addNewPartitions: () => Promise<Partial<TablePartition>>;
}

const AddPartitionModal = forwardRef<IRef, IProps>(function ({}, ref) {
  const pageContext = useContext(TablePageContext);
  const [visible, setVisible] = useState(false);
  const [newPartitions, setNewPartitions] = useState<Partial<TablePartition>>();
  const callbackRef = useRef<(newPartitions: any) => void>();
  const table = pageContext?.table;
  const partitions = table?.partitions as any;
  useImperativeHandle(
    ref,
    () => ({
      async addNewPartitions() {
        return new Promise((resolve) => {
          callbackRef.current = resolve;
          setVisible(true);
          setNewPartitions(null);
        });
      },
    }),

    [],
  );

  function close() {
    setVisible(false);
    callbackRef.current = null;
  }
  return (
    <Modal
      visible={visible}
      width={720}
      destroyOnClose
      title={formatMessage({
        id: 'odc.Partitions.AddPartitionModal.CreatePartition',
      })} /*新建分区*/
      onCancel={() => {
        callbackRef.current?.(null);
        close();
      }}
      onOk={() => {
        callbackRef.current?.(newPartitions);
        close();
      }}
    >
      <CreateTablePartitionRuleForm
        addMode={true}
        partitionType={partitions?.partType}
        selectColumns={partitions?.columns}
        selectColumnName={partitions?.columnName}
        expression={partitions?.expression}
        columns={table?.columns}
        dataTypes={pageContext?.session?.dataTypes}
        session={pageContext.session}
        onSave={(newPartitions) => {
          setNewPartitions(newPartitions);
        }}
      />
    </Modal>
  );
});

export default AddPartitionModal;

/*
 * Copyright 2024 OceanBase
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

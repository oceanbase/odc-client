import { generateUpdateTableDDL, getTableInfo } from '@/common/network/table';
import { IPartitionType } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { generateUniqKey } from '@/util/utils';
import { cloneDeep } from 'lodash';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import AddPartitionModal from '.';
import {
  ITableListColumnsPartition,
  ITableListPartition,
  ITableRangeColumnsPartition,
  ITableRangePartition,
} from '../../../CreateTable/interface';
import TablePageContext from '../../context';

interface IProps {
  session: SessionStore;
}

const AddPartitionWithTableNameModal = forwardRef<any, IProps>(function ({ session }, ref) {
  const modalRef = useRef<any>();
  const [table, setTable] = useState(null);

  async function onRefresh(tableName) {
    const table = await getTableInfo(tableName, session?.database?.dbName, session?.sessionId);
    if (table) {
      setTable(table);
    }
    return table;
  }
  useImperativeHandle(
    ref,
    () => {
      return {
        async addNewPartitions(tableName) {
          let table;
          if ((table = await onRefresh(tableName))) {
            const values = await modalRef.current.addNewPartitions();
            if (!values) {
              return;
            }
            if (values) {
              const newPartitions = cloneDeep(table.partitions);
              const partType = values.partType;
              let newValues;
              switch (partType) {
                case IPartitionType.LIST: {
                  (newPartitions as ITableListPartition).partitions = (
                    newPartitions as ITableListPartition
                  ).partitions.concat(
                    values.partitions?.map((part) =>
                      Object.assign({ key: generateUniqKey() }, part),
                    ),
                  );
                  newValues = newPartitions;
                  break;
                }
                case IPartitionType.RANGE: {
                  (newPartitions as ITableRangePartition).partitions = (
                    newPartitions as ITableRangePartition
                  ).partitions.concat(
                    values.partitions?.map((part) =>
                      Object.assign({ key: generateUniqKey() }, part),
                    ),
                  );
                  newValues = newPartitions;
                  break;
                }
                case IPartitionType.LIST_COLUMNS: {
                  (newPartitions as ITableListColumnsPartition).partitions = (
                    newPartitions as ITableListColumnsPartition
                  ).partitions.concat(
                    values.partitions?.map((part) =>
                      Object.assign({ key: generateUniqKey() }, part),
                    ),
                  );
                  newValues = newPartitions;
                  break;
                }
                case IPartitionType.RANGE_COLUMNS: {
                  (newPartitions as ITableRangeColumnsPartition).partitions = (
                    newPartitions as ITableRangeColumnsPartition
                  ).partitions.concat(
                    values.partitions?.map((part) =>
                      Object.assign({ key: generateUniqKey() }, part),
                    ),
                  );
                  newValues = newPartitions;
                  break;
                }
              }
              const updateTableDML = await generateUpdateTableDDL(
                {
                  ...table,
                  partitions: newValues,
                },
                table,
                session?.sessionId,
                session?.database?.dbName,
              );
              return updateTableDML;
            }
          }
        },
      };
    },
    [modalRef],
  );

  return (
    <TablePageContext.Provider
      value={{
        table,
        onRefresh: () => {},
      }}
    >
      <AddPartitionModal ref={modalRef} />
    </TablePageContext.Provider>
  );
});

export default AddPartitionWithTableNameModal;

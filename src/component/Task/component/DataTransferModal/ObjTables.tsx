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

import { DbObjectTypeTextMap } from '@/constant/label';
import {
  IExportDbObject,
  ITransferDataObjStatus,
  ITransferObjectInfo,
  ITransferSchemaInfo,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Table } from 'antd';
import { ColumnType } from 'antd/es/table';
import React from 'react';
import getTaskStatus, { StatusItem } from './status';

function getColumns(transferDDL: boolean, transferData: boolean, isImport: boolean) {
  let columns: ColumnType<any>[] = [
    {
      title: formatMessage({
        id: 'odc.component.TaskDetailDrawer.ObjTables.ObjectName',
      }),

      dataIndex: 'objectName',
      ellipsis: true,
      render: (t) => {
        return t;
      },
    },

    {
      title: formatMessage({
        id: 'odc.component.TaskDetailDrawer.ObjTables.ObjectType',
      }),

      dataIndex: 'dbObjectType',
      width: 80,
      render: (t) => DbObjectTypeTextMap[t],
    },
  ];

  columns = columns.concat(
    [
      transferDDL && {
        title: formatMessage({
          id: 'odc.component.TaskDetailDrawer.ObjTables.StructureProcessingStatus',
        }),

        dataIndex: ['schemaInfo', 'status'],
        width: 120,
        render(t) {
          return <StatusItem status={t} />;
        },
        filters: [
          ITransferDataObjStatus.INITIAL,
          ITransferDataObjStatus.SUCCESS,
          ITransferDataObjStatus.FAILURE,
        ].map((status) => {
          return {
            text: getTaskStatus[status]?.text,
            value: status,
          };
        }),
        onFilter: (value, record) => {
          return value == record.schemaInfo?.status;
        },
      },

      transferData && {
        title: formatMessage({
          id: 'odc.component.TaskDetailDrawer.ObjTables.ActualProcessingQuantity',
        }), // 实际处理数量
        dataIndex: ['dataInfo', 'count'],
        width: 100,
      },

      transferData && {
        title: formatMessage({
          id: 'odc.component.TaskDetailDrawer.ObjTables.DataProcessingStatus',
        }),

        dataIndex: ['dataInfo', 'status'],
        width: 120,
        render(t) {
          return <StatusItem status={t} />;
        },
        filters: [
          ITransferDataObjStatus.INITIAL,
          ITransferDataObjStatus.SUCCESS,
          ITransferDataObjStatus.FAILURE,
        ].map((status) => {
          return {
            text: getTaskStatus[status]?.text,
            value: status,
          };
        }),
        onFilter: (value, record) => {
          return value == record.dataInfo?.status;
        },
      },
    ].filter(Boolean),
  );
  return columns;
}

function unionData(
  data: IExportDbObject[],
  dataInfo: ITransferObjectInfo[],
  schemaInfo: ITransferSchemaInfo[],
  isImport: boolean,
) {
  const dataInfoMap = {};
  const schemaInfoMap = {};
  dataInfo?.forEach((data) => {
    dataInfoMap[data.name + '%$%' + data.type] = data;
  });
  schemaInfo?.forEach((data) => {
    schemaInfoMap[data.name + '%$%' + data.type] = data;
  });
  const allNames = Array.from(new Set(Object.keys(dataInfoMap).concat(Object.keys(schemaInfoMap))));
  return allNames.map((nameAndType) => {
    const [name, type] = nameAndType.split('%$%');
    return {
      objectName: name,
      dbObjectType: type,
      dataInfo: dataInfoMap[nameAndType],
      schemaInfo: schemaInfoMap[nameAndType],
    };
  });
}

const ObjTable: React.FC<{
  data: IExportDbObject[];
  dataInfo: ITransferObjectInfo[];
  schemaInfo: ITransferSchemaInfo[];
  isImport: boolean;
  transferDDL: boolean;
  transferData: boolean;
}> = function (props) {
  const { transferData, transferDDL, data, dataInfo, schemaInfo, isImport } = props;
  const columns = getColumns(transferDDL, transferData, isImport);
  const dataSource = unionData(data, dataInfo, schemaInfo, isImport);
  return (
    <Table
      bordered
      className="o-mini-table o-mini-table--no-border"
      rowClassName={(record, i) => (i % 2 === 0 ? 'o-min-table-even' : 'o-min-table-odd')}
      rowKey={(record) => {
        return `${record.objectName}_${record.dbObjectType}`;
      }}
      columns={columns}
      dataSource={dataSource}
    />
  );
};

export default ObjTable;

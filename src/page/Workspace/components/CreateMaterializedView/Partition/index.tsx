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

import CreateTablePartitionRuleForm from '@/page/Workspace/components/CreateTable/Partition/CreateTablePartitionRuleForm';
import MViewContext from '../context/MaterializedViewContext';
import { useContext, useMemo } from 'react';
import { Select, Tooltip } from 'antd';
const Option = Select.Option;

const Partition = () => {
  const mviewContext = useContext(MViewContext);
  const { columns, session, setPartitions } = mviewContext;

  const optionColumns = useMemo(() => {
    return columns?.map((item: any) => ({
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
      customRenderOptions={(item) => {
        return (
          <Option
            key={item.aliasName ? item.aliasName?.trim() : item.columnName}
            value={item.aliasName ? item.aliasName?.trim() : item.columnName}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span>{item.columnName}</span>
              <Tooltip title={item.aliasName}>
                <span
                  style={{
                    color: 'var(--text-color-placeholder)',
                    marginLeft: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.aliasName}
                </span>
              </Tooltip>
            </div>
          </Option>
        );
      }}
    />
  );
};

export default Partition;

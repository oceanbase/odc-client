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

import SessionDropdown, {
  ISessionDropdownFiltersProps,
} from '@/page/Workspace/components/SessionContextWrap/SessionSelect/SessionDropdown';
import { IDatabase } from '@/d.ts/database';
import React, { useState } from 'react';
import { Divider, Select, Space, Form } from 'antd';
import { formatMessage } from '@/util/intl';
import { DEFALT_WIDTH } from '@/page/Workspace/components/SessionContextWrap/SessionSelect/const';
import { SelectItemProps } from '@/page/Project/Sensitive/interface';

interface IProps {
  width?: number | string;
  selectWidth?: number | string;
  projectId?: number;
  dataSourceId?: number;
  filters?: ISessionDropdownFiltersProps;
  placeholder?: string;
  disabled?: boolean;
  datasourceMode?: boolean;
  onSelect?: (Ids: React.Key[]) => void;
  onChange?: (Ids: React.Key) => void;
  onClear?: () => void;
  label: string;
  name: string;
  isAdaptiveWidth?: boolean;
}

const MultipleDatabaseSelect: React.FC<IProps> = (props) => {
  const {
    projectId,
    dataSourceId,
    filters = null,
    onSelect,
    onClear,
    onChange,
    isAdaptiveWidth,
    label,
    name,
    width,
    selectWidth,
    placeholder = formatMessage({
      id: 'src.page.Workspace.components.SessionContextWrap.SessionSelect.66A17FFD',
      defaultMessage: '请选择',
    }),
    disabled = false,
  } = props;

  const [options, setOptions] = useState<SelectItemProps[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  return (
    <SessionDropdown
      projectId={projectId}
      dataSourceId={dataSourceId}
      filters={filters}
      width={width || DEFALT_WIDTH}
      disabled={disabled}
      checkModeConfig={{
        onSelect,
        checkedKeys,
        setOptions,
        setCheckedKeys,
      }}
    >
      <Space
        direction="vertical"
        size={24}
        style={{ width: isAdaptiveWidth ? '100%' : selectWidth, height: '100%' }}
      >
        <Form.Item
          label={label}
          name={name}
          style={{ marginBottom: '0px' }}
          required
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'odc.component.DatabaseSelect.SelectADatabase',
                defaultMessage: '请选择数据库',
              }), //请选择数据库
            },
          ]}
        >
          <Select
            mode="multiple"
            options={options}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(value) => {
              setCheckedKeys(value);
              onChange?.(value);
            }}
            style={{ width: '100%' }}
            open={false}
            maxTagCount="responsive"
            allowClear
            onClear={onClear}
          />
        </Form.Item>
      </Space>
    </SessionDropdown>
  );
};

export default MultipleDatabaseSelect;

import { ConnectionMode } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { MenuOutlined } from '@ant-design/icons';
import { Dropdown, Input, Menu } from 'antd';
import React, { useMemo } from 'react';

interface IProps {
  value?: string;
  connectionMode?: ConnectionMode;
  onChange?: (v: string) => void;
}

export const ValueList = {
  DEFAULT: Symbol('default').toString(),
  NULL: Symbol('null').toString(),
};

const ValueInput: React.FC<IProps> = function ({ value, connectionMode, onChange }) {
  const isOracle = connectionMode === ConnectionMode.OB_ORACLE;
  value = value === null ? ValueList.NULL : value;
  const [inputValue, inputPlaceholder, menuValue] = useMemo(() => {
    const menuObj = Object.entries(ValueList).find(([key, _value]) => _value === value);
    return menuObj ? [null, menuObj[0], value] : [value, null, null];
  }, [value]);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Input
        placeholder={inputPlaceholder}
        value={inputValue}
        bordered={false}
        style={{ flex: 1 }}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />

      <Dropdown
        overlay={
          <Menu
            activeKey={menuValue}
            onClick={(info) => {
              if (info.key === 'empty') {
                onChange('');
              } else {
                onChange(info.key);
              }
            }}
          >
            {isOracle && (
              <Menu.Item key={ValueList.DEFAULT}>
                {
                  formatMessage({
                    id: 'odc.component.EditPLParamsModal.ValueInput.SetToDefault',
                  }) /*设置为 DEFAULT*/
                }
              </Menu.Item>
            )}
            <Menu.Item key={ValueList.NULL}>
              {
                formatMessage({
                  id: 'odc.component.EditPLParamsModal.ValueInput.SetToNull',
                }) /*设置为 NULL*/
              }
            </Menu.Item>
            {!isOracle && (
              <Menu.Item key={'empty'}>
                {
                  formatMessage({
                    id: 'odc.component.EditPLParamsModal.ValueInput.SetToAnEmptyString',
                  }) /*设置为空字符串*/
                }
              </Menu.Item>
            )}
          </Menu>
        }
      >
        <MenuOutlined
          style={{
            padding: '2px 4px',
          }}
        />
      </Dropdown>
    </div>
  );
};

export default ValueInput;

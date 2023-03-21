import { formatMessage } from '@/util/intl';
import { FilterOutlined } from '@ant-design/icons';
import { Button, Checkbox, Divider, Popover, Space, Tooltip } from 'antd';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

interface IProps {
  filterValue: string[];
  onChange: (value: string[]) => void;
}

const FilterPopover: React.FC<IProps> = (props) => {
  const { filterValue, onChange } = props;
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState([]);

  useEffect(() => {
    setValue(filterValue);
  }, [filterValue]);

  const handleValueChange = (checkedValues) => {
    setValue(checkedValues);
  };

  const handleReset = () => {
    onChange([]);
    setVisible(false);
  };

  const handleConfirm = () => {
    onChange(value);
    setVisible(false);
  };

  return (
    <Popover
      overlayClassName={styles.filterPopover}
      trigger="click"
      placement="bottomRight"
      visible={visible}
      onVisibleChange={(v) => {
        setVisible(v);
        if (!v) {
          handleConfirm();
        }
      }}
      content={
        <>
          <Checkbox.Group value={value} onChange={handleValueChange}>
            <Space direction="vertical">
              <Checkbox value="VALID">
                {
                  formatMessage({
                    id: 'odc.component.FilterPopover.Effective',
                  }) /*有效*/
                }
              </Checkbox>
              <Checkbox value="INVALID">
                {
                  formatMessage({
                    id: 'odc.component.FilterPopover.Invalid',
                  }) /*无效*/
                }
              </Checkbox>
            </Space>
          </Checkbox.Group>
          <Divider />
          <div className={styles.footer}>
            <Button
              className={classnames({ [styles.active]: value.length })}
              type="link"
              size="small"
              onClick={handleReset}
            >
              {
                formatMessage({
                  id: 'odc.component.FilterPopover.Reset',
                }) /*重置*/
              }
            </Button>
            <Button type="primary" size="small" onClick={handleConfirm}>
              {formatMessage({ id: 'odc.component.FilterPopover.Ok' }) /*确定*/}
            </Button>
          </div>
        </>
      }
    >
      <Tooltip
        title={formatMessage({
          id: 'odc.component.FilterPopover.Filter',
        })} /*筛选*/
      >
        <FilterOutlined className={classnames({ [styles.active]: filterValue.length })} />
      </Tooltip>
    </Popover>
  );
};

export default FilterPopover;

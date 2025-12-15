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
import React, { useEffect, useState, useMemo } from 'react';
import { Button, Checkbox, Popover, Spin, Empty, Input, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import styles from './index.less';
import { ReactComponent as TableOutlined } from '@/svgr/menuTable.svg';

interface BatchSelectionPopoverProps {
  options: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];
  handleConfirm: (selectedList: any[]) => void;
  disabled?: boolean;
  maxCount?: number;
}

const BatchSelectionPopover: React.FC<BatchSelectionPopoverProps> = (props) => {
  const { options = [], handleConfirm, disabled = false, maxCount } = props;

  const [checkedList, setCheckedList] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>(undefined);
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    setCheckedList([]);
    setSearchValue(undefined);
  };

  useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open, searchValue]);

  const filterOptions = useMemo(() => {
    if (!searchValue?.trim()) {
      return options;
    }

    return options?.filter((item) => {
      return item.label?.includes(searchValue);
    });
  }, [searchValue, options]);

  const filterCheckedList = useMemo(() => {
    if (!searchValue?.trim()) {
      return checkedList;
    }
    return checkedList?.filter((item) => {
      return (item as string)?.includes(searchValue);
    });
  }, [searchValue, checkedList]);

  /**
   * 手动设置Popover的显隐藏时，antd4没有提供蒙层关闭，手动添加蒙层解决
   */
  const renderMask = useMemo(() => {
    return (
      <>
        {open && (
          <div
            className={styles.batchIncreasePopoverMask}
            onClick={() => {
              setOpen(false);
            }}
          ></div>
        )}
      </>
    );
  }, [open]);

  const renderInputSearch = useMemo(() => {
    return (
      <div className={`${styles.p12} ${styles.pb0}`}>
        <Input
          placeholder={formatMessage({
            id: 'src.component.BatchSelectionPopover.9DC08FE8',
            defaultMessage: '搜索关键字',
          })}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
    );
  }, [searchValue]);

  const renderContentBottom = useMemo(() => {
    return (
      <>
        <div className={styles.line}></div>
        <div className={`${styles.flexBetween} ${styles.p12}`}>
          <Checkbox
            checked={
              filterCheckedList.length &&
              filterOptions?.filter((item) => !item?.disabled)?.length === filterCheckedList?.length
            }
            disabled={!filterOptions?.filter((item) => !item?.disabled)?.length}
            onChange={(e: CheckboxChangeEvent) => {
              setCheckedList(
                e.target.checked
                  ? filterOptions?.filter((item) => !item?.disabled)?.map((item) => item?.value)
                  : [],
              );
            }}
          >
            {formatMessage({
              id: 'src.component.BatchSelectionPopover.080F782E',
              defaultMessage: '全选',
            })}
          </Checkbox>
          <Button
            size="small"
            type="primary"
            onClick={() => {
              if (maxCount && checkedList?.length > maxCount) {
                message.warning(
                  formatMessage(
                    {
                      id: 'src.component.BatchSelectionPopover.8DFDBE89',
                      defaultMessage: '最多还可以添加{maxCount}个',
                    },
                    { maxCount },
                  ),
                );
                return;
              }
              handleConfirm(checkedList);
              setOpen(false);
            }}
          >
            {formatMessage({
              id: 'src.component.BatchSelectionPopover.EDF3640E',
              defaultMessage: '确定',
            })}
          </Button>
        </div>
      </>
    );
  }, [checkedList, filterOptions]);

  const renderContent = () => {
    const renderContentWhenHasData = () => {
      return (
        <div className={styles.checkboxGroup}>
          {filterOptions?.map((item) => (
            <div className={styles.checkboxItem} key={item.value}>
              <Checkbox
                value={item.value}
                className={styles.w100}
                disabled={item?.disabled}
                checked={checkedList?.indexOf(item.value) !== -1}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckedList([...checkedList, e.target.value]);
                  } else {
                    setCheckedList(checkedList?.filter((item) => item !== e.target.value));
                  }
                }}
              >
                <div className={styles.flexCenter}>
                  <TableOutlined className={styles.tableIcon} />
                  {item.label}
                </div>
              </Checkbox>
            </div>
          ))}
        </div>
      );
    };
    let content;
    if (!filterOptions) {
      content = <Spin className={styles.center} />;
    } else if (filterOptions && filterOptions.length === 0) {
      content = <Empty className={styles.center} />;
    } else {
      content = renderContentWhenHasData();
    }

    return (
      <div className={styles.content}>
        {renderInputSearch}
        <div className={styles.groupContent}>{content}</div>
        {renderContentBottom}
      </div>
    );
  };

  return (
    <>
      {renderMask}
      <Popover
        open={open}
        overlayClassName={styles.batchIncreasePopover}
        content={renderContent()}
        placement="bottom"
      >
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={() => {
            setOpen(true);
          }}
          disabled={disabled}
        >
          {formatMessage({
            id: 'src.component.BatchSelectionPopover.F72B9B10',
            defaultMessage: '批量添加',
          })}
        </Button>
      </Popover>
    </>
  );
};

export default BatchSelectionPopover;

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

import { getDataSourceStyleByConnectType } from '@/common/datasource';
import ConnectionPopover from '@/component/ConnectionPopover';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { ConnectType, IConnection } from '@/d.ts';
import { IEnvironment } from '@/d.ts/environment';
import { ReactComponent as DragSvg } from '@/svgr/drag.svg';
import { formatMessage } from '@/util/intl';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Form, FormListFieldData, Popover, Select, Space, Tooltip } from 'antd';
import { useWatch } from 'antd/lib/form/Form';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { flatArray } from '@/util/data/array';
import styles from './index.less';
import DatabaseSelectEmpty from '@/component/Empty/DatabaseSelectEmpty';
import { IDatabase } from '@/d.ts/database';
import { rules } from '../const';

export type DatabaseOption = {
  label: string;
  value: number;
  dataSource: IConnection;
  environment: IEnvironment;
  existed: boolean;
  unauthorized: boolean;
  expired: boolean;
  connectType: ConnectType;
  database?: IDatabase;
};
const InnerSelect: React.FC<{
  rootName: (number | string)[];
  innerName: number;
  outerName: number;
  innerIndex: number;
  disabled: boolean;
  databaseOptions: DatabaseOption[];
  innerFields: FormListFieldData[];
  innerRemove: (value: number) => void;
}> = ({
  rootName,
  innerName,
  outerName,
  innerIndex,
  disabled,
  databaseOptions,
  innerRemove,
  innerFields,
}) => {
  const ref = useRef(null);
  const form = Form.useFormInstance();
  const [searchValue, setSearchValue] = useState<string>();
  const orderedDatabaseIds = useWatch<number[][]>(rootName, form);
  const currentOrderedDatabaseIds = useWatch<number[]>([...rootName, outerName], form);
  const currnetOrderedDatabaseId = useWatch<number>([...rootName, outerName, innerName], form);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  const databaseOptionMap = databaseOptions?.reduce((pre, cur) => {
    pre[cur?.value] = cur;
    return pre;
  }, {});
  const swapSiblingIndex = (origin, originIndex, targetIndex) => {
    const currentOrderedDatabaseId = currentOrderedDatabaseIds[originIndex];
    currentOrderedDatabaseIds.splice(originIndex, 1);
    currentOrderedDatabaseIds.splice(targetIndex, 0, currentOrderedDatabaseId);
    form.setFieldValue([...rootName, origin], currentOrderedDatabaseIds);
  };
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'box',
    hover(item: any, monitor) {},
    drop: (item, monitor) => {
      if (item?.originOuterName === outerName) {
        if (item?.originInnerIndex === innerIndex) {
          return;
        }
        return swapSiblingIndex(item?.originOuterName, item?.originInnerIndex, innerIndex);
      } else {
        // target
        currentOrderedDatabaseIds?.splice(
          innerIndex,
          0,
          orderedDatabaseIds?.[item?.originOuterName]?.[item?.originInnerIndex],
        );
        const originOrderedDatabaseIds = orderedDatabaseIds?.[item?.originOuterName];
        originOrderedDatabaseIds?.splice(item?.originInnerIndex, 1);
        orderedDatabaseIds?.splice(item?.originOuterName, 1, originOrderedDatabaseIds);
        const newOrderedDatabaseIds = orderedDatabaseIds?.filter((ids) => ids?.length);
        form.setFieldValue(rootName, newOrderedDatabaseIds);
      }
    },
    collect: (monitor) => {
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      };
    },
  });
  drop(ref);
  const [{ opacity, isDragging }, drag, preview] = useDrag({
    item: { originInnerIndex: innerIndex, originOuterName: outerName, type: 'box' },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
      isDragging: monitor.isDragging(),
    }),
    options: {
      dropEffect: 'move',
    },
  });
  drag(ref);

  const getPlaceholder = () => {
    if (!currnetOrderedDatabaseId) {
      return formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.91F6B921',
        defaultMessage: '请选择数据库',
      });
    }
    const item = databaseOptionMap?.[currnetOrderedDatabaseId];
    const icon = getDataSourceStyleByConnectType(item?.dataSource?.type);
    if (item) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Space size={0}>
            <RiskLevelLabel content={item?.environment?.name} color={item?.environment?.style} />
            <Icon
              component={icon?.icon?.component}
              style={{
                color: icon?.icon?.color,
                fontSize: 16,
                marginRight: 4,
              }}
            />

            <div style={{ color: 'var(--text-color-primary)' }}>{item?.label}</div>
            <div style={{ color: 'var(--text-color-hint)', marginLeft: '4px' }}>
              {item?.dataSource?.name}
            </div>
          </Space>
        </div>
      );
    }
    // return (
    //   <div
    //     style={{
    //       display: 'flex',
    //       alignItems: 'center',
    //       justifyContent: 'space-between',
    //     }}
    //   >
    //     <div style={{ color: 'var(--text-color-primary)' }}>{currnetOrderedDatabaseId}</div>
    //   </div>
    // );

    return formatMessage({
      id: 'src.component.Task.MutipleAsyncTask.CreateModal.91F6B921',
      defaultMessage: '请选择数据库',
    });
  };

  const renderItem = (
    item: DatabaseOption,
    setSearchValue: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const icon = getDataSourceStyleByConnectType(item?.dataSource?.type);
    const databaseIds = flatArray(orderedDatabaseIds);
    const isSelected =
      databaseIds?.includes(item?.value) && item.value !== currnetOrderedDatabaseId;
    const disabled = isSelected || item?.expired || item?.unauthorized;
    const getTooltipTitle = (expired: boolean, unauthorized: boolean, isSelected: boolean) => {
      if (expired) {
        return formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.797AEFEE',
          defaultMessage: '该数据库已失效',
        });
      }
      if (unauthorized) {
        return formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.24303BEB',
          defaultMessage: '暂无权限，请先申请数据库权限',
        });
      }
      if (isSelected) {
        return formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.BF1212E7',
          defaultMessage: '该数据库已被选中',
        });
      }
      return null;
    };
    const tooltipTitle = getTooltipTitle(item?.expired, item?.unauthorized, isSelected);
    const isCurrentItem = item?.value === currnetOrderedDatabaseId;
    return (
      <Popover
        showArrow={false}
        placement={'right'}
        content={
          <ConnectionPopover connection={item?.dataSource} showRemark database={item?.database} />
        }
      >
        <div
          title={item?.label}
          key={item?.value}
          data-key={item?.value}
          onClick={() => {
            if (disabled) {
              return;
            }
            setSearchValue('');
            form.setFieldValue([...rootName, outerName, innerName], item?.value);
            setPopoverOpen(false);
          }}
        >
          <Tooltip title={disabled ? tooltipTitle : null} placement="left">
            <div
              className={classNames(styles.option, {
                [styles.optionDisabled]: disabled,
              })}
              style={{
                backgroundColor: isCurrentItem ? 'val(--hover-color)' : null,
              }}
            >
              <Space>
                <Icon
                  component={icon?.icon?.component}
                  style={{
                    color: disabled ? 'var(--icon-color-disable)' : icon?.icon?.color,
                    fontSize: 16,
                    marginRight: 4,
                  }}
                />

                <div
                  style={{
                    color: disabled
                      ? 'var(--text-color-placeholder)'
                      : isCurrentItem
                      ? 'var(--text-color-link)'
                      : 'var(--text-color-primary)',
                  }}
                >
                  {item?.label}
                </div>
                <div
                  style={{
                    color: isCurrentItem
                      ? 'var(--text-color-link)'
                      : 'var(--text-color-placeholder)',
                  }}
                >
                  {item?.dataSource?.name}
                </div>
              </Space>
              <div
                style={{
                  height: '6px',
                  width: '6px',
                  backgroundColor: item?.environment?.style,
                }}
              />
            </div>
          </Tooltip>
        </div>
      </Popover>
    );
  };
  useEffect(() => {
    return () => {
      ref.current = null;
    };
  }, []);
  const renderOptions = searchValue?.trim()?.length
    ? databaseOptions?.filter((item) => {
        if (item?.label?.toString()?.toLowerCase()?.indexOf(searchValue?.toLowerCase()) > -1) {
          return item;
        }
        if (
          item?.dataSource?.name?.toString()?.toLowerCase()?.indexOf(searchValue?.toLowerCase()) >
          -1
        ) {
          return item;
        }
      })
    : databaseOptions;
  return (
    <div
      ref={ref}
      className={styles.dragIem}
      style={{
        borderTop: isOver ? '1px solid blue' : '1px solid transparent',
        opacity: isDragging ? 0 : 1,
        width: '444px',
      }}
    >
      <Form.Item>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          <Icon
            component={DragSvg}
            className={styles.dragIcon}
            style={{ cursor: 'move !important', marginRight: 4 }}
          />
          <Form.Item
            name={[innerName]}
            rules={rules.innerName({ databaseOptionMap })}
            style={{ flex: 1, padding: 0 }}
          >
            <Popover
              trigger="click"
              placement="bottom"
              showArrow={false}
              overlayStyle={{
                width: '390px',
                padding: 0,
              }}
              open={popoverOpen}
              onOpenChange={(open) => setPopoverOpen(open)}
              overlayInnerStyle={{
                padding: 0,
              }}
              overlayClassName={styles.selectOptions}
              content={
                renderOptions?.length ? (
                  <div
                    style={{
                      maxHeight: '320px',
                      overflowY: 'scroll',
                      scrollbarWidth: 'none',
                    }}
                  >
                    {renderOptions?.map((item) => renderItem(item, setSearchValue))}
                  </div>
                ) : (
                  <DatabaseSelectEmpty />
                )
              }
            >
              <Select
                showSearch
                optionFilterProp="title"
                style={{ flex: 1 }}
                searchValue={searchValue}
                onSearch={(searchValue) => setSearchValue(searchValue)}
                placeholder={getPlaceholder()}
                disabled={disabled}
                allowClear
                open={false}
              />
            </Popover>
          </Form.Item>
          {innerFields?.length > 1 && (
            <DeleteOutlined onClick={() => innerRemove(innerName)} style={{ marginLeft: 4 }} />
          )}
        </div>
      </Form.Item>
    </div>
  );
};
const InnerSelecter: React.FC<{
  rootName: (number | string)[];
  innerFields: FormListFieldData[];
  outerName: number;
  disabled: boolean;
  databaseOptions: DatabaseOption[];
  innerRemove: (index: number | number[]) => void;
}> = ({ rootName, innerFields, outerName, disabled, databaseOptions, innerRemove }) => {
  const ref = useRef(null);
  const form = Form.useFormInstance();
  const orderedDatabaseIds = useWatch<number[][]>(rootName, form);
  const currentOrderedDatabaseIds = useWatch<number[]>([...rootName, outerName], form);

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'box',
    hover(item: any, monitor) {},
    drop: (item, monitor) => {
      // target
      currentOrderedDatabaseIds.push(
        orderedDatabaseIds?.[item?.originOuterName]?.[item?.originInnerIndex],
      );
      orderedDatabaseIds[outerName] = currentOrderedDatabaseIds;
      orderedDatabaseIds?.[item?.originOuterName]?.splice(item?.originInnerIndex, 1);
      const newOrderedDatabaseIds = orderedDatabaseIds?.filter((ids) => ids?.length);
      form.setFieldValue(rootName, newOrderedDatabaseIds);
    },
    collect: (monitor) => {
      return {
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      };
    },
  });
  drop(ref);
  useEffect(() => {
    return () => {
      ref.current = null;
    };
  }, []);
  return (
    <div>
      {innerFields?.map(({ key: innerKey, name: innerName, ...innerRestField }, innerIndex) => (
        <InnerSelect
          rootName={rootName}
          key={innerIndex}
          disabled={disabled}
          databaseOptions={databaseOptions}
          innerIndex={innerIndex}
          innerFields={innerFields}
          outerName={outerName}
          innerName={innerName}
          innerRemove={innerRemove}
        />
      ))}
      <div
        ref={ref}
        style={{
          borderTop: isOver ? '1px solid red' : '1px solid transparent',
          height: 8,
          width: '430px',
        }}
      ></div>
    </div>
  );
};

export default InnerSelecter;

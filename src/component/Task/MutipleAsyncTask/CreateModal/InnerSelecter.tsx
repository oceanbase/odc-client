import { formatMessage } from '@/util/intl';
import { IConnection } from '@/d.ts';
import { Form, FormListFieldData, Popover, Select, Space, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { useDrag, useDrop } from 'react-dnd';
import { IEnvironment } from '@/d.ts/environment';
import { useWatch } from 'antd/lib/form/Form';
import _ from 'lodash';
import { ReactComponent as DragSvg } from '@/svgr/drag.svg';
import { getDataSourceStyleByConnectType } from '@/common/datasource';
import styles from './index.less';
import { flatArray } from '.';
import classNames from 'classnames';
import RiskLevelLabel from '@/component/RiskLevelLabel';

type DatabaseOption = {
  label: string;
  value: number;
  dataSource: IConnection;
  environment: IEnvironment;
  existed: boolean;
};
const InnerSelect: React.FC<{
  innerName: number;
  outerName: number;
  innerIndex: number;
  projectId: number;
  databaseOptions: DatabaseOption[];
  innerRemove: (value: number) => void;
}> = ({ innerName, outerName, innerIndex, projectId, databaseOptions, innerRemove }) => {
  const ref = useRef(null);
  const form = Form.useFormInstance();
  const [searchValue, setSearchValue] = useState<string>();
  const orderedDatabaseIds = useWatch<number[][]>(['parameters', 'orderedDatabaseIds'], form);
  const currentOrderedDatabaseIds = useWatch<number[]>(
    ['parameters', 'orderedDatabaseIds', outerName],
    form,
  );
  const currnetOrderedDatabaseId = useWatch<number>(
    ['parameters', 'orderedDatabaseIds', outerName, innerName],
    form,
  );
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  const databaseOptionMap = databaseOptions?.reduce((pre, cur) => {
    pre[cur?.value] = cur;
    return pre;
  }, {});
  const swapSiblingIndex = (origin, originIndex, targetIndex) => {
    const currentOrderedDatabaseId = currentOrderedDatabaseIds[originIndex];
    currentOrderedDatabaseIds.splice(originIndex, 1);
    currentOrderedDatabaseIds.splice(targetIndex, 0, currentOrderedDatabaseId);
    form.setFieldValue(['parameters', 'orderedDatabaseIds', origin], currentOrderedDatabaseIds);
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
        form.setFieldValue(['parameters', 'orderedDatabaseIds'], newOrderedDatabaseIds);
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
            <div style={{ color: 'var(--mask-color)', marginLeft: '4px' }}>
              {item?.dataSource?.name}
            </div>
          </Space>
        </div>
      );
    }
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ color: 'var(--text-color-primary)' }}>{currnetOrderedDatabaseId}</div>
      </div>
    );
  };

  const checkDatabaseExsisted = async (ruler, value) => {
    if (value && !databaseOptionMap?.[value]) {
      throw new Error(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.94128D2B',
          defaultMessage: '该数据库不属于当前项目',
        }),
      );
    }
  };
  const renderItem = (item: DatabaseOption) => {
    const icon = getDataSourceStyleByConnectType(item?.dataSource?.type);
    const databaseIds = flatArray(orderedDatabaseIds);
    const isDisabled = databaseIds?.includes(item?.value);
    return (
      <div
        title={item?.label}
        key={item?.value}
        data-key={item?.value}
        onClick={() => {
          if (isDisabled) {
            return;
          }
          form.setFieldValue(
            ['parameters', 'orderedDatabaseIds', outerName, innerName],
            item?.value,
          );
          setPopoverOpen(false);
        }}
      >
        <Tooltip
          title={
            isDisabled
              ? formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.BF1212E7',
                  defaultMessage: '该数据库已被选中',
                })
              : null
          }
        >
          <div
            className={classNames(styles.option, {
              [styles.optionDisabled]: isDisabled,
            })}
          >
            <Space>
              <Icon
                component={icon?.icon?.component}
                style={{
                  color: isDisabled ? 'var(--icon-color-disable)' : icon?.icon?.color,
                  fontSize: 16,
                  marginRight: 4,
                }}
              />

              <div
                style={{
                  color: isDisabled ? 'var(--mask-color)' : 'var(--text-color-primary)',
                }}
              >
                {item?.label}
              </div>
              <div style={{ color: 'var(--mask-color)' }}>{item?.dataSource?.name}</div>
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
    );
  };
  useEffect(() => {
    return () => {
      ref.current = null;
    };
  }, []);
  return (
    <div
      ref={ref}
      style={{
        borderTop: isOver ? '1px solid blue' : '1px solid transparent',
        opacity: isDragging ? 0 : 1,
        width: '430px',
      }}
    >
      <Form.Item>
        <Space>
          <Icon
            component={DragSvg}
            className={styles.dragIcon}
            style={{ cursor: 'move !important' }}
          />

          <Form.Item
            name={[innerName]}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.E7E1BCF3',
                  defaultMessage: '请选择数据库',
                }),
              },
              {
                validateTrigger: 'onChange',
                validator: checkDatabaseExsisted,
              },
            ]}
            noStyle
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
                <div
                  style={{
                    maxHeight: '320px',
                    overflowY: 'scroll',
                  }}
                >
                  {searchValue?.trim()?.length
                    ? databaseOptions
                        ?.filter((item) => {
                          if (
                            item?.label
                              ?.toString()
                              ?.toLowerCase()
                              ?.indexOf(searchValue?.toLowerCase()) > -1
                          ) {
                            return item;
                          }
                          if (
                            item?.dataSource?.name
                              ?.toString()
                              ?.toLowerCase()
                              ?.indexOf(searchValue?.toLowerCase()) > -1
                          ) {
                            return item;
                          }
                        })
                        ?.map((item) => renderItem(item))
                    : databaseOptions?.map((item) => renderItem(item))}
                </div>
              }
            >
              <Select
                showSearch
                optionFilterProp="title"
                style={{ width: 390 }}
                onSearch={(searchValue) => setSearchValue(searchValue)}
                placeholder={getPlaceholder()}
                disabled={!projectId}
                allowClear
                open={false}
              />
            </Popover>
          </Form.Item>
          <DeleteOutlined onClick={() => innerRemove(innerName)} />
        </Space>
      </Form.Item>
    </div>
  );
};
const InnerSelecter: React.FC<{
  innerFields: FormListFieldData[];
  outerName: number;
  projectId: number;
  databaseOptions: DatabaseOption[];
  innerRemove: (index: number | number[]) => void;
}> = ({ innerFields, outerName, projectId, databaseOptions, innerRemove }) => {
  const ref = useRef(null);
  const form = Form.useFormInstance();
  const orderedDatabaseIds = useWatch<number[][]>(['parameters', 'orderedDatabaseIds'], form);
  const currentOrderedDatabaseIds = useWatch<number[]>(
    ['parameters', 'orderedDatabaseIds', outerName],
    form,
  );

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
      form.setFieldValue(['parameters', 'orderedDatabaseIds'], newOrderedDatabaseIds);
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
          key={innerIndex}
          projectId={projectId}
          databaseOptions={databaseOptions}
          innerIndex={innerIndex}
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

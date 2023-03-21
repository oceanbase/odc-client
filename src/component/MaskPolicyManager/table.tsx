import { getMaskRuleList } from '@/common/network/manager';
import Action from '@/component/Action';
import HelpDoc from '@/component/helpDoc';
import { formatMessage } from '@/util/intl';
import { generateUniqKey } from '@/util/utils';
import { ExclamationCircleFilled, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { Button, Form, Popconfirm, Space, Table, Tooltip } from 'antd';
import { arrayMoveImmutable } from 'array-move';
import classnames from 'classnames';
import React, { RefObject, useEffect, useState } from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { EditableCell } from './editableCell';
import type { IApplyingRule } from './index';
import styles from './index.less';

export const DragHandle = SortableHandle(() => (
  <MenuOutlined
    style={{
      cursor: 'grab',
      color: 'var(--text-color-hint)',
    }}
  />
));

const SortableItem = SortableElement((props) => <tr {...props} />);
const SortableBody = SortableContainer((props) => <tbody {...props} id="editable_table" />);

interface IProps {
  ruleApplyings: IApplyingRule[];
  activeKey: string;
  isNameFinish: boolean;
  editingRowKeys: string[];
  editPopKey: string;
  formInstance: FormInstance<any>;
  wrapperRef: RefObject<any>;
  onChange: (values: IApplyingRule[]) => void;
  onEditRowChange: (key: string, isEditing: boolean) => void;
}

const EditableTable: React.FC<IProps> = (props) => {
  const {
    ruleApplyings,
    activeKey,
    isNameFinish,
    editingRowKeys,
    editPopKey,
    formInstance,
    wrapperRef,
    onChange,
    onEditRowChange,
  } = props;
  const [rules, setRules] = useState([]);
  const dataSource = ruleApplyings?.map(
    ({ key, rule: { name, id, enabled }, includes, excludes }) => ({
      key,
      name,
      id,
      enabled,
      includes: includes.join(','),
      excludes: excludes.join(','),
    }),
  );

  const onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(ruleApplyings.slice(), oldIndex, newIndex).filter(
        (el) => !!el,
      );

      onChange(newData);
    }
  };

  const DraggableContainer = (props) => (
    <SortableBody
      lockAxis="y"
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      helperContainer={() => wrapperRef.current}
      {...props}
    />
  );

  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    const index = dataSource?.findIndex((x) => x.key === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  const isEditing = (record) => {
    return editingRowKeys.includes(record.key);
  };

  const loadRules = async () => {
    const res = await getMaskRuleList();
    setRules(res?.contents ?? []);
  };

  const handleClose = (key: string) => {
    onEditRowChange(key, false);
    formInstance.setFieldsValue({
      [key]: null,
    });
  };

  const handleEdit = (record) => {
    formInstance.setFieldsValue({
      [record.key]: {
        ...record,
      },
    });
    onEditRowChange(record.key, true);
  };

  const handleAdd = () => {
    const key = generateUniqKey();
    const newData = [
      ...ruleApplyings,
      {
        key,
        rule: {
          name: '',
        },

        includes: [],
        excludes: [],
      },
    ];

    onChange(newData as IApplyingRule[]);
    onEditRowChange(key, true);
  };

  const handleRemove = (key) => {
    const newData = [...ruleApplyings];
    if (newData.length === 1) {
      return;
    }
    const targetIndex = newData.findIndex((item) => item.key === key);
    newData.splice(targetIndex, 1);
    onChange(newData);
  };

  const handleCancel = (record: IApplyingRule) => {
    const data = formInstance.getFieldValue(record.key);
    if (!data?.name) {
      onEditRowChange(record.key, false);
      handleRemove(record.key);
    } else {
      handleClose(record.key);
    }
  };

  const handleSave = async (value: IApplyingRule) => {
    try {
      const name = value.key;
      const data = formInstance.getFieldValue(name);
      const { id, excludes, includes } = data ?? {};
      if (!id) {
        formInstance.setFields([
          {
            name: [name, 'id'],
            errors: [
              formatMessage({
                id: 'odc.component.MaskPolicyManager.editableCell.SelectADesensitizationRule',
              }), //请选择脱敏规则
            ],
          },
        ]);
        return;
      }

      if (!includes) {
        formInstance.setFields([
          {
            name: [name, 'includes'],
            errors: [
              formatMessage({
                id: 'odc.component.MaskPolicyManager.editableCell.EnterAMatchingRule',
              }), //请输入匹配规则
            ],
          },
        ]);
        return;
      }

      const newData = [...ruleApplyings];
      const index = newData.findIndex((item) => value.key === item.key);
      const rule = rules.find((item) => item.id === id) ?? newData[index]?.rule;
      newData.splice(index, 1, {
        ...newData[index],
        rule,
        excludes: excludes?.split(',') ?? [],
        includes: includes?.split(',') ?? [],
      });

      onChange(newData);
      handleClose(value.key);
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const columns = [
    {
      title: formatMessage({
        id: 'odc.component.MaskPolicyManager.table.Sort',
      }), //排序
      width: 60,
      dataIndex: 'id',
      key: 'id',
      className: 'drag-visible',
      render: () => <DragHandle />,
    },

    {
      title: formatMessage({
        id: 'odc.component.MaskPolicyManager.table.DesensitizationRules',
      }), //脱敏规则
      dataIndex: 'name',
      width: 230,
      editable: true,
      render: (name, _) => {
        const disabled = _.enabled !== undefined && !_.enabled;
        return (
          <Space
            className={classnames({
              [styles.disabled]: disabled,
            })}
          >
            <span>{name}</span>
            {disabled ? (
              <Tooltip
                title={formatMessage({
                  id: 'odc.component.MaskPolicyManager.table.TheDesensitizationRuleIsDisabled',
                })} /*该脱敏规则已停用，匹配或排除的对象不会被处理*/
              >
                <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />
              </Tooltip>
            ) : null}
          </Space>
        );
      },
    },

    {
      title: (
        <HelpDoc leftText isTip doc="maskRuleInclude">
          {
            formatMessage({
              id: 'odc.component.MaskPolicyManager.table.MatchingRuleDatabaseNameTable',
            }) /*匹配规则 (库名.表名.字段名)*/
          }
        </HelpDoc>
      ),

      dataIndex: 'includes',
      editable: true,
      render: (includes, _) => {
        const disabled = _.enabled !== undefined && !_.enabled;
        return (
          <Space
            direction="vertical"
            size={4}
            className={classnames({
              [styles.disabled]: disabled,
            })}
          >
            <span className={styles['rule-desc']}>
              {
                formatMessage({
                  id: 'odc.component.MaskPolicyManager.table.Match',
                }) /*匹配:*/
              }
              {_.includes ?? '-'}
            </span>
            <span className={styles['rule-desc']}>
              {
                formatMessage({
                  id: 'odc.component.MaskPolicyManager.table.Exclude',
                }) /*排除:*/
              }
              {_.excludes ?? '-'}
            </span>
          </Space>
        );
      },
    },

    {
      title: formatMessage({
        id: 'odc.component.MaskPolicyManager.table.Operation',
      }), //操作
      dataIndex: 'action',
      width: 80,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Action.Group>
            {editPopKey === record.key ? (
              <Popconfirm
                visible={!!editPopKey}
                overlayStyle={{ width: '180px' }}
                title={formatMessage({
                  id: 'odc.component.MaskPolicyManager.table.ThereAreUneditedDesensitizationRules',
                })} /*存在未编辑完成的脱敏规则，是否确定修改？*/
                okText={formatMessage({
                  id: 'odc.component.MaskPolicyManager.table.Ok',
                })} /*确定*/
                cancelText={formatMessage({
                  id: 'odc.component.MaskPolicyManager.table.Cancel',
                })} /*取消*/
                onConfirm={(e) => {
                  e.stopPropagation();
                  handleSave(record);
                }}
                onCancel={async () => {
                  handleCancel(record);
                }}
              >
                <Action.Link>
                  {
                    formatMessage({
                      id: 'odc.component.MaskPolicyManager.table.Ok',
                    }) /*确定*/
                  }
                </Action.Link>
              </Popconfirm>
            ) : (
              <Action.Link
                onClick={async () => {
                  handleSave(record);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.component.MaskPolicyManager.table.Ok',
                  }) /*确定*/
                }
              </Action.Link>
            )}

            <Action.Link
              onClick={async () => {
                handleCancel(record);
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.MaskPolicyManager.table.Cancel',
                }) /*取消*/
              }
            </Action.Link>
          </Action.Group>
        ) : (
          <Action.Group>
            <Action.Link
              onClick={async () => {
                handleEdit(record);
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.MaskPolicyManager.table.Edit',
                }) /*编辑*/
              }
            </Action.Link>
            <Action.Link
              onClick={async () => {
                handleRemove(record.key);
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.MaskPolicyManager.table.Remove',
                }) /*移除*/
              }
            </Action.Link>
          </Action.Group>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        rules,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Form form={formInstance} component={false}>
      <Table
        rowKey="key"
        components={{
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow,
            cell: EditableCell,
          },
        }}
        dataSource={dataSource}
        // @ts-ignore
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={false}
        bordered
      />

      <Button
        type="dashed"
        disabled={!isNameFinish}
        onClick={() => handleAdd()}
        block
        icon={<PlusOutlined />}
      >
        {
          formatMessage({
            id: 'odc.component.MaskPolicyManager.table.AddDesensitizationRules',
          }) /*添加脱敏规则*/
        }
      </Button>
    </Form>
  );
};

export default EditableTable;

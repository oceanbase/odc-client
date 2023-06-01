import { Button, Dropdown, Space, Tooltip } from 'antd';
import React from 'react';
import styles from '../index.less';
import type { IOperationContent, IOperationOption, ITableLoadOptions } from '../interface';
import { IOperationOptionType } from '../interface';

interface IOperationItemProps {
  option: IOperationOption;
  onClick: (fn: (args?: ITableLoadOptions) => void) => void;
}
const OperationItem: React.FC<IOperationItemProps> = ({ option, onClick }) => {
  const { type, content, icon = null, isPrimary, overlay, disabled = false } = option;
  let operation = null;
  switch (type) {
    case IOperationOptionType.icon:
      operation = (
        <a
          onClick={() => {
            onClick(option?.onClick);
          }}
          className={styles.op}
        >
          {content}
        </a>
      );
      break;
    case IOperationOptionType.dropdown:
      operation = (
        <Dropdown trigger={['click']} disabled={disabled} overlay={overlay} placement="bottomRight">
          {content}
        </Dropdown>
      );
      break;
    default:
      operation = (
        <Button
          type={isPrimary ? 'primary' : 'default'}
          disabled={disabled}
          icon={icon}
          onClick={() => {
            onClick(option?.onClick);
          }}
        >
          {content}
        </Button>
      );
  }
  return operation;
};

interface IProps extends IOperationContent {
  onClick: (fn: (args?: ITableLoadOptions) => void) => void;
}

export const OperationContent: React.FC<IProps> = (props) => {
  const { options, onClick } = props;

  return (
    <Space className={styles.operationContent} size={16}>
      {options
        .filter(({ visible = true }) => visible)
        .map((item, i) => {
          const { tooltip = null, type, render } = item;
          return (
            <Tooltip title={tooltip} key={i}>
              {type === IOperationOptionType.custom ? (
                render?.()
              ) : (
                <OperationItem option={item} onClick={onClick} />
              )}
            </Tooltip>
          );
        })}
    </Space>
  );
};

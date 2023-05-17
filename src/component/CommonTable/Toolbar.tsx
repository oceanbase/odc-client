import { SyncOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { FilterContent, OperationContent, TitleContent } from './component';
import styles from './index.less';
import type {
  IFilterContent,
  IOperationContent,
  ITableLoadOptions,
  ITitleContent,
} from './interface';

interface IProps {
  loading: boolean;
  titleContent: ITitleContent;
  filterContent: IFilterContent;
  operationContent: IOperationContent;
  isSplit: boolean;
  params: ITableLoadOptions;
  enabledReload?: boolean;
  onFilterChange: (name: string, value: any) => void;
  onSearchChange: (value: string) => void;
  onTabChange: (value: string) => void;
  onReload: (args?: ITableLoadOptions) => void;
  onOperationClick: (fn: (args?: ITableLoadOptions) => void) => void;
}

export const Toolbar: React.FC<IProps> = (props) => {
  const {
    titleContent,
    filterContent,
    operationContent,
    isSplit,
    loading,
    params,
    enabledReload = true,
    onReload,
    onFilterChange,
    onSearchChange,
    onTabChange,
    onOperationClick,
  } = props;
  return (
    <Space className={classNames(styles.toolBar, 'odc-commontable-toolbar')}>
      {operationContent && <OperationContent {...operationContent} onClick={onOperationClick} />}
      {titleContent && <TitleContent {...titleContent} onTabChange={onTabChange} />}
      <Space split={isSplit ? '|' : null} size={16}>
        {filterContent && (
          <FilterContent
            {...filterContent}
            params={params}
            onFilterChange={onFilterChange}
            onSearchChange={onSearchChange}
          />
        )}
        {enabledReload && (
          <SyncOutlined
            className={styles.cursor}
            onClick={() => {
              onReload();
            }}
            spin={loading}
          />
        )}
      </Space>
    </Space>
  );
};

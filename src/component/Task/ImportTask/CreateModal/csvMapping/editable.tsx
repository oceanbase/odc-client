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

import { Popover, Table } from 'antd';
import React from 'react';

import { ColumnType, TableProps } from 'antd/es/table';
import classNames from 'classnames';
import styles from './editable.less';

interface IEditableColumn extends ColumnType<any> {
  editor?: (text: any, record: any, index: number) => React.ReactElement;
}

interface IEditableProps extends TableProps<any> {
  columns: IEditableColumn[];
}

class Editable extends React.Component<IEditableProps, any> {
  state = {
    selected: [],
  };

  initColumns = () => {
    const { columns } = this.props;
    function columnConvert(column) {
      return {
        ...column,
        ellipsis: true,
        children: column.children?.map((c) => {
          return columnConvert(c);
        }),
        render: (text, record, i) => {
          const originContent = column.render ? column.render(text, record, i) : text;
          if (column.editor) {
            return (
              <Popover
                overlayClassName={styles.popOver}
                trigger="click"
                getPopupContainer={(trigger) => {
                  return document.querySelector('.odc_csvmapping_archor');
                }}
                content={column.editor(text, record, i)}
              >
                <div
                  style={{
                    height: '100%',
                    position: 'relative',
                    cursor: 'pointer',
                    lineHeight: '24px',
                  }}
                >
                  {originContent}
                </div>
              </Popover>
            );
          } else {
            return originContent;
          }
        },
      };
    }
    return columns.map((column) => {
      return columnConvert(column);
    });
  };

  render() {
    const { columns, ...rest } = this.props;
    return (
      <Table
        bordered={true}
        className={classNames(styles.table, 'odc_csvmapping_archor')}
        rowClassName={(record, i) => (i % 2 === 0 ? styles.even : styles.odd)}
        columns={this.initColumns()}
        {...rest}
      />
    );
  }
}
export default Editable;

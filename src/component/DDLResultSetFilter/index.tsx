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

import { FilterOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, Popover } from 'antd';
import { Component } from 'react';
// @ts-ignore
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import styles from './index.less';
import { formatMessage } from '@/util/intl';

export default class DDLResultSetFilter extends Component<
  {
    filteredValues: string[];
    values: string[];
    onCancel: () => void;
    onSubmit: (selectedValues: string[]) => void;
  },
  {
    visible: boolean;
    filtered: boolean;
    searchKey: string;
    selectedValues: string[];
  }
> {
  public readonly state = {
    visible: false,
    filtered: false,
    searchKey: '',
    selectedValues: this.props.filteredValues || [],
  };

  public handleSearch = (searchKey: string) => {
    this.setState({ searchKey });
  };

  public handleSelectAll = () => {
    /**
     * 全选当前显示的选项
     */
    const values = this.getFilterValues();

    const newValues = new Set([].concat(values || []).concat(this.state.selectedValues || []));
    this.setState({
      selectedValues: Array.from(newValues),
    });
  };

  public handleDeselectAll = () => {
    /**
     * 剔除当前显示的选项
     */
    const values = this.getFilterValues();
    let filtermap = {};
    values?.forEach((v) => {
      filtermap[v] = true;
    });

    this.setState({
      selectedValues: this.state.selectedValues.filter((v) => {
        return !filtermap[v];
      }),
    });
  };

  public handleCheckboxChange = (selectedValues: CheckboxValueType[]) => {
    this.setState({
      selectedValues: selectedValues as string[],
    });
  };

  public handleVisibleChange = (visible: boolean) => {
    this.setState({ visible });
  };

  public handleCancel = () => {
    this.setState({
      visible: false,
      filtered: false,
      selectedValues: this.props.filteredValues || [],
    });
    this.props.onCancel();
  };

  public handleSubmit = () => {
    this.setState({
      visible: false,
      filtered: !!this.state.selectedValues.length,
    });
    this.props.onSubmit(this.state.selectedValues);
  };

  private getFilterValues = () => {
    const { values } = this.props;
    const { searchKey } = this.state;
    return (
      values.filter((v) => v && v.toString().toUpperCase().indexOf(searchKey.toUpperCase()) > -1) ||
      []
    );
  };

  public render() {
    const { selectedValues, visible, filtered } = this.state;
    const filteredColumns = this.getFilterValues();
    return (
      <Popover
        trigger="click"
        open={visible}
        onOpenChange={this.handleVisibleChange}
        content={
          <div className={styles.wrapper}>
            <Input.Search
              size="small"
              placeholder={formatMessage({
                id: 'workspace.window.table.datatab.placeholder',
                defaultMessage: '请输入',
              })}
              onChange={(e) => {
                this.handleSearch(e.target.value);
              }}
              onSearch={this.handleSearch}
            />

            <Checkbox.Group
              className={styles.columns}
              options={filteredColumns}
              value={selectedValues}
              onChange={this.handleCheckboxChange}
            />

            <div className={styles.footer}>
              <span>
                <span className={styles.select} onClick={this.handleSelectAll}>
                  {formatMessage({ id: 'app.button.selectAll', defaultMessage: '全选' })}
                </span>
                <span className={styles.deselect} onClick={this.handleDeselectAll}>
                  {formatMessage({ id: 'app.button.deselectAll', defaultMessage: '取消全选' })}
                </span>
              </span>
              <span>
                <Button size="small" style={{ marginRight: 8 }} onClick={this.handleCancel}>
                  {formatMessage({ id: 'app.button.cancel', defaultMessage: '取消' })}
                </Button>
                <Button size="small" type="primary" onClick={this.handleSubmit}>
                  {formatMessage({ id: 'app.button.ok', defaultMessage: '确定' })}
                </Button>
              </span>
            </div>
          </div>
        }
      >
        <FilterOutlined
          className={styles.filter}
          style={{
            color: filtered || visible ? '#1890ff' : '#bfbfbf',
          }}
        />
      </Popover>
    );
  }
}

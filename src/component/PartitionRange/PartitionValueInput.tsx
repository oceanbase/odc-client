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

import { formatMessage } from '@umijs/max';
import React from 'react';

import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';

// compatible

import { Form, Input, Tooltip } from 'antd';
// @ts-ignore
import styles from './PartitionValueInput.less';

interface PartitionValueInputProps {
  index: number;
  error?: {
    name: string;
    value: any;
  };

  selectColums: Array<any>;
  partitionType: string;
  value: any;
  style?: object;
  placeholder: string;
  handleEdit: any;
}

interface ToolTipInputProos {
  placeholder: string;
  value?: string;
  minWidth?: number;
  maxWdith?: number;
  style?: any;
  addonBefore?: any;
  onChange?: (e: any) => void;
}

class ToolTipInput extends React.PureComponent<ToolTipInputProos> {
  inputRef = React.createRef();

  state = {
    isShowTop: false,
  };

  timer = null;

  getTextOffsetWidth = (text) => {
    let tempDiv = document.getElementById('J_inputResizeTemp');
    if (!tempDiv) {
      const el = document.createElement('DIV');
      el.id = 'J_inputResizeTemp';
      el.style.cssText = 'position:absolute;top:-99999px;padding:0 11px;height:0';
      document.body.appendChild(el);
      tempDiv = el;
    }
    // @ts-ignore
    tempDiv.innerText = text;
    return tempDiv.offsetWidth;
  };

  getRangeWidth(width) {
    const { minWidth, maxWdith } = this.props;
    if (width < minWidth) {
      return minWidth;
    }
    if (width > maxWdith) {
      return maxWdith;
    }
    return width;
  }

  triggerTip = (el) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState({
        isShowTop: el.clientWidth + 2 < el.scrollWidth,
      });
    }, 300);
  };

  handleInputChange = (e) => {
    const { minWidth, maxWdith } = this.props;
    // @ts-ignore
    const inputEl = this.inputRef.current?.input;
    if (minWidth && maxWdith) {
      const textOffsetWidth = this.getTextOffsetWidth(e.target.value);
      const computedWidth = this.getRangeWidth(textOffsetWidth);
      inputEl.style.width = `${computedWidth + 2}px`;
    }
    this.triggerTip(inputEl);
    this.props.onChange(e);
  };

  render() {
    const { minWidth } = this.props;
    return (
      <Tooltip
        trigger="focus"
        visible={this.state.isShowTop}
        title={
          this.props.value ||
          formatMessage({
            id: 'odc.component.PartitionRange.PartitionValueInput.PleaseFillIn',
          })
        }
        placement="topLeft"
        arrowPointAtCenter
      >
        <Input
          {...this.props}
          // @ts-ignore
          ref={this.inputRef}
          className={styles.tooltipinput}
          style={minWidth ? { width: minWidth + 'px' } : {}}
          onChange={this.handleInputChange}
          onBlur={() => {
            this.setState({
              isShowTop: false,
            });
          }}
        />
      </Tooltip>
    );
  }
}

class PartitionValueInput extends React.PureComponent<PartitionValueInputProps> {
  handleInputChange = (e) => {
    const { handleEdit, index } = this.props;
    handleEdit(index, { value: e.target.value });
  };

  // value: {a: 1, b: 2, c: 3}
  handleRangeColumInputChange = (columnName, columnValue) => {
    const { selectColums, value, handleEdit, index } = this.props;
    const update = value || {};
    update[columnName] = columnValue;
    handleEdit(index, { value: { ...update } });
  };

  // value: [{a:1,b:2,c:3}, {a:1,b:2,c:3}]
  handleListColumInputChange = (valueIndex, columnName, columnValue) => {
    const { value, handleEdit, index } = this.props;
    const update = value || [];
    const updateItem = update[valueIndex] || {};
    updateItem[columnName] = columnValue;
    handleEdit(index, { value: [...update] });
  };

  handleAddColumValue = () => {
    const { value, handleEdit, index } = this.props;
    handleEdit(index, { value: [...value, {}] });
  };

  handleRemoveColumValue = (valueIndex) => {
    const { value = [], handleEdit, index } = this.props;
    value.splice(valueIndex, 1);
    handleEdit(index, { value: [...value] });
  };

  renderRangeColumInput = () => {
    const { selectColums, index, value, error = {} } = this.props;
    if (!selectColums.length) {
      return (
        <span className="empty-tip">
          {formatMessage({
            id: 'odc.component.PartitionRange.PartitionValueInput.SelectAFieldFirst',
          })}
        </span>
      );
    }

    return (
      <>
        {selectColums.map((col) => {
          const { columnName } = col;
          return (
            <Form.Item
              name={['partitions', index, 'value', columnName]}
              validateStatus={error[columnName] ? 'error' : null}
              className={styles.rangeColumFormItem}
              help={error[columnName]}
              key={`${columnName}-${index}`}
            >
              <ToolTipInput
                addonBefore={columnName}
                placeholder={formatMessage({
                  id: 'odc.component.PartitionRange.PartitionValueInput.PleaseFillIn',
                })}
              />
            </Form.Item>
          );
        })}
      </>
    );
  };

  renderListColumInput = () => {
    const { selectColums, value, index, error = [] } = this.props;
    const vauleList = value instanceof Array ? value : [];

    if (!selectColums.length) {
      return (
        <span className="empty-tip">
          {formatMessage({
            id: 'odc.component.PartitionRange.PartitionValueInput.SelectAFieldFirst',
          })}
        </span>
      );
    }
    return (
      <>
        {vauleList.map((value, i) => {
          return (
            <Form.Item
              validateStatus={error[i] ? 'error' : null}
              help={error[i]}
              className={styles.inputGroupWrap}
              key={`list-colum-${i}`}
            >
              <Input.Group compact>
                {selectColums.map((col) => {
                  const { columnName } = col;
                  return (
                    <ToolTipInput
                      minWidth={50}
                      maxWdith={170}
                      value={value[columnName]}
                      key={`${columnName}-list-input`}
                      placeholder={columnName}
                      onChange={(e) => {
                        this.handleListColumInputChange(i, columnName, e.target.value);
                      }}
                    />
                  );
                })}
              </Input.Group>
              {vauleList.length > 1 ? (
                <DeleteOutlined
                  className={styles.close}
                  style={{ lineHeight: '32px' }}
                  onClick={() => {
                    this.handleRemoveColumValue(i);
                  }}
                />
              ) : null}
            </Form.Item>
          );
        })}
        <PlusCircleOutlined
          className={styles.close}
          style={{ lineHeight: '32px', marginLeft: '-6px' }}
          onClick={this.handleAddColumValue}
        />
      </>
    );
  };

  render() {
    const { partitionType, value, placeholder, error, index } = this.props;
    if (partitionType === 'RANGE_COLUMNS') {
      return this.renderRangeColumInput();
    }

    if (partitionType === 'LIST_COLUMNS') {
      return this.renderListColumInput();
    }

    return (
      <Form.Item
        name={['partitions', index, 'value']}
        shouldUpdate
        validateStatus={error ? 'error' : null}
        help={error}
      >
        <Input style={{ flex: 1 }} placeholder={placeholder} />
      </Form.Item>
    );
  }
}

export default PartitionValueInput;

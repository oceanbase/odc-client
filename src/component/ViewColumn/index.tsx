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

import { PlusOutlined } from '@ant-design/icons';
import { FormattedMessage } from '@umijs/max';
import { Button } from 'antd';
import { Component } from 'react';
// @ts-ignore
import update from 'immutability-helper';
import DragableViewColumn from './DragableViewColumn';
import styles from './index.less';

let dragIdxGenerator = 1;

export interface IViewParam {
  paramName: string;
  dragIdx: number;
}

interface IProps {
  value?: IViewParam[];
  onChange?: (list: IViewParam[]) => void;
}

export default class ViewColumn extends Component<IProps> {
  public handleAdd = () => {
    const { value, onChange } = this.props;
    if (onChange && value) {
      onChange(
        [...value].concat({
          dragIdx: dragIdxGenerator++,
          paramName: '',
        }),
      );
    }
  };

  public handleDelete = (idx: number) => {
    const { value, onChange } = this.props;
    if (onChange && value) {
      value.splice(idx, 1);
      onChange(value);
    }
  };

  public handleEdit = (idx: number, rule: IViewParam) => {
    const { value, onChange } = this.props;
    if (value) {
      value.splice(idx, 1, {
        ...value[idx],
        ...rule,
      });
      if (onChange) {
        onChange(value);
      }
    }
  };

  public handleMove = (dragIndex: number, hoverIndex: number) => {
    const { value, onChange } = this.props;

    if (value) {
      const dragParam = value[dragIndex];
      if (onChange) {
        onChange(
          update(value, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragParam],
            ],
          }),
        );
      }
    }
  };

  public renderSingleRule = (rule: IViewParam, index: number) => {
    return (
      <DragableViewColumn
        key={rule.dragIdx || 0}
        id={rule.dragIdx || 0}
        index={index}
        rule={rule}
        handleDelete={this.handleDelete}
        handleEdit={this.handleEdit}
        handleMove={this.handleMove}
      />
    );
  };

  public render() {
    const { value } = this.props;

    return (
      <>
        <div className={styles.list}>{value && value.map(this.renderSingleRule)}</div>
        <Button icon={<PlusOutlined />} size="small" onClick={this.handleAdd}>
          <FormattedMessage id="workspace.window.createView.button.addColumn" />
        </Button>
      </>
    );
  }
}

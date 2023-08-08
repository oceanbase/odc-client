import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Component } from 'react';
import { FormattedMessage } from '@umijs/max';
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

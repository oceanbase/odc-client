import { FilterOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, Popover } from 'antd';
import { Component } from 'react';
import { formatMessage, FormattedMessage } from '@umijs/max';
// @ts-ignore
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import styles from './index.less';

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
                  <FormattedMessage id="app.button.selectAll" />
                </span>
                <span className={styles.deselect} onClick={this.handleDeselectAll}>
                  <FormattedMessage id="app.button.deselectAll" />
                </span>
              </span>
              <span>
                <Button size="small" style={{ marginRight: 8 }} onClick={this.handleCancel}>
                  <FormattedMessage id="app.button.cancel" />
                </Button>
                <Button size="small" type="primary" onClick={this.handleSubmit}>
                  <FormattedMessage id="app.button.ok" />
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

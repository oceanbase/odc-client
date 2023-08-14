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

import { Input } from 'antd';
import { PureComponent } from 'react';

interface IProps {
  editable?: boolean;
  placeholder?: string;
  hideArrow?: boolean;
  initValue?: string;
  onChange: (values: any) => void;
}

interface IState {
  editable: boolean;
  value: string;
}

export default class EditableText extends PureComponent<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      editable: this.props.editable || false,
      value: this.props.initValue,
    };
  }

  changeToEditable = () => {
    this.setState({
      editable: true,
    });
  };

  handleSubmit = () => {
    const { editable, value } = this.state;
    if (editable) {
      this.setState({
        editable: false,
      });
      this.props?.onChange(value);
    }
  };

  handleChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  render() {
    const { placeholder, hideArrow } = this.props;
    const { editable, value } = this.state;
    if (!editable) {
      if (hideArrow) {
        return <a onClick={this.changeToEditable}>{value || placeholder}</a>;
      } else {
        return <a onClick={this.changeToEditable}>&lt;{value || placeholder}&gt;</a>;
      }
    }
    return (
      <Input
        autoFocus={true}
        size="small"
        style={{ minWidth: '50px' }}
        placeholder={placeholder}
        onBlur={this.handleSubmit}
        onPressEnter={this.handleSubmit}
        onChange={this.handleChange}
        value={value}
      />
    );
  }
}

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
import React, { useEffect, useState } from 'react';

interface IProps {
  editable?: boolean;
  placeholder?: string;
  hideArrow?: boolean;
  initValue?: string;
  onChange: (values: any) => void;
}

const EditableText: React.FC<IProps> = React.memo((props) => {
  const [state, setState] = useState({ editable: props.editable || false, value: props.initValue });

  const changeToEditable = () => {
    setState({
      ...state,
      editable: true,
    });
  };

  const handleSubmit = () => {
    const { editable, value } = state;
    if (editable) {
      setState({
        ...state,
        editable: false,
      });
      props?.onChange(value);
    }
  };

  const handleChange = (e) => {
    setState({
      ...state,
      value: e.target.value,
    });
  };

  if (!state.editable) {
    if (props.hideArrow) {
      return <a onClick={changeToEditable}>{state.value || props.placeholder}</a>;
    } else {
      return <a onClick={changeToEditable}>&lt;{state.value || props.placeholder}&gt;</a>;
    }
  }
  return (
    <Input
      autoFocus={true}
      size="small"
      style={{ minWidth: '50px' }}
      placeholder={props.placeholder}
      onBlur={handleSubmit}
      onPressEnter={handleSubmit}
      onChange={handleChange}
      value={state.value}
    />
  );
});

export default EditableText;

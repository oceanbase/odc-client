/*
 * Copyright 2024 OceanBase
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

import { Dropdown } from 'antd';
import { DropDownProps } from 'antd/lib/dropdown';
import React from 'react';
import HeaderBtn from '../HeaderBtn';

interface IProps {
  overlay: React.ReactElement;
  placement?: DropDownProps['placement'];
  className?: string;
}

class DropdownMenu extends React.PureComponent<IProps> {
  public menuRef: React.RefObject<HTMLSpanElement> = React.createRef();

  render() {
    const { overlay, children, className } = this.props;
    return (
      <Dropdown overlay={overlay} getPopupContainer={() => this.menuRef?.current}>
        <HeaderBtn ref={this.menuRef} className={className}>
          {children}
        </HeaderBtn>
      </Dropdown>
    );
  }
}

export default DropdownMenu;

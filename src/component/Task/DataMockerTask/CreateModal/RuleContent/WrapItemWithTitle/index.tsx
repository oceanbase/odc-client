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

import { SelectProps } from 'antd/es/select';
import React from 'react';

import styles from './index.less';

interface ISelectWithTitleProps extends SelectProps<any> {
  addonBefore: string;
}

const WrapItemWithTitle: React.FC<ISelectWithTitleProps> = (props) => {
  const { addonBefore, children, ...rest } = props;
  let item;
  if (React.isValidElement(children)) {
    item = React.cloneElement(children, {
      className: styles.inputItem,
      ...rest,
      ...children.props,
    });
  }
  return (
    <span className={styles.selecWithTitle}>
      <span className={styles.addonBefore}>{addonBefore}</span>
      {item}
    </span>
  );
};
export default WrapItemWithTitle;

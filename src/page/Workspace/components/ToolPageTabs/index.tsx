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

/**
 * 任意对象详情页的tabs组件，主要包含了ODC的统一定制样式
 */
import { Tabs } from 'antd';
import React from 'react';
import styles from './index.less';

interface IProps {
  activeKey: string;
  onChange: () => void;
}

const ToolPageTabs: React.FC<IProps> = (props) => {
  const { activeKey, onChange } = props;
  return (
    <Tabs activeKey={activeKey} tabPosition="left" className={styles.propsTab} onChange={onChange}>
      {props.children}
    </Tabs>
  );
};

export default ToolPageTabs;

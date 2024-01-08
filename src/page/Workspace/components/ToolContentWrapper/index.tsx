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
 * 任意对象详情页 Toolbar区块下面的容器组件，主要包含了高度计算样式
 */
import React from 'react';

const ToolContentWrapper: React.FC<{}> = (props) => {
  return <div style={{ height: `calc(100% - 38px)`, position: 'relative' }}>{props.children}</div>;
};

export default ToolContentWrapper;

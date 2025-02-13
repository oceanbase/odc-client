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

import { formatMessage } from '@/util/intl';
import React from 'react';

interface IProps {}
const SqlWorkspace: React.FC<IProps> = () => {
  return (
    <h2>
      {
        formatMessage({
          id: 'odc.page.SqlWorkspace.SqlWorkbench',
          defaultMessage: 'SQL 工作台',
        }) /*SQL 工作台*/
      }
    </h2>
  );
};

export default SqlWorkspace;

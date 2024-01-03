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

import { formatMessage } from '@/util/intl';
import { Select, SelectProps } from 'antd';
export default function ProjectSelect({ value, onChange, options, ...rest }: SelectProps) {
  value = value || -999;
  options = []
    .concat([
      {
        label: formatMessage({
          id:
            'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.ProjectItem.NonBindingProject',
        }), //'不绑定项目'
        value: -999,
      },
    ])
    .concat(options || []);
  function _onChange(v, option) {
    if (v === -999) {
      onChange(null, option);
    } else {
      onChange(v, option);
    }
  }
  return <Select value={value} onChange={_onChange} options={options} {...rest} />;
}

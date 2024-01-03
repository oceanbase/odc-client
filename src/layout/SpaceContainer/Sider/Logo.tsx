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
import Icon from '@ant-design/icons';

import { ReactComponent as ODCColorSvg } from '@/svgr/odc_logo_color.svg';

export default function ({ collapsed }) {
  if (collapsed) {
    return (
      <Icon style={{ fontSize: 16, marginBottom: 12, marginLeft: 5 }} component={ODCColorSvg} />
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
        marginBottom: 12,
        color: 'var(--text-color-primary)',
      }}
    >
      <Icon style={{ fontSize: 27 }} component={ODCColorSvg} />
      <div
        style={{
          wordBreak: 'break-word',
          marginLeft: 10,
          fontSize: 14,
          fontFamily: 'DIN-Bold, Alibaba-puhui-title, PingFangSC-Medium, Microsoft YaHei',
        }}
      >
        OceanBase
        <br />
        {
          formatMessage({
            id: 'odc.Index.Sider.Logo.DeveloperCenter',
          }) /*开发者中心*/
        }
      </div>
    </div>
  );
}

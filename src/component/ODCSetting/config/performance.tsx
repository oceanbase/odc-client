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
import { IODCSetting, ODCSettingGroup } from '../config';
import TextAreaItem from '../Item/TextItem';

const performanceGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.353C6B46' }), //'性能'
  key: 'performance',
};
const performanceDefaultGroup: ODCSettingGroup = {
  label: '',
  key: 'performanceDefault',
};

const restartTip = formatMessage({ id: 'src.component.ODCSetting.config.1ACE7366' }); //'修改此参数，将在 ODC 重启后生效'

const performanceSettings: IODCSetting[] = [
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.15368609' }), //'Jvm 参数'
    key: 'client.jvm.params',
    tip: restartTip,
    group: performanceGroup,
    secondGroup: performanceDefaultGroup,
    storeType: 'local',
    span: 24,
    render: (value, onChange) => {
      return <TextAreaItem value={value} onChange={onChange} />;
    },
  },
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.74959AFE' }), //'ODC 参数'
    key: 'client.start.params',
    tip: restartTip,
    group: performanceGroup,
    secondGroup: performanceDefaultGroup,
    storeType: 'local',
    span: 24,
    render: (value, onChange) => {
      return <TextAreaItem value={value} onChange={onChange} />;
    },
  },
];

export default performanceSettings;

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

import KeymapInput from '@/component/Input/Keymap';
import { validForEditorKeymap } from '@/component/Input/Keymap/helper';
import { formatMessage } from '@/util/intl';
import { IODCSetting, ODCSettingGroup } from '../../config';
import RadioItem from '../../Item/RadioItem';
import SelectItem from '../../Item/SelectItem';

const editorGroup: ODCSettingGroup = {
  label: formatMessage({
    id: 'src.component.ODCSetting.config.239D3F16',
    defaultMessage: '编辑器',
  }), //'编辑器'
  key: 'editor',
};
const editorPreferenceGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.FCD07871', defaultMessage: '样式' }), //'样式'
  key: 'editorPreference',
};
const editorKeymapGroup: ODCSettingGroup = {
  label: formatMessage({
    id: 'src.component.ODCSetting.config.0D4063E6',
    defaultMessage: '快捷键',
  }), //'快捷键'
  key: 'editorKeymap',
};

const editorSettings: IODCSetting[] = [
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.DD62F7C6',
      defaultMessage: '主题',
    }), //'主题'
    key: 'odc.editor.style.theme',
    group: editorGroup,
    secondGroup: editorPreferenceGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <SelectItem
          options={[
            {
              label: 'OceanBase',
              value: 'OceanBase',
            },
            {
              label: 'VSCode',
              value: 'VSCode',
            },
            {
              label: 'VSCode-HC',
              value: 'VSCode-HC',
            },
            {
              label: 'GitHub',
              value: 'GitHub',
            },
            {
              label: 'Monokai',
              value: 'Monokai',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.D9835833',
      defaultMessage: '字体',
    }), //'字体'
    key: 'odc.editor.style.fontSize',
    group: editorGroup,
    secondGroup: editorPreferenceGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.D6D77D8C',
                defaultMessage: '小',
              }), //'小'
              value: 'Small',
            },
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.80241964',
                defaultMessage: '正常',
              }), //'正常'
              value: 'Normal',
            },
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.6D389EE6',
                defaultMessage: '大',
              }), //'大'
              value: 'Large',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.88E11A59',
      defaultMessage: '运行 SQL',
    }), //'运行 SQL'
    key: 'odc.editor.shortcut.executeStatement',
    group: editorGroup,
    secondGroup: editorKeymapGroup,
    storeType: 'server',
    rules: [
      {
        validator(rule, value, callback) {
          return validForEditorKeymap(value);
        },
      },
    ],

    render: (value, onChange) => {
      return <KeymapInput value={value} onChange={onChange} />;
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.663436E6',
      defaultMessage: '运行所选 SQL',
    }), //'运行所选 SQL'
    key: 'odc.editor.shortcut.executeCurrentStatement',
    group: editorGroup,
    secondGroup: editorKeymapGroup,
    rules: [
      {
        validator(rule, value, callback) {
          return validForEditorKeymap(value);
        },
      },
    ],

    storeType: 'server',
    render: (value, onChange) => {
      return <KeymapInput value={value} onChange={onChange} />;
    },
  },
];

export default editorSettings;

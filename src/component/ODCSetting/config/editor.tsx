import RadioItem from '../Item/RadioItem';
import { IODCSetting, ODCSettingGroup } from '../config';
import InputItem from '../Item/InputItem';
import KeymapInput from '@/component/Input/Keymap';

const editorGroup: ODCSettingGroup = {
  label: '编辑器',
  key: 'editor',
};
const editorPreferenceGroup: ODCSettingGroup = {
  label: '样式',
  key: 'editorPreference',
};
const editorKeymapGroup: ODCSettingGroup = {
  label: '快捷键',
  key: 'editorKeymap',
};

const editorSettings: IODCSetting[] = [
  {
    label: '主题',
    key: 'odc.editor.style.theme',
    group: editorGroup,
    secondGroup: editorPreferenceGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: 'OceanBase',
              value: 'OceanBase',
            },
            {
              label: 'VSCode',
              value: 'VSCode',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: '字体',
    key: 'odc.editor.style.fontSize',
    group: editorGroup,
    secondGroup: editorPreferenceGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: '小',
              value: 'Small',
            },
            {
              label: '正常',
              value: 'Normal',
            },
            {
              label: '大',
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
    label: '运行 SQL',
    key: 'odc.editor.shortcut.executeStatement',
    group: editorGroup,
    secondGroup: editorKeymapGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return <KeymapInput value={value} onChange={onChange} />;
    },
  },
  {
    label: '运行所选 SQL',
    key: 'odc.editor.shortcut.executeCurrentStatement',
    group: editorGroup,
    secondGroup: editorKeymapGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return <KeymapInput value={value} onChange={onChange} />;
    },
  },
];

export default editorSettings;

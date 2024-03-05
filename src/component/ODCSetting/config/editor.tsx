import { formatMessage } from '@/util/intl';
import RadioItem from '../Item/RadioItem';
import { IODCSetting, ODCSettingGroup } from '../config';
import InputItem from '../Item/InputItem';
import KeymapInput from '@/component/Input/Keymap';
import SelectItem from '../Item/SelectItem';

const editorGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.239D3F16' }), //'编辑器'
  key: 'editor',
};
const editorPreferenceGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.FCD07871' }), //'样式'
  key: 'editorPreference',
};
const editorKeymapGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.0D4063E6' }), //'快捷键'
  key: 'editorKeymap',
};

const editorSettings: IODCSetting[] = [
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.DD62F7C6' }), //'主题'
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
    label: formatMessage({ id: 'src.component.ODCSetting.config.D9835833' }), //'字体'
    key: 'odc.editor.style.fontSize',
    group: editorGroup,
    secondGroup: editorPreferenceGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.D6D77D8C' }), //'小'
              value: 'Small',
            },
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.80241964' }), //'正常'
              value: 'Normal',
            },
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.6D389EE6' }), //'大'
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
    label: formatMessage({ id: 'src.component.ODCSetting.config.88E11A59' }), //'运行 SQL'
    key: 'odc.editor.shortcut.executeStatement',
    group: editorGroup,
    secondGroup: editorKeymapGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return <KeymapInput value={value} onChange={onChange} />;
    },
  },
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.663436E6' }), //'运行所选 SQL'
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

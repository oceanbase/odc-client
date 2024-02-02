import RadioItem from '../Item/RadioItem';
import { IODCSetting, ODCSettingGroup } from '../config';
import { EThemeConfigKey } from '@/store/setting';
import { localeList } from '@/constant';

const preferenceGroup: ODCSettingGroup = {
  label: '外观',
  key: 'preference',
};
const preferenceDefaultGroup: ODCSettingGroup = {
  label: '',
  key: 'preferenceDefault',
};

const perferenceSettings: IODCSetting[] = [
  {
    label: '主题',
    key: 'theme',
    group: preferenceGroup,
    secondGroup: preferenceDefaultGroup,
    storeType: 'server',
    span: 24,
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: 'White',
              value: EThemeConfigKey.ODC_WHITE,
            },
            {
              label: 'Dark',
              value: EThemeConfigKey.ODC_DARK,
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: '语言',
    key: 'language',
    group: preferenceGroup,
    secondGroup: preferenceDefaultGroup,
    storeType: 'server',
    span: 24,
    render: (value, onChange) => {
      return <RadioItem options={localeList} value={value} onChange={onChange} />;
    },
  },
];

export default perferenceSettings;

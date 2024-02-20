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
    key: 'appearance.scheme',
    group: preferenceGroup,
    secondGroup: preferenceDefaultGroup,
    storeType: 'server',
    span: 24,
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: (
                <img
                  style={{ width: 170, height: 100 }}
                  src={window.publicPath + `img/theme-white.png`}
                />
              ),
              value: EThemeConfigKey.ODC_WHITE,
            },
            {
              label: (
                <img
                  style={{ width: 170, height: 100 }}
                  src={window.publicPath + `img/theme-dark.png`}
                />
              ),
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
    key: 'appearance.language',
    group: preferenceGroup,
    secondGroup: preferenceDefaultGroup,
    storeType: 'server',
    span: 24,
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: '当前系统语言',
              value: 'auto',
            },
          ].concat(localeList)}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
];

export default perferenceSettings;

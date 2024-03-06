import { formatMessage } from '@/util/intl';
import RadioItem from '../Item/RadioItem';
import { IODCSetting, ODCSettingGroup } from '../config';
import { SpaceType } from '@/d.ts/_index';

const accountGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.01FFDFB6' }), //'账号'
  key: 'account',
};
const accountSpaceGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.2D3DF155' }), //'空间'
  key: 'accountSpace',
};
const accountPrivacyGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.CE327E25' }), //'隐私'
  key: 'accountPrivacy',
};

const accountSettings: IODCSetting[] = [
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.099F3C40' }), //'默认空间'
    key: 'odc.account.defaultOrganizationType',
    group: accountGroup,
    secondGroup: accountSpaceGroup,
    storeType: 'server',
    disabledInClient: true,
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.A846B841' }), //'团队空间'
              value: SpaceType.SYNERGY,
            },
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.5C426BEE' }), //'个人空间'
              value: SpaceType.PRIVATE,
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.7925A54D' }), //'用户行为分析'
    key: 'odc.account.userBehaviorAnalysisEnabled',
    group: accountGroup,
    secondGroup: accountSpaceGroup,
    disabledInClient: true,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.E78E7A5E' }), //'开启'
              value: 'true',
            },
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.BE020520' }), //'关闭'
              value: 'false',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
];

export default accountSettings;

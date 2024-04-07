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

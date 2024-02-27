import { IODCSetting, ODCSettingGroup } from '../config';
import TextAreaItem from '../Item/TextItem';

const performanceGroup: ODCSettingGroup = {
  label: '性能',
  key: 'performance',
};
const performanceDefaultGroup: ODCSettingGroup = {
  label: '',
  key: 'performanceDefault',
};

const restartTip = '修改此参数，将在 ODC 重启后生效';

const performanceSettings: IODCSetting[] = [
  {
    label: 'Jvm 参数',
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
    label: 'ODC 参数',
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

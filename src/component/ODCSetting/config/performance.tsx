import { IODCSetting, ODCSettingGroup } from '../config';
import TextAreaItem from '../Item/TextItem';

const performanceGroup: ODCSettingGroup = {
  label: '性能',
  key: 'performance',
};
const performanceDefaultGroup: ODCSettingGroup = {
  label: '性能',
  key: 'performanceDefault',
};

const performanceSettings: IODCSetting[] = [
  {
    label: 'Jvm 参数',
    key: 'jvmParams',
    group: performanceGroup,
    secondGroup: performanceDefaultGroup,
    storeType: 'server',
    span: 24,
    render: (value, onChange) => {
      return <TextAreaItem value={value} onChange={onChange} />;
    },
  },
  {
    label: 'ODC 参数',
    key: 'odcParams',
    group: performanceGroup,
    secondGroup: performanceDefaultGroup,
    storeType: 'server',
    span: 24,
    render: (value, onChange) => {
      return <TextAreaItem value={value} onChange={onChange} />;
    },
  },
];

export default performanceSettings;

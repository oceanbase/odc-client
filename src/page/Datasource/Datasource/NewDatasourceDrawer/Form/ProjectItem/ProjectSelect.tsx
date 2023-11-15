import { Select, SelectProps } from 'antd';

export default function ProjectSelect({ value, onChange, options, ...rest }: SelectProps) {
  value = value || -999;
  options = []
    .concat([
      {
        label: '不绑定项目',
        value: -999,
      },
    ])
    .concat(options || []);
  function _onChange(v, option) {
    if (v === -999) {
      onChange(null, option);
    } else {
      onChange(v, option);
    }
  }
  return <Select value={value} onChange={_onChange} options={options} {...rest} />;
}

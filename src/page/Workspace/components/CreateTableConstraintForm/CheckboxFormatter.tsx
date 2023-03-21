import { Checkbox } from 'antd';

export default (props) => {
  const { row, onRowChange } = props;
  const { _created, enable } = row;
  return (
    <Checkbox
      disabled={!_created}
      checked={!!enable}
      tabIndex={-1}
      onChange={() => {
        onRowChange({
          ...row,
          enable: !enable,
        });
      }}
    />
  );
};

export const ReadonlyCheckBoxFormatter = (props) => {
  const { row, onRowChange } = props;
  const { enable } = row;
  return (
    <Checkbox
      disabled={true}
      checked={!!enable}
      tabIndex={-1}
      onChange={() => {
        onRowChange({
          ...row,
          enable: !enable,
        });
      }}
    />
  );
};

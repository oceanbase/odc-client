import { Checkbox } from 'antd';

export default (props) => {
  const { row, onRowChange } = props;
  const { _created, unique } = row;
  return (
    <Checkbox
      disabled={!_created}
      checked={!!unique}
      tabIndex={-1}
      onChange={() => {
        onRowChange({
          ...row,
          unique: !unique,
        });
      }}
    />
  );
};

import { isSupportAutoIncrement } from '@/util/utils';
import { Checkbox } from 'antd';

export default function WrapCheckboxFormatetr(key: string, isDisabled?: (row) => boolean) {
  return (props) => {
    const { row, onRowChange } = props;
    const value = row[key];
    return (
      <Checkbox
        checked={value}
        onKeyDown={(e) => console.log(e)}
        disabled={isDisabled?.(row)}
        tabIndex={-1}
        onChange={() => {
          onRowChange({
            ...row,
            [key]: !value,
          });
        }}
      />
    );
  };
}

export function WrapReverseCheckboxFormatetr(key: string, isDisabled?: (row) => boolean) {
  return (props) => {
    const { row, onRowChange } = props;
    const value = row[key];
    return (
      <Checkbox
        checked={!value}
        onKeyDown={(e) => console.log(e)}
        disabled={isDisabled?.(row)}
        tabIndex={-1}
        onChange={() => {
          onRowChange({
            ...row,
            [key]: !value,
          });
        }}
      />
    );
  };
}

export function WrapOracleCheckboxFormatetr(editable: boolean) {
  return (props) => {
    const { row, onRowChange } = props;
    const { autoIncreament, dataType } = row;
    return (
      <Checkbox
        tabIndex={-1}
        disabled={!editable || !isSupportAutoIncrement(dataType)}
        checked={!!autoIncreament}
        onChange={() => {
          onRowChange({
            ...row,
            autoIncreament: !autoIncreament,
          });
        }}
      />
    );
  };
}
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

export const CheckBoxFormatter = (props) => {
  const { row, onRowChange } = props;
  const { enable } = row;
  return (
    <Checkbox
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

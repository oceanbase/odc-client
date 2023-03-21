import { isSupportAutoIncrement } from '@/util/utils';
import { Checkbox } from 'antd';

export default function WrapCheckboxFormatetr(editable: boolean, enablePrimaryKeyEditor: boolean) {
  return (props) => {
    const { row, onRowChange } = props;
    const { initialValue, allowNull, primaryKey } = row;
    return (
      <Checkbox
        disabled={!editable || (primaryKey && enablePrimaryKeyEditor) || initialValue?.allowNull}
        checked={!allowNull}
        tabIndex={-1}
        onChange={() => {
          onRowChange({
            ...row,
            allowNull: !allowNull,
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

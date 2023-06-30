import { ConnectionMode } from '@/d.ts';
import { TableConstraintDefer } from '@/d.ts/table';
import { formatMessage } from '@/util/intl';
import { useMemo } from 'react';
import { WrapSelectEditor } from '../../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../../EditableTable/Editors/TextEditor';
import { useTableConfig } from '../config';
import { ReadonlyCheckBoxFormatter } from '../RdgFomatter/CheckboxFormatter';
import WrapValueFormatter from '../RdgFomatter/ValueFormatter';

export function useDeferColumn(mode: ConnectionMode) {
  const deferOptions = {
    [TableConstraintDefer.NOT]: formatMessage({
      id: 'odc.CreateTable.TableConstraint.baseColumn.NonDelayed',
    }), //不可延迟
    [TableConstraintDefer.DEFERRABLE_DEFER]: formatMessage({
      id: 'odc.CreateTable.TableConstraint.baseColumn.DelayedVerification',
    }), //延迟验证
    [TableConstraintDefer.DEFERRABLE_IMMEDIATE]: formatMessage({
      id: 'odc.CreateTable.TableConstraint.baseColumn.VerifyNow',
    }), //立即验证
  };
  const config = useTableConfig(mode);
  const methodSelect = useMemo(() => {
    return WrapSelectEditor(
      Object.entries(deferOptions).map(([key, text]) => {
        return {
          text,
          value: key,
        };
      }),
      false,
    );
  }, []);
  const deferFormatter = useMemo(() => {
    return WrapValueFormatter((row) => {
      return deferOptions[row['defer']];
    });
  }, []);
  if (!config.constraintDeferConfigurable) {
    return null;
  }
  return {
    key: 'defer',
    name: formatMessage({
      id: 'odc.CreateTable.TableConstraint.baseColumn.DelayedState',
    }), //可延迟状态
    resizable: true,
    filterable: false,
    editor: methodSelect,
    editable: true,
    width: 150,
    formatter: deferFormatter,
  };
}

export function useEnableColumn(mode: ConnectionMode) {
  const config = useTableConfig(mode);
  if (!config.constraintEnableConfigurable) {
    return null;
  }
  return {
    key: 'enable',
    name: formatMessage({
      id: 'odc.CreateTable.TableConstraint.baseColumn.WhetherToEnable',
    }), //是否启用
    resizable: true,
    editable: false,
    filterable: false,
    width: 100,
    editor: TextEditor,
    formatter: ReadonlyCheckBoxFormatter,
  };
}

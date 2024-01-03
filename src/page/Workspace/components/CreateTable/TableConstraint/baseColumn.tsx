/*
 * Copyright 2024 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ConnectionMode } from '@/d.ts';
import { TableConstraintDefer } from '@/d.ts/table';
import { formatMessage } from '@/util/intl';
import { useMemo } from 'react';
import { WrapSelectEditor } from '../../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../../EditableTable/Editors/TextEditor';
import { useTableConfig } from '../config';
import { CheckBoxFormatter, ReadonlyCheckBoxFormatter } from '../RdgFomatter/CheckboxFormatter';
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

export function useEnableColumnForeign(mode: ConnectionMode) {
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
    formatter: CheckBoxFormatter,
  };
}

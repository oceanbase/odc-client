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

import { IProcedure } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { PureComponent } from 'react';
import styles from './index.less';

interface IProps {
  model: Partial<IProcedure>;
}

class ShowProcedureBaseInfoForm extends PureComponent<IProps> {
  public render() {
    const { model } = this.props;

    return (
      <div className={styles.box}>
        {[
          [
            formatMessage({
              id: 'workspace.window.createProcedure.proName',
              defaultMessage: '存储过程名称',
            }),
            model.proName,
          ],
          [
            formatMessage({ id: 'workspace.window.createView.definer', defaultMessage: '创建人' }),
            model.definer,
          ],
          [
            formatMessage({
              id: 'workspace.window.database.createTime',
              defaultMessage: '创建时间',
            }),
            getLocalFormatDateTime(model.createTime),
          ],

          [
            formatMessage({
              id: 'workspace.window.createProcedure.modifyTime',
              defaultMessage: '最近修改时间',
            }),
            getLocalFormatDateTime(model.modifyTime),
          ],
        ].map(([label, content]) => {
          return (
            <div className={styles.line}>
              <span className={styles.title}>{label}:</span>
              <span className={styles.content}>{content}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

// @ts-ignore
export default ShowProcedureBaseInfoForm;

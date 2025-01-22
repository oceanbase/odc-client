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

import { tableModify } from '@/common/network/table';
import { formatMessage } from '@/util/intl';
import { message } from 'antd';

export const handleExecuteTableDMLV2 = async (sql: string, tableName: string) => {
  try {
    const isSuccess = await tableModify(sql, tableName);
    if (isSuccess) {
      message.success(
        formatMessage({ id: 'portal.connection.form.save.success', defaultMessage: '保存成功' }),
      );
      return true;
    }
  } catch (e) {
    //
  } finally {
  }
};

import { tableModify } from '@/common/network/table';
import { formatMessage } from '@/util/intl';
import { message } from 'antd';

export const handleExecuteTableDMLV2 = async (sql: string, tableName: string) => {
  try {
    const isSuccess = await tableModify(sql, tableName);
    if (isSuccess) {
      message.success(formatMessage({ id: 'portal.connection.form.save.success' }));
      return true;
    }
  } catch (e) {
    //
  } finally {
  }
};

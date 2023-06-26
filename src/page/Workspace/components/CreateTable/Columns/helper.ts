import { ConnectionMode } from '@/d.ts';
import { dataTypesIns } from '@/util/dataType';

export function getTypeByColumnName(columnName: string, dialectType) {
  if (!columnName) {
    return null;
  }
  const matchArr = [
    {
      type: dialectType === ConnectionMode.OB_MYSQL ? 'int' : 'NUMBER',
      regexp: /id$/i,
    },
    {
      type: dialectType === ConnectionMode.OB_MYSQL ? 'varchar' : 'VARCHAR',
      regexp: /name/i,
    },
    {
      type: dialectType === ConnectionMode.OB_MYSQL ? 'datetime' : 'DATE',
      regexp: /date/i,
    },
    {
      type: dialectType === ConnectionMode.OB_MYSQL ? 'timestamp' : 'TIMESTAMP',
      regexp: /time/i,
    },
    {
      type: dialectType === ConnectionMode.OB_MYSQL ? 'varchar' : 'VARCHAR',
      regexp: /.*/i,
    },
  ];
  for (let item of matchArr) {
    if (item.regexp.test(columnName)) {
      return { type: dataTypesIns.getDataType(dialectType, item.type), name: item.type };
    }
  }
  return null;
}

export function useColumns() {
  const a = [
    {
      key: 'refreshId',
      name: 'REFRESH_ID',
      width: 120,
      columnType: 'INT',
    },
    {
      key: 'refreshMethod',
      name: 'REFRESH_METHOD',
      width: 180,
      columnType: 'char',
    },
    {
      key: 'startTime',
      name: 'START_TIME',
      width: 180,
      columnType: 'char',
    },
    {
      key: 'endTime',
      name: 'END_TIME',
      width: 180,
      columnType: 'char',
    },
    {
      key: 'elapsedTime',
      name: 'ELAPSED_TIME',
      width: 180,
      columnType: 'INT',
    },
    {
      key: 'logPurgeTime',
      name: 'LOG_PURGE_TIME',
      width: 180,
      columnType: 'INT',
    },
    {
      key: 'initialNumRows',
      name: 'INITIAL_NUM_ROWS',
      width: 180,
      columnType: 'INT',
    },
    {
      key: 'finalNumRows',
      name: 'FINAL_NUM_ROWS',
      width: 180,
      columnType: 'INT',
    },
  ];
  return a.map((item, index) => ({
    ...item,
    columnName: item.name,
    columnIndex: index,
    readonly: true,
  }));
}

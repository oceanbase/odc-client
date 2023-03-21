export function getDefaultCollation(character: string, collations) {
  return (
    collations?.find((collation) => {
      const _character = character || 'utf8mb4';
      return collation.indexOf(_character) > -1;
    }) || 'utf8mb4_general_ci'
  );
}

export function removeGridParams(rows: any[]) {
  return rows.map((row) => Object.assign({}, row, { _originRow: null, key: null }));
}

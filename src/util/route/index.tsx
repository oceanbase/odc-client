export function gotoSQLWorkspace(projectId?: number, datasourceId?: number, databaseId?: number) {
  window.open(
    location.origin +
      location.pathname +
      `#/sqlworkspace?projectId=${projectId || ''}&datasourceId=${datasourceId || ''}&databaseId=${
        databaseId || ''
      }`,
    'sqlworkspace',
  );
}

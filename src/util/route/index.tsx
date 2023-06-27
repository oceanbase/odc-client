export function gotoSQLWorkspace(projectId?: number, dataSourceId?: number, databaseId?: number) {
  window.open(
    location.origin +
      `#/sqlworkspace?projectId=${projectId}&dataSourceId=${dataSourceId}&databaseId=${databaseId}`,
    'sqlworkspace',
  );
}

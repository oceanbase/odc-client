export default function (value: string | null) {
  if (value === null) {
    return 'NULL';
  } else if (typeof value === 'undefined') {
    return 'DEFAULT';
  }
  return `to_timestamp_tz('${value}', 'YYYY-MM-DD HH24:MI:SS.FF TZH:TZM')`;
}

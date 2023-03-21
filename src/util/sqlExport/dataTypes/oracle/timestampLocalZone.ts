export default function (value: string | null) {
  if (value === null) {
    return 'NULL';
  } else if (typeof value === 'undefined') {
    return 'DEFAULT';
  }
  return `to_timestamp('${value.split(/\s/).slice(0, -1).join(' ')}', 'YYYY-MM-DD HH24:MI:SS.FF')`;
}

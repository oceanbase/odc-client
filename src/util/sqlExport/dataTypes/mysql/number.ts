export default function (value: string | null) {
  if (value === null) {
    return 'NULL';
  } else if (typeof value === 'undefined') {
    return 'DEFAULT';
  }
  return value;
}

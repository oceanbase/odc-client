export default function (value: string | null) {
  if (value === null) {
    return 'NULL';
  } else if (typeof value === 'undefined') {
    return 'DEFAULT';
  }
  /**
   * xx-xx-xx xx:xx:xx.0 -> xx-xx-xx xx:xx:xx
   */
  value = value.split('.')[0];
  return `to_date('${value}', 'YYYY-MM-DD HH24:MI:SS')`;
}

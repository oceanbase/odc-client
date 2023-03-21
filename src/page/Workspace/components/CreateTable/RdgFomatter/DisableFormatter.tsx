import styles from './index.less';

export default function WrapDisableFormatter(isDisableFunc: (row: any) => boolean, key: string) {
  return (props) => {
    const { row } = props;
    const isCellDisable = isDisableFunc(row);
    const value = row[key] ?? '';
    return isCellDisable ? <div className={styles.disableCell}>{value}</div> : value;
  };
}

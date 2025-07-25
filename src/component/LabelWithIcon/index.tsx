import styles from './index.less';

interface IProps {
  gap: number;
  icon: React.ReactNode;
  label: React.ReactNode;
  align?: string[];
}
const LabelWithIcon = ({ icon, label, gap, align }: IProps) => {
  const displayedLabel =
    typeof label === 'string' ? <span className={styles.icon}>{label}</span> : label;
  return (
    <span
      style={{
        gap,
        flexDirection: align?.[0] === 'vertical' ? 'column' : 'row',
        alignItems: align?.[0] === 'vertical' ? align?.[1] : '',
      }}
      className={styles.labelWithIcon}
    >
      {icon}
      {displayedLabel}
    </span>
  );
};

export default LabelWithIcon;

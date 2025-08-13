import styles from './index.less';
import { Tooltip } from 'antd';
import { useMemo } from 'react';

interface IProps {
  content: string | React.ReactNode;
  customTooltipContent?: React.ReactNode;
  needTooltip?: boolean;
}

const EllipsisText = (props: IProps) => {
  const { content, customTooltipContent, needTooltip = true } = props;

  const tooltipContent = useMemo(() => {
    if (!content || !needTooltip) return null;
    if (customTooltipContent) {
      return customTooltipContent;
    }
    return content;
  }, [content, customTooltipContent, needTooltip]);

  return content ? (
    <Tooltip title={tooltipContent}>
      <div className={styles.ellipsisContent}>{content}</div>
    </Tooltip>
  ) : (
    <>-</>
  );
};

export default EllipsisText;

import { formatMessage } from '@/util/intl';
/**
 * 多行溢出文本 通用组件
 * 说明：若使用纯CSS的方式实现有兼容性问题
 */
import { Button } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';

interface IProps {
  content: React.ReactNode;
  className: string;
  isShowMore?: boolean;
  maxHeight?: number;
}

const MultiLineOverflowText: React.FC<IProps> = ({
  content,
  className,
  isShowMore = false,
  maxHeight = 20,
}) => {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const [overflow, setOverflow] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);

  const style = !openStatus
    ? {
        maxHeight: `${maxHeight}px`,
      }
    : null;

  useEffect(() => {
    setOverflow(contentRef?.current?.offsetHeight > wrapperRef?.current?.offsetHeight);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={classNames(styles.overflowText, className, {
        [styles.overflow]: overflow && !openStatus,
        [styles.showMore]: isShowMore,
      })}
      style={style}
    >
      <div ref={contentRef} className={styles.content}>
        {content}
      </div>
      {isShowMore && overflow && (
        <Button
          type="link"
          className={styles.more}
          onClick={() => {
            setOpenStatus(!openStatus);
          }}
        >
          {
            openStatus
              ? formatMessage({
                  id: 'odc.component.MultiLineOverflowText.Fold',
                }) //收起
              : formatMessage({
                  id: 'odc.component.MultiLineOverflowText.More',
                }) //更多
          }
        </Button>
      )}
    </div>
  );
};

export default MultiLineOverflowText;

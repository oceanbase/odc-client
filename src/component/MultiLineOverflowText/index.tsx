/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { formatMessage } from '@/util/intl';
/**
 * 多行溢出文本 通用组件
 * 说明：若使用纯CSS的方式实现有兼容性问题
 */
import { Button, Tooltip } from 'antd';
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
      {isShowMore ? (
        <div ref={contentRef} className={styles.content}>
          {content}
        </div>
      ) : (
        <Tooltip title={content}>
          <div ref={contentRef} className={styles.content}>
            {content}
          </div>
        </Tooltip>
      )}
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

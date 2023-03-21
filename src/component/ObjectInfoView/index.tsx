import React from 'react';

import styles from './index.less';

interface IProps {
  data: {
    label: string;
    content: React.ReactNode;
  }[];
}

const ObjectInfoView: React.FC<IProps> = function (props) {
  const { data } = props;
  return (
    <div className={styles.textFrom}>
      {data?.map(({ label, content }) => {
        return (
          <div className={styles.textFromLine}>
            <span className={styles.textFromLabel}>{label}:</span>
            <span className={styles.textFromContent}>{content}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ObjectInfoView;

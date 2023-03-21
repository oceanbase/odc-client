import { CheckCircleFilled } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React from 'react';

import styles from './index.less';

const ImgCheckboxGroup: React.FC<{
  options: {
    img: React.ReactNode;
    title: string;
    content: string;
    key: string;
  }[];
  onChange?: (key: string) => void;
  value?: string;
}> = (props) => {
  return (
    <Row gutter={8}>
      {props.options.map((option) => {
        const { title, content, img, key } = option;
        const isChecked = props.value == key;
        return (
          <Col
            key={key}
            onClick={() => {
              props.onChange(key);
            }}
            span={8}
          >
            <div className={`${isChecked ? styles.activeKey : ''} ${styles.item}`}>
              <div className={styles.img}>{img}</div>
              <div className={styles.right}>
                <div className={styles.title}>{title}</div>
                <div className={styles.content}>{content}</div>
              </div>
              {isChecked && (
                <CheckCircleFilled className={styles.checkicon} style={{ color: '#1890FF' }} />
              )}
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

export default ImgCheckboxGroup;

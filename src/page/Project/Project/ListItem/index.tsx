import { IProject, ProjectRole } from '@/d.ts/project';
import { FileZipFilled, UserOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import classNames from 'classnames';
import React, { forwardRef } from 'react';
import styles from './index.less';

interface IProps {
  data: IProject;
  onClick: (p: IProject) => void;
}

export default forwardRef(function ListItem(
  { data, onClick }: IProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div ref={ref} className={styles.item} onClick={onClick.bind(this, data)}>
      <div className={classNames(styles.block, styles.status)}>
        <FileZipFilled style={{ color: 'var(--icon-blue-color)' }} />
      </div>
      <div className={classNames(styles.block, styles.name)}>{data.name}</div>
      <div className={classNames(styles.block, styles.desc)}>{data.description || '-'}</div>
      <div className={classNames(styles.block, styles.users)}>
        <Space>
          <UserOutlined />
          {data.members?.find((item) => item.role === ProjectRole.OWNER)?.name || '-'}
        </Space>
      </div>
    </div>
  );
});

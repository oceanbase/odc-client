import { IProject } from '@/d.ts/project';
import { UserOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

interface IProps {
  data: IProject;
  onClick: (p: IProject) => void;
}

export default function ListItem({ data, onClick }: IProps) {
  return (
    <div className={styles.item} onClick={onClick.bind(this, data)}>
      <div className={classNames(styles.block, styles.status)}>
        <UserOutlined />
      </div>
      <div className={classNames(styles.block, styles.name)}>{data.name}</div>
      <div className={classNames(styles.block, styles.desc)}>{data.description || '-'}</div>
      <div className={classNames(styles.block, styles.users)}>
        <Space>
          <UserOutlined />
          {data.creator?.name}
        </Space>
      </div>
    </div>
  );
}

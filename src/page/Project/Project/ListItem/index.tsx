import { IProject, ProjectRole } from '@/d.ts/project';
import Icon from '@ant-design/icons';
import { Space } from 'antd';
import classNames from 'classnames';
import React, { forwardRef } from 'react';
import styles from './index.less';

import ProjectSvg from '@/svgr/project_space.svg';
import UserSvg from '@/svgr/user.svg';

interface IProps {
  data: IProject;
  onClick: (p: IProject) => void;
}

export default forwardRef(function ListItem(
  { data, onClick }: IProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={classNames(styles.item, { [styles.itemDisable]: data?.archived })}
      onClick={onClick.bind(this, data)}
    >
      <div className={classNames(styles.block, styles.status)}>
        <Icon component={ProjectSvg} style={{ color: 'var(--icon-blue-color)', fontSize: 16 }} />
      </div>
      <div className={classNames(styles.block, styles.name)}>{data.name}</div>
      <div className={classNames(styles.block, styles.desc)}>{data.description || '-'}</div>
      <div className={classNames(styles.block, styles.users)}>
        <Space>
          <Icon style={{ color: 'var(--icon-color-disable)' }} component={UserSvg} />
          {data.members
            ?.filter((item) => item.role === ProjectRole.OWNER)
            ?.map((a) => a.name)
            ?.join(', ') || '-'}
        </Space>
      </div>
    </div>
  );
});

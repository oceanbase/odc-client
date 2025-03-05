import React, { useContext } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { ControlOutlined } from '@ant-design/icons';
import { DatabaseGroup } from '../const';
import ParamContext from '../ParamContext';
import { ReactComponent as GroupSvg } from '@/svgr/group.svg';
import Icon from '@ant-design/icons';

interface IProps {}

const items: MenuProps['items'] = [
  {
    key: DatabaseGroup.none,
    label: '不分组',
  },
  {
    key: DatabaseGroup.type,
    label: '按类型分组',
  },
  {
    key: DatabaseGroup.environment,
    label: '按环境分组',
  },
  {
    key: DatabaseGroup.dataSource,
    label: '按数据源分组',
  },
  {
    key: DatabaseGroup.cluster,
    label: '按集群分组',
  },
];
const Group: React.FC<IProps> = function () {
  const context = useContext(ParamContext);

  const handleSelectGroupBy = (e) => {
    context.setGroupMode?.(e.key as DatabaseGroup);
  };
  return (
    <Dropdown
      menu={{
        selectedKeys: [context.groupMode],
        items,
        onClick: handleSelectGroupBy,
      }}
    >
      <Icon
        component={GroupSvg}
        style={
          context.groupMode !== DatabaseGroup.none
            ? { color: 'var(--brand-blue6-color)', fontSize: 16 }
            : { color: 'var(--neutral-grey8-color)', fontSize: 16 }
        }
      />
    </Dropdown>
  );
};

export default Group;

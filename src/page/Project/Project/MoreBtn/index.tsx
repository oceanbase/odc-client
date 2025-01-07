import { formatMessage } from '@/util/intl';
import { Dropdown } from 'antd';
import { inject, observer } from 'mobx-react';
import { EllipsisOutlined } from '@ant-design/icons';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import styles from './index.less';
import { useState } from 'react';
import { IProject } from '@/d.ts/project';
import DeleteProjectModal from '@/page/Project/components/DeleteProjectModal.tsx';

enum Actions {
  REMOVE = 'remove',
}

interface MoreBtnProps {
  project: IProject;
  reload: () => void;
}

const MoreBtn: React.FC<MoreBtnProps> = function (props) {
  const { project, reload } = props;
  const [openDeleteProjectModal, setOpenDeleteProjectModal] = useState(false);

  const items: ItemType[] = [
    {
      label: formatMessage({
        id: 'src.page.Project.Project.MoreBtn.CF5D6A1D',
        defaultMessage: '删除项目',
      }),
      key: Actions.REMOVE,
    },
  ];

  return (
    <>
      <Dropdown
        menu={{
          items: items?.filter(Boolean),
          className: styles.menu,
          onClick(e) {
            // e.domEvent.stopPropagation();
            switch (e.key) {
              case Actions.REMOVE: {
                setOpenDeleteProjectModal(true);
                return;
              }
            }
          },
        }}
      >
        <EllipsisOutlined
          style={{
            cursor: 'default',
            fontSize: 14,
            color: 'var(--icon-color-normal)',
          }}
        />
      </Dropdown>
      <DeleteProjectModal
        open={openDeleteProjectModal}
        setOpen={setOpenDeleteProjectModal}
        projectList={[{ id: project.id, name: project.name }]}
        verifyValue="delete"
        beforeDelete={reload}
      ></DeleteProjectModal>
    </>
  );
};

export default inject('modalStore')(observer(MoreBtn));

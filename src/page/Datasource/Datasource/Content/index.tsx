import ApplyPermission from '@/component/ApplyPermission';
import PageContainer, { TitleType } from '@/component/PageContainer';
import { ModalStore } from '@/store/modal';
import { SettingStore } from '@/store/setting';
import { inject, observer } from 'mobx-react';
import { forwardRef, useContext, useImperativeHandle, useRef } from 'react';
import ParamContext from '../ParamContext';
import styles from './index.less';
import List from './List';
import TitleButton from './TitleButton';

interface IProps {
  modalStore?: ModalStore;
  settingStore?: SettingStore;
}

const Content = function (props: IProps, ref) {
  const listRef = useRef<any>();
  const context = useContext(ParamContext);

  const reload = () => {
    return listRef.current?.reload();
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        reload,
      };
    },
    [],
  );
  return (
    <PageContainer
      titleProps={{
        title: '数据源',
        type: TitleType.TEXT,
        showDivider: true,
      }}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <TitleButton onReload={reload} />
        </div>
        <div className={styles.list}>
          <List ref={listRef} />
        </div>
        <ApplyPermission />
      </div>
    </PageContainer>
  );
};

export default inject('modalStore', 'settingStore')(observer(forwardRef<any, IProps>(Content)));

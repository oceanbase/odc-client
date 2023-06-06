import { SecureStore } from '@/store/secure';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import styles from './index.less';
export interface SiderItem {
  value: any;
  label: string;
}

export interface SecureSiderProps {
  secureStore: SecureStore;
  siderData: SiderItem[];
  initData: () => void;
  handleItemClick: (v: string) => void;
}
export interface ISecureSiderProps {
  secureStore: SecureStore;
  siderItemList: SiderItem[];
  selectedFlag: string;
  handleItemClick: (v: string) => void;
}
const SecureSider: React.FC<ISecureSiderProps> = ({
  siderItemList,
  secureStore,
  selectedFlag,
  handleItemClick,
}) => {
  function renderList() {
    if (siderItemList?.length === 0) {
      return null;
    }
    return (
      <div className={styles.siderItemList}>
        {siderItemList.map((item) => {
          return (
            <div
              className={classNames(
                {
                  [styles.selected]: secureStore[`${selectedFlag}`] === item.value,
                },
                styles.item,
              )}
              key={item.value}
              onClick={() => {
                handleItemClick(item.value);
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    );
  }

  return <div className={styles.secureSider}>{renderList()}</div>;
};
export default inject('secureStore')(observer(SecureSider));

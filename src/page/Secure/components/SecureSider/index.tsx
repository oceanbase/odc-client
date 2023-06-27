import { Spin } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
export interface SiderItem {
  value: any;
  label: string;
}
export interface SecureSiderProps {
  siderData: SiderItem[];
  initData: () => void;
  handleItemClick: (v: any) => void;
}
export interface ISecureSiderProps {
  loading?: boolean;
  siderItemList: SiderItem[];
  selectedItem: any;
  handleItemClick: (v: any) => void;
}
const SecureSider: React.FC<ISecureSiderProps> = ({
  loading = false,
  siderItemList,
  selectedItem,
  handleItemClick,
}) => {
  const handleSelected = (v) => {
    return selectedItem === v;
  };
  function renderList() {
    if (siderItemList?.length === 0) {
      return null;
    }
    return (
      <Spin spinning={loading}>
        <div className={styles.siderItemList}>
          {siderItemList.map((item) => {
            return (
              <div
                className={classNames(
                  {
                    [styles.selected]: handleSelected(item.value),
                  },
                  styles.item,
                )}
                key={item.value}
                onClick={() => {
                  handleItemClick(item);
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </Spin>
    );
  }
  return <div className={styles.secureSider}>{renderList()}</div>;
};
export default SecureSider;

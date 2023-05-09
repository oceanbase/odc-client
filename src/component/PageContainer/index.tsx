import BigSelect from '@/component/BigSelect';
import { Tabs } from 'antd';
import classnames from 'classnames';
import { ReactNode } from 'react';
import styles from './index.less';

export enum TitleType {
  TEXT = 'text',
  TAB = 'tab',
  SELECT = 'select',
}

interface IPageContainerProps {
  titleProps: {
    type: TitleType;
    title?: ReactNode;
    options?: {
      label: string;
      value: string | number;
    }[];
    defaultValue?: string | number;
    showDivider?: boolean;
    onChange?: (value: string) => void;
  };
  tabList?: { key: string; tab: ReactNode }[];
  tabActiveKey?: string;
  tabBarExtraContent?: ReactNode;
  onTabChange?: (key) => void;
}

const PageContainer: React.FC<IPageContainerProps> = (props) => {
  const { titleProps, tabList, tabActiveKey, tabBarExtraContent, onTabChange } = props;
  const { title, type, options, defaultValue, showDivider, onChange } = titleProps;

  return (
    <div className={styles['page-container']}>
      <div
        className={classnames(styles['page-container-header'], {
          [styles['bottom-border']]: showDivider,
        })}
      >
        {type === TitleType.TAB && (
          <Tabs
            className={styles['page-container-title-tab']}
            activeKey={tabActiveKey}
            tabBarExtraContent={tabBarExtraContent}
            onChange={onTabChange}
          >
            {options?.map(({ label, value }) => {
              return <Tabs.TabPane tab={label} key={label} />;
            })}
          </Tabs>
        )}
        {type === TitleType.TEXT && <div className={styles.title}>{title}</div>}
        {type === TitleType.SELECT && (
          <BigSelect defaultValue={defaultValue} options={options} onChange={onChange} />
        )}
      </div>
      {tabList?.length && (
        <Tabs
          activeKey={tabActiveKey}
          tabBarExtraContent={tabBarExtraContent}
          onChange={onTabChange}
        >
          {tabList?.map(({ tab, key }) => {
            return <Tabs.TabPane tab={tab} key={key} />;
          })}
        </Tabs>
      )}
      <div className={styles['page-container-main']}>{props?.children}</div>
    </div>
  );
};

export default PageContainer;

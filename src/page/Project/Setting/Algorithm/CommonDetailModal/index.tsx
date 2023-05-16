import type { IManagerDetailTabs } from '@/d.ts';
import { Drawer, Radio } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { ReactNode, useEffect, useState } from 'react';
import Status from '../CommonStatus';
import styles from './index.less';

interface IProps {
  visible: boolean;
  title: string;
  detailId: number;
  tabs?: {
    key: string;
    title: string;
    hidden?: boolean;
  }[];
  footer: ReactNode;
  width?: number;
  className?: string;
  getDetail: (id: number) => void;
  onClose: () => void;
  renderContent: (key: IManagerDetailTabs, data: any, onClose: () => void) => ReactNode;
}

const CommonDetailModal: React.FC<IProps> = inject('connectionStore')(
  observer((props) => {
    const {
      visible,
      title,
      footer,
      detailId,
      tabs = [],
      width = 520,
      className = '',
      getDetail,
      onClose,
      renderContent,
    } = props;
    const [detail, setDetail] = useState(null);
    const filteredTabs = tabs?.filter((tab) => !tab.hidden);
    const [activeKey, setActiveKey] = useState(filteredTabs?.[0]?.key);

    const handleChangeKey = (e) => {
      setActiveKey(e.target.value);
    };

    useEffect(() => {
      (async () => {
        if (detailId && visible) {
          setActiveKey(filteredTabs?.[0]?.key);
          const data = await getDetail(detailId);
          setDetail(data);
        }
      })();
    }, [detailId, getDetail, visible]);

    return (
      <Drawer
        visible={visible}
        width={width}
        title={title}
        destroyOnClose
        className={styles.detailDrawer}
        footer={footer}
        onClose={() => {
          onClose();
        }}
      >
        {!!filteredTabs?.length && (
          <div className={styles.header}>
            <Radio.Group onChange={handleChangeKey} value={activeKey}>
              {filteredTabs.map((item) => {
                return <Radio.Button value={item.key}>{item.title}</Radio.Button>;
              })}
            </Radio.Group>
            <Status enabled={detail?.enabled} />
          </div>
        )}
        <div className={`${className} ${styles.content}`}>
          {detail ? renderContent(activeKey as IManagerDetailTabs, detail, onClose) : null}
        </div>
      </Drawer>
    );
  }),
);

export default CommonDetailModal;

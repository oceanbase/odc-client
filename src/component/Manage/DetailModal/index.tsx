/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IManagerDetailTabs } from '@/d.ts';
import { Drawer, Radio } from 'antd';
import React, { ReactNode, useEffect, useState } from 'react';
import Status from '../Status';
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

const CommonDetailModal: React.FC<IProps> = (props) => {
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
      open={visible}
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
};

export default CommonDetailModal;

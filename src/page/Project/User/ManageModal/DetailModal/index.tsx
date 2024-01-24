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

import { Drawer, Space, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const getDetail = async (detailId: number) => {};

interface IProps {
  visible: boolean;
  detailId: number;
  onClose: () => void;
}

const DetailModal: React.FC<IProps> = (props) => {
  const { visible, detailId, onClose } = props;
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    (async () => {
      if (detailId && visible) {
        const data = await getDetail(detailId);
        setDetail(data);
      }
    })();
  }, [detailId, visible]);

  return (
    <Drawer
      open={visible}
      width="520"
      title="权限详情"
      destroyOnClose
      className={styles.detailDrawer}
      footer={
        <Space>
          <Button onClick={() => {}}>确定</Button>
        </Space>
      }
      onClose={() => {
        onClose();
      }}
    >
      <div className={styles.content}>
        <span>权限详情</span>
      </div>
    </Drawer>
  );
};

export default DetailModal;

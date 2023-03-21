import React, { useContext, useMemo, useRef, useState } from 'react';
import IconBtn from '../IconBtn';

import { setConnectionLabel } from '@/common/network/connection';
import LabelList from '@/component/Label/LabelList';
import LabelManage from '@/component/Label/LabelMange';
import { labelColorsMap } from '@/constant';
import { IConnection } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import TagActiveSvg from '@/svgr/icon_tag_filled.svg';
import TagSvg from '@/svgr/icon_tag_outlined.svg';
import { formatMessage } from '@/util/intl';
import { message, Popover, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import ParamContext from '../../../ParamContext';

import styles from './index.less';

interface IProps {
  connection: IConnection;
  connectionStore?: ConnectionStore;
}

const LabelBtn: React.FC<IProps> = function ({ connection, connectionStore }) {
  const context = useContext(ParamContext);
  const [visible, setVisible] = useState(false);
  const iconRef = useRef<HTMLSpanElement>();
  const labelId = connection.labelIds?.[0];
  const isActive = !!labelId;
  const labelMap = useMemo(() => {
    let map = {};
    connectionStore.labels?.forEach((label) => {
      map[label.id] = label;
    });
    return map;
  }, [connectionStore.labels]);
  async function onChangeLabel(labelId?: number | string) {
    const res = await setConnectionLabel(connection.id, labelId);
    if (res) {
      message.success(
        formatMessage({ id: 'odc.page.ConnectionList.TheTagHasBeenModified' }), // 修改标签成功
      );
      context.reloadTable();
    } else {
      message.error(
        formatMessage({ id: 'odc.page.ConnectionList.UnableToModifyTheTag' }), // 修改标签失败
      );
    }
  }
  if (isActive) {
    const colors = labelColorsMap[labelMap[labelId]?.labelColor];
    return (
      <Tooltip title={labelMap[labelId]?.labelName}>
        <IconBtn
          style={{ color: colors?.color }}
          icon={TagSvg}
          activeIcon={TagActiveSvg}
          isActive={isActive}
          onClick={() => {
            onChangeLabel(null);
          }}
        />
      </Tooltip>
    );
  }
  return (
    <>
      {visible && (
        <LabelManage
          visible={visible}
          labels={connectionStore.labels}
          activeConnection={connection}
          changeVisible={setVisible}
          onChangeLabel={(e, id) => onChangeLabel(id)}
          containerDOM={document.body}
        />
      )}
      <Popover
        overlayClassName={styles.label}
        trigger={['hover']}
        content={
          <LabelList
            record={connection}
            onChangeLabelManageVisible={() => setVisible(true)}
            onChangeLabel={(e, id) => onChangeLabel(id)}
          />
        }
      >
        <IconBtn ref={iconRef} icon={TagSvg} activeIcon={TagActiveSvg} isActive={isActive} />
      </Popover>
    </>
  );
};

export default inject('connectionStore')(observer(LabelBtn));

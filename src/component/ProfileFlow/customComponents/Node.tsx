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

import { Handle, Position } from 'reactflow';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Progress, Tooltip } from 'antd';
import Icon, { LoadingOutlined } from '@ant-design/icons';
import styles from './index.less';
import classNames from 'classnames';
import { formatTimeTemplate } from '@/util/data/dateTime';
import BigNumber from 'bignumber.js';
import { ReactComponent as WaitingSvg } from '@/svgr/Waiting.svg';
import { IProfileNodeStatus } from '@/d.ts';

const nodeStatusIconMap = {
  [IProfileNodeStatus.RUNNING]: (
    <LoadingOutlined style={{ color: 'var(--profile-progress-primary-color)' }} />
  ),
  [IProfileNodeStatus.PREPARING]: (
    <Icon
      component={WaitingSvg}
      style={{ fontSize: 14, color: 'var(--profile-icon-unready-color)' }}
    />
  ),
  [IProfileNodeStatus.FINISHED]: null,
};

function TextUpdaterNode({ data, id, isConnectable }) {
  return (
    <div className={styles.customNodes}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
      {data?.subNodes ? (
        <>
          <div
            className={classNames(styles.node, styles.nodeOverlap1, {
              [styles.active]: data?.isSelected,
            })}
          ></div>
          <div
            className={classNames(styles.node, styles.nodeOverlap2, {
              [styles.active]: data?.isSelected,
            })}
          ></div>
        </>
      ) : null}
      <div
        className={classNames(styles.node, styles.nodeOverlap3, {
          [styles.active]: data?.isSelected,
        })}
        onClick={() => {
          data?.setSelectedNode(data);
        }}
      >
        <div className={styles.nodeHeader}>
          <span className={styles.titleBox}>
            <Tooltip title={data.label}>
              <div className={styles.title}>{data.label}</div>
            </Tooltip>
            <div className={styles.number}>[{data?.id}]</div>
          </span>
          {nodeStatusIconMap?.[data.status]}
        </div>
        <div className={styles.subTitle} title={data?.title}>
          {data?.title || '-'}
          <span className={styles.params}>
            {formatTimeTemplate(BigNumber(data?.duration).div(1000000).toNumber())}{' '}
            {data && data.percentageInAll === '' ? '' : `(${data?.percentageInAll}%)`}
          </span>
        </div>
        {data.percentageInAll === '' ? (
          <div></div>
        ) : (
          <Progress
            percent={data?.percentageInAll}
            showInfo={false}
            className={styles.progress}
          ></Progress>
        )}
        {data?.hasChild ? (
          <div
            className={styles.icon}
            style={{ top: data?.subNodes ? 'calc(100% + 8px)' : '100%' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              data?.changeTreeOpen(id, data.isTreeOpen);
            }}
          >
            {data.isTreeOpen ? <MinusCircleOutlined /> : <PlusCircleOutlined />}
          </div>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
        style={{ visibility: 'hidden' }}
      />
    </div>
  );
}

export default TextUpdaterNode;

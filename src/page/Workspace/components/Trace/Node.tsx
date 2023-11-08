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

import { MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import styles from './index.less';
import OBServerSvg from '@/svgr/OBServer.svg';
import OBProxySvg from '@/svgr/OBProxy.svg';
import JDBCSvg from '@/svgr/JDBC.svg';
import { TraceSpanNode } from '@/d.ts';

export const getIconByNodeType = (nodeType: TraceSpanNode) => {
  switch (nodeType) {
    case TraceSpanNode.OBServer:
      return <OBServerSvg />;
    case TraceSpanNode.OBProxy:
      return <OBProxySvg />;
    case TraceSpanNode.JDBC:
      return <JDBCSvg />;
    default:
      return '';
  }
};
const Node = ({
  level,
  lastOne,
  title,
  isRoot,
  isParent,
  isExpand,
  node,
  uuid,
  handleNodeExpand,
  parentKey,
  countStepBySameParentKey,
  index,
  siblings,
}) => {
  return (
    <div
      className={styles.node}
      style={{
        borderBottom: lastOne ? '1px solid var(--odc-border-color)' : 'transparent',
      }}
    >
      {isRoot && !isExpand ? (
        <></>
      ) : (
        <svg
          width="24px"
          height="24px"
          style={{
            position: 'absolute',
            top: '18px',
            zIndex: 1,
          }}
        >
          <line
            x1="12"
            y1={isRoot ? '17' : '0'}
            x2="12"
            y2={level === 0 && index === siblings - 1 ? '17' : '0'}
            style={{
              stroke: 'grey',
              strokeWidth: '1',
            }}
            strokeDasharray={'2 2'}
          />
        </svg>
      )}
      {Array.from({ length: level }).map((_, index) => (
        <div
          key={index}
          style={{
            width: '24px',
            height: '24px',
          }}
        ></div>
      ))}
      <div className={styles.nodeEmptySquare}>
        {index === 0 && siblings > 0 && (
          <svg
            width="2px"
            height={`${24 * countStepBySameParentKey(parentKey)}px`}
            style={{
              position: 'absolute',
              left: '-13px',
              top: '-6px',
              zIndex: 1,
            }}
          >
            <line
              x1="1"
              y1="3"
              x2="1"
              y2={`${24 * countStepBySameParentKey(parentKey) - 6}`}
              style={{
                stroke: 'grey',
                strokeWidth: '1',
              }}
              strokeDasharray={'2 2'}
            />
          </svg>
        )}
        {isParent ? (
          <div className={styles.expandIcon}>
            {!isRoot && (
              <>
                <svg
                  width="24px"
                  height="24px"
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '-3px',
                    zIndex: 1,
                  }}
                >
                  <line
                    x1="6"
                    y1="12"
                    x2="24"
                    y2="12"
                    style={{
                      stroke: 'grey',
                      strokeWidth: '1',
                    }}
                    strokeDasharray={'2 2'}
                  />
                </svg>
              </>
            )}
            {isExpand ? (
              <MinusSquareOutlined onClick={() => handleNodeExpand(uuid)} />
            ) : (
              <PlusSquareOutlined onClick={() => handleNodeExpand(uuid)} />
            )}
          </div>
        ) : (
          <div className={styles.lastNode}>
            <svg
              width="36px"
              height="24px"
              style={{
                position: 'absolute',
                zIndex: 1,
                right: 0,
              }}
            >
              <line
                x1="0"
                y1="1"
                x2="36"
                y2="1"
                style={{
                  stroke: 'grey',
                  strokeWidth: '1',
                }}
                strokeDasharray={'2 2'}
              />
            </svg>
          </div>
        )}
      </div>
      <div className={styles.nodeTitle}>
        <div style={{ width: '16px', height: '16px' }}>{getIconByNodeType(node)}</div>
        {title}
      </div>
    </div>
  );
};
export default Node;

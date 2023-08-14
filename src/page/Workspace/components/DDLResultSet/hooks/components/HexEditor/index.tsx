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

import classnames from 'classnames';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { FixedSizeList } from 'react-window';
import styles from './index.less';

interface IProps {
  value: string[];
  disabled?: boolean;
  onChange: (newValue: string[]) => void;
}

const cellWidth = 22;

const HexEditor: React.FC<IProps> = function (props) {
  const { value, disabled, onChange } = props;
  const domRef = useRef<HTMLDivElement>();
  const [domWidth, setDomWidth] = useState(0);
  const [selectCells, setSelectCells] = useState({ begin: -1, end: -1 });
  const domHeight = domRef.current?.clientHeight;
  const lineCount = Math.max(0, Math.floor(domWidth / cellWidth) - 1);

  useLayoutEffect(() => {
    setDomWidth(domRef.current?.clientWidth);
  }, []);

  return (
    <div
      ref={domRef}
      style={{
        width: '100%',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        domRef.current?.focus();
        const cell = e.target;
        if (cell instanceof HTMLSpanElement && cell.getAttribute('role') === 'hexcell') {
          const cellIdx = parseInt(cell.getAttribute('data-cellIdx'));
          if (selectCells.begin === cellIdx) {
            setSelectCells({ begin: -1, end: -1 });
            return;
          }
          setSelectCells({
            begin: cellIdx,
            end: cellIdx,
          });
        } else {
          if (selectCells.begin !== -1 && selectCells.end != -1) {
            setSelectCells({ begin: -1, end: -1 });
          }
        }
      }}
      onKeyDown={
        disabled
          ? null
          : (e) => {
              const key = e.key;
              if (/^[a-f0-9]$/i.test(key) && selectCells.begin !== -1) {
                const cellIdx = selectCells.begin;
                let cellValue = value[cellIdx];
                if (cellValue.length === 1) {
                  cellValue = cellValue + key;
                } else {
                  cellValue = key;
                }
                let newValue = [...value];
                newValue[cellIdx] = cellValue.toUpperCase();
                onChange(newValue);
              } else if (e.detail === 0 && selectCells.begin !== -1) {
                const cellIdx = selectCells.begin;
                let newValue = [...value];
                newValue.splice(cellIdx, 1);
                onChange(newValue);
              }
            }
      }
    >
      {domWidth ? (
        <FixedSizeList
          height={domHeight}
          width={domWidth}
          itemCount={
            disabled
              ? Math.ceil((value?.length || 0) / lineCount)
              : Math.ceil(((value?.length || 0) + 1) / lineCount)
          }
          itemSize={cellWidth}
        >
          {({ index, style }) => {
            const offset = index * lineCount;
            const isLastLine = index + 1 === Math.ceil(((value?.length || 0) + 1) / lineCount);
            const isShowBtn = isLastLine && !disabled;
            return (
              <div key={index} style={{ ...style, padding: 2 }}>
                {value?.slice(offset, offset + lineCount).map((str, idx) => {
                  const cellIdx = index * lineCount + idx;
                  const isCellSelected = selectCells.begin <= cellIdx && selectCells.end >= cellIdx;
                  return (
                    <span
                      key={index + '-' + idx}
                      onSelect={(e) => {
                        console.log(e);
                      }}
                      role={'hexcell'}
                      data-cellIdx={cellIdx}
                      className={classnames(styles.cell, {
                        [styles.cellSeleced]: isCellSelected,
                      })}
                      style={{
                        width: cellWidth,
                        height: cellWidth,
                        lineHeight: cellWidth + 'px',
                      }}
                    >
                      {str}
                    </span>
                  );
                })}
                {isShowBtn ? (
                  <span
                    className={styles.addCell}
                    style={{
                      width: cellWidth,
                      height: cellWidth,
                      lineHeight: cellWidth + 'px',
                    }}
                    onClick={() => {
                      onChange((value || []).concat('00'));
                    }}
                  >
                    +
                  </span>
                ) : null}
              </div>
            );
          }}
        </FixedSizeList>
      ) : null}
    </div>
  );
};

export default HexEditor;

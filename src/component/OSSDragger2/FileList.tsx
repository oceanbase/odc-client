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

import type { UploadFile } from 'antd/lib/upload/interface';
import React from 'react';
import { FixedSizeList } from 'react-window';
import { DragableItem, FileItem } from './FileListItem';
import styles from './index.less';

interface IProps {
  searchValue: string;
  fileList: UploadFile[];
  onDelete: (file: UploadFile) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

const FileList: React.FC<IProps> = (props) => {
  const { searchValue, fileList, onMove, onDelete } = props;

  return (
    <FixedSizeList
      className={styles.listWrapper}
      height={280}
      itemCount={fileList.length}
      itemSize={30}
    >
      {({ index, style }) => {
        const file = fileList?.[index];
        return (
          <div style={style} key={file?.uid || file?.name}>
            {!searchValue.length ? (
              <DragableItem
                index={index}
                searchValue={searchValue}
                file={file}
                handleMove={onMove}
                onDelete={onDelete}
              />
            ) : (
              <div className={styles.uploadListItem}>
                <FileItem {...props} file={file} />
              </div>
            )}
          </div>
        );
      }}
    </FixedSizeList>
  );
};

export default FileList;

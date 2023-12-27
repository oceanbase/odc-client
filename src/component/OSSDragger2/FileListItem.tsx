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

import Dragable, { IDragable } from '@/component/Dragable';
import { ReactComponent as DragSvg } from '@/svgr/DragItem.svg';
import { formatMessage } from '@/util/intl';
import { encodeRegexpStr } from '@/util/utils';
import Icon, { DeleteOutlined, LoadingOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Popconfirm, Progress, Space, Tooltip } from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import React from 'react';
import styles from './index.less';

interface IFileItemProps {
  file: UploadFile;
  searchValue: string;
  onDelete: (file: UploadFile) => void;
}

export const FileItem: React.FC<IFileItemProps> = (props) => {
  const { searchValue, onDelete, file } = props;
  const { name, percent, status } = file;
  const isSearch = !!searchValue.length;
  let nameContent: React.ReactNode = name;
  if (isSearch) {
    const reg = RegExp(encodeRegexpStr(searchValue), 'ig');
    const searchTextArr = name.match(reg);
    const nameTextArr = searchValue ? name.split(reg) : [name];
    if (nameTextArr.length > 1) {
      nameContent = nameTextArr.map((item) => {
        const searchText = searchTextArr.shift();
        return (
          <>
            {item}
            {searchText ? <mark className={styles.mark}>{searchText}</mark> : null}
          </>
        );
      });
    }
  }

  const handleDelete = () => {
    onDelete(file);
  };

  return (
    <>
      <div className={`${styles.info} ${styles[status]}`}>
        <span className={styles.icon}>
          {status === 'uploading' ? (
            <LoadingOutlined />
          ) : (
            <Space size={2}>
              {!searchValue.length && <Icon component={DragSvg} />}
              <PaperClipOutlined className={styles.paperClip} />
            </Space>
          )}
        </span>
        {status === 'error' ? (
          <Tooltip
            title={
              file?.response?.errMsg ??
              formatMessage({
                id: 'odc.component.OSSDragger2.FileListItem.UploadFailed',
              }) //上传失败
            }
          >
            <span className={styles.text}>{nameContent}</span>
          </Tooltip>
        ) : (
          <span className={styles.text}>{nameContent}</span>
        )}
        {status === 'error' ? (
          <span className={styles.action} onClick={handleDelete}>
            <DeleteOutlined />
          </span>
        ) : (
          <Popconfirm
            placement="topLeft"
            title={formatMessage({
              id: 'odc.component.OSSDragger2.FileListItem.AreYouSureYouWant',
            })} /*确定要移除文件吗？*/
            onConfirm={handleDelete}
            okText={formatMessage({
              id: 'odc.component.OSSDragger2.FileListItem.Ok',
            })} /*确定*/
            cancelText={formatMessage({
              id: 'odc.component.OSSDragger2.FileListItem.Cancel',
            })} /*取消*/
          >
            <span className={styles.action}>
              <DeleteOutlined />
            </span>
          </Popconfirm>
        )}
      </div>
      {status === 'uploading' && (
        <div className={styles.progress}>
          <Progress type="line" strokeWidth={2} percent={percent} />
        </div>
      )}
    </>
  );
};

interface IDragableItemProps extends IDragable {
  searchValue: string;
  file: UploadFile;
  onDelete: (file: UploadFile) => void;
}

export const DragableItem = Dragable<IDragableItemProps>(
  ({ props }: { props: IDragableItemProps }) => {
    const { connectDragSource, isOver, isDragging } = props;
    return connectDragSource(
      <div
        className={`${styles.uploadListItem} ${isDragging ? styles.dragging : styles.drag} ${
          isOver ? styles.active : ''
        }`}
      >
        <FileItem {...props} />
      </div>,
    );
  },
  'UPLOAD_FILE',
) as React.ComponentType<any>;

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

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

import setting from '@/store/setting';
import { uploadFileToOSS } from '@/util/aliyun';
import { formatMessage } from '@/util/intl';
import { encodeRegexpStr } from '@/util/utils';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useUnmountedRef } from 'ahooks';
import { Button, Input, Space, Tooltip, Upload } from 'antd';
import { DraggerProps } from 'antd/lib/upload';
import type { UploadFile } from 'antd/lib/upload/interface';
import update from 'immutability-helper';
import _ from 'lodash';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import FileList from './FileList';
import styles from './index.less';
import { request } from './request';

interface IProps extends DraggerProps {
  /**
   * 自动清除成功的文件
   */
  clearSuccess?: boolean;
  uploadFileOpenAPIName?: string;
  onFileChange?: (list: UploadFile[]) => void;
  onBeforeUpload?: (list: UploadFile[]) => boolean;
  tip?: string;
  sessionId?: string;
  ref?: React.RefObject<{
    setValue: (values: UploadFile[]) => void;
    resetFields: () => void;
  }>;
}

const ODCDragger: React.FC<IProps> = React.memo(
  forwardRef((props, ref) => {
    const { onFileChange, clearSuccess, tip, onBeforeUpload, sessionId, defaultFileList } = props;
    const [fileList, setFileList] = useState(defaultFileList);
    const [isSearch, setIsSearch] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const requestTask = useRef([]);
    const draggerRef = useRef(null);
    const isTaskReady = useRef(false);
    const unmountedRef = useUnmountedRef();
    const uploadListLen = useRef(0);
    const reg = RegExp(encodeRegexpStr(searchValue), 'ig');
    const isEmpty = !fileList?.length;
    const handleFileChange = (files: UploadFile[]) => {
      if (unmountedRef.current) {
        return;
      }
      setFileList(files);
      if (!uploadListLen.current) {
        onFileChange?.(files);
      }
    };

    const throttledChange60 = useCallback(
      _.throttle((list: UploadFile[]) => {
        handleFileChange(list);
        if (clearSuccess) {
          setFileList(list.filter((file) => file.status !== 'success'));
        } else {
          setFileList(list);
        }
      }, 60),
      [clearSuccess],
    );

    const throttledChange500 = useCallback(
      _.throttle((list: UploadFile[]) => {
        handleFileChange(list);
        if (clearSuccess) {
          setFileList(list.filter((file) => file.status !== 'success'));
        } else {
          setFileList(list);
        }
      }, 500),
      [clearSuccess],
    );

    useEffect(() => {
      return () => {
        resetTask();
      };
    }, []);

    const finishUpload = (files: UploadFile[]) => {
      finishTask();
      handleFileChange([...files]);
    };

    const params = {
      ...props,
      onChange(info) {
        const files = info.fileList;
        const uploadingListLen = files?.filter((file) => file.status === 'uploading')?.length;
        if (isTaskReady.current) {
          // 上传过程中
          throttledChange500.cancel();
          throttledChange60([...files]);
        } else {
          uploadListLen.current = uploadingListLen;
          // 初始化中
          throttledChange500([...files]);
        }
        if (!uploadingListLen && !requestTask.current.length) {
          finishUpload(files);
        }
      },
      fileList,
      showUploadList: false,
      customRequest(params) {
        requestTask.current.push({ ...params, ...props });
        if (requestTask.current?.length === uploadListLen.current) {
          isTaskReady.current = true;
          runTask();
        }
      },
    };

    async function runTask() {
      const task = requestTask.current.shift();
      if (!task) {
        requestTask.current = [];
        return;
      }
      if (onBeforeUpload && !onBeforeUpload(task?.file)) {
        task?.onError({
          isLimit: true,
        });
        runTask();
        return;
      }

      try {
        if (setting.isUploadCloudStore) {
          const fileName = await uploadFileToOSS(
            task.file,
            task.uploadFileOpenAPIName,
            sessionId,
            task.onProgress,
          );
          task.onSuccess(
            {
              data: fileName,
            },

            task.file,
          );
        } else {
          await request(task);
        }
        runTask();
      } catch (e) {
        console.error(e);
        runTask();
      }
    }

    const handleMove = useCallback(
      _.debounce((dragIndex: number, hoverIndex: number) => {
        const dragFile = fileList[dragIndex];
        handleFileChange(
          update(fileList, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragFile],
            ],
          }),
        );
      }, 0),
      [fileList],
    );

    const handleDelete = useCallback(
      (file: UploadFile) => {
        const key = file.uid ? 'uid' : 'name';
        const files = fileList.filter((item) => item[key] !== file[key]);
        handleFileChange(files);
      },
      [fileList],
    );

    function handleSwitchSearch(searchMode: boolean) {
      setIsSearch(searchMode);
    }

    function handlePropagation(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    function handleFileSelect() {
      draggerRef.current.click();
    }

    function finishTask() {
      resetTask();
    }

    function resetTask() {
      requestTask.current = [];
      uploadListLen.current = 0;
      isTaskReady.current = false;
    }

    useImperativeHandle(ref, () => ({
      setValue: (values) => {
        setFileList(values);
      },
      resetFields: () => {
        setFileList(defaultFileList);
      },
    }));

    return (
      <div className={isEmpty ? styles.empty : styles.fileList}>
        <Upload.Dragger {...params}>
          {!isEmpty ? (
            <>
              <div ref={draggerRef} className={styles.toolBar}>
                {isSearch ? (
                  <div className={styles.searchMode} onClick={handlePropagation}>
                    <Input.Search
                      prefix={<SearchOutlined />}
                      placeholder={formatMessage({
                        id: 'odc.component.OSSDragger2.SearchForFileName',
                        defaultMessage: '搜索文件名称',
                      })}
                      /*搜索文件名称*/
                      onSearch={(value, e) => {
                        handlePropagation(e);
                        setSearchValue(value);
                      }}
                    />

                    <Button
                      type="link"
                      onClick={() => {
                        setSearchValue('');
                        handleSwitchSearch(false);
                      }}
                    >
                      {
                        formatMessage({
                          id: 'odc.component.OSSDragger2.Cancel',
                          defaultMessage: '取消',
                        })
                        /*取消*/
                      }
                    </Button>
                  </div>
                ) : (
                  <div className={styles.tipMode} onClick={handlePropagation}>
                    <div className={styles.tipInfo}>
                      {
                        tip
                          ? tip
                          : formatMessage({
                              id: 'odc.component.OSSDragger2.SupportsDragAndDropFile',
                              defaultMessage: '支持拖拽文件上传',
                            }) //支持拖拽文件上传
                      }
                    </div>
                    <Space className={styles.opBtns}>
                      {!!props.multiple && (
                        <Tooltip
                          title={formatMessage({
                            id: 'odc.component.OSSDragger2.Search',
                            defaultMessage: '搜索',
                          })}
                          /*搜索*/
                        >
                          <SearchOutlined
                            onClick={() => {
                              handleSwitchSearch(true);
                            }}
                          />
                        </Tooltip>
                      )}

                      <Tooltip
                        title={formatMessage({
                          id: 'odc.component.OSSDragger2.Add',
                          defaultMessage: '添加',
                        })}
                        /*添加*/
                      >
                        <PlusOutlined onClick={handleFileSelect} />
                      </Tooltip>
                    </Space>
                  </div>
                )}
              </div>
              <div onClick={handlePropagation}>
                <FileList
                  searchValue={searchValue}
                  fileList={fileList.filter((item) => item.name.match(reg))}
                  onMove={handleMove}
                  onDelete={handleDelete}
                />
              </div>
            </>
          ) : (
            props.children
          )}
        </Upload.Dragger>
      </div>
    );
  }),
);

export default ODCDragger;

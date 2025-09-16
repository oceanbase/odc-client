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

import Icon, { PlusOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { ReactComponent as ObIcon } from '@/svgr/greyOb.svg';
import { Button, message } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import styles from './index.less';

export enum UploadState {
  DEFAULT = 'default',
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface FileUploadProps {
  /** 支持的文件扩展名，如 ['.jar', '.py', '.zip'] */
  accept?: string[];
  /** 最大文件大小（MB） */
  maxSize?: number;
  /** 文件选择成功回调 */
  onSuccess?: (file: File) => void;
  /** 文件验证失败回调 */
  onError?: (file: File, error: string) => void;
  /** 文件选择回调 */
  onFileSelect?: (file: File) => void;
  /** 文件移除回调 */
  onRemove?: () => void;
  /** 自定义上传函数，如果不提供则只进行文件选择 */
  customUpload?: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  /** 文件选择区域提示文本 */
  uploadText?: string;
  /** 上传区域副标题文本 */
  hintText?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 样式类名 */
  className?: string;
}

export interface FileUploadRef {
  reset: () => void;
}

const FileUpload = React.forwardRef<FileUploadRef, FileUploadProps>(
  (
    {
      accept = ['.jar', '.py', '.zip'],
      maxSize = 512,
      onSuccess,
      onError,
      onFileSelect,
      onRemove,
      customUpload,
      uploadText = '点击或拖拽文件到此区域选择',
      hintText,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [uploadState, setUploadState] = useState<UploadState>(UploadState.DEFAULT);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 生成默认提示文本
    const defaultHintText = `支持 ${accept.join(', ')} 文件，最大 ${maxSize}MB`;
    const displayHintText = hintText || defaultHintText;

    // 生成 accept 属性
    const acceptAttribute = accept.join(',');

    const validateFile = (file: File): boolean => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = accept.some((ext) => ext.toLowerCase() === fileExtension);

      if (!isValidType) {
        const errorMsg = `仅支持 ${accept.join('、')} 文件`;
        message.error(errorMsg);
        return false;
      }

      const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
      if (!isLtMaxSize) {
        const errorMsg = `文件大小必须小于 ${maxSize}MB`;
        message.error(errorMsg);
        return false;
      }

      return true;
    };

    const handleFileProcess = async (file: File) => {
      setCurrentFile(file);

      try {
        if (customUpload) {
          // 使用自定义上传函数
          setUploadState(UploadState.UPLOADING);
          setUploadProgress(0);
          await customUpload(file, setUploadProgress);
          setUploadState(UploadState.SUCCESS);
          onSuccess?.(file);
        } else {
          // 只进行文件选择，不执行上传
          setUploadState(UploadState.SUCCESS);
          setUploadProgress(100);
          onSuccess?.(file);
        }
      } catch (error) {
        setUploadState(UploadState.ERROR);
        const errorMsg = error instanceof Error ? error.message : '文件处理失败';
        onError?.(file, errorMsg);
      }
    };

    const handleFileSelect = (file: File) => {
      if (disabled) return;

      if (validateFile(file)) {
        onFileSelect?.(file);
        handleFileProcess(file);
      }
    };

    const handleFileRemove = () => {
      if (disabled) return;

      setUploadState(UploadState.DEFAULT);
      setUploadProgress(0);
      setCurrentFile(null);
      onRemove?.();
    };

    const handleDragEnter = (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
    };

    const handleDragLeave = (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
    };

    const handleDragOver = (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    };

    const handleClick = () => {
      if (disabled || uploadState !== UploadState.DEFAULT) return;
      fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
      // 清空input value，允许重新选择同一个文件
      e.target.value = '';
    };

    // 重置函数，供外部调用
    const reset = () => {
      setUploadState(UploadState.DEFAULT);
      setUploadProgress(0);
      setCurrentFile(null);
    };

    // 暴露重置方法给父组件
    React.useImperativeHandle(
      ref,
      () => ({
        reset,
      }),
      [],
    );

    // 渲染状态配置
    const stateConfig: Record<
      UploadState,
      { icon: React.ReactNode; text: string; hint?: string; removeButton?: boolean }
    > = {
      [UploadState.DEFAULT]: {
        icon: <PlusOutlined className={styles.uploadIcon} />,
        text: uploadText,
        hint: displayHintText,
      },
      [UploadState.UPLOADING]: {
        icon: <Icon component={ObIcon} className={styles.uploadIcon} />,
        text: currentFile?.name || '-',
        hint: '上传中...',
      },
      [UploadState.SUCCESS]: {
        icon: <CheckCircleFilled className={`${styles.uploadIcon} ${styles.successIcon}`} />,
        text: currentFile?.name || '-',
        removeButton: true,
      },
      [UploadState.ERROR]: {
        icon: <CloseCircleFilled className={`${styles.uploadIcon} ${styles.errorIcon}`} />,
        text: currentFile?.name || '-',
        removeButton: true,
      },
    };

    const currentConfig = stateConfig[uploadState];

    const uploadAreaClassName = [
      styles.uploadArea,
      uploadState !== UploadState.DEFAULT ? styles.hasFile : '',
      disabled ? styles.disabled : '',
      className || '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        className={uploadAreaClassName}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {currentConfig.icon}
        <p className={styles.text}>{currentConfig.text}</p>
        {currentConfig?.hint && <p className={styles.hint}>{currentConfig?.hint}</p>}
        {currentConfig?.removeButton && (
          <Button
            type="link"
            size="small"
            className={styles.removeButton}
            onClick={(e) => {
              e.stopPropagation();
              handleFileRemove();
            }}
            disabled={disabled}
          >
            移除
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttribute}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          disabled={disabled}
        />
      </div>
    );
  },
);

FileUpload.displayName = 'FileUpload';

export default FileUpload;

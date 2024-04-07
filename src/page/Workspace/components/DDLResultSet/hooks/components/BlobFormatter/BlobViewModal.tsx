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

import { generateSessionSid } from '@/common/network/pathUtil';
import { fetchResultCache, IDataFormmater } from '@/common/network/sql';
import ODCDragger from '@/component/OSSDragger2';
import { LobExt, RSModifyDataType } from '@/d.ts';
import login from '@/store/login';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { formatBytes, getBlobValueKey } from '@/util/utils';
import type { FormatterProps } from '@oceanbase-odc/ob-react-data-grid';
import { Alert, Button, Image, Input, Modal, Radio, Row, Space, Spin, Typography } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import Cookies from 'js-cookie';
import { inject, observer } from 'mobx-react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { getLocale } from '@umijs/max';
import ResultContext from '../../../ResultContext';
import HexEditor from '../HexEditor';
import styles from './index.less';

enum DISPLAY_MODE {
  TEXT,
  HEXTEXT,
  UPLOAD,
  IMG,
}

interface IProps {
  onCancel: () => void;
  column: FormatterProps['column'];
  row: Record<string, any>;
  settingStore?: SettingStore;
  onRowChange: (row: Readonly<any>) => void;
}

const maxTextSize = 1024 * 200;
// 文本查看最大 2M
const maxReadyonlyTextSize = 1024 * 1024 * 2;
const len = 500;

type Request = (offset: number) => Promise<{
  content: string;
  size: number;
}>;
type Callback = (res: { content: string; size: number }) => void;

const CreateFileLoader = (params: { request: Request; callback: Callback }) => {
  const { request, callback } = params;
  const contents = [];
  let offset = 0;
  let isFinish = false;
  let cancel = false;
  const fileLoader = async (fileSize: number = 0) => {
    if (cancel) {
      return;
    }
    if (offset !== 0 && (offset >= fileSize / 1024 || offset > maxReadyonlyTextSize / 1024)) {
      isFinish = true;
      return;
    }
    const res = await request(offset);
    const { content, size } = res;
    contents?.push({
      content: content,
      size,
    });

    if (offset === 0) {
      offset += len;
      fileLoader(size);
      callback(contents?.[0]);
    } else {
      requestIdleCallback(() => {
        offset += len;
        fileLoader(size);
        if (isFinish) {
          callback({
            content: contents?.map((item) => item?.content)?.join(''),
            size,
          });
        }
      });
    }
  };
  return {
    load: fileLoader,
    cancel: () => {
      cancel = true;
    },
  };
};

const BlobViewModal: React.FC<IProps> = (props) => {
  const { onCancel, onRowChange, column, row, settingStore } = props;
  const resultContext = useContext(ResultContext);
  const session = resultContext.session;
  const [mode, setMode] = useState<DISPLAY_MODE>(DISPLAY_MODE.TEXT);
  const [text, setText] = useState<string>();
  const [textSize, setTextSize] = useState<number>(0);
  const [file, setFile] = useState<UploadFile>();
  const [hexText, setHexText] = useState<string[]>();
  const [hexTextSize, setHexTextSize] = useState<number>(0);
  const [originValue, setOriginValue] = useState<string>();
  const [isImgLoading, setIsImgLoading] = useState<boolean>(false);
  const [imgUrl, setImgUrl] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const columnKey = resultContext.isColumnMode ? row.columnKey : column?.key;
  const columnName = resultContext.isColumnMode ? row.columnName : column?.name;
  let blobExt: LobExt;
  if (columnKey) {
    blobExt = row[getBlobValueKey(columnKey)];
  }

  const isOverSize = useMemo(() => {
    return textSize > maxTextSize || hexTextSize > maxTextSize;
  }, [textSize, hexTextSize]);

  let isModeEditable = ![DISPLAY_MODE.IMG].includes(mode);
  if (isOverSize && mode !== DISPLAY_MODE.UPLOAD) {
    isModeEditable = false;
  }

  const update = (data) => {
    const { content, size } = data;
    setTextSize(size);
    setText(content);
    setOriginValue(content);
  };

  const columnNumber = resultContext.originColumns.findIndex((originColumn) => {
    return originColumn.key === columnKey;
  });

  const request = (offset) => {
    return fetchResultCache(
      resultContext.sqlId,
      row._rowIndex,
      columnNumber,
      IDataFormmater.TEXT,
      resultContext.sessionId,
      len,
      offset,
      session?.database?.dbName,
    );
  };

  const fileLoader = CreateFileLoader({
    request,
    callback: update,
  });

  const updateData = async function () {
    if (row._created) {
      return;
    }
    setLoading(true);
    try {
      switch (mode) {
        case DISPLAY_MODE.TEXT: {
          if (blobExt?.type === RSModifyDataType.RAW) {
            setText(blobExt?.info);
            break;
          }
          if (text) {
            break;
          }
          fileLoader.load();
          break;
        }
        case DISPLAY_MODE.HEXTEXT: {
          if (blobExt?.type === RSModifyDataType.HEX) {
            setHexText(blobExt?.info?.split(' '));
            break;
          }
          if (hexText) {
            break;
          }
          const data = await fetchResultCache(
            resultContext.sqlId,
            row._rowIndex,
            columnNumber,
            IDataFormmater.HEX,
            resultContext.sessionId,
            maxTextSize / 1024,
            0,
            session?.database?.dbName,
          );

          setHexTextSize(data?.size);
          setHexText(data?.content?.split(' ').filter(Boolean));
          setOriginValue(data?.content);
          break;
        }
        case DISPLAY_MODE.IMG: {
          setIsImgLoading(true);
          const url = await resultContext.getDonwloadUrl(columnKey, row);
          setIsImgLoading(false);
          setImgUrl(url);
        }
        case DISPLAY_MODE.UPLOAD:
        default: {
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateData();
  }, [mode, column, row]);

  useEffect(() => {
    return () => {
      fileLoader.cancel();
    };
  }, []);

  function rendeContent() {
    switch (mode) {
      case DISPLAY_MODE.TEXT:
      case DISPLAY_MODE.HEXTEXT: {
        const maxSizeText = formatBytes(maxTextSize);
        const disabled = !isModeEditable || !resultContext.isEditing;
        return (
          <Spin spinning={loading}>
            <div style={{ display: 'flex', flexDirection: 'column', height: 500 }}>
              {isOverSize && resultContext.isEditing && (
                <Alert
                  style={{ width: '100%' }}
                  message={
                    formatMessage(
                      {
                        id: 'odc.components.BlobFormatter.BlobViewModal.TheSizeOfTheEditable',
                      },
                      { maxSizeText: maxSizeText },
                    ) //`可编辑的内容大小不能超过 ${maxSizeText}`
                  }
                />
              )}
              {mode === DISPLAY_MODE.HEXTEXT ? (
                <HexEditor
                  disabled={disabled}
                  value={hexText}
                  onChange={(v) => {
                    setHexText(v);
                  }}
                />
              ) : disabled ? (
                <div className={styles['contenttext-disabled']}>
                  <Typography.Text>{mode == DISPLAY_MODE.TEXT ? text : hexText}</Typography.Text>
                </div>
              ) : (
                <Input.TextArea
                  className={styles.contenttext}
                  style={{ resize: 'none', wordBreak: 'break-all' }}
                  autoSize={false}
                  value={mode == DISPLAY_MODE.TEXT ? text : hexText}
                  disabled={disabled}
                  onChange={(e) => {
                    if (mode === DISPLAY_MODE.TEXT) {
                      setText(e.target.value);
                    } else if (mode === DISPLAY_MODE.HEXTEXT) {
                      // setHexText(e.target.value);
                    }
                  }}
                />
              )}
            </div>
          </Spin>
        );
      }
      // case DISPLAY_MODE.HEXTEXT: {
      //   return <div style={{ display: 'flex', flexDirection: 'column', height: 500 }}>
      //     <HexEditor value={hexText} onChange={(v) => {}} />
      //   </div>
      // }
      case DISPLAY_MODE.IMG: {
        return (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin spinning={isImgLoading}>
              <Image
                fallback="data:image/png;base64,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"
                placeholder={true}
                style={{ maxWidth: 600, maxHeight: 500 }}
                src={imgUrl}
              />
            </Spin>
          </div>
        );
      }
      case DISPLAY_MODE.UPLOAD: {
        return (
          <ODCDragger
            uploadFileOpenAPIName="UploadObjectData"
            multiple={false}
            sessionId={resultContext.sessionId}
            maxCount={1}
            action={
              window.ODCApiHost +
              `/api/v2/datasource/sessions/${generateSessionSid(resultContext.sessionId)}/upload`
            }
            headers={{
              'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
              'Accept-Language': getLocale(),
              currentOrganizationId: login.organizationId?.toString(),
            }}
            onFileChange={(files) => {
              const file = files?.[0];
              if (file) {
                setFile(file);
              }
            }}
          >
            {formatMessage({
              id: 'odc.ImportDrawer.ImportForm.ClickOrDragTheFile',
            })}
          </ODCDragger>
        );
      }
    }
  }

  function renderFooter() {
    if (!resultContext.isEditing || !isModeEditable) {
      return null;
    }
    return (
      <Space>
        <Button onClick={onCancel}>
          {
            formatMessage({
              id: 'odc.components.BlobFormatter.BlobViewModal.Cancel',
            })
            /*取消*/
          }
        </Button>
        <Button
          type="primary"
          onClick={() => {
            let value;
            let type;
            switch (mode) {
              case DISPLAY_MODE.TEXT: {
                value = text;
                type = RSModifyDataType.RAW;
                break;
              }
              case DISPLAY_MODE.HEXTEXT: {
                value = hexText.join(' ');
                type = RSModifyDataType.HEX;
                break;
              }
              case DISPLAY_MODE.UPLOAD: {
                value = file?.response?.data;
                type = RSModifyDataType.FILE;
                break;
              }
              default: {
                return;
              }
            }

            onRowChange({
              ...row,
              [columnKey]: value,
              [getBlobValueKey(columnKey)]: new LobExt(value, type),
            });

            onCancel();
          }}
        >
          {
            formatMessage({
              id: 'odc.components.BlobFormatter.BlobViewModal.Ok',
            })
            /*确认*/
          }
        </Button>
      </Space>
    );
  }

  return (
    <Modal
      maskClosable={!resultContext.isEditing}
      width={720}
      title={columnName}
      open={true}
      centered
      onCancel={onCancel}
      footer={renderFooter()}
    >
      <Space style={{ width: '100%' }} direction="vertical">
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Radio.Group
            value={mode}
            onChange={(e) => {
              setFile(null);
              setMode(e.target.value);
            }}
          >
            <Radio.Button value={DISPLAY_MODE.TEXT}>
              {
                formatMessage({
                  id: 'odc.components.BlobFormatter.BlobViewModal.Text',
                })

                /* 文本 */
              }
            </Radio.Button>
            <Radio.Button value={DISPLAY_MODE.HEXTEXT}>
              {
                formatMessage({
                  id: 'odc.components.BlobFormatter.BlobViewModal.JinZhi',
                })

                /* 16 进制 */
              }
            </Radio.Button>
            <Radio.Button value={DISPLAY_MODE.IMG}>
              {
                formatMessage({
                  id: 'odc.components.BlobFormatter.BlobViewModal.Image',
                })
                /*图片*/
              }
            </Radio.Button>
            {resultContext.isEditing ? (
              <Radio.Button value={DISPLAY_MODE.UPLOAD}>
                {
                  formatMessage({
                    id: 'odc.components.BlobFormatter.BlobViewModal.ImportFiles',
                  })
                  /*导入文件*/
                }
              </Radio.Button>
            ) : null}
          </Radio.Group>
          {settingStore.enableDataExport && !row._created && (
            <a
              onClick={() => {
                resultContext.downloadObjectData?.(columnKey, row);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.BlobFormatter.BlobViewModal.DownloadObjects',
                })

                /* 下载文件 */
              }
            </a>
          )}
        </Row>
        <div style={{ height: 500 }}>{rendeContent()}</div>
      </Space>
    </Modal>
  );
};

export default inject('settingStore')(observer(BlobViewModal));

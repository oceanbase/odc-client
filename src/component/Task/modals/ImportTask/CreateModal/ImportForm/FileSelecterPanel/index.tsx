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

import { getImportUploadUrl } from '@/common/network';
import ODCDragger from '@/component/OSSDragger';
import { DbObjsIcon } from '@/constant';
import { ImportFormData, IMPORT_CONTENT, IMPORT_ENCODING, IMPORT_TYPE, DbObjectType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import Icon from '@ant-design/icons';
import { Form, FormInstance, message, Select, Tree, Upload } from 'antd';
import Cookies from 'js-cookie';
import React, { useContext, useEffect, useRef, useState } from 'react';
import CsvFormItem from '../formitem/CsvFormItem';
import {
  checkImportFile,
  getFileMIMETypeWithImportType,
  getFileTypeWithImportType,
  getSizeLimitTip,
} from '../helper';

import { DbObjectTypeTextMap } from '@/constant/label';
import login from '@/store/login';
import { isClient } from '@/util/env';
import { getLocale } from '@umijs/max';
import FormContext from '../FormContext';
import styles from './index.less';
import { selectFolder } from '@/util/client';
import { getImportFileMeta } from '@/common/network/exportAndImport';
import { rules } from '../../const';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps {
  isSingleImport: boolean;
  form: FormInstance<any>;
}
function getTiltleByFileType(fileType) {
  switch (fileType) {
    case IMPORT_TYPE.ZIP:
    case IMPORT_TYPE.CSV:
    case IMPORT_TYPE.SQL: {
      return formatMessage({
        id: 'odc.ImportDrawer.ImportForm.ClickOrDragTheFile',
        defaultMessage: '点击或将文件拖拽到这里上传',
      });
    }
    case IMPORT_TYPE.DIR: {
      return formatMessage({
        id: 'src.component.Task.ImportTask.CreateModal.ImportForm.FileSelecterPanel.051A8387',
        defaultMessage: '点击或将目录文件拖拽到这里上传',
      });
    }
  }
}
function getTipByFileType(fileType) {
  switch (fileType) {
    case IMPORT_TYPE.ZIP: {
      return formatMessage({
        id: 'odc.ImportForm.FileSelecterPanel.OnlyCompressedFilesExportedBy',
        defaultMessage: '仅支持上传由 ODC 导出的压缩文件，可批量导入数据或结构',
      });
      //仅支持上传由 ODC 导出的压缩文件，可批量导入数据或结构
    }
    case IMPORT_TYPE.CSV: {
      return formatMessage({
        id: 'odc.ImportForm.FileSelecterPanel.YouCanImportDataFrom',
        defaultMessage: '支持导入单表数据，可自定义映射字段',
      });
      //支持导入单表数据，可自定义映射字段
    }
    case IMPORT_TYPE.SQL: {
      return [
        getSizeLimitTip(),
        formatMessage({
          id: 'odc.ImportForm.FileSelecterPanel.TheFilesAreExecutedIn',
          defaultMessage: '文件将按磁盘顺序执行',
        }),
        //文件将按磁盘顺序执行
      ]
        .filter(Boolean)
        .join(',');
    }
    case IMPORT_TYPE.DIR: {
      return formatMessage({
        id: 'src.component.Task.ImportTask.CreateModal.ImportForm.FileSelecterPanel.272612BC',
        defaultMessage: '仅支持上传 ODC 导出的目录文件',
      });
    }
  }
}

const FileSelecterPanel: React.FC<IProps> = function ({ isSingleImport, form }) {
  const [ctoken, setCtoken] = useState('');
  const messageRef = useRef(false);
  const formContext = useContext(FormContext);
  useEffect(() => {
    const time = setInterval(() => {
      const newCtoken = Cookies.get('XSRF-TOKEN') || '';
      if (newCtoken != ctoken) {
        setCtoken(newCtoken);
      }
    }, 500);
    return () => {
      clearInterval(time);
    };
  });

  function beforeUpload(fileType, file, fileList: any[], silence?: boolean) {
    const type = file?.name?.split('.')?.pop();
    const allowedFileMIMEType = getFileMIMETypeWithImportType(fileType);
    if (!allowedFileMIMEType.includes(type)) {
      message.warning(
        formatMessage({
          id: 'src.component.Task.ImportTask.CreateModal.ImportForm.FileSelecterPanel.AC29DC3E',
          defaultMessage: '请上传指定文件格式的文件',
        }),
      );
      return Upload.LIST_IGNORE;
    }
    if (fileList.length > 50) {
      if (messageRef.current) {
        return Upload.LIST_IGNORE;
      }
      message.warning({
        content: formatMessage({
          id: 'odc.ImportDrawer.ImportForm.TooManyFilesAreUploaded',
          defaultMessage: '同时上传文件过多，单次最多选择 50 个文件',
        }),

        // 同时上传文件过多，单次最多选择 50 个文件
        onClose: () => {
          messageRef.current = false;
        },
      });

      messageRef.current = true;
      return Upload.LIST_IGNORE;
    }
    const isLimit = [...(form.getFieldValue('importFileName') || []), ...fileList].length > 500;
    if (isLimit) {
      notification.warn(
        formatMessage({
          id: 'odc.ImportDrawer.ImportForm.UpToObjectsCanBe',
          defaultMessage: '最多上传 500 个文件',
        }),

        // 最多上传 500 个文件
        false,
      );
    }
    return isLimit ? Upload.LIST_IGNORE : checkImportFile(file, fileList, silence);
  }

  const handleOpenFolderSelector = async (fileType: IMPORT_TYPE) => {
    const path = await selectFolder();
    if (!path) return;
    const response = await getImportFileMeta(path, fileType);
    formContext.updateFormData({
      importFileName: [
        {
          uid: Date.now(),
          name: path,
          status: response.errorCode ? 'error' : 'done',
          response: response.errorCode ? response.errorMessage : { data: response },
        },
      ],
    });
    handleImportFileChange(response);
  };

  const isDirImport = (fileType) => fileType === IMPORT_TYPE.DIR;

  const handleImportFileChange = (data) => {
    const { containsData, containsSchema } = data;
    if (containsData && containsSchema) {
      formContext.updateFormData({
        importContent: IMPORT_CONTENT.DATA_AND_STRUCT,
      });
    } else if (containsData) {
      formContext.updateFormData({
        importContent: IMPORT_CONTENT.DATA,
        replaceSchemaWhenExists: false,
      });
    } else if (containsSchema) {
      formContext.updateFormData({
        importContent: IMPORT_CONTENT.STRUCT,
      });
    } else {
      return;
    }
  };
  return (
    <>
      <FormItem
        label={formatMessage({
          id: 'odc.ImportDrawer.ImportForm.ImportFormat',
          defaultMessage: '导入文件格式',
        })}
        name="fileType"
        rules={rules.fileType}
      >
        <Select style={{ width: 152 }}>
          <Option key={IMPORT_TYPE.ZIP} value={IMPORT_TYPE.ZIP}>
            {
              formatMessage({
                id: 'odc.ImportDrawer.ImportForm.ZipCompressedFiles',
                defaultMessage: 'ZIP 压缩文件',
              })

              /* ZIP 压缩文件 */
            }
          </Option>
          <Option key={IMPORT_TYPE.CSV} value={IMPORT_TYPE.CSV}>
            {
              formatMessage({
                id: 'odc.ImportDrawer.ImportForm.CsvFile',
                defaultMessage: 'CSV 文件',
              })

              /* CSV 文件 */
            }
          </Option>
          {!isSingleImport && (
            <Option key={IMPORT_TYPE.SQL} value={IMPORT_TYPE.SQL}>
              {
                formatMessage({
                  id: 'odc.ImportDrawer.ImportForm.SqlFile.1',
                  defaultMessage: 'SQL 文件',
                })

                /* SQL 文件 */
              }
            </Option>
          )}

          {isClient() && (
            <Option key={IMPORT_TYPE.DIR} value={IMPORT_TYPE.DIR}>
              {formatMessage({
                id: 'src.component.Task.ImportTask.CreateModal.ImportForm.FileSelecterPanel.D738185C',
                defaultMessage: '目录文件',
              })}
            </Option>
          )}
        </Select>
      </FormItem>
      <FormItem
        label={formatMessage({
          id: 'odc.ImportDrawer.ImportForm.ImportFiles',
          defaultMessage: '导入文件',
        })}
        shouldUpdate
      >
        {({ getFieldValue }) => {
          const fileType = getFieldValue('fileType');
          const multipleUpload = fileType === IMPORT_TYPE.SQL;
          return (
            <FormItem
              noStyle
              label={formatMessage({
                id: 'odc.ImportDrawer.ImportForm.ImportFiles',
                defaultMessage: '导入文件',
              })}
              name="importFileName"
              rules={rules.importFileName}
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (!e.fileList?.length) {
                  return [];
                }
                e.fileList.forEach((item) => {
                  const { response, status } = item;
                  if (status === 'done') {
                    if (!response?.data?.fileName) {
                      item.response = response?.data?.errorMessage;
                      item.status = 'error';
                    } else if (!response?.data?.containsData && !response?.data?.containsSchema) {
                      item.response = formatMessage({
                        id: 'odc.ImportForm.FileSelecterPanel.TheFileHasNoContent',
                        defaultMessage: '该文件无内容',
                      }); //该文件无内容
                      item.status = 'error';
                    }
                  }
                });
                if (multipleUpload) {
                  return e.fileList;
                }
                return e.fileList?.slice(e.fileList?.length - 1);
              }}
            >
              <ODCDragger
                // @ts-ignore
                beforeUpload={(...args) => beforeUpload(fileType, ...args)}
                clientMode={isClient()}
                uploadFileOpenAPIName="UploadTransferFile"
                accept={getFileTypeWithImportType(fileType)}
                multiple={multipleUpload}
                name="file"
                headers={{
                  'X-XSRF-TOKEN': ctoken || '',
                  'Accept-Language': getLocale(),
                  currentOrganizationId: login.organizationId?.toString(),
                }}
                onChange={(info) => {
                  const file = info.fileList?.[0];
                  if (['success', 'done'].includes(file?.status)) {
                    /**
                     * 文件状态改变，需要更新数据
                     */
                    handleImportFileChange(file.response?.data);
                  }
                }}
                action={getImportUploadUrl()}
                openFileDialogOnClick={isDirImport(fileType) ? false : true}
              >
                <div
                  onClick={isDirImport(fileType) ? () => handleOpenFolderSelector(fileType) : null}
                  className={styles.fileImportUpload}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-color-primary)',
                      lineHeight: '20px',
                    }}
                  >
                    {getTiltleByFileType(fileType)}
                  </p>
                  <p
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: 'var(--text-color-hint)',
                      lineHeight: '20px',
                    }}
                  >
                    {getTipByFileType(fileType)}
                  </p>
                  {!isDirImport(fileType) && (
                    <p
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        color: 'var(--text-color-hint)',
                        lineHeight: '20px',
                      }}
                    >
                      {formatMessage({
                        id: 'odc.ImportDrawer.ImportForm.SupportedExtensions',
                        defaultMessage: '支持扩展名：',
                      })}

                      {getFileTypeWithImportType(fileType)}
                    </p>
                  )}
                </div>
              </ODCDragger>
            </FormItem>
          );
        }}
      </FormItem>
      <FormItem noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const importObjects = (
            getFieldValue('importFileName') as ImportFormData['importFileName']
          )?.[0]?.response?.data?.importObjects;
          if (importObjects) {
            const data = Object.entries(importObjects).map(([dataType, list]) => {
              const ObjIcon = DbObjsIcon[dataType];
              let icon = null;
              if (ObjIcon) {
                icon = <Icon component={ObjIcon} />;
              }
              return {
                title: DbObjectTypeTextMap(dataType as DbObjectType) + `(${list?.length})`,
                key: dataType,
                icon,
                children: list?.map((name) => {
                  return {
                    title: name,
                    icon,
                    key: dataType + '$' + name,
                  };
                }),
              };
            });
            if (!data.length) {
              return null;
            }
            return (
              <FormItem
                required={false}
                label={formatMessage({
                  id: 'odc.ImportForm.FileSelecterPanel.ImportObjectPreview',
                  defaultMessage: '导入对象预览',
                })}
                /*导入对象预览*/ shouldUpdate
              >
                <div className={styles.fileImportFiles}>
                  <Tree
                    defaultExpandAll
                    showIcon
                    height={300}
                    autoExpandParent
                    selectable={false}
                    treeData={data}
                  />
                </div>
              </FormItem>
            );
          }
        }}
      </FormItem>
      <FormItem
        label={formatMessage({
          id: 'odc.ImportDrawer.ImportForm.FileEncoding',
          defaultMessage: '文件编码',
        })}
        name="encoding"
        rules={rules.encoding}
      >
        <Select style={{ width: 152 }}>
          {Object.entries(IMPORT_ENCODING).map(([text, value]) => {
            return (
              <Option value={value} key={value}>
                {text}
              </Option>
            );
          })}
        </Select>
      </FormItem>
      <CsvFormItem />
    </>
  );
};

export default FileSelecterPanel;

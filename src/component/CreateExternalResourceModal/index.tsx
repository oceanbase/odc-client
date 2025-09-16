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

import { Modal, Form, Input, Button, message, AutoComplete, Row, Col } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import React, { useState, useEffect, useRef } from 'react';
import { inject, observer } from 'mobx-react';
import { ModalStore } from '@/store/modal';
import { useDBSession } from '@/store/sessionManager/hooks';
import { getCurrentOrganizationId } from '@/store/setting';
import FileUpload, { FileUploadRef } from '../FileUpload';
import { createExternalResource } from '@/common/network';

const { TextArea } = Input;

interface IProps {
  modalStore?: ModalStore;
}

const CreateExternalResourceModal: React.FC<IProps> = ({ modalStore }) => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileUploadRef = useRef<FileUploadRef>(null);

  const { createExternalResourceModalVisible, createExternalResourceModalData } = modalStore;
  const databaseId = createExternalResourceModalData?.databaseId;
  const dbName = createExternalResourceModalData?.dbName;
  const { session } = useDBSession(databaseId);
  const organizationId = getCurrentOrganizationId();

  // 资源类型选项
  const resourceTypeOptions = [
    { value: 'JAVA_JAR', label: 'JAVA_JAR' },
    { value: 'PYTHON_PY', label: 'PYTHON_PY' },
  ];

  useEffect(() => {
    if (createExternalResourceModalVisible) {
      // 初始化表单
      form.resetFields();
      setFileList([]);
      setSelectedFile(null);
    }
  }, [createExternalResourceModalVisible, form]);

  // 上传文件并创建外部资源
  const uploadFileAndCreateResource = async (file: File, values: any): Promise<void> => {
    if (!session) {
      throw new Error('会话信息不存在');
    }

    const { sessionId } = session;
    const { resourceName, resourceType, description } = values;
    const databaseName = dbName || session.database?.dbName;

    // 构建 FormData
    const formData = new FormData();
    formData.append('file', file);

    // 构建 req参数
    const reqData = {
      schemaName: databaseName,
      name: file.name,
      comment: description,
      type: resourceType,
    };

    const reqBlob = new Blob([JSON.stringify(reqData)], { type: 'application/json' });
    formData.append('req', reqBlob);

    await createExternalResource({ formData, sessionId, databaseName, resourceName });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedFile) {
        message.error('请选择文件');
        return;
      }

      setUploading(true);

      // 上传文件并创建外部资源
      await uploadFileAndCreateResource(selectedFile, values);
      message.success('创建成功');
      if (session?.database?.getExternalResourceList) {
        await session.database.getExternalResourceList();
      }

      handleCancel();
    } catch (error) {
      console.error('创建外部资源失败:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    modalStore.changeCreateExternalResourceModalVisible(false);
  };

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList.slice(-1)); // 只保留最后一个文件
  };

  const handleFileRemove = () => {
    setFileList([]);
    setSelectedFile(null);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    fileList,
    onChange: handleFileChange,
    onRemove: handleFileRemove,
    beforeUpload: (file: File) => {
      const isValidType =
        file.name.endsWith('.jar') || file.name.endsWith('.py') || file.name.endsWith('.zip');
      if (!isValidType) {
        message.error('仅支持 .jar、.py、.zip 文件');
        return false;
      }

      const isLt512M = file.size / 1024 / 1024 < 512;
      if (!isLt512M) {
        message.error('文件大小必须小于 512MB');
        return false;
      }

      return false; // 阻止自动上传，我们手动控制
    },
    showUploadList: false,
  };

  return (
    <Modal
      title="新建外部资源"
      width={720}
      open={createExternalResourceModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={uploading} onClick={handleSubmit}>
          确定
        </Button>,
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          resourceName: '',
          resourceType: '',
          description: '',
        }}
        requiredMark="optional"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="资源名称"
              name="resourceName"
              rules={[
                {
                  required: true,
                  message: '请输入资源名称',
                },
                {
                  validator: (rule, value, callback) => {
                    if (value.length > 128) {
                      callback('不超过 128 个字符');
                    }
                    callback();
                  },
                },
              ]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="资源类型"
              name="resourceType"
              rules={[
                {
                  required: true,
                  message: '请输入或选择资源类型',
                },
              ]}
            >
              <AutoComplete
                options={resourceTypeOptions}
                placeholder="请输入或选择"
                filterOption={(inputValue, option) =>
                  option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="上传文件"
          required
          rules={[
            {
              validator: (rule, value, callback) => {
                if (value.size > 512 * 1024 * 1024) {
                  return Promise.reject('文件不能大于 512 MB');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <FileUpload
            ref={fileUploadRef}
            accept={['.jar', '.py', '.zip']}
            maxSize={512}
            uploadText="点击或拖拽文件到此区域选择"
            hintText="支持 .jar, .py, .zip文件，最大 512MB"
            onSuccess={(file) => {
              setSelectedFile(file);
              message.success(`文件 ${file.name} 选择成功`);
            }}
            onError={(file, error) => {
              message.error(`文件验证失败: ${error}`);
              setSelectedFile(null);
            }}
            onRemove={() => {
              setSelectedFile(null);
            }}
          />
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
          required
          rules={[{ required: true, message: '请输入描述' }]}
        >
          <TextArea rows={3} placeholder="请输入" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default inject('modalStore')(observer(CreateExternalResourceModal));

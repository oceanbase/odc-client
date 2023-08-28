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

import OSSUpload from '@/component/OSSDragger/Upload';
import login from '@/store/login';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { getLocale } from '@umijs/max';
import { message } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import SideTabs from '../components/SideTabs';
import ScriptFile from './ScriptFile';
import Snippet from './Snippet';
import tracert from '@/util/tracert';

const Script: React.FC<{}> = function () {
  const snippetRef = useRef(null);

  const uploadRef = useRef<HTMLSpanElement>(null);

  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  async function updateFile() {}

  function checkImportFile(file) {
    const { size } = file;
    if (size <= setting.serverSystemInfo?.maxScriptUploadLength) {
      return true;
    }
    message.error(
      formatMessage({
        id: 'odc.components.OBClientPage.ScriptManageModal.TheSizeOfTheUploaded',
      }),

      // 上传文件大小不能超出限制
    );
    return false;
  }
  useEffect(() => {
    tracert.expo('a3112.b41896.c330989');
  }, []);
  return (
    <>
      <div style={{ display: 'none', pointerEvents: 'none' }}>
        <OSSUpload
          showUploadList={false}
          name="file"
          multiple={true}
          beforeUpload={(file) => {
            return checkImportFile(file);
          }}
          headers={{
            'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
            'Accept-Language': getLocale(),
            currentOrganizationId: login.organizationId?.toString(),
          }}
          action={window.ODCApiHost + `/api/v2/script/scripts/batchUpload`}
          accept=".sql, .pl, .txt"
          fileList={uploadFiles}
          onChange={(info) => {
            if (info.fileList.find((file) => file.status === 'done')) {
              login.scriptStore.getScriptList();
            }
            setUploadFiles(info.fileList.filter((file) => file.status !== 'done'));
          }}
          uploadFileOpenAPIName="UploadScript"
        >
          <span ref={uploadRef}>a</span>
        </OSSUpload>
      </div>
      <SideTabs
        tabs={[
          {
            title: formatMessage({ id: 'odc.SideBar.Script.Script' }), //脚本
            key: 'script',
            actions: [
              {
                title: formatMessage({ id: 'odc.SideBar.Script.UploadScript' }), //上传脚本
                key: 'upload',
                onClick() {
                  tracert.click('a3112.b41896.c330989.d367625');
                  uploadRef.current?.click();
                },
                icon: UploadOutlined,
              },
              {
                title: formatMessage({ id: 'odc.SideBar.Script.Refresh' }), //刷新
                key: 'reload',
                onClick() {
                  return login.scriptStore.getScriptList();
                },
                icon: ReloadOutlined,
              },
            ],

            render() {
              return <ScriptFile uploadFiles={uploadFiles} setUploadFiles={setUploadFiles} />;
            },
          },
          {
            title: formatMessage({ id: 'odc.SideBar.Script.CodeSnippet' }), //代码片段
            key: 'snippet',
            actions: [
              {
                title: formatMessage({ id: 'odc.SideBar.Script.CreateACodeSnippet' }), //新建代码片段
                key: 'add',
                onClick() {
                  tracert.click('a3112.b41896.c330989.d367626');
                  snippetRef.current?.newSnippet();
                },
                icon: PlusOutlined,
              },
              {
                title: formatMessage({ id: 'odc.SideBar.Script.Refresh' }), //刷新
                key: 'reload',
                onClick() {
                  snippetRef.current?.reload();
                },
                icon: ReloadOutlined,
              },
            ],

            render() {
              return <Snippet ref={snippetRef} />;
            },
          },
        ]}
      />
    </>
  );
};

export default Script;

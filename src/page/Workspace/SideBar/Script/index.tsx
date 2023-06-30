import login from '@/store/login';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { getLocale } from '@umijs/max';
import { message, Upload } from 'antd';
import { UploadFile } from 'antd/es/upload/interface';
import Cookies from 'js-cookie';
import React, { useRef, useState } from 'react';
import SideTabs from '../components/SideTabs';
import ScriptFile from './ScriptFile';
import Snippet from './Snippet';

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
  return (
    <>
      <div style={{ display: 'none' }}>
        <Upload
          showUploadList={false}
          name="file"
          multiple={true}
          beforeUpload={(file) => {
            return checkImportFile(file);
          }}
          headers={{
            'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
            'Accept-Language': getLocale(),
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
        >
          <span ref={uploadRef}>a</span>
        </Upload>
      </div>
      <SideTabs
        tabs={[
          {
            title: '脚本',
            key: 'script',
            actions: [
              {
                title: '上传脚本',
                key: 'upload',
                onClick() {
                  uploadRef.current?.click();
                },
                icon: UploadOutlined,
              },
              {
                title: '刷新',
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
            title: '代码片段',
            key: 'snippet',
            actions: [
              {
                title: '新建代码片段',
                key: 'add',
                onClick() {
                  snippetRef.current?.newSnippet();
                },
                icon: PlusOutlined,
              },
              {
                title: '刷新',
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

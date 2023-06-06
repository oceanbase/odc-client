import { PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';
import SideTabs from '../components/SideTabs';
import ScriptFile from './ScriptFile';
import Snippet from './Snippet';

const Script: React.FC<{}> = function () {
  const snippetRef = useRef(null);
  return (
    <>
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
                  console.log('upload');
                },
                icon: UploadOutlined,
              },
              {
                title: '刷新',
                key: 'reload',
                onClick() {
                  console.log('reload');
                },
                icon: ReloadOutlined,
              },
            ],
            render() {
              return <ScriptFile />;
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

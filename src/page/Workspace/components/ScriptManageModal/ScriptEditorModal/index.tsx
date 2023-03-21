import { getScript, updateScript as updateRemoteScript } from '@/common/network';
import CommonIDE from '@/component/CommonIDE';
import { getLanguageFromConnectType } from '@/component/SQLCodeEditor/helper';
import { ConnectionStore } from '@/store/connection';
import { updatePageByScriptId } from '@/store/helper/page';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Form, Input, Modal, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './index.less';

interface IProps {
  visible: boolean;
  scriptId: string;
  connectionStore?: ConnectionStore;
  onClose: () => void;
  onOk: () => void;
}

const ScriptEditorModal: React.FC<IProps> = function ({
  connectionStore,
  scriptId,
  visible,
  onClose: propOnClose,
  onOk,
}) {
  const [script, setScript] = useState(null);
  const [scriptKey, setScriptKey] = useState(0);
  const [changed, setChanged] = useState(false);
  const [form] = Form.useForm();
  const connectType = connectionStore?.connection?.type;
  useEffect(() => {
    if (visible) {
      setChanged(false);
    }
  }, [visible]);
  const onClose = useCallback(() => {
    if (changed) {
      Modal.confirm({
        content: formatMessage({
          id: 'odc.ScriptManageModal.ScriptEditorModal.TheCurrentOperationIsNot',
        }), //当前的操作未保存，确定要关闭窗口吗?
        title: formatMessage({
          id: 'odc.ScriptManageModal.ScriptEditorModal.CloseWindow',
        }), //关闭窗口
        onOk: () => {
          propOnClose();
        },
      });
    } else {
      propOnClose();
    }
  }, [propOnClose, changed]);
  const onSave = async function () {
    // save
    const values = await form.validateFields();
    if (!values) {
      return;
    }
    const file = await updateRemoteScript(scriptId, script.scriptText, values.scriptName);

    if (file) {
      updatePageByScriptId(
        file.id,
        {
          title: script.scriptName,
          isSaved: true,
        },

        {
          scriptText: script.scriptText,
          scriptName: script.scriptName,
          scriptId: scriptId,
        },
      );

      setChanged(false);
      onOk();
    }
  };
  async function updateScript() {
    if (!scriptId) {
      return;
    }
    const file = await getScript(scriptId);
    setScript({
      scriptText: file.content,
      scriptName: file.scriptMeta.objectName,
    });

    setScriptKey(scriptKey + 1);
    form.setFieldsValue({
      scriptText: file.content,
      scriptName: file.scriptMeta.objectName,
    });
  }

  useEffect(() => {
    //get script
    updateScript();
  }, [scriptId]);

  const editorLang = getLanguageFromConnectType(connectType);
  const scriptName = script?.scriptName;
  return (
    <Drawer
      width={520}
      destroyOnClose
      visible={visible}
      title={
        formatMessage(
          {
            id: 'odc.ScriptManageModal.ScriptEditorModal.EditScriptScriptname',
          },

          { scriptName: scriptName },
        )
        //`编辑脚本(${scriptName})`
      }
      onClose={onClose}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>
            {
              formatMessage({
                id: 'odc.ScriptManageModal.ScriptEditorModal.Cancel',
              })

              /*取消*/
            }
          </Button>
          <Button type="primary" onClick={onSave}>
            {
              formatMessage({
                id: 'odc.ScriptManageModal.ScriptEditorModal.Save',
              })

              /*保存*/
            }
          </Button>
        </Space>
      }
    >
      <Form
        onValuesChange={() => {
          setChanged(true);
        }}
        layout="vertical"
        form={form}
        initialValues={script}
      >
        <Form.Item
          name="scriptName"
          label={formatMessage({
            id: 'odc.ScriptManageModal.ScriptEditorModal.ScriptName',
          })}

          /*脚本名称*/
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage({
            id: 'odc.ScriptManageModal.ScriptEditorModal.ScriptContent',
          })}
          /*脚本内容*/
          name="scriptText"
          style={{ height: 500 }}
          className={styles.sqlContent}
        >
          <CommonIDE
            key={scriptKey}
            bordered
            initialSQL={script?.scriptText}
            language={editorLang}
            onSQLChange={(sql) => {
              !changed && setChanged(true);
              setScript(Object.assign({}, script, { scriptText: sql }));
            }}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default inject('connectionStore')(observer(ScriptEditorModal));

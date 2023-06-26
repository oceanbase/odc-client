import { getScript, updateScript as updateRemoteScript } from '@/common/network';
import CommonIDE from '@/component/CommonIDE';
import { updatePageByScriptId } from '@/store/helper/page';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Form, Input, Modal, Space, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './index.less';

interface IProps {
  visible: boolean;
  scriptId: string;
  onClose: () => void;
  onOk: () => void;
}

const ScriptEditorModal: React.FC<IProps> = function ({
  scriptId,
  visible,
  onClose: propOnClose,
  onOk,
}) {
  const [script, setScript] = useState(null);
  const [scriptKey, setScriptKey] = useState(0);
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
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
    setLoading(true);
    try {
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    //get script
    updateScript();
  }, [scriptId]);

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
      <Spin spinning={loading}>
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
            style={{ height: 500 }}
            className={styles.sqlContent}
          >
            <div style={{ height: 500 }}>
              <CommonIDE
                session={null}
                key={scriptKey}
                bordered
                initialSQL={script?.scriptText}
                language={'sql'}
                onSQLChange={(sql) => {
                  !changed && setChanged(true);
                  setScript(Object.assign({}, script, { scriptText: sql }));
                }}
              />
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </Drawer>
  );
};

export default ScriptEditorModal;

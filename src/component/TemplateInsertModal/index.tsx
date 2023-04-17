import { getTableInfo } from '@/common/network/table';
import { getView } from '@/common/network/view';
import { DragInsertTypeText } from '@/constant/label';
import { DbObjectType, DragInsertType } from '@/d.ts/index';
import type { ModalStore } from '@/store/modal';
import sessionManager from '@/store/sessionManager';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { getQuoteTableName } from '@/util/utils';
import { Button, Checkbox, message, Modal, Radio, Space } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import copy from 'copy-to-clipboard';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';

export const CLOSE_INSERT_PROMPT_KEY = 'CLOSE_INSERT_PROMPT';

function escape(str: string) {
  return str?.replace(/\$/gi, '\\$');
}

interface IProps {
  modalStore?: ModalStore;
  visible: boolean;
  name: string;
  type: DbObjectType;
  settingStore?: SettingStore;
  onClose: () => void;
  onOk: (insertText: string) => void;
}

const TemplateInsertModal: React.FC<IProps> = function (props) {
  const { visible, name, type, settingStore, onClose, onOk, modalStore } = props;
  const [value, setValue] = useState(DragInsertType.NAME);
  const [closePrompt, setClosePrompt] = useState(false);

  const handleChange = (e: CheckboxChangeEvent) => {
    setClosePrompt(e.target.checked);
  };

  const handleClose = () => {
    setClosePrompt(false);
    onClose();
  };

  const handleOk = async () => {
    const text = await getCopyText(
      name,
      type,
      value,
      true,
      sessionManager.getMasterSession()?.sessionId,
    );
    localStorage.setItem(CLOSE_INSERT_PROMPT_KEY, String(closePrompt));
    onOk(text);
    if (closePrompt) {
      message.success(
        <>
          {
            formatMessage({
              id: 'odc.component.TemplateInsertModal.TheGenerationIsSuccessfulAnd',
            }) /*生成成功，且下次拖放将不再提示，可前往*/
          }

          <Button
            type="link"
            size="small"
            onClick={() => {
              modalStore.changeUserConfigModal(true);
            }}
          >
            {
              formatMessage({
                id: 'odc.component.TemplateInsertModal.PersonalSettings',
              }) /*个人设置*/
            }
          </Button>
          {
            formatMessage({
              id: 'odc.component.TemplateInsertModal.ModifyTheGeneratedStatementType',
            }) /*修改生成语句类型*/
          }
        </>,
      );
    }
  };

  useEffect(() => {
    if (visible) {
      setValue(settingStore.configurations['sqlexecute.defaultObjectDraggingOption']);
    }
  }, [visible, settingStore.configurations]);

  return (
    <Modal
      title={
        formatMessage({
          id: 'odc.component.TemplateInsertModal.FastGeneration',
        }) + //快速生成
        `(${name})`
      }
      width={380}
      visible={visible}
      onCancel={handleClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Checkbox checked={closePrompt} onChange={handleChange}>
            {
              formatMessage({
                id: 'odc.component.TemplateInsertModal.NoMorePromptInThe',
              }) /*以后不再提示*/
            }
          </Checkbox>
          <div>
            <Button onClick={handleClose}>
              {
                formatMessage({
                  id: 'odc.component.TemplateInsertModal.Cancel',
                }) /*取消*/
              }
            </Button>
            <Button type="primary" onClick={handleOk}>
              {
                formatMessage({
                  id: 'odc.component.TemplateInsertModal.Ok',
                }) /*确定*/
              }
            </Button>
          </div>
        </div>
      }
    >
      <Space direction="vertical">
        {
          formatMessage({
            id: 'odc.component.TemplateInsertModal.WhenYouDragAndDrop',
          }) /*选择对象进行拖放时，可在 SQL 窗口快速生成：*/
        }

        <Radio.Group
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        >
          <Space direction="vertical">
            <Radio value={DragInsertType.NAME}>{DragInsertTypeText[DragInsertType.NAME]}</Radio>
            <Radio value={DragInsertType.SELECT}>{DragInsertTypeText[DragInsertType.SELECT]}</Radio>
            <Radio value={DragInsertType.INSERT}>{DragInsertTypeText[DragInsertType.INSERT]}</Radio>
            <Radio value={DragInsertType.UPDATE}>{DragInsertTypeText[DragInsertType.UPDATE]}</Radio>
            <Radio value={DragInsertType.DELETE}>{DragInsertTypeText[DragInsertType.DELETE]}</Radio>
          </Space>
        </Radio.Group>
      </Space>
    </Modal>
  );
};

export default inject('settingStore', 'modalStore')(observer(TemplateInsertModal));

async function getColumns(type: DbObjectType, name: string, sessionId: string) {
  const dbSession = sessionManager.sessionMap.get(sessionId);
  const dbName = dbSession?.database?.dbName;
  switch (type) {
    case DbObjectType.table: {
      return (
        (await getTableInfo(name, dbName, sessionId))?.columns
          ?.map((column) => {
            return getQuoteTableName(column.name);
          })
          .join(', ') || ''
      );
    }
    case DbObjectType.view: {
      return (
        (await getView(name, sessionId, dbName))?.columns
          ?.map((column) => {
            return getQuoteTableName(column.columnName);
          })
          .join(', ') || ''
      );
    }
  }

  return '';
}

export async function getCopyText(
  name: string,
  objType: DbObjectType,
  copyType: DragInsertType,
  isEscape: boolean = false,
  sessionId: string,
) {
  const _escape = isEscape
    ? escape
    : function (b) {
        return b;
      };
  switch (copyType) {
    case DragInsertType.NAME: {
      return _escape(name);
    }
    case DragInsertType.SELECT: {
      return _escape(
        'SELECT ' +
          (await getColumns(objType, name, sessionId)) +
          ' FROM ' +
          getQuoteTableName(name) +
          ';',
      );
    }
    case DragInsertType.INSERT: {
      return (
        '<com.oceanbase.odc.snippet>' +
        'INSERT INTO ' +
        _escape(getQuoteTableName(name)) +
        '(' +
        _escape(await getColumns(objType, name, sessionId)) +
        ') VALUES(${1:expr}, ${2:expr});' +
        '</com.oceanbase.odc.snippet>'
      );
    }
    case DragInsertType.DELETE: {
      return (
        '<com.oceanbase.odc.snippet>' +
        'DELETE FROM ' +
        _escape(getQuoteTableName(name)) +
        ' WHERE ${1:where_condition};' +
        '</com.oceanbase.odc.snippet>'
      );
    }
    case DragInsertType.UPDATE: {
      return (
        '<com.oceanbase.odc.snippet>' +
        'UPDATE ' +
        _escape(getQuoteTableName(name)) +
        ' SET ${1:col_name1=expr1} WHERE ${2:where_condition};' +
        '</com.oceanbase.odc.snippet>'
      );
    }
    default: {
      return '';
    }
  }
}

export async function copyObj(
  name: string,
  objType: DbObjectType,
  copyType: DragInsertType,
  sessionId: string,
) {
  const text = await getCopyText(name, objType, copyType, false, sessionId);
  copy(text);
  message.success(
    formatMessage({
      id: 'odc.component.TemplateInsertModal.CopiedSuccessfully',
    }), //复制成功
  );
}

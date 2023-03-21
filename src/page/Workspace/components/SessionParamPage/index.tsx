import { IConnectionProperty } from '@/d.ts';
import { ConnectionPropertyType, ConnectionStore } from '@/store/connection';
import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { Layout, Radio, Space } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';
import { inject, observer } from 'mobx-react';
import { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'umi';
import { RowType } from '../EditableTable';
import styles from './index.less';
import SessionParamsTable from './SessionParamsTable';
const { Content } = Layout;

interface IRowConnectionProperty extends RowType, IConnectionProperty {}

function SessionParamPage(props: {
  settingStore: SettingStore;
  connectionStore?: ConnectionStore;
  onSetUnsavedModalTitle: (title: string) => void;
  onSetUnsavedModalContent: (title: string) => void;
}) {
  const { settingStore, connectionStore, onSetUnsavedModalTitle, onSetUnsavedModalContent } = props;
  const [connectionPropertyType, setConnectionPropertyType] = useState(
    ConnectionPropertyType.SESSION,
  );

  /**
   * 初始化
   */
  useEffect(() => {
    onSetUnsavedModalTitle(
      formatMessage({
        id: 'workspace.window.session.modal.sql.close.title',
      }),
    );

    onSetUnsavedModalContent(
      formatMessage({
        id: 'workspace.window.session.modal.sql.close.content',
      }),
    );
  }, []);

  const handleChangePropertyType = useCallback(async (e: RadioChangeEvent) => {
    setConnectionPropertyType(e.target.value);
  }, []);

  return (
    <>
      <Content
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <header className={styles.header}>
          <Space>
            <Radio.Group
              onChange={handleChangePropertyType}
              value={connectionPropertyType}
              style={{
                fontSize: '12px',
              }}
            >
              <Radio.Button value="session">
                <FormattedMessage id="workspace.window.session.params" />
              </Radio.Button>
              <Radio.Button value="global">
                <FormattedMessage id="workspace.window.session.globalParams" />
              </Radio.Button>
            </Radio.Group>
          </Space>
        </header>
        <div style={{ flexGrow: 1 }}>
          <SessionParamsTable
            tip={
              connectionPropertyType === ConnectionPropertyType.SESSION &&
              settingStore.enableMultiSession
                ? formatMessage({
                    id: 'odc.components.SessionParamPage.ThisSessionVariableDoesNot',
                  })
                : null
            }
            sessionId={connectionStore.sessionId}
            connectionPropertyType={connectionPropertyType}
          />
        </div>
      </Content>
    </>
  );
}

export default inject(
  'sqlStore',
  'connectionStore',
  'pageStore',
  'settingStore',
)(observer(SessionParamPage));

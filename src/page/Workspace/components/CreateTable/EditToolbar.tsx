import { formatMessage } from '@/util/intl';
import { Button, Space } from 'antd';
import React, { useRef } from 'react';

interface IProps {
  modified: boolean;
  onCancel?: () => void;
  onOk?: () => void;
}

const EditToolbar: React.FC<IProps> = function (props) {
  const { children, modified, onCancel, onOk } = props;
  const aRef = useRef<HTMLAnchorElement>();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 12,
        background: 'var(--background-secondry-color)',
        height: '100%',
      }}
    >
      {children}
      <div>
        {modified ? (
          <Space>
            <Button onClick={onCancel}>
              {
                formatMessage({
                  id: 'odc.components.CreateTable.EditToolbar.Cancel',
                }) /*取消*/
              }
            </Button>
            <a
              ref={aRef}
              style={{ display: 'none' }}
              onClick={() => {
                props.onOk();
              }}
            />
            <Button
              type="primary"
              onClick={() => {
                setTimeout(() => {
                  /**
                   * 这里要增加一个延迟触发click的功能，以此来保证editor正在编辑的数据已经被提交了
                   */
                  aRef.current.click();
                }, 200);
              }}
            >
              {
                formatMessage({
                  id: 'odc.components.CreateTable.EditToolbar.NextStepConfirmSql',
                }) /*下一步：确认 SQL*/
              }
            </Button>
          </Space>
        ) : null}
      </div>
    </div>
  );
};

export default EditToolbar;

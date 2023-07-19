import { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import React from 'react';
export function getConfirmTitle(isRollback?: boolean) {
  const text = isRollback
    ? formatMessage({ id: 'odc.component.SubmitConfirm.Rollback' }) //回滚
    : formatMessage({ id: 'odc.component.SubmitConfirm.Submitted' }); //提交
  return (
    <div
      style={{
        lineHeight: '20px',
        color: 'var(--text-color-secondary)',
      }}
    >
      <div
        style={{
          color: 'var(--text-color-primary)',
          fontFamily: 'PingFangSC-Semibold',
        }}
      >
        {
          formatMessage(
            {
              id: 'odc.component.SubmitConfirm.ConfirmTheTextCurrentTransaction',
            },
            { text: text },
          ) /*确认{text}当前事务？*/
        }
      </div>
      <div>
        <div>
          {
            formatMessage({
              id: 'odc.component.SubmitConfirm.TheCurrentConnectionUsesA',
            }) /*当前连接采用共享session，*/
          }
        </div>
        {text}
        {
          formatMessage({
            id: 'odc.component.SubmitConfirm.TheOperationTakesEffectFor',
          }) /*操作会对所有窗口生效。*/
        }
      </div>
    </div>
  );
}

const SubmitConfirm: React.FC<{
  settingStore?: SettingStore;
  onConfirm: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  isRollback?: boolean;
  disabled?: boolean;
}> = function (props) {
  const text = props.isRollback
    ? formatMessage({ id: 'odc.component.SubmitConfirm.Rollback' }) //回滚
    : formatMessage({ id: 'odc.component.SubmitConfirm.Submitted' }); //提交
  return (
    <>
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement<any>(child, { onClick: props.onConfirm });
        }
        return child;
      })}
    </>
  );
};

export default inject('settingStore')(observer(SubmitConfirm));

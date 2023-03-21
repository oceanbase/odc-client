import { formatMessage } from '@/util/intl';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import React from 'react';

import styles from './index.less';

interface IProps {
  label?: React.ReactNode;
  overview?: React.ReactNode;
  expandText?: string;
  expand?: boolean;
  /**
   * 展开panel，没有按钮展开缩起
   */
  keepExpand?: boolean;
  onExpandChange?: (isExpand: boolean) => void;
}

const FormItemPanel: React.FC<IProps> = function (props) {
  const { overview, label, children, expandText, keepExpand } = props;
  const [expand, setExpand] = useControllableValue<boolean>(props, {
    defaultValue: false,
    valuePropName: 'expand',
    trigger: 'onExpandChange',
  });

  const iconStyle = {
    marginLeft: '4px',
    fontSize: 14,
  };

  return (
    <div>
      {label ? (
        <div className={styles.header}>
          <span className={styles.label}>{label}</span>
          {!keepExpand ? (
            <a
              onClick={() => {
                setExpand(!expand);
              }}
              className={styles.expandBtn}
            >
              {
                expandText || formatMessage({ id: 'odc.component.FormItemPanel.Superior' }) // 高级
              }
              {expand ? <UpOutlined style={iconStyle} /> : <DownOutlined style={iconStyle} />}
            </a>
          ) : null}
        </div>
      ) : null}
      <div
        style={{
          background: 'var(--background-tertraiy-color)',
          padding: '11px 12px 8px 12px',
          margin: '0px 0px 16px 0px',
        }}
      >
        <div>{overview}</div>
        <div style={{ display: expand || keepExpand ? 'unset' : 'none' }}>{children}</div>
      </div>
    </div>
  );
};

export default FormItemPanel;

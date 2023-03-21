import { CloseOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { FormattedMessage } from 'umi';
// @ts-ignore
import styles from './index.less';

@inject('schemaStore', 'connectionStore')
@observer
export class LockResultSetHint extends Component<{
  onClose(): void;
}> {
  public componentDidMount() {
    const { onClose } = this.props;
    // 10s 后自动消失
    setTimeout(() => {
      onClose();
    }, 10000);
  }

  public render() {
    const { onClose } = this.props;

    return (
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <FormattedMessage id="workspace.window.sql.record.notify.title" />
          <CloseOutlined onClick={onClose} />
        </header>
        <div className={styles.desc}>
          <FormattedMessage id="workspace.window.sql.record.notify.desc" />
        </div>
      </div>
    );
  }
}

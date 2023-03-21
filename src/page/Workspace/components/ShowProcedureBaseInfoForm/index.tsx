import { IProcedure } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { PureComponent } from 'react';
import styles from './index.less';

interface IProps {
  model: Partial<IProcedure>;
}

class ShowProcedureBaseInfoForm extends PureComponent<IProps> {
  public render() {
    const { model } = this.props;

    return (
      <div className={styles.box}>
        {[
          [formatMessage({ id: 'workspace.window.createProcedure.proName' }), model.proName],
          [formatMessage({ id: 'workspace.window.createView.definer' }), model.definer],
          [
            formatMessage({ id: 'workspace.window.database.createTime' }),
            getLocalFormatDateTime(model.createTime),
          ],
          [
            formatMessage({
              id: 'workspace.window.createProcedure.modifyTime',
            }),
            getLocalFormatDateTime(model.modifyTime),
          ],
        ].map(([label, content]) => {
          return (
            <div className={styles.line}>
              <span className={styles.title}>{label}:</span>
              <span className={styles.content}>{content}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

// @ts-ignore
export default ShowProcedureBaseInfoForm;

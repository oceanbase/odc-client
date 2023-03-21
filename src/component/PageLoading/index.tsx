import { formatMessage } from '@/util/intl';
import classnames from 'classnames';
import styles from './index.less';

export default (props: { showError: boolean; queue?: { waitNumber: number } | null }) => (
  <div>
    <div className={styles['odc-loading']}>
      {!props.showError ? (
        <div className={styles['dot-box']}>
          <div className={classnames(styles['dot1'], styles['dot-item'])}>
            <div className={styles['dot']} />
          </div>
          <div className={classnames(styles['dot2'], styles['dot-item'])}>
            <div className={styles['dot']} />
          </div>
          <div className={classnames(styles['dot3'], styles['dot-item'])}>
            <div className={styles['dot']} />
          </div>
        </div>
      ) : null}
      <img src={window.publicPath + 'img/odc_icon.svg'} width="90px" />
      {props.showError ? (
        <strong style={{ color: '#ff4d4f' }}>
          {
            formatMessage({
              id: 'odc.src.layout.LoadingPage.SystemLoadingFailedPleaseReload',
            })
            // 系统加载失败，请重新加载
          }
        </strong>
      ) : null}
      {props.queue
        ? formatMessage(
            {
              id: 'odc.component.PageLoading.ThereAreStillPropsqueuewaitnumberPeople',
            },
            { propsQueueWaitNumber: props.queue.waitNumber },
          ) //`前方还有${props.queue.waitNumber}人正在排队中，请耐心等待。`
        : null}
    </div>
    <img className={styles['ob-loading-icon']} src={window.publicPath + 'img/ob_logo.svg'} />
  </div>
);

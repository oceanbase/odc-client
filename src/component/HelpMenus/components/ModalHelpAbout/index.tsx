import { formatMessage, getLocalImg } from '@/util/intl';
import { Modal } from 'antd';
import moment from 'moment';
import { PureComponent } from 'react';
import pkg from '../../../../../package.json';
import styles from './index.less';
console.log(RELEASE_DATE);
export default class ModalHelp extends PureComponent<{
  showModal: boolean;
  onCancel: () => void;
}> {
  public render() {
    return (
      <Modal
        className={styles.modalAbout}
        title=""
        open={this.props.showModal}
        onCancel={this.props.onCancel}
        footer={null}
        width={480}
        centered
      >
        <div className="basic-info">
          <img className="logo" src={getLocalImg('version_icon.png')} />
        </div>
        <div className="release-version">
          <p>
            {formatMessage(
              {
                id: 'odc.components.ModalHelpAbout.VersionNumberPkgversion',
              },
              { pkgVersion: pkg.version },
            )}
          </p>
          <span>Release Date: {RELEASE_DATE ? moment(RELEASE_DATE).format('y-MM-DD') : ''}</span>
        </div>
        <div className={styles.copyright}>
          <div>
            <a target="_blank" href={pkg.homepage} rel="noreferrer">
              {pkg.homepage}
            </a>
            <div className="grey-color">{pkg.copyright}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <img style={{ height: 12 }} src={window.publicPath + 'img/logov2.png'} />
          </div>
        </div>
      </Modal>
    );
  }
}

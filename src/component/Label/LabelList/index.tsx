import { formatMessage } from '@/util/intl';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
// compatible
import { labelColorsMap } from '@/constant';
import { IConnection } from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Divider } from 'antd';
import styles from './index.less';
interface IProps {
  connectionStore?: ConnectionStore;
  record: IConnection;
  onChangeLabelManageVisible: (visible: boolean, connection?: IConnection) => void;
  onChangeLabel: (e: IConnection, id: string | number) => void;
}

@inject('connectionStore')
@observer
class LabelList extends Component<IProps> {
  public render() {
    const {
      connectionStore: { labels },
      onChangeLabelManageVisible,
      record,
      onChangeLabel,
    } = this.props;
    return (
      <div className={styles.labelList}>
        <header className={styles.header}>
          <span>
            {
              formatMessage({
                id: 'odc.components.LabelList.SetTags',
              }) /*设置标签*/
            }
          </span>
          <SettingOutlined
            onClick={() => {
              return onChangeLabelManageVisible(true);
            }}
            style={{
              color: 'var(--text-color-primary)',
            }}
          />
        </header>
        <div className={styles.labels}>
          {labels.map((label, i) => {
            const labelColor = labelColorsMap[label.labelColor];
            const labelStyle = {
              color: `${labelColor?.color}`,
              backgroundColor: `${labelColor?.bgColor}`,
            };
            return (
              <div
                key={i}
                className={styles.label}
                onClick={() => {
                  onChangeLabel(record, label.id);
                }}
              >
                <span className={styles.labelTag} style={labelStyle}>
                  {label.labelName}
                </span>
              </div>
            );
          })}
        </div>
        <Divider />
        <footer className={styles.footer}>
          <Button
            type="link"
            onClick={() => {
              return onChangeLabelManageVisible(true, record);
            }}
          >
            {
              formatMessage({
                id: 'odc.components.LabelList.CreateTag',
              }) /*新建标签*/
            }
          </Button>
        </footer>
      </div>
    );
  }
}

export default LabelList;

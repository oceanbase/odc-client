import { SchemaStore } from '@/store/schema';
import { formatMessage } from '@/util/intl';
import { DatabaseOutlined } from '@ant-design/icons';
import { Col, Form, Row } from 'antd';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { Component } from 'react';

import styles from './index.less';
const formItemLayout = {
  labelCol: { span: 11 },
  wrapperCol: { span: 13 },
};

@inject('schemaStore')
@observer
export default class DatabaseInfo extends Component<
  {
    schemaStore?: SchemaStore;
  },
  {
    loading: boolean;
  }
> {
  public readonly state = {
    loading: false,
  };

  public render() {
    const {
      schemaStore: { database },
    } = this.props;
    return (
      (database && (
        <div className={styles.container}>
          <header className={styles.header}>
            <DatabaseOutlined className={styles.icon} />
            {database.name}
          </header>
          <Form {...formItemLayout} className={styles.form}>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={formatMessage({
                    id: 'workspace.window.createTable.baseInfo.character',
                  })}
                >
                  <span className="ant-form-text">{database.charset}</span>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={formatMessage({
                    id: 'workspace.window.createTable.baseInfo.collation',
                  })}
                >
                  <span className="ant-form-text">{database.collation}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={formatMessage({
                    id: 'workspace.window.database.size',
                  })}
                >
                  <span className="ant-form-text">{this.formatDBSize(database.size)}</span>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={formatMessage({
                    id: 'workspace.window.database.createTime',
                  })}
                >
                  <span className="ant-form-text">
                    {database.gmtCreated
                      ? moment(database.gmtCreated).format('YYYY-MM-DD HH:mm')
                      : formatMessage({
                          id: 'workspace.window.database.createTime.unknown',
                        })}
                  </span>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      )) || <></>
    );
  }

  private formatDBSize(size: string | undefined): string {
    if (size === null || size === undefined) {
      return formatMessage({ id: 'workspace.window.database.size.unknown' });
    }
    if (size !== formatMessage({ id: 'workspace.window.database.unknown' })) {
      return `${size}MB`;
    }
    return size;
  }
}

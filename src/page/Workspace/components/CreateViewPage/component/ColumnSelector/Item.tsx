import Dragable, { IDragable } from '@/component/Dragable';
import { formatMessage } from '@/util/intl';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Col, Row, Space } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import { PureComponent } from 'react';
// @ts-ignore
import DragSvg from '@/svgr/DragItem.svg';
import EditableText from '../EditableText';
import ObjectName, { EnumObjectType } from '../ObjectName';
// @ts-ignore
import styles from './index.less';

export interface IProps extends IDragable {
  dataKey: string;
  handleDelete: (idx: string | number) => void;
  handleChange: (idx: any) => void;
  isLast: boolean;
  props?: any;
}

class Item extends PureComponent<IProps> {
  render() {
    const { index, isDragging, dataKey, connectDragSource, handleDelete } = this.props.props;
    const isCustomer = dataKey.includes('odc.customer.column');
    const params = parse(dataKey);
    const { v, c, t, d, aliasName } = params;

    return connectDragSource(
      <div className="dragable-item">
        <Row
          className={classNames(
            styles.column,
            styles.dragable,
            isDragging ? styles.dragging : null,
          )}
        >
          <Col className={styles['dragable-item']} span={24}>
            <Space>
              <Icon component={DragSvg} className={styles.dragHandler} />
              {!isCustomer ? (
                c
              ) : (
                <EditableText
                  hideArrow
                  onChange={this.handleSetColumnName}
                  placeholder={formatMessage({
                    id: 'odc.component.ColumnSelector.Item.CustomFields',
                  })} /* 自定义字段 */
                />
              )}

              {!isCustomer && t ? (
                <span>
                  ({' '}
                  <ObjectName
                    title={`${d}.${t}${aliasName ? `<${aliasName}>` : ''}`}
                    type={EnumObjectType.TABLE}
                  />{' '}
                  )
                </span>
              ) : null}
              {!isCustomer && v ? (
                <span>
                  ({' '}
                  <ObjectName
                    title={`${d}.${v}${aliasName ? `<${aliasName}>` : ''}`}
                    type={EnumObjectType.VIEW}
                  />{' '}
                  )
                </span>
              ) : null}
              <EditableText
                onChange={this.handleChangeAliasName}
                placeholder={formatMessage({
                  id: 'odc.component.ColumnSelector.Item.Alias',
                })} /* 别名 */
              />
            </Space>
            <DeleteOutlined className={styles.close} onClick={() => handleDelete(index)} />
          </Col>
        </Row>
      </div>,
    );
  }

  handleChangeAliasName = (value) => {
    const { dataKey, handleChange } = this.props.props;
    handleChange({ dataKey, aliasName: value });
  };

  handleSetColumnName = (value) => {
    const { dataKey, handleChange } = this.props.props;
    handleChange({ dataKey, columnName: value });
  };
}

export default Dragable<IProps>(Item, 'CREATE_VIEW_COLUMNS');

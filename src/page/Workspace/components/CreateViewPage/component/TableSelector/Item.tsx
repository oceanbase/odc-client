import Dragable, { IDragable } from '@/component/Dragable';
import DragSvg from '@/svgr/DragItem.svg';
import { formatMessage } from '@/util/intl';
import Icon, { DeleteOutlined } from '@ant-design/icons';
import { Col, Row, Select, Space } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import { PureComponent } from 'react';
import EditableText from '../EditableText';
import ObjectName, { EnumObjectType } from '../ObjectName';
// @ts-ignore
import styles from './index.less';

const { Option } = Select;
const JOIN_KEYWORDS = [
  ',',
  'join',
  'inner join',
  'left join',
  'right join',
  'cross join',
  'full join',
  'union',
  'union all',
  'intersect',
  'minus',
  'left outer join',
  'right outer join',
  'full outer join',
];

interface IProps extends IDragable {
  dataKey: string;
  handleDelete: (idx: string | number) => void;
  handleChange: (idx: any) => void;
  isLast: boolean;
  props?: any;
}

class Item extends PureComponent<IProps> {
  render() {
    const { index, dataKey, isDragging, isLast, connectDragSource, handleDelete } =
      this.props.props;
    const params = parse(dataKey);
    const { d, v, t, uid } = params;
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
              {t ? <ObjectName title={t} type={EnumObjectType.TABLE} /> : null}
              {v ? <ObjectName title={v} type={EnumObjectType.VIEW} /> : null}
              <span className={styles.groupName}>({d})</span>
              <EditableText
                onChange={this.handleChangeAliasName}
                placeholder={formatMessage({
                  id: 'odc.component.TableSelector.Item.Alias',
                })} /* 别名 */
              />
              {!isLast && (
                <Select
                  defaultValue={JOIN_KEYWORDS[0]}
                  dropdownStyle={{ minWidth: '150px' }}
                  onChange={this.handleChangeOperation}
                  bordered={false}
                  style={{ marginLeft: '-8px' }}
                >
                  {JOIN_KEYWORDS.map((keyword) => (
                    <Option key={keyword} value={keyword}>
                      {keyword.toUpperCase()}
                    </Option>
                  ))}
                </Select>
              )}
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

  handleChangeOperation = (value) => {
    const { dataKey, handleChange } = this.props.props;
    handleChange({ dataKey, operation: value });
  };
}

export default Dragable<IProps>(Item, 'CREATE_VIEW_TABLES');

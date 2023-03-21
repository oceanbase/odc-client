import Icon, { DatabaseOutlined, TableOutlined } from '@ant-design/icons';
import { PureComponent } from 'react';
// @ts-ignore
import ViewSvg from '@/svgr/View.svg';

interface IProps {
  title: any;
  type: EnumObjectType;
}

export enum EnumObjectType {
  TABLE = 'TABLE',
  VIEW = 'VIEW',
}

export const ICON_DATABASE = <DatabaseOutlined style={{ color: ' #9d7ac7' }} />;

export const ICON_TABLE = <TableOutlined style={{ color: '#3FA3FF' }} />;

export const ICON_VIEW = <Icon type="view" component={ViewSvg} style={{ color: '#FA8C15' }} />;

export default class ObjectName extends PureComponent<IProps> {
  render() {
    const { title, type } = this.props;
    if (type === EnumObjectType.TABLE) {
      return (
        <span>
          {ICON_TABLE}&nbsp;&nbsp;{title}
        </span>
      );
    }
    if (type === EnumObjectType.VIEW) {
      return (
        <span>
          {ICON_VIEW}&nbsp;&nbsp;{title}
        </span>
      );
    }
    return <span>{title}</span>;
  }
}

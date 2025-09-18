import {
  CheckCircleFilled,
  CheckOutlined,
  CloseCircleFilled,
  Loading3QuartersOutlined,
} from '@ant-design/icons';
import { notification, Typography } from 'antd';

export enum EStatus {
  LOADING = 'loading',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum EResourceType {
  DATASOURCE = 'datasource',
  USER = 'user',
  DATABASE = 'database',
}

const getTitle = (name: string) => ({
  [EResourceType.DATASOURCE]: {
    [EStatus.LOADING]: `数据源 ${name} 删除中`,
    [EStatus.SUCCESS]: `数据源 ${name} 删除成功`,
    [EStatus.FAILED]: `数据源 ${name} 删除失败`,
  },
  [EResourceType.DATABASE]: {
    [EStatus.LOADING]: `数据库 ${name} 修改项目中`,
    [EStatus.SUCCESS]: `数据库 ${name} 修改项目成功`,
    [EStatus.FAILED]: `数据库 ${name} 修改项目失败`,
  },
  [EResourceType.USER]: {
    [EStatus.LOADING]: `用户 ${name} 删除中`,
    [EStatus.SUCCESS]: `用户 ${name} 删除成功`,
    [EStatus.FAILED]: `用户 ${name} 删除失败`,
  },
});

const getContent = (name: string) => ({
  [EResourceType.DATASOURCE]: {
    [EStatus.LOADING]: '删除前将终止所有相关未完成的工单和作业，请等待。',
    [EStatus.SUCCESS]: '数据源已删除，未完成的工单和作业已终止。',
    [EStatus.FAILED]: '部分未完成的工单和作业未被终止，请检查。',
  },
  [EResourceType.DATABASE]: {
    [EStatus.LOADING]: '修改前将终止相关未完成的工单和作业，请等待。',
    [EStatus.SUCCESS]: `数据库已迁移至项目 ${name} 中，未完成的工单和作业已终止。`,
    [EStatus.FAILED]: '部分未完成的工单和作业未被终止，请检查。',
  },
  [EResourceType.USER]: {
    [EStatus.LOADING]: '删除前将终止该用户个人空间中所有未完成的工单和作业，请等待。',
    [EStatus.SUCCESS]: '用户已删除，该用户个人空间中所有未完成的工单和作业已被终止。',
    [EStatus.FAILED]: '该用户个人空间中部分未完成的工单和作业未被终止，请检查。',
  },
});

const iconConfig = {
  [EStatus.LOADING]: (
    <Loading3QuartersOutlined style={{ color: 'var(--icon-blue-color)', fontSize: 20 }} />
  ),
  [EStatus.SUCCESS]: <CheckCircleFilled style={{ color: 'var(--icon-color-2)', fontSize: 20 }} />,
  [EStatus.FAILED]: <CloseCircleFilled style={{ color: 'var(--code-red-color)', fontSize: 20 }} />,
};

interface IOpenNotificationProps {
  name: string;
  type: EResourceType;
  status: EStatus;
}

const useResourceDepNotification = () => {
  const [api, contextHolder] = notification.useNotification();
  const openNotification = ({ name, type, status }: IOpenNotificationProps) => {
    api.open({
      message: <Typography.Title level={5}>{getTitle(name)[type][status]}</Typography.Title>,
      description: getContent(name)[type][status],
      icon: iconConfig[status],
    });
  };
  return { contextHolder, openNotification };
};

export default useResourceDepNotification;

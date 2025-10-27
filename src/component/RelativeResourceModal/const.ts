import { formatMessage } from '@/util/intl';
import { EEntityType } from '@/d.ts/relativeResource';
import { ButtonProps } from 'antd';

interface IEntityConfig {
  actionType?: ButtonProps['color'];
  actionText?: string;
  confirmText?: string;
  hasRelatedText: string;
}

export const ENTITY_CONFIG: Record<EEntityType, IEntityConfig> = {
  [EEntityType.PROJECT]: {
    hasRelatedText: formatMessage({
      id: 'src.component.RelativeResourceModal.CA1D1A34',
      defaultMessage: '请先手动终止以下工单和作业。',
    }),
  },
  [EEntityType.USER]: {
    actionText: formatMessage({
      id: 'src.component.RelativeResourceModal.92AC3A13',
      defaultMessage: '删除用户',
    }),
    actionType: 'danger',
    confirmText: formatMessage({
      id: 'src.component.RelativeResourceModal.1BCF3FE7',
      defaultMessage: '我已确认风险，删除后所有相关工单和作业将被终止',
    }),
    hasRelatedText: formatMessage({
      id: 'src.component.RelativeResourceModal.5F3F0D6E',
      defaultMessage: '当前用户存在以下未完成的工单和作业，删除后所有相关工单和作业将被终止。',
    }),
  },
  [EEntityType.DATABASE]: {
    actionText: formatMessage({
      id: 'src.component.RelativeResourceModal.FD63940F',
      defaultMessage: '修改所属项目',
    }),
    confirmText: formatMessage({
      id: 'src.component.RelativeResourceModal.5D9821D7',
      defaultMessage: '我已确认风险，修改后所有相关工单和作业将被终止',
    }),
    hasRelatedText: formatMessage({
      id: 'src.component.RelativeResourceModal.9DB21436',
      defaultMessage: '当前数据库已关联以下未完成的工单和作业，修改后所有相关工单和作业将被终止。',
    }),
  },
  [EEntityType.DATASOURCE]: {
    hasRelatedText: formatMessage({
      id: 'src.component.RelativeResourceModal.59AC3A0B',
      defaultMessage: '请先手动终止以下工单和作业。',
    }),
  },
};

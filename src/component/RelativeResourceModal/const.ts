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
    hasRelatedText: '请先手动终止以下工单和作业。',
  },
  [EEntityType.USER]: {
    actionText: '删除用户',
    actionType: 'danger',
    confirmText: '我已确认风险，删除后所有相关工单和作业将被终止',
    hasRelatedText: '当前用户存在以下未完成的工单和作业，删除后所有相关工单和作业将被终止。',
  },
  [EEntityType.DATABASE]: {
    actionText: '修改所属项目',
    confirmText: '我已确认风险，修改后所有相关工单和作业将被终止',
    hasRelatedText: '当前数据库已关联以下未完成的工单和作业，修改后所有相关工单和作业将被终止。',
  },
  [EEntityType.DATASOURCE]: {
    hasRelatedText: '请先手动终止以下工单和作业。',
  },
};

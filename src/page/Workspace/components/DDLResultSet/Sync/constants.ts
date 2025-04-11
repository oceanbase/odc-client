import { RefreshMethod } from '@/d.ts';
import { refreshMethodText } from '@/constant/label';

// 物化视图的刷新方式对应允许的同步方式
export const refreshMethodAllowsSyncMethods = {
  [RefreshMethod.REFRESH_FAST]: [
    RefreshMethod.REFRESH_FAST,
    RefreshMethod.REFRESH_COMPLETE,
    RefreshMethod.REFRESH_FORCE,
  ],
  [RefreshMethod.REFRESH_FORCE]: [RefreshMethod.REFRESH_COMPLETE, RefreshMethod.REFRESH_FORCE],
  [RefreshMethod.REFRESH_COMPLETE]: [RefreshMethod.REFRESH_COMPLETE, RefreshMethod.REFRESH_FORCE],
  [RefreshMethod.NEVER_REFRESH]: [],
};

export const synchronizeText = {
  [RefreshMethod.REFRESH_FAST]: {
    tip: '仅同步增量数据',
    descriptions: '快速同步仅同步增量数据，且同步过程需要一定的等待时间。',
    label: refreshMethodText[RefreshMethod.REFRESH_FAST],
  },
  [RefreshMethod.REFRESH_FORCE]: {
    tip: '优先尝试同步增量数据，失败后再尝试同步全量数据',
    label: refreshMethodText[RefreshMethod.REFRESH_FORCE],
    descriptions:
      '强制同步优先尝试同步增量数据、失败后再尝试同步全量数据，且同步过程需要一定的等待时间。',
  },
  [RefreshMethod.REFRESH_COMPLETE]: {
    tip: '仅同步全量数据',
    label: refreshMethodText[RefreshMethod.REFRESH_COMPLETE],
    descriptions: '完全同步仅同步全量数据，且同步过程需要一定的等待时间。',
  },
};

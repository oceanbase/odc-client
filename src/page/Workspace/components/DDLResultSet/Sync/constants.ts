import { RefreshMethod, SyncMethods } from '@/d.ts';

// 物化视图的刷新方式对应允许的同步方式
export const refreshMethodAllowsSyncMethods = {
  [RefreshMethod.REFRESH_FAST]: [
    SyncMethods.REFRESH_FAST,
    SyncMethods.REFRESH_COMPLETE,
    SyncMethods.REFRESH_FORCE,
  ],
  [RefreshMethod.REFRESH_FORCE]: [SyncMethods.REFRESH_COMPLETE, SyncMethods.REFRESH_FORCE],
  [RefreshMethod.REFRESH_COMPLETE]: [SyncMethods.REFRESH_COMPLETE, SyncMethods.REFRESH_FORCE],
  [RefreshMethod.NEVER_REFRESH]: [],
};

export const synchronizeText = {
  [SyncMethods.REFRESH_FAST]: {
    tip: '仅同步增量数据',
    descriptions: '快速同步仅同步增量数据，且同步过程需要一定的等待时间。',
    label: '快速同步',
  },
  [SyncMethods.REFRESH_FORCE]: {
    tip: '优先尝试同步增量数据，失败后再尝试同步全量数据',
    label: '强制同步',
    descriptions:
      '强制同步优先尝试同步增量数据、失败后再尝试同步全量数据，且同步过程需要一定的等待时间。',
  },
  [SyncMethods.REFRESH_COMPLETE]: {
    tip: '仅同步全量数据',
    label: '完全同步',
    descriptions: '完全同步仅同步全量数据，且同步过程需要一定的等待时间。',
  },
};

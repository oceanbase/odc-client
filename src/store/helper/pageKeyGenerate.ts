import { PageType } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export const PLPageMap = {
  [PageType.BATCH_COMPILE_FUNCTION]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Function' }), //函数
  },
  [PageType.BATCH_COMPILE_PROCEDURE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.StoredProcedure' }), //存储过程
  },
  [PageType.BATCH_COMPILE_PACKAGE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Bag' }), //包
  },
  [PageType.BATCH_COMPILE_TRIGGER]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Trigger' }), //触发器
  },
  [PageType.BATCH_COMPILE_TYPE]: {
    label: formatMessage({ id: 'odc.components.ResourceTree.Type' }), //类型
  },
};

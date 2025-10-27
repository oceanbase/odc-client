import { formatMessage } from '@/util/intl';
import { IDatabase } from '@/d.ts/database';
import { MaximumCharacterLength } from '@/component/Task/component/CreateTaskConfirmModal';
import { safeTruncateString } from '@/util/stringTruncate';

/** 作业的默认生成规则 */
export const getDefaultName = (database: IDatabase) => {
  let scheduleName = `[${database?.environment?.name}]${database?.name}_${+new Date()}`;
  return safeTruncateString(MaximumCharacterLength, scheduleName);
};

/** 克隆作业时的默认生成规则 */
export const getInitScheduleName = (scheduleName: string, type: 'RETRY' | 'EDIT') => {
  let initScheduleName = undefined;
  if (scheduleName) {
    if (type === 'RETRY') {
      initScheduleName = formatMessage(
        {
          id: 'src.component.Task.component.CreateTaskConfirmModal.A4D01F9B',
          defaultMessage: '[克隆]{scheduleName}',
        },
        { scheduleName },
      );
    }
  }
  return safeTruncateString(MaximumCharacterLength, initScheduleName);
};

import { FormInstance } from 'antd';
import { convertCronToMinutes } from '@/component/Crontab/utils';
import { ICrontab } from '@/component/Crontab/interface';
import setting from '@/store/setting';

/**
 * 校验 crontab 调度间隔是否符合最小间隔要求
 * @param crontab - crontab 配置对象
 * @param form - Ant Design 表单实例
 * @param fieldName - 要设置错误的字段名，默认为 'crontab'
 * @param clearErrorOnSuccess - 校验通过时是否清除错误，默认为 true
 * @returns 校验是否通过
 */
export function validateCrontabInterval(
  crontab: ICrontab | null,
  form: FormInstance,
  fieldName: string = 'crontab',
): boolean {
  console.log('111', form.getFieldsValue());
  if (!crontab?.cronString) {
    return true;
  }

  const intervalMinutes = convertCronToMinutes(crontab.cronString);
  const minSchedulingIntervalMinutes =
    setting?.spaceConfigurations?.['odc.schedule.minSchedulingIntervalMinutes'];
  const limit = Number(minSchedulingIntervalMinutes);

  if (intervalMinutes && minSchedulingIntervalMinutes && intervalMinutes < limit) {
    form.setFields([
      {
        name: fieldName,
        errors: [`作业任务最小调度间隔不小于 ${limit} 分钟`],
      },
    ]);
    return false;
  }

  form.setFields([
    {
      name: fieldName,
      errors: [],
    },
  ]);

  return true;
}

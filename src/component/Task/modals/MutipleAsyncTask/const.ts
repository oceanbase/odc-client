import { existsTemplateName } from '@/common/network/databaseChange';
import login from '@/store/login';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';

export const rules = {
  sqlContentType: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.components.CreateAsyncTaskModal.SelectSqlContent',
        defaultMessage: '请选择 SQL 内容',
      }),

      // 请选择 SQL 内容
    },
  ],
  editName: ({ projectId, currentTemplate }) => [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.components.Template.F3DD7E9F',
        defaultMessage: '请输入',
      }),
    },
    {
      validator: async (ruler, value) => {
        const name = value?.trim();
        if (!name) {
          return;
        }
        const isRepeat = await existsTemplateName(
          name,
          projectId,
          login.organizationId?.toString(),
        );
        if (isRepeat && name !== currentTemplate?.name) {
          throw new Error(
            formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.components.Template.A6EB2822',
              defaultMessage: '模版名称已存在',
            }),
          );
        }
      },
    },
  ],
  name: ({ projectId }) => [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.components.Template.4B3E6B15',
        defaultMessage: '请输入模版名称',
      }),
    },
    {
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.components.Template.1797C71B',
        defaultMessage: '模版名称已存在',
      }),
      required: true,
      validator: async (ruler, value) => {
        const name = value?.trim();
        if (!name) {
          return;
        }
        const isRepeat = await existsTemplateName(
          name,
          projectId,
          login.organizationId?.toString(),
        );
        if (isRepeat) {
          throw new Error();
        }
      },
    },
  ],
  ['parameters-sqlContent']: ({ required }) => {
    return [
      {
        required,
        message: formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.20CA9283',
          defaultMessage: '请填写 SQL 内容',
        }),
      },
    ];
  },
  innerName: ({ databaseOptionMap }) => {
    return [
      {
        required: true,
        message: formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.E7E1BCF3',
          defaultMessage: '请选择数据库',
        }),
      },
      {
        validateTrigger: 'onChange',
        validator: async (ruler, value) => {
          if (value && !databaseOptionMap?.[value]) {
            throw new Error(
              formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.94128D2B',
                defaultMessage: '该数据库不属于当前项目',
              }),
            );
          }
        },
      },
    ];
  },
  ['parameters-delimiter']: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.FF497D5B',
        defaultMessage: '请输入分隔符',
      }),
    },
  ],
  ['parameters-queryLimit']: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.631AD60F',
        defaultMessage: '请输入查询结果限制',
      }),
    },
    {
      validator: (_, value) => {
        const max = setting.getSpaceConfigByKey('odc.sqlexecute.default.maxQueryLimit');
        if (value !== undefined && value > max) {
          return Promise.reject(
            formatMessage(
              {
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.61AA1269',
                defaultMessage: '不超过查询条数上限 {max}',
              },
              { max },
            ),
          );
        }
        return Promise.resolve();
      },
    },
  ],
  ['parameters-timeoutMillis']: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.57804D6A',
        defaultMessage: '请输入超时时间',
      }),
    },
    {
      type: 'number',
      max: 480,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.50D2F13E',
        defaultMessage: '最大不超过480小时',
      }),
    },
  ],
  ['parameters-errorStrategy']: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.C3F2CC4E',
        defaultMessage: '请选择SQL 执行处理',
      }),
    },
  ],
  executionStrategy: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.B1EBE15F',
        defaultMessage: '请选择执行方式',
      }),
    },
  ],
  ['parameters-autoErrorStrategy']: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.D2818FDA',
        defaultMessage: '请选择任务错误处理',
      }),
    },
  ],
  ['parameters-manualTimeoutMillis']: [
    {
      required: true,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.73A16360',
        defaultMessage: '请输入手动确认超时时间',
      }),
    },
    {
      type: 'number',
      max: 480,
      message: formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.61541BB4',
        defaultMessage: '最大不超过480小时',
      }),
    },
  ],
  projectId: [
    {
      required: true,
      message: formatMessage({
        id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseSelectTheProject',
        defaultMessage: '请选择项目',
      }), //'请选择项目'
    },
  ],
};

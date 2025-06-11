import { formatMessage } from '@/util/intl';
import setting, { getCurrentOrganizationId } from '@/store/setting';

export const validForqueryQueryNumber = (value) => {
  const sessionQueryLimit = sessionStorage.getItem(`maxQueryLimit-${getCurrentOrganizationId()}`);
  const queryLimit = setting.getSpaceConfigByKey('odc.sqlexecute.default.maxQueryLimit');
  if (!value) {
    return Promise.reject(
      formatMessage({
        id: 'src.component.ODCSetting.B7CA4CA1',
        defaultMessage: '请输入查询条数默认值',
      }),
    );
  }
  if (sessionQueryLimit) {
    if (value > Number(sessionQueryLimit)) {
      return Promise.reject(
        formatMessage(
          { id: 'src.component.ODCSetting.5127321B', defaultMessage: '不超过{sessionQueryLimit}' },
          { sessionQueryLimit },
        ),
      );
    } else {
      return Promise.resolve();
    }
  }
  if (value > Number(queryLimit)) {
    return Promise.reject(
      formatMessage(
        { id: 'src.component.ODCSetting.A8E22CC2', defaultMessage: '不超过{queryLimit}' },
        { queryLimit },
      ),
    );
  }
  return Promise.resolve();
};

export const validForqueryLimit = (value) => {
  const limit =
    Number(setting.configurations['odc.session.sql-execute.max-result-set-rows']) || 100000;
  if (value > limit) {
    return Promise.reject(`不超过${limit}`);
  }
  if (!value) {
    return Promise.reject(
      formatMessage({
        id: 'src.component.ODCSetting.DD41DED4',
        defaultMessage: '请输入查询条数上限',
      }),
    );
  }
  return Promise.resolve();
};

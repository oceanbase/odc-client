import { formatMessage } from '@/util/intl';
import setting, { getCurrentOrganizationId } from '@/store/setting';
import { getSystemConfig } from '@/common/network/other';

export const validForQueryQueryNumber = (value) => {
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

export const validForQueryLimit = async (value) => {
  const res = await getSystemConfig();
  const maxResultsetRows =
    parseInt(res?.['odc.session.sql-execute.max-result-set-rows']) || Number.MAX_SAFE_INTEGER;

  if (value > maxResultsetRows) {
    return Promise.reject(
      formatMessage(
        { id: 'src.component.ODCSetting.2BE8F5C3', defaultMessage: '不超过{maxResultsetRows}' },
        { maxResultsetRows },
      ),
    );
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

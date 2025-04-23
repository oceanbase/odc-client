import setting from '@/store/setting';

export const validForqueryQueryNumber = (value) => {
  const queryLimit = setting.getSpaceConfigByKey('odc.sqlexecute.default.maxQueryLimit');
  if (value > Number(queryLimit)) {
    return Promise.reject(`不超过${queryLimit}`);
  }
  if (!value) {
    return Promise.reject('请输入查询条数默认值');
  }
  return Promise.resolve();
};

export const validForqueryLimit = (value) => {
  if (value > 100000) {
    return Promise.reject(`不超过100000`);
  }
  if (!value) {
    return Promise.reject('请输入查询条数上限');
  }
  return Promise.resolve();
};

import { formatMessage } from '@/util/intl';
import { getLocale } from '@umijs/max';

import Exception from '@/component/Exception/index';
import login from '@/store/login';
import { Button } from 'antd';

export default () => {
  console.log('[getLocale()]', getLocale());
  console.log('403');
  async function back() {
    await login.logout();
    login.gotoLogoutPage();
  }
  return (
    <Exception
      type="403"
      desc=""
      actions={
        <Button type="primary" onClick={back}>
          {formatMessage({ id: 'odc.page.Exception.403.LogOnAgain' }) /*重新登录*/}
        </Button>
      }
    />
  );
};

import { getLocale, Link } from '@umijs/max';

import Exception from '@/component/Exception/index';
import { formatMessage } from '@/util/intl';

export default () => {
  console.log('[getLocale()]', getLocale());

  return (
    <Exception
      type="404"
      linkElement={Link}
      desc=""
      backText={formatMessage({
        id: 'odc.page.Exception.404.ReturnToHomePage',
      })}
      redirect="/"
    />
  );
};

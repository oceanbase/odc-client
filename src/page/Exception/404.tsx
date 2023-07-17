import { formatMessage, getLocale, Link } from 'umi';

import Exception from '@/component/Exception/index';

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
      redirect="/project"
    />
  );
};

import { getLocale } from 'umi';

import Exception from '@/component/Exception/index';

export default () => {
  console.log('[getLocale()]', getLocale());
  console.log('403');

  return <Exception type="403" desc="" actions={<span />} />;
};

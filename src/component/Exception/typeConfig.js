import { formatMessage } from '@/util/intl';

const config = {
  403: {
    img: '/img/403.svg',
    title: '403',
    desc: formatMessage({
      id: 'odc.component.Exception.typeConfig.SorryYouAreNotAuthorized',
    }),
  },

  404: {
    img: '/img/404.svg',
    title: '404',
    desc: formatMessage({
      id: 'odc.component.Exception.typeConfig.SorryThePageYouVisited',
    }),
  },

  500: {
    img: '/img/500.svg',
    title: '500',
    desc: formatMessage({
      id: 'odc.component.Exception.typeConfig.SorryTheServerHasAn',
    }),
  },
};

export default config;

import odc from '@/plugins/odc';
import privateRequest from './private';

function getRequest() {
  return odc.ODCRequest || privateRequest;
}

export function getODCServerHost() {
  return window.ODCApiHost || '';
}

export default {
  get(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().get(url, data, params);
  },
  post(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().post(url, data, params);
  },
  put(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().put(url, data, params);
  },
  patch(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().patch(url, data, params);
  },
  delete(
    url: string,
    data?: Record<string, any>,

    params?: Record<string, any>,
  ) {
    return getRequest().delete(url, data, params);
  },
};

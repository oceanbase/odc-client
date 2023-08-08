import { isObject } from 'lodash';
import { join } from 'path';
import pathToRegexp from 'path-to-regexp';
import { parse } from 'query-string';
import { IRoute } from '@umijs/max';

interface TracertRoutePath {
  title: string;
  regExp: RegExp;
  route: string;
  spmBPos: string | Record<string, string>;
  redirect: string;
}

export const getValidRoutes = (allUserRoutes: IRoute[], defaultStrict = true) => {
  const allRoutePath: TracertRoutePath[] = [];

  const parseSubRouteConfig = (routeConfig: IRoute, parentPath: string) => {
    if (!routeConfig || (!routeConfig.path && !routeConfig.routes?.length)) {
      return;
    }

    const { exact = true, strict = defaultStrict, sensitive = false, redirect } = routeConfig;
    const routeConfigPath = routeConfig.path || '';
    const curRoutePath =
      routeConfigPath.indexOf('/') === 0 ? routeConfigPath : join(parentPath, routeConfigPath);

    const curRoutePathRegExp = pathToRegexp(curRoutePath, [], {
      strict,
      sensitive,
      end: exact,
    });

    const findIndex = allRoutePath.findIndex(
      (item) => item.regExp.toString() === curRoutePathRegExp.toString(),
    );
    const curTitle = routeConfig.title || routeConfig.name || '';

    const findSpmBPos = routeConfig.spmBPos || routeConfig.spmb || '';
    if (findIndex === -1) {
      allRoutePath.push({
        title: curTitle,
        regExp: curRoutePathRegExp,
        route: curRoutePath,
        spmBPos: findSpmBPos,
        redirect: redirect || '',
      });
    } else {
      const exist: any = allRoutePath[findIndex] || {};
      exist.route = curRoutePath;
      exist.title = curTitle || exist.title;
      exist.spmBPos = findSpmBPos || exist.spmBPos;
      exist.redirect = redirect || exist.redirect;
    }

    if (!routeConfig.routes) {
      return;
    }

    getAllPath(routeConfig.routes, curRoutePath);
  };

  const getAllPath = (routes: IRoute[], parentPath: string) => {
    if (!routes) {
      return;
    }
    if (isObject(routes)) {
      routes = Object.values(routes);
    }
    for (const config of routes) {
      parseSubRouteConfig(config, parentPath);
    }
  };

  getAllPath(allUserRoutes, '/');
  return allRoutePath;
};

export const findPathRoute = (allRoutes: TracertRoutePath[], curPathName: string) => {
  let path = curPathName;
  // PC 开启 exportStatic 时，会生成弱 MPA 形式
  // 当刷新时，会在当前路由后新增 /，
  // 如 http://ali/home 会成为 http://ali/home/，其实是 http://ali/home/index.html。这里排除这种情况。
  // 同时首页也会产生空位
  if (path.length > 1 && path.endsWith('/')) {
    path = path.substring(0, path.length - 1);
  }

  let route = null;
  let spmBPos = null;
  let redirect = null;
  let title = '';
  for (const item of allRoutes) {
    // regExp 无法使用 ===，这里消除首页情况
    if (item.regExp.test(path)) {
      if (item.route === '/') {
        route = item.route || route;
        spmBPos = item.spmBPos || spmBPos;
        redirect = item.redirect;
        title = item.title;
      } else {
        route = item.route;
        spmBPos = item.spmBPos;
        redirect = item.redirect;
        title = item.title;
        break;
      }
    }
  }

  return {
    route,
    redirect,
    spmBPos,
    title,
  };
};

interface RouteChange {
  location: {
    pathname: string;
    search: string;
  };
  matchedRoutes: IRoute[];
  routes: IRoute[];
  action: string;
}

interface Tracert {
  spmAPos: string;
  framePageTitle: string;
  call: Function;
  _qiankunRouteFilter?: Function;
  [key: string]: any;
}

let lastRouteInfo: any = {
  route: null,
  pathname: null,
};

export function getRoute(params: RouteChange, tracert: Tracert) {
  const { matchedRoutes, location, routes, action } = params || {};

  if (!location || !location.pathname) {
    return;
  }

  let targetRoute = null;
  if (matchedRoutes && matchedRoutes.length > 0) {
    targetRoute = matchedRoutes[matchedRoutes.length - 1].route;
  } else {
    const allRoutes = getValidRoutes(routes);
    targetRoute = findPathRoute(allRoutes, location.pathname);
  }

  const { route, redirect, spmBPos, title, name, spmb, path, ignoreMergeRoute, queryTitle }: any =
    targetRoute || {};

  const nextRoute: string = path || route || '';

  let nextSpmb: string = spmBPos || spmb || '';
  const { spmAPos, _qiankunRouteFilter } = tracert;

  if (typeof spmBPos === 'object' && spmBPos !== null && spmAPos && spmBPos[spmAPos]) {
    nextSpmb = spmBPos[spmAPos];
  }

  if (typeof _qiankunRouteFilter === 'function') {
    const isFilter = _qiankunRouteFilter(lastRouteInfo, targetRoute, action);
    if (tracert._isMain && isFilter) {
      return;
    }
  }

  // 防止锚点、相同路由触发
  if (
    !nextRoute ||
    (redirect && !nextSpmb) ||
    (lastRouteInfo.route === nextRoute && lastRouteInfo.pathname === location.pathname)
  ) {
    return;
  }

  lastRouteInfo = {
    route: nextRoute,
    pathname: location.pathname,
  };

  let titleFromQuery = '';
  if (ignoreMergeRoute) {
    // 处理B位设置
    if (!nextSpmb) {
      nextSpmb = location.pathname;
    }
    // 处理B位title采集
    if (queryTitle && typeof queryTitle === 'string' && location.search) {
      const queryObj = parse(location.search) || {};
      titleFromQuery = decodeURIComponent(queryObj[queryTitle] || title || name);
    }
  }

  tracert.call('set', {
    framePageTitle: titleFromQuery || title || name || '',
  });

  if (typeof nextSpmb != 'string' || !nextSpmb) {
    nextSpmb = nextRoute;
  }

  return {
    pathName: nextRoute,
    spmBPos: nextSpmb,
  };
}

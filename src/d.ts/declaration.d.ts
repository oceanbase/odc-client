declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default ReactComponent;
}

declare const ENV_target: 'web' | 'client';
declare const ENV_environment: 'private' | 'cloud';
declare const RELEASE_DATE: string | number;
declare const MONACO_VERSION: string;
declare const HAVEOCP: string;

interface Window {
  _odc_params: any;
  publicPath: string;
  _forceRefresh: boolean;
  newVersionModal: any;
  Tracert: any;
  /**
   * ODC 请求地址
   */
  ODCApiHost: string;
  /**
   * 当前环境信息
   */
  currentEnv: string;
  route: any;
  haveOCP: boolean;
}

declare let window: Window;

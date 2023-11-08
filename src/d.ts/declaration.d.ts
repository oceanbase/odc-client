/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  ODCClient: any;
}

declare let window: Window;

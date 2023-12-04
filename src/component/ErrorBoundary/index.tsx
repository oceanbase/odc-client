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

import { formatMessage } from '@/util/intl';
import { Button, Result } from 'antd';
import React from 'react';

export default class ErrorBoundary extends React.Component {
  public static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  public state = {
    hasError: false,
    errorComponent: null,
    errorStack: null,
  };

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorComponent: null, errorStack: null };
  }

  public componentDidCatch(error: any, errorInfo) {
    // You can also log the error to an error reporting service
    console.log('error', error?.stack, errorInfo);
    this.setState({
      hasError: true,
      errorComponent: errorInfo?.componentStack,
      errorStack: error?.stack,
    });
  }

  public render() {
    const isChunkError = this.state.errorStack?.toString().includes('ChunkLoadError');
    if (isChunkError) {
      return <Result
        status="404"
        title="系统正在升级中"
        subTitle="当前 ODC 版本已过期，请刷新重试"
        extra={<Button
          onClick={() => {
            window.location.href = `${location.origin}${location.pathname}`;
          }}
          type="primary"
        >
          {formatMessage({ id: 'odc.component.ErrorBoundary.Reload' })}
        </Button>}
      />
    }
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <div
            style={{
              textAlign: 'center',
              padding: 15,
              background: '#fff1f0',
              fontSize: 16,
            }}
          >
            {formatMessage({
              id: 'odc.component.ErrorBoundary.SorryAnUnpredictableExceptionOccurred',
            })}

            <a
              onClick={() => {
                window.location.href = `${location.origin}${location.pathname}`;
              }}
            >
              {formatMessage({ id: 'odc.component.ErrorBoundary.Reload' })}
            </a>
          </div>
          <pre style={{ padding: 20, color: 'red' }}>
            <h3>Stack</h3>
            {this.state.errorStack}
            <h3 style={{ marginTop: 10 }}>Component</h3>
            {this.state.errorComponent}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

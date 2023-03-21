import { formatMessage } from '@/util/intl';
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

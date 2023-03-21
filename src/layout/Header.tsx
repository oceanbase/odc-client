import GlobalHeader from '@/component/GlobalHeader';
import { Layout } from 'antd';
import { PureComponent } from 'react';

const { Header } = Layout;

export default class HeaderView extends PureComponent<{
  style: any;
}> {
  public render() {
    return (
      <Header style={Object.assign({ height: 40 }, this.props.style)}>
        <GlobalHeader />
      </Header>
    );
  }
}

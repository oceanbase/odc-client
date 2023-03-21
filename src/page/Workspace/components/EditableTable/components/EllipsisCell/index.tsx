import { Tooltip } from 'antd';
import React, { Component, RefObject } from 'react';
// @ts-ignore
import styles from './index.less';

export default class EllipsisCell extends Component<{
  value: string | number;
}> {
  ref: RefObject<HTMLSpanElement>;
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  render() {
    const { value } = this.props;
    const refEl = this.ref.current;
    const scrollx = refEl?.scrollWidth > refEl?.clientWidth;
    const scrolly = refEl?.scrollHeight > 24;
    let isEllipsis = refEl ? scrollx || scrolly : false;

    if (isEllipsis) {
      return (
        <Tooltip placement="topLeft" title={<pre style={{ marginBottom: 0 }}>{value}</pre>}>
          <span ref={this.ref} className={styles.cellEllipsis}>
            {value}
          </span>
        </Tooltip>
      );
    }
    return (
      <span ref={this.ref} className={styles.cellEllipsis}>
        {value}
      </span>
    );
  }
}

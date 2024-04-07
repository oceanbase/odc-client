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

import { Tabs } from 'antd';
import { TabsProps } from 'antd/lib/tabs';
import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';

const cardTarget = {
  drop(props, monitor) {
    const dragKey = monitor.getItem().index;
    const hoverKey = props.index;

    if (dragKey === hoverKey) {
      return;
    }

    props.moveTabNode(dragKey, hoverKey);
    monitor.getItem().index = hoverKey;
  },
};
const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

class TabNode extends React.PureComponent<any, any> {
  render() {
    const { connectDragSource, connectDropTarget, children } = this.props;

    return connectDragSource(connectDropTarget(children));
  }
}

const WrapTabNode = DropTarget('DND_NODE', cardTarget, (connect) => ({
  connectDropTarget: connect.dropTarget(),
}))(
  DragSource('DND_NODE', cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }))(TabNode),
);

interface IDraggableTabsProps extends TabsProps {
  moveTabNode: (dragKey: string, hoverKey: string) => void;
}
export default class DraggableTabs extends React.PureComponent<IDraggableTabsProps, any> {
  state = {
    order: [],
  };

  moveTabNode = (dragKey, hoverKey) => {
    const newOrder = this.state.order.slice();
    const { children } = this.props;

    React.Children.forEach(children, (c: any) => {
      if (newOrder.indexOf(c.key) === -1) {
        newOrder.push(c.key);
      }
    });

    const dragIndex = newOrder.indexOf(dragKey);
    const hoverIndex = newOrder.indexOf(hoverKey);

    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragKey);

    this.setState({
      order: newOrder,
    });
  };

  renderTabBar = (props, DefaultTabBar) => {
    const { moveTabNode, items, ...restProps } = props;
    return (
      <DefaultTabBar {...restProps}>
        {(node) => (
          <WrapTabNode key={node.key} index={node.key} moveTabNode={this.props.moveTabNode}>
            {node}
          </WrapTabNode>
        )}
      </DefaultTabBar>
    );
  };

  render() {
    const { order } = this.state;
    const { children, moveTabNode, ...rest } = this.props;

    return <Tabs renderTabBar={this.renderTabBar} {...rest} />;
  }
}

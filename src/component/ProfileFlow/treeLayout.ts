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

import { NODE_WIDTH, NODE_X_INTERVAL, NODE_HEIGTH, NODE_Y_INTERVAL } from './constant';

// 节点类
export class Node {
  // 存放节点数据
  public data: any;
  // 父节点
  public parent: Node;
  // 孩子节点
  public child: Node[];
  // 节点所在的层级
  public layer: number;
  // 节点在层级的位置
  public index: number;
  // 横坐标
  public x: number;
  // 纵坐标
  public y: number;
  // 初始横坐标
  public ox: number;

  constructor(data: any, parent: Node, layer: number, index: number, x: number, y: number) {
    this.data = data;
    this.parent = parent;
    this.layer = layer;
    this.index = index;
    this.x = x;
    this.y = y;
    this.ox = x;
    this.child = [];
  }
}

// 树的主类
export class Tree {
  // 根节点
  public root: Node;
  // 节点数
  public count: number;
  // 一个保存树层次结构的hashtree
  public hashTree: Array<Node[]>;
  // 渲染请求计数器
  private renderRequestCount: number;
  // 渲染执行计数器
  private renderCount: number;
  // 根节点横坐标
  public rootX: number;
  // 根节点纵坐标
  public rootY: number;
  // 父子节点的垂直间距
  private yInterval: number;
  // 节点间的水平最小间距
  private nodeInterval: number;
  // 节点的宽度
  private nodeWidth: number;
  // 节点的高度
  private nodeHeight: number;

  constructor() {
    this.count = 0;
    this.nodeWidth = NODE_WIDTH;
    this.nodeHeight = NODE_HEIGTH;
    this.nodeInterval = NODE_X_INTERVAL + this.nodeWidth;
    this.yInterval = NODE_Y_INTERVAL + this.nodeHeight;
    this.rootX = 0;
    this.rootY = 0;
    this.hashTree = [];
    this.renderRequestCount = this.renderCount = 0;
  }

  /**
   * 核心函数：布局调整函数
   */
  layout() {
    // 正推布局，从根节点开始，按照节点的水平垂直间距布局整棵树
    this.layoutChild(this.root);
    // 回推布局，从最底层开始，往上检索，查找重叠节点，调整优化树的布局
    this.layoutOverlaps();
  }

  /**
   * 找出与node1的某个祖先节点为兄弟节点的node2的祖先节点
   * @param node1
   * @param node2
   */
  findCommonParentNode(node1: Node, node2: Node): Node {
    // 若node1和node2为兄弟节点，返回node2
    if (node1.parent === node2.parent) {
      return node2;
    }
    // 否则，递归往上寻找
    else {
      return this.findCommonParentNode(node1.parent, node2.parent);
    }
  }

  /**
   * 水平位移整棵树
   * @param node 该树的根节点
   * @param x 要移动到的位置
   */
  translateTree(node: Node, x: number, y?: number) {
    y = typeof y === 'undefined' ? node.y : y;

    // 计算移动的距离
    let dx = x - node.x;
    let dy = y - node.y;
    // 更新节点的横坐标
    node.x = x;
    node.y = y;

    // 位移所有子节点
    for (let i = 0; i < node.child.length; i++) {
      this.translateTree(node.child[i], node.child[i].x + dx, node.child[i].y + dy);
    }
  }

  /**
   * 回推函数
   */
  // 布局重叠节点
  layoutOverlaps() {
    for (let i = this.hashTree.length - 1; i >= 0; i--) {
      let j = 0;
      while (j < this.hashTree[i].length - 1) {
        const n1 = this.hashTree[i][j];
        const n2 = this.hashTree[i][j + 1];
        if (this.isOverlaps(n1, n2)) {
          const dx = n1.x + this.nodeInterval - n2.x;
          const node2Move = this.findCommonParentNode(n1, n2);
          if (dx !== 0) {
            const node2MoveIndex = this.hashTree[i].indexOf(node2Move);
            const nodesToMove = this.getNodesToMove(node2Move);
            this.hashTree[i].splice(node2MoveIndex, nodesToMove.length);
            this.translateTree(node2Move, node2Move.x + dx);
            this.centerChild(node2Move.parent);
            this.insertNodesToHashTree(nodesToMove, i);
            j = this.hashTree[i].indexOf(node2Move) + 1;
          }
        } else {
          j++;
        }
      }
    }
  }
  // 调整子节点位置，确保子节点之间不重叠
  adjustChildrenPositions(node) {
    if (node.children && node.children.length > 0) {
      let prevChild = null;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (prevChild) {
          // 根据前一个兄弟节点和间距计算
          child.x = prevChild.x + this.nodeInterval;
          // 检查与前一个兄弟节点是否重叠
          if (this.isOverlaps(child, prevChild)) {
            child.x = prevChild.x + this.nodeInterval;
          }
        } else {
          // 第一个子节点，根据父节点居中
          child.x = node.x;
        }
        prevChild = child;
        // 递归调整子节点的子节点
        this.adjustChildrenPositions(child);
      }
    }
  }
  /**
   * 获取需要移动的节点
   * @param node
   * @returns
   */
  getNodesToMove(node): Node[] {
    const nodesToMove: Node[] = [];
    const queue = [node];

    while (queue.length > 0) {
      const curNode = queue.shift()!;
      nodesToMove.push(curNode);

      if (curNode.children) {
        queue.push(...curNode.children);
      }
    }
    return nodesToMove;
  }

  /**
   * 将节点插入到哈希树中
   * @param nodes
   * @param level
   */
  insertNodesToHashTree(nodes: Node[], level: number) {
    // 如果 this.hashTree[level] 不存在，则初始化为空数组
    if (!this.hashTree[level]) {
      this.hashTree[level] = [];
    }
    // 将 nodes 中的节点依次添加到 this.hashTree[level] 中
    for (const node of nodes) {
      this.hashTree[level].push(node);
    }
  }

  /**
   * 居中所有子节点
   * @param parent 父节点：按照该父节点的位置，居中该父节点下的所有子节点
   */
  centerChild(parent: Node) {
    // 要移动的距离
    let dx = 0;

    // 父节点为null，返回
    if (parent === null) return;

    // 只有一个子节点，则只要将该子节点与父节点对齐即可
    if (parent.child.length === 1) {
      dx = parent.x - parent.child[0].x;
    }

    // > 1 的子节点，就要计算最左的子节点和最右的子节点的距离的中点与父节点的距离
    if (parent.child.length > 1) {
      dx =
        parent.x -
        (parent.child[0].x + (parent.child[parent.child.length - 1].x - parent.child[0].x) / 2);
    }
    // 若要移动的距离不为0
    if (dx) {
      // 将所有子节点居中对齐父节点
      for (let i = 0; i < parent.child.length; i++) {
        this.translateTree(parent.child[i], parent.child[i].x + dx);
      }
    }
  }

  /**
   * 正推布局函数，将当前节点的所有子节点按等间距布局
   * @param node 当前节点
   */
  layoutChild(node: Node) {
    // 若当前节点为叶子节点，返回
    if (node.child.length === 0) return;
    else {
      // 计算子节点最左位置
      let start = node.x - ((node.child.length - 1) * this.nodeInterval) / 2;

      // 遍历子节点
      for (let i = 0, len = node.child.length; i < len; i++) {
        // 计算当前子节点横坐标
        let x = start + i * this.nodeInterval;
        let childY = node.y + this.yInterval;
        // 移动该子节点及以该子节点为根的整棵树
        this.translateTree(node.child[i], x, childY);
        // 递归布局该子节点
        this.layoutChild(node.child[i]);
      }
    }
  }

  /**
   * 判断重叠函数
   * @param node1 左边的节点
   * @param node2 右边的节点
   */
  isOverlaps(node1: Node, node2: Node): boolean {
    // 若左边节点的横坐标比右边节点大，或者两节点间的间距小于最小间距，均判断为重叠
    return Math.abs(node1.x - node2.x) < this.nodeInterval;
  }

  /**
   * 更新需要更新的节点
   * @param node
   */
  patch(node: Node) {
    // 若节点的当前位置不等于初始位置，则更新
    if (node.x !== node.ox) {
      // 更新节点的初始位置为当前位置
      node.ox = node.x;
    }

    // 递归更新子节点
    for (let i = 0; i < node.child.length; i++) {
      this.patch(node.child[i]);
    }
  }
}

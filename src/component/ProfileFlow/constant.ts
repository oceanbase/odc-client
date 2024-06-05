// reactFlow id
export const REACT_FLOW_ID = 'PROFILE_FLOW_BOX';
// 节点宽度
export const NODE_WIDTH = 280;
// 节点高度
export const NODE_HEIGTH = 90;
// 节点x间距
export const NODE_X_INTERVAL = 80;
// 节点y间距
export const NODE_Y_INTERVAL = 84;
// 千
export const KILO = 1000;
// 初始化node距离画布top的高度
export const INIT_HEIGHT_GAP = 16;

export const subNodeSortType = {
  BY_DURATION: 'duration',
  BY_OUTPUT: 'output',
  BY_MAX_MEMORY: 'maxMemory',
};

// 子节点信息汇总
export const SUM = 'SUM';

export const subNodesSortMap = {
  [subNodeSortType.BY_DURATION]: {
    label: '按 DB 耗时排序',
  },
  [subNodeSortType.BY_MAX_MEMORY]: {
    label: '按内存排序',
    objectKey: 'Max memory',
  },
  [subNodeSortType.BY_OUTPUT]: {
    label: '按吐行排序',
    objectKey: 'Output rows',
  },
};

export const CPU_TIME = 'CPU time';
export const IO_WAIT_TIME = 'I/O wait time';

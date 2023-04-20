import { PLType } from '@/constant/plType';
import { IFunction, IPLParam, IProcedure, ParamMode } from '@/d.ts';
import SessionStore from '../sessionManager/session';

export enum DebugStatus {
  /**
   * 初始化完成
   */
  INIT = 'init',
  /**
   * 执行到下一个断点
   */
  RESUME = 'resume',
  /**
   * 单步执行
   */
  STEP_OVER = 'step_over',
  /**
   * 跳入执行
   */
  STEP_IN = 'step_in',
  /**
   * 跳出执行
   */
  STEP_OUT = 'step_out',
  /**
   * 结束中
   */
  EXITING = 'exiting',
  /**
   * 成功结束
   */
  SUCCESS = 'success',
  /**
   * 失败结束
   */
  FAIL = 'fail',
  /**
   * 终止
   */
  STOP = 'stop',
  /**
   * 重启中
   */
  RECOVER = 'recover',
}

export interface ICreateDebugConfig {
  plType: PLType;
  session: SessionStore;
  packageName?: string;
  procedure?: IProcedure;
  function?: IFunction;
  /**
   * 内容
   */
  content?: string;
  onContextChange?: (newContext: IDebugStackItem[], oldContext: IDebugStackItem[]) => void;
}

export interface IDebugConfig extends ICreateDebugConfig {
  debugId: string;
}

export interface IDebugError {
  name: string;
  type: string;
  line: number;
  position: number;
  text: string;
  attribute: string;
  messageNumber: number;
}

export interface IDebugBreakpoint {
  /**
   * 断点行
   */
  line: number;
  /**
   * 断点的序号
   */
  num: number;
}
/**
 * PL 调试参数，出参+入参
 */
export interface IDebugParam {
  paramName: string;
  seqNum: number;
  paramMode: ParamMode;
  dataType: string;
  defaultValue: string;
}
/**
 * 上下文变量
 */
export interface IDebugContextVariable {
  name: string;
  frameNum: number;
  value: string;
}
/**
 * 调试的对象信息
 */
export interface IDebugStackItem {
  /**
   * 文件内容
   */
  content: string;
  plName: string;
  packageName?: string;
  breakpoints: IDebugBreakpoint[];
  plType: PLType;
  /**
   * 当前是否为执行上下文
   */
  isActive: boolean;
  /**
   * 执行到哪一行
   */
  activeLine?: number;
}

export interface IDebugFunctionResult {
  params?: IDebugParam[];
  returnType: string;
  returnValue: string;
}
export interface IDebugProcedureResult {
  params: IDebugParam[];
}

export interface IDebugContext {
  /**
   * 是否已经执行完成
   */
  terminated: boolean;
  variables: IDebugContextVariable[];
  /**
   * 执行失败会有错误信息
   */
  errors: {
    name: string;
    type: string;
    line: number;
    position: number;
    text: string;
    attribute: string;
    messageNumber: number;
  }[];
  /**
   * dbms输出
   */
  dbmsOutput: {
    line: string;
  };
  /**
   * 当前栈
   */
  backtrace: {
    packageName: string;
    plName: string;
    plType: PLType;
    lineNum: number;
    terminated: string;
    stackdepth: number;
  };
  /**
   * 函数的结果
   */
  functionResult: IDebugFunctionResult;
  /**
   * 存储过程结果
   */
  procedureResult: IPLParam[];
}

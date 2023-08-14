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

import { getFunctionByFuncName, getPackage, getProcedureByProName } from '@/common/network';
import {
  addBreakpoints,
  createDebugSession,
  disposeDebugSession,
  executeResume,
  executeStepIn,
  executeStepOut,
  executeStepOver,
  getDebugContext,
  removeBreakpoints,
} from '@/common/network/debug';
import { PLType } from '@/constant/plType';
import type { IFunction, IPLParam, IProcedure } from '@/d.ts';
import { ILogType } from '@/d.ts';
import { cloneDeep } from 'lodash';
import { action, observable, runInAction } from 'mobx';
import SessionStore from '../sessionManager/session';
import DebugHistory from './debugHistory';
import type {
  ICreateDebugConfig,
  IDebugBreakpoint,
  IDebugConfig,
  IDebugContextVariable,
  IDebugError,
  IDebugFunctionResult,
  IDebugProcedureResult,
  IDebugStackItem,
} from './type';
import { DebugStatus } from './type';

type IDebugResult = IDebugFunctionResult | IDebugProcedureResult | IDebugError[];

export class Debug {
  @observable
  public debugId: string;
  @observable
  public plType: PLType;
  @observable
  public packageName?: string;
  @observable
  public status: DebugStatus;
  @observable
  public function: IFunction;
  @observable
  public procedure: IProcedure;
  @observable
  public dbms: string;
  @observable
  public history: DebugHistory = new DebugHistory();
  @observable
  public contextVariables: IDebugContextVariable[] = [];
  @observable
  public plInfo: IDebugStackItem[] = [];
  @observable
  public result: IDebugResult;

  public anonymousBlock: string;

  public session: SessionStore;

  public onContextChangeQueue?: ((
    newContext: IDebugStackItem[],
    oldContext: IDebugStackItem[],
  ) => void)[] = [];

  public static async createDebug(config: ICreateDebugConfig) {
    const ddl = await Debug.getContentFromPL(
      config.plType,
      config.function?.funName || config?.procedure?.proName,
      config.packageName,
      config.session,
    );
    if (!ddl && config.plType !== PLType.ANONYMOUSBLOCK) {
      return null;
    }
    if (config.plType === PLType.FUNCTION) {
      config.function = Object.assign({}, config.function, { ddl });
      config.content = ddl;
    } else if (config.plType === PLType.PROCEDURE) {
      config.procedure = Object.assign({}, config.procedure, { ddl });
      config.content = ddl;
    }
    const debugId = await createDebugSession(
      config.packageName,
      Debug.getConfigSchema(config),
      config.plType,
      config.anonymousBlock,
      config.session,
    );
    if (debugId) {
      return new Debug(
        Object.assign(
          {
            debugId,
          },
          config,
        ),
      );
    }
  }

  public static getConfigSchema(config: ICreateDebugConfig) {
    switch (config.plType) {
      case PLType.FUNCTION: {
        return config.function;
      }
      case PLType.PROCEDURE: {
        return config.procedure;
      }
      default: {
        return null;
      }
    }
  }

  constructor(config: IDebugConfig) {
    this.debugId = config.debugId;
    this.plType = config.plType;
    this.packageName = config.packageName;
    this.status = DebugStatus.INIT;
    this.function = config.function;
    this.procedure = config.procedure;
    this.onContextChangeQueue = [config.onContextChange];
    this.session = config.session;
    this.anonymousBlock = config.anonymousBlock;
    this.plInfo = [
      {
        content: config.content,
        plName: this.getPlName(),
        packageName: config.packageName,
        breakpoints: [],
        plType: config.plType,
        isActive: true,
      },
    ];
    this.history.addHistory(
      {
        debugId: this.debugId,
      },
      'Start Debug',
      ILogType.INFO,
    );
  }

  /**
   * 重新进行调试
   */
  public async recoverDebug(newParams?: IPLParam[], ddl?: string) {
    const oldStatus = this.status;
    try {
      this.status = DebugStatus.RECOVER;
      const mainPlName = this.getPlName(true);
      const mainPl = this.getPlInfo(this.packageName, mainPlName, this.plType);
      if (newParams && this.getPlSchema()) {
        this.getPlSchema().params = newParams;
      }
      const debugId = await createDebugSession(
        this.packageName,
        this.getPlSchema(),
        this.plType,
        ddl,
        this.session,
      );
      if (debugId) {
        this.debugId = debugId;
        const initBreakPoints = mainPl.breakpoints;
        this.plInfo = this.plInfo.map((pl) => {
          return {
            ...pl,
            breakpoints: [],
            isActive: mainPl === pl ? true : false,
            activeLine: null,
          };
        });
        await this.addBreakpoints(
          initBreakPoints?.map((point) => {
            return {
              ...point,
              plType: this.plType,
              plName: mainPlName,
              packageName: this.packageName,
            };
          }),
        );
        runInAction(() => {
          this.status = DebugStatus.INIT;
          this.history = new DebugHistory();
          this.dbms = null;
          this.result = null;
          this.history.addHistory(
            {
              debugId: this.debugId,
            },
            'Start Debug',
            ILogType.INFO,
          );
        });
      } else {
        this.status = oldStatus;
      }
    } catch (e) {
      console.trace(e);
      this.status = oldStatus;
    }
  }

  public onContextChange = (newContext: IDebugStackItem[], oldContext: IDebugStackItem[]) => {
    this.onContextChangeQueue.forEach((func) => {
      func?.(newContext, oldContext);
    });
  };
  public addContextListener(func) {
    this.onContextChangeQueue.push(func);
  }
  public removeContextListener(func) {
    this.onContextChangeQueue = this.onContextChangeQueue.filter((f) => {
      return f !== func;
    });
  }
  public isDebugEnd() {
    return [DebugStatus.STOP, DebugStatus.SUCCESS, DebugStatus.FAIL, DebugStatus.RECOVER].includes(
      this.status,
    );
  }

  public getPlSchema() {
    switch (this.plType) {
      case PLType.FUNCTION: {
        return this.function;
      }
      case PLType.PROCEDURE: {
        return this.procedure;
      }
      default: {
        return null;
      }
    }
  }
  public getPlName(isMain: boolean = false): string {
    if (isMain) {
      switch (this.plType) {
        case PLType.FUNCTION: {
          return this.function.funName;
        }
        case PLType.PROCEDURE: {
          return this.procedure.proName;
        }
        default: {
          return '__anonymous_block__';
        }
      }
    }
    const activePl = this.getActivePl();
    if (activePl) {
      return activePl.plName;
    }
    switch (this.plType) {
      case PLType.FUNCTION: {
        return this.function.funName;
      }
      case PLType.PROCEDURE: {
        return this.procedure.proName;
      }
      case PLType.ANONYMOUSBLOCK: {
        return '__anonymous_block__';
      }
      default: {
        return '';
      }
    }
  }
  public getActivePl() {
    return this.plInfo.find((pl) => {
      return pl.isActive;
    });
  }
  public async dispose() {
    this.contextVariables = [];
    const oldContext = cloneDeep(this.plInfo);
    this.plInfo = this.plInfo.map((pl) => {
      return {
        ...pl,
        isActive: false,
        activeLine: null,
      };
    });
    this.onContextChange?.(this.plInfo, oldContext);
    return await disposeDebugSession(this.debugId);
  }
  public async addBreakpoint(
    packageName: string | null,
    plName: string,
    plType: PLType,
    line: number,
  ) {
    return await this.addBreakpoints([
      {
        packageName,
        plName,
        line,
        plType,
      },
    ]);
  }
  public async addBreakpoints(
    points: {
      packageName: string | null;
      plName: string;
      plType: PLType;
      line: number;
    }[],
  ) {
    const breakpoints = await addBreakpoints(this.debugId, points);
    if (breakpoints) {
      const oldContext = cloneDeep(this.plInfo);
      breakpoints.forEach(
        ({ packageName, objectName: plName, objectType: plType, lineNum, breakpointNum }) => {
          const pl = this.getPlInfo(packageName, plName, plType);
          pl.breakpoints.push({
            line: lineNum,
            num: breakpointNum,
          });
          this.history.addHistory(
            {
              plName,
              packageName,
              line: lineNum,
              plType,
            },
            `Add breakpoint ${Debug.getFullName(packageName, plName)} [line ${lineNum}].`,
            ILogType.INFO,
          );
        },
      );
      this.onContextChange?.(this.plInfo, oldContext);
      return true;
    } else {
      points.forEach(({ packageName, plName, line, plType }) => {
        this.history.addHistory(
          {
            plName,
            packageName,
            line,
            plType,
          },
          `Add breakpoint ${Debug.getFullName(packageName, plName)} [line ${line}].`,
          ILogType.ERROR,
        );
      });
      this.onContextChange?.(this.plInfo, this.plInfo);
    }
  }
  public async removeBreakpoint(
    packageName: string | null,
    plName: string,
    line: number,
    plType: PLType,
  ) {
    return await this.removeBreakpoints([
      {
        packageName,
        plName,
        line,
        plType,
      },
    ]);
  }

  @action
  public async removeBreakpoints(
    points: {
      packageName: string | null;
      plName: string;
      line: number;
      plType: PLType;
    }[],
  ) {
    const oldContext = cloneDeep(this.plInfo);
    const breakpoints = [];
    points.forEach(({ packageName, plName, plType, line }) => {
      const pl = this.getPlInfo(packageName, plName, plType);
      const breakPoint = pl.breakpoints.find((point) => point.line === line);
      if (breakPoint) {
        breakpoints.push({
          packageName,
          plName,
          plType,
          line,
          breakpointNum: breakPoint.num,
        });
      }
    });
    if (!breakpoints.length) {
      return;
    }
    let isSuccess = true;
    if (!this.isDebugEnd()) {
      isSuccess = await removeBreakpoints(this.debugId, breakpoints);
    }
    breakpoints.forEach(({ packageName, plName, plType, line }) => {
      this.history.addHistory(
        {
          plName,
          packageName,
          line,
          plType,
        },
        `Remove breakpoint ${Debug.getFullName(packageName, plName)} [line ${line}].`,
        isSuccess ? ILogType.INFO : ILogType.ERROR,
      );
    });
    if (!isSuccess) {
      this.onContextChange?.(this.plInfo, oldContext);
      return false;
    }
    points.forEach(({ packageName, plName, plType, line }) => {
      const pl = this.getPlInfo(packageName, plName, plType);
      pl.breakpoints = pl.breakpoints.filter((point) => point.line !== line);
    });
    this.onContextChange?.(this.plInfo, oldContext);
    return true;
  }
  public async executeResume() {
    this.status = DebugStatus.RESUME;
    const isSuccess = await executeResume(this.debugId);
    this.history.addHistory({}, 'Continue execution', isSuccess ? ILogType.INFO : ILogType.ERROR);
    if (isSuccess) {
      await this.syncDebugContext();
    } else {
      this.status = DebugStatus.INIT;
    }
  }
  public async executeStepOver() {
    this.status = DebugStatus.STEP_OVER;
    const isSuccess = await executeStepOver(this.debugId);
    this.history.addHistory({}, 'Execute next line', isSuccess ? ILogType.INFO : ILogType.ERROR);
    if (isSuccess) {
      await this.syncDebugContext();
    } else {
      this.status = DebugStatus.INIT;
    }
  }
  public async executeSetpIn() {
    this.status = DebugStatus.STEP_IN;
    const isSuccess = await executeStepIn(this.debugId);
    this.history.addHistory({}, 'Step in', isSuccess ? ILogType.INFO : ILogType.ERROR);
    if (isSuccess) {
      await this.syncDebugContext();
    } else {
      this.status = DebugStatus.INIT;
    }
  }
  public async executeStepOut() {
    this.status = DebugStatus.STEP_OUT;
    const isSuccess = await executeStepOut(this.debugId);
    this.history.addHistory({}, 'Step out', isSuccess ? ILogType.INFO : ILogType.ERROR);
    if (isSuccess) {
      await this.syncDebugContext();
    } else {
      this.status = DebugStatus.INIT;
    }
  }
  public async executeExit() {
    this.status = DebugStatus.EXITING;
    this.dispose();
    this.history.addHistory({}, 'Stop Debug', ILogType.WARN);
    this.status = DebugStatus.STOP;
  }
  public async syncDebugContext() {
    const result = await getDebugContext(this.debugId);
    if (result) {
      const oldContext = cloneDeep(this.plInfo);
      if (result.terminated) {
        /**
         * 执行结束的逻辑
         */
        this.contextVariables = [];
        this.dbms = (this.dbms || '') + (result.dbmsOutput?.line || '');
        if (result.errors?.length) {
          this.history.addHistory(
            { result },
            result.errors?.map((error) => error.text)?.join('\n') || 'Execute fail',
            ILogType.ERROR,
          );
          this.result = result.errors;
          this.status = DebugStatus.FAIL;
        } else {
          this.history.addHistory({ result }, 'Process exit', ILogType.INFO);
          switch (this.plType) {
            case PLType.FUNCTION: {
              this.result = result.functionResult;
              break;
            }
            case PLType.PROCEDURE: {
              this.result = {
                params: result.procedureResult,
              };
              break;
            }
          }
          this.status = DebugStatus.SUCCESS;
        }
        this.dispose();
      } else {
        /**
         * 还在执行，需要更新状态
         */
        const { plName, lineNum, plType, packageName } = result.backtrace;
        await this.updatePlStack(plType, plName, packageName, lineNum);
        this.contextVariables = result.variables;
        this.dbms = (this.dbms || '') + (result.dbmsOutput?.line || '');
        this.status = DebugStatus.INIT;
        this.onContextChange?.(this.plInfo, oldContext);
      }
    } else {
      this.status = DebugStatus.FAIL;
      this.history.addHistory({}, 'Sync context failed', ILogType.ERROR);
      this.dispose();
    }
  }
  /**
   * 更新当前上下文的执行信息
   */
  public async updatePlStack(plType: PLType, plName: string, packageName: string, lineNum: number) {
    const pl = this.getActivePl();
    if (pl.plName !== plName || packageName != pl.packageName || plType !== pl.plType) {
      /**
       * 上下文对象切换了
       */
      const newPl = this.plInfo.find((pl) => {
        return pl.plName === plName && packageName == pl.packageName && plType === pl.plType;
      });
      if (!newPl) {
        /**
         * 不在缓存里面，去拉取
         */
        const content = await Debug.getContentFromPL(plType, plName, packageName, this.session);
        if (content) {
          this.plInfo.push({
            content,
            plName,
            plType,
            packageName,
            breakpoints: [],
            isActive: false,
          });
        }
      }
      this.setPlActive(plType, plName, packageName, lineNum);
    } else {
      pl.activeLine = lineNum;
      this.plInfo = [...this.plInfo];
    }
  }
  private setPlActive(plType: PLType, plName: string, packageName: string, activeLine: number) {
    this.plInfo = this.plInfo.map((pl) => {
      if (pl.plName === plName && packageName == pl.packageName && plType === pl.plType) {
        return {
          ...pl,
          isActive: true,
          activeLine,
        };
      } else if (pl.isActive) {
        return {
          ...pl,
          isActive: false,
          activeLine: null,
        };
      } else {
        return pl;
      }
    });
  }
  public static async getContentFromPL(
    plType: PLType,
    plName: string,
    packageName: string,
    session: SessionStore,
  ): Promise<string> {
    if (packageName) {
      return (await getPackage(packageName, session?.sessionId, session?.database?.dbName))
        ?.packageBody?.basicInfo?.ddl;
    } else if (plType === PLType.FUNCTION) {
      return (
        await getFunctionByFuncName(plName, false, session?.sessionId, session?.database?.dbName)
      ).ddl;
    } else if (plType === PLType.PROCEDURE) {
      return (
        await getProcedureByProName(plName, false, session?.sessionId, session?.database?.dbName)
      ).ddl;
    } else {
      return null;
    }
  }
  public static getFullName(packageName, plName) {
    return [packageName, plName].filter(Boolean).join('.');
  }
  public getFullName() {
    const plName = this.getPlName();
    return Debug.getFullName(this.packageName, plName);
  }
  public getPlInfo(packageName: string | null, plName: string, plType: PLType) {
    return this.plInfo.find((pl) => {
      return pl.packageName == packageName && plName === pl.plName && plType === pl.plType;
    });
  }
  public getAllBreakpoints() {
    let allBreakPoints: IDebugBreakpoint[] = [];
    return allBreakPoints
      .concat(
        ...this.plInfo.map((ctx) => {
          return ctx.breakpoints;
        }),
      )
      .filter(Boolean)
      .sort((a, b) => a.num - b.num);
  }
}

export class DebugStore {
  @observable
  public debugPools: {
    [tabKey: string]: Debug;
  } = {};

  @observable
  public debugLoading: {
    [tabKey: string]: boolean;
  } = {};

  @action
  public async newDebug(config: ICreateDebugConfig, tabKey: string) {
    this.debugLoading[tabKey] = true;
    try {
      const debug = await Debug.createDebug(config);
      if (debug) {
        this.debugPools[tabKey] = debug;
        return debug;
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.debugLoading[tabKey] = false;
    }
  }

  @action
  public removeDebug(tabKey: string) {
    const debug = this.getDebug(tabKey);
    if (debug && !debug.isDebugEnd()) {
      debug.dispose();
    }
    this.debugPools[tabKey] = null;
  }

  public getDebug(tabKey: string): Debug | null {
    return this.debugPools[tabKey];
  }
}

export default new DebugStore();

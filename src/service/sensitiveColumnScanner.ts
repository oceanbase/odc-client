/**
 * 敏感列扫描服务
 * 用于在表结构查看和SQL执行结果中触发敏感列扫描
 */

import { formatMessage } from '@/util/intl';
import logger from '@/util/logger';
import notification from '@/util/notification';
import { ISensitiveColumnInfo, Level } from '@/d.ts/sensitiveColumn';
import { IServerTableColumn } from '@/d.ts/table';
import { scanSingleTableAsync, getSingleTableScanResult } from '@/common/network/sensitiveColumn';
import sessionManagerStore from '@/store/sessionManager';
import login from '@/store/login';

// 扫描结果接口
export interface IScanResult {
  tableName: string;
  databaseName: string;
  sensitiveColumns: ISensitiveColumnInfo[];
  scanTime: number;
  scanId: string;
}

// 持久化缓存数据接口
interface IPersistentCacheData {
  result: IScanResult;
  expireTime: number;
  version: string;
}

// 缓存配置常量
const CACHE_CONFIG = {
  // 缓存过期时间：24小时
  EXPIRE_TIME: 24 * 60 * 60 * 1000,
  // 缓存版本，用于缓存格式升级时清理旧缓存
  VERSION: '1.0.0',
  // localStorage键前缀
  STORAGE_PREFIX: 'sensitive-scan',
};

// 扫描参数接口
export interface IScanParams {
  tableName: string;
  databaseName: string;
  sessionId: string;
  columns: IServerTableColumn[];
  projectId?: number;
  connectionId?: number;
  databaseId?: number;
  triggerSource: 'TABLE_VIEW' | 'SQL_RESULT'; // 触发来源
}

class SensitiveColumnScanner {
  private scanCache: Map<string, IScanResult> = new Map();
  private scanningTasks: Set<string> = new Set();
  private cacheChangeListeners: Set<(tableName: string, databaseName: string) => void> = new Set();

  /**
   * 生成内存缓存键
   */
  private getCacheKey(tableName: string, databaseName: string): string {
    return `${databaseName}.${tableName}`;
  }

  /**
   * 生成localStorage缓存键
   */
  private getStorageKey(tableName: string, databaseName: string): string {
    const orgId = login?.organizationId || 'default';
    return `${CACHE_CONFIG.STORAGE_PREFIX}-${orgId}-${databaseName}.${tableName}`;
  }

  /**
   * 从localStorage读取缓存
   */
  private getFromStorage(tableName: string, databaseName: string): IScanResult | null {
    try {
      const key = this.getStorageKey(tableName, databaseName);
      const cached = localStorage.getItem(key);
      if (!cached) {
        logger.debug(`localStorage缓存为空: ${tableName}`);
        return null;
      }

      const data: IPersistentCacheData = JSON.parse(cached);

      // 检查版本
      if (data.version !== CACHE_CONFIG.VERSION) {
        localStorage.removeItem(key);
        logger.info(
          `清除版本不匹配的缓存: ${tableName}, 版本 ${data.version} -> ${CACHE_CONFIG.VERSION}`,
        );
        return null;
      }

      // 检查是否过期
      if (Date.now() > data.expireTime) {
        localStorage.removeItem(key);
        logger.info(`清除过期缓存: ${tableName}`);
        return null;
      }

      logger.info(`从localStorage读取敏感列缓存: ${tableName}`);
      return data.result;
    } catch (error) {
      logger.error('读取localStorage缓存失败:', error);
      // 清除损坏的缓存
      try {
        const key = this.getStorageKey(tableName, databaseName);
        localStorage.removeItem(key);
        logger.info(`已清除损坏的缓存: ${tableName}`);
      } catch (cleanupError) {
        logger.error('清除损坏缓存失败:', cleanupError);
      }
      return null;
    }
  }

  /**
   * 保存到localStorage
   */
  private saveToStorage(result: IScanResult): void {
    try {
      const key = this.getStorageKey(result.tableName, result.databaseName);
      const data: IPersistentCacheData = {
        result,
        expireTime: Date.now() + CACHE_CONFIG.EXPIRE_TIME,
        version: CACHE_CONFIG.VERSION,
      };

      const dataStr = JSON.stringify(data);
      localStorage.setItem(key, dataStr);
      logger.info(
        `保存敏感列缓存到localStorage: ${result.tableName}, 大小: ${Math.round(
          dataStr.length / 1024,
        )}KB`,
      );
    } catch (error) {
      logger.error('保存localStorage缓存失败:', error);
      // 如果是存储空间不足，尝试清理过期缓存后重试
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        logger.warn('localStorage空间不足，尝试清理过期缓存后重试');
        try {
          this.cleanExpiredStorage();
          const key = this.getStorageKey(result.tableName, result.databaseName);
          const data: IPersistentCacheData = {
            result,
            expireTime: Date.now() + CACHE_CONFIG.EXPIRE_TIME,
            version: CACHE_CONFIG.VERSION,
          };
          localStorage.setItem(key, JSON.stringify(data));
          logger.info(`重试保存成功: ${result.tableName}`);
        } catch (retryError) {
          logger.error('重试保存失败:', retryError);
        }
      }
    }
  }

  /**
   * 保存持久化缓存
   */
  private savePersistentCache(cache: Record<string, IPersistentCacheData>): void {
    try {
      const cacheStr = JSON.stringify(cache);
      const orgId = login?.organizationId || 'default';
      const key = `${CACHE_CONFIG.STORAGE_PREFIX}-${orgId}-persistent`;
      localStorage.setItem(key, cacheStr);
      const cacheCount = Object.keys(cache).length;
      logger.debug(
        `保存持久化缓存成功: ${cacheCount} 项, 大小: ${Math.round(cacheStr.length / 1024)}KB`,
      );
    } catch (error) {
      logger.error('保存持久化缓存失败:', error);
      // 如果是存储空间不足，尝试清理后重试
      if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        logger.warn('localStorage空间不足，尝试清理后重试保存持久化缓存');
        try {
          // 清理所有过期缓存
          this.cleanExpiredStorage();
          // 重试保存
          const orgId = login?.organizationId || 'default';
          const key = `${CACHE_CONFIG.STORAGE_PREFIX}-${orgId}-persistent`;
          localStorage.setItem(key, JSON.stringify(cache));
          logger.info('重试保存持久化缓存成功');
        } catch (retryError) {
          logger.error('重试保存持久化缓存失败:', retryError);
        }
      }
    }
  }

  /**
   * 保存到持久化缓存
   */
  private saveToPersistentCache(
    cacheKey: string,
    cacheData: { result: IScanResult; timestamp: number },
  ): void {
    try {
      const persistentCache = this.loadPersistentCache();
      persistentCache[cacheKey] = {
        result: cacheData.result,
        expireTime: cacheData.timestamp + 24 * 60 * 60 * 1000, // 24小时后过期
        version: CACHE_CONFIG.VERSION,
      };
      this.savePersistentCache(persistentCache);
      logger.debug(`保存到持久化缓存成功: ${cacheKey}`);
    } catch (error) {
      logger.error(`保存到持久化缓存失败: ${cacheKey}`, error);
    }
  }

  /**
   * 从持久化缓存加载
   */
  private loadPersistentCache(): Record<string, IPersistentCacheData> {
    try {
      const orgId = login?.organizationId || 'default';
      const key = `${CACHE_CONFIG.STORAGE_PREFIX}-${orgId}-persistent`;
      const cached = localStorage.getItem(key);
      if (!cached) {
        return {};
      }
      return JSON.parse(cached);
    } catch (error) {
      logger.error('加载持久化缓存失败:', error);
      return {};
    }
  }

  /**
   * 从localStorage删除缓存
   */
  private removeFromStorage(tableName: string, databaseName: string): void {
    try {
      const key = this.getStorageKey(tableName, databaseName);
      localStorage.removeItem(key);
      logger.debug(`从localStorage删除敏感列缓存: ${tableName}`);
    } catch (error) {
      logger.error('删除localStorage缓存失败:', error);
    }
  }

  /**
   * 清理过期的localStorage缓存
   */
  private cleanExpiredStorage(): void {
    try {
      const orgId = login?.organizationId || 'default';
      const prefix = `${CACHE_CONFIG.STORAGE_PREFIX}-${orgId}-`;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const data: IPersistentCacheData = JSON.parse(cached);
              if (Date.now() > data.expireTime || data.version !== CACHE_CONFIG.VERSION) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            // 解析失败的缓存也删除
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      if (keysToRemove.length > 0) {
        logger.info(`缓存清理完成: 持久化缓存清理 ${keysToRemove.length} 项`);
      }
    } catch (error) {
      logger.error('清理过期缓存失败:', error);
    }
  }

  /**
   * 真实AI敏感列扫描
   * 调用后端API进行单表AI扫描
   */
  private async realAIScan(params: IScanParams): Promise<ISensitiveColumnInfo[]> {
    const { tableName, databaseName } = params;

    try {
      logger.info(`开始AI扫描敏感列: ${databaseName}.${tableName}`);

      // 获取项目ID和数据库ID
      const { projectId, databaseId } = await this.getScanContext(params);
      logger.info(`获取扫描上下文成功: projectId=${projectId}, databaseId=${databaseId}`);

      if (!projectId || !databaseId) {
        const errorMsg = formatMessage({
          id: 'service.sensitiveColumn.scan.context.missing',
          defaultMessage: '无法获取必要的扫描参数',
        });
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      // 启动单表AI扫描任务
      logger.info(`启动单表AI扫描任务: databaseId=${databaseId}, tableName=${tableName}`);
      const taskId = await scanSingleTableAsync(projectId, {
        databaseId,
        tableName,
        scanningMode: 'AI_ONLY', // AI专用模式（仅使用AI识别）
      });
      logger.info(`AI扫描任务已启动: taskId=${taskId}`);

      if (!taskId) {
        const errorMsg = formatMessage({
          id: 'service.sensitiveColumn.scan.task.start.failed',
          defaultMessage: '启动单表扫描任务失败',
        });
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      // 轮询单表扫描结果
      logger.info(`开始轮询AI扫描结果: taskId=${taskId}`);
      const result = await this.pollSingleTableScanResults(projectId, taskId);
      logger.info(`AI扫描完成，找到 ${result.sensitiveColumns?.length || 0} 个敏感列`);

      // 转换扫描结果格式
      const sensitiveColumnsData = result.result || result.sensitiveColumns || [];
      const tableSensitiveColumns = sensitiveColumnsData.map((col) => {
        const mappedLevel = this.mapSensitivityLevel(col.level);
        return {
          columnName: col.columnName,
          sensitivityLevel: mappedLevel,
          reason:
            col.reason ||
            formatMessage({
              id: 'service.sensitiveColumn.scan.reason.default',
              defaultMessage: '规则匹配',
            }),
          confidence: col.confidence || 0.9,
        };
      });

      logger.info(`AI扫描结果转换完成，共找到 ${tableSensitiveColumns.length} 个敏感列`);
      return tableSensitiveColumns;
    } catch (error) {
      logger.error('AI扫描敏感列失败:', error);
      notification.error({
        track: formatMessage({
          id: 'service.sensitiveColumn.scan.ai.failed',
          defaultMessage: 'AI扫描敏感列失败',
        }),
        supportRepeat: true,
      });
      throw error;
    }
  }

  private async getScanContext(params: IScanParams): Promise<{
    projectId: number;
    connectionId?: number;
    databaseId: number;
  }> {
    const { sessionId, databaseName } = params;

    // 从会话管理器获取连接信息
    const session = sessionManagerStore.sessionMap.get(sessionId);
    if (!session) {
      const errorMsg = formatMessage({
        id: 'service.sensitiveColumn.scan.session.notfound',
        defaultMessage: '无法找到会话信息',
      });
      logger.error(`${errorMsg}: sessionId=${sessionId}`);
      throw new Error(errorMsg);
    }

    const connectionId = session.connection?.id;
    const projectId = session.odcDatabase?.project?.id;
    const databaseId = session.odcDatabase?.id;

    if (!projectId || !databaseId) {
      const errorMsg = formatMessage({
        id: 'service.sensitiveColumn.scan.session.incomplete',
        defaultMessage: '会话信息不完整',
      });
      logger.error(`${errorMsg}: projectId=${projectId}, databaseId=${databaseId}`);
      throw new Error(errorMsg);
    }

    return { projectId, connectionId, databaseId };
  }

  private async pollScanResults(
    projectId: number,
    taskId: string,
    maxAttempts: number = 60,
  ): Promise<any> {
    logger.info(`开始轮询扫描结果: taskId=${taskId}, maxAttempts=${maxAttempts}`);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await getSingleTableScanResult(projectId, taskId);

        if (result && (result.status === 'SUCCESS' || result.status === 'COMPLETED')) {
          logger.info(`扫描任务完成: taskId=${taskId}, attempt=${attempt + 1}`);
          return result;
        }

        if (result && (result.status === 'FAILED' || result.status === 'CANCELLED')) {
          const errorMsg = formatMessage({
            id: 'service.sensitiveColumn.scan.task.failed',
            defaultMessage: '扫描任务失败',
          });
          const fullErrorMsg = `${errorMsg}: ${
            result.errorMsg ||
            formatMessage({
              id: 'service.sensitiveColumn.scan.error.unknown',
              defaultMessage: '未知错误',
            })
          }`;
          logger.error(fullErrorMsg);
          throw new Error(fullErrorMsg);
        }

        if (attempt % 10 === 0) {
          logger.info(
            `轮询进度: taskId=${taskId}, attempt=${attempt + 1}/${maxAttempts}, status=${
              result?.status || 'unknown'
            }`,
          );
        }

        // 等待2秒后重试
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          logger.error(`轮询扫描结果失败: taskId=${taskId}`, error);
          throw error;
        }
        logger.warn(`轮询扫描结果出错，将重试: taskId=${taskId}, attempt=${attempt + 1}`, error);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    const timeoutMsg = formatMessage({
      id: 'service.sensitiveColumn.scan.task.timeout',
      defaultMessage: '扫描任务超时',
    });
    logger.error(`${timeoutMsg}: taskId=${taskId}`);
    throw new Error(timeoutMsg);
  }

  /**
   * 轮询单表扫描结果
   */
  private async pollSingleTableScanResults(
    projectId: number,
    taskId: string,
    maxAttempts: number = 60,
  ): Promise<any> {
    logger.info(`开始轮询单表扫描结果: taskId=${taskId}, maxAttempts=${maxAttempts}`);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await getSingleTableScanResult(projectId, taskId);

        if (result && (result.status === 'SUCCESS' || result.status === 'COMPLETED')) {
          logger.info(`单表扫描任务完成: taskId=${taskId}, attempt=${attempt + 1}`);
          return result;
        }

        if (result && (result.status === 'FAILED' || result.status === 'CANCELLED')) {
          const errorMsg = formatMessage({
            id: 'service.sensitiveColumn.scan.task.failed',
            defaultMessage: '扫描任务失败',
          });
          const fullErrorMsg = `${errorMsg}: ${
            result.errorMsg ||
            result.errorCode ||
            formatMessage({
              id: 'service.sensitiveColumn.scan.error.unknown',
              defaultMessage: '未知错误',
            })
          }`;
          logger.error(fullErrorMsg);
          throw new Error(fullErrorMsg);
        }

        if (attempt % 10 === 0) {
          logger.info(
            `轮询进度: taskId=${taskId}, attempt=${attempt + 1}/${maxAttempts}, status=${
              result?.status || 'unknown'
            }`,
          );
        }

        // 等待2秒后重试
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          logger.error(`轮询单表扫描结果失败: taskId=${taskId}`, error);
          throw error;
        }
        logger.warn(
          `轮询单表扫描结果出错，将重试: taskId=${taskId}, attempt=${attempt + 1}`,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    const timeoutMsg = formatMessage({
      id: 'service.sensitiveColumn.scan.task.timeout',
      defaultMessage: '扫描任务超时',
    });
    logger.error(`${timeoutMsg}: taskId=${taskId}`);
    throw new Error(timeoutMsg);
  }

  private mapSensitivityLevel(level: any): 'HIGH' | 'MEDIUM' | 'LOW' {
    logger.debug(`mapSensitivityLevel 输入:`, { level, type: typeof level, value: level });

    // 处理 Level 枚举或字符串
    if (typeof level === 'number') {
      logger.debug(`处理数字类型敏感等级: ${level}`);
      // Level 枚举: LOW=0, MEDIUM=1, HIGH=2, EXTREME_HIGH=3
      switch (level) {
        case 0: // Level.LOW
          logger.debug(`映射 ${level} -> LOW`);
          return 'LOW';
        case 1: // Level.MEDIUM
          logger.debug(`映射 ${level} -> MEDIUM`);
          return 'MEDIUM';
        case 2: // Level.HIGH
        case 3: // Level.EXTREME_HIGH
          logger.debug(`映射 ${level} -> HIGH`);
          return 'HIGH';
        default:
          logger.debug(`未知数字等级 ${level}，默认返回 MEDIUM`);
          return 'MEDIUM';
      }
    }

    // 处理字符串类型
    const levelStr = String(level).toUpperCase();
    logger.debug(`处理字符串类型敏感等级: ${level} -> ${levelStr}`);
    switch (levelStr) {
      case 'HIGH':
      case '高':
        logger.debug(`映射 ${levelStr} -> HIGH`);
        return 'HIGH';
      case 'MEDIUM':
      case '中':
        logger.debug(`映射 ${levelStr} -> MEDIUM`);
        return 'MEDIUM';
      case 'LOW':
      case '低':
        logger.debug(`映射 ${levelStr} -> LOW`);
        return 'LOW';
      default:
        logger.debug(`未知字符串等级 ${levelStr}，默认返回 MEDIUM`);
        return 'MEDIUM';
    }
  }

  /**
   * 模拟AI敏感列扫描
   * 这里使用Mock数据模拟AI扫描行为
   */
  private async mockAIScan(params: IScanParams): Promise<ISensitiveColumnInfo[]> {
    const { tableName, columns } = params;
    logger.info(`开始Mock AI扫描: ${tableName}`);

    // 保留原有的模拟逻辑作为备用
    if (!columns || columns.length === 0) {
      logger.info(`Mock AI扫描完成: ${tableName}, 无列信息`);
      return [];
    }

    const sensitiveColumns: ISensitiveColumnInfo[] = [];

    // 敏感列匹配模式
    const sensitivePatterns = {
      HIGH: [
        /password/i,
        /pwd/i,
        /secret/i,
        /token/i,
        /key/i,
        /身份证/i,
        /idcard/i,
        /id_card/i,
        /ssn/i,
        /银行卡/i,
        /bank_card/i,
        /credit_card/i,
        /手机号/i,
        /phone/i,
        /mobile/i,
        /tel/i,
      ],
      MEDIUM: [
        /email/i,
        /mail/i,
        /邮箱/i,
        /address/i,
        /addr/i,
        /地址/i,
        /name/i,
        /姓名/i,
        /username/i,
        /user_name/i,
        /salary/i,
        /income/i,
        /工资/i,
        /收入/i,
      ],
      LOW: [
        /age/i,
        /年龄/i,
        /birthday/i,
        /birth/i,
        /生日/i,
        /gender/i,
        /sex/i,
        /性别/i,
        /department/i,
        /dept/i,
        /部门/i,
      ],
    };

    // 模拟AI识别逻辑
    columns.forEach((column) => {
      const columnName = column.name;

      // 检查高敏感
      for (const pattern of sensitivePatterns.HIGH) {
        if (pattern.test(columnName)) {
          sensitiveColumns.push({
            columnName,
            sensitivityLevel: 'HIGH',
            reason: `列名匹配高敏感模式: ${pattern.source}`,
            confidence: 0.9 + Math.random() * 0.1,
          });
          return;
        }
      }

      // 检查中敏感
      for (const pattern of sensitivePatterns.MEDIUM) {
        if (pattern.test(columnName)) {
          sensitiveColumns.push({
            columnName,
            sensitivityLevel: 'MEDIUM',
            reason: `列名匹配中敏感模式: ${pattern.source}`,
            confidence: 0.7 + Math.random() * 0.2,
          });
          return;
        }
      }

      // 检查低敏感
      for (const pattern of sensitivePatterns.LOW) {
        if (pattern.test(columnName)) {
          sensitiveColumns.push({
            columnName,
            sensitivityLevel: 'LOW',
            reason: `列名匹配低敏感模式: ${pattern.source}`,
            confidence: 0.5 + Math.random() * 0.3,
          });
          return;
        }
      }
    });

    logger.info(`Mock AI扫描完成: ${tableName}, 返回 ${sensitiveColumns.length} 个敏感列`);
    return sensitiveColumns;
  }

  /**
   * 执行敏感列扫描
   */
  private async performScan(params: IScanParams): Promise<ISensitiveColumnInfo[]> {
    const { tableName } = params;
    logger.info(`执行敏感列扫描: ${tableName}`);

    try {
      // 直接使用真实AI扫描
      const result = await this.realAIScan(params);

      logger.info(`敏感列扫描完成: ${tableName}, 找到 ${result.length} 个敏感列`);
      return result;
    } catch (error) {
      logger.error(`敏感列扫描执行失败: ${tableName}`, error);
      throw error;
    }
  }

  /**
   * 扫描敏感列
   */
  public async scanSensitiveColumns(params: IScanParams): Promise<IScanResult | null> {
    const cacheKey = this.getCacheKey(params.tableName, params.databaseName);

    logger.info(`开始敏感列扫描: ${cacheKey} (来源: ${params.triggerSource})`);

    try {
      // 检查是否正在扫描
      if (this.scanningTasks.has(cacheKey)) {
        logger.info(`敏感列扫描正在进行中: ${cacheKey}`);
        return null;
      }

      // 首先检查内存缓存（5分钟有效期，用于快速访问）
      const memoryCached = this.scanCache.get(cacheKey);
      if (memoryCached && Date.now() - memoryCached.scanTime < 5 * 60 * 1000) {
        logger.info(`使用内存缓存的敏感列扫描结果: ${cacheKey}`);
        return memoryCached;
      }

      // 检查localStorage持久化缓存（24小时有效期）
      const storageCached = this.getFromStorage(params.tableName, params.databaseName);
      if (storageCached) {
        // 将持久化缓存加载到内存缓存中
        this.scanCache.set(cacheKey, storageCached);
        logger.info(`使用localStorage缓存的敏感列扫描结果: ${cacheKey}`);
        return storageCached;
      }

      try {
        this.scanningTasks.add(cacheKey);

        logger.info(`开始新的敏感列扫描任务: ${params.tableName}`);

        // 清理过期缓存（异步执行，不阻塞扫描）
        setTimeout(() => this.cleanExpiredStorage(), 0);

        // 使用统一的扫描方法
        const sensitiveColumns = await this.performScan(params);

        const result: IScanResult = {
          tableName: params.tableName,
          databaseName: params.databaseName,
          sensitiveColumns,
          scanTime: Date.now(),
          scanId: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        // 同时保存到内存缓存和localStorage
        this.scanCache.set(cacheKey, result);
        this.saveToStorage(result);

        logger.info(
          `敏感列扫描完成: ${params.tableName}, 找到 ${sensitiveColumns.length} 个敏感列`,
        );
        return result;
      } finally {
        this.scanningTasks.delete(cacheKey);
      }
    } catch (error) {
      logger.error(`敏感列扫描失败: ${cacheKey}`, error);
      notification.error({
        track: formatMessage({
          id: 'service.sensitiveColumn.scan.failed',
          defaultMessage: '敏感列扫描失败',
        }),
        supportRepeat: true,
      });
      return null;
    }
  }

  /**
   * 获取缓存的扫描结果
   */
  getCachedResult(tableName: string, databaseName: string): IScanResult | null {
    const cacheKey = this.getCacheKey(tableName, databaseName);

    // 首先检查内存缓存
    const memoryCached = this.scanCache.get(cacheKey);
    if (memoryCached && Date.now() - memoryCached.scanTime < 5 * 60 * 1000) {
      return memoryCached;
    }

    // 检查localStorage缓存
    const storageCached = this.getFromStorage(tableName, databaseName);
    if (storageCached) {
      // 将持久化缓存加载到内存缓存中
      this.scanCache.set(cacheKey, storageCached);
      return storageCached;
    }

    return null;
  }

  /**
   * 清除缓存
   */
  public clearCache(tableName?: string, databaseName?: string): void {
    if (tableName && databaseName) {
      const cacheKey = this.getCacheKey(tableName, databaseName);
      this.scanCache.delete(cacheKey);
      this.removeFromStorage(tableName, databaseName);
      logger.info(`清除敏感列缓存: ${tableName}`);
      // 通知监听器缓存已清除
      this.notifyCacheChange(tableName, databaseName);
    } else {
      // 清除所有内存缓存
      this.scanCache.clear();

      // 清除所有localStorage缓存
      try {
        const orgId = login?.organizationId || 'default';
        const prefix = `${CACHE_CONFIG.STORAGE_PREFIX}-${orgId}-`;
        const keysToRemove: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));
        logger.info(`清除所有敏感列缓存，共${keysToRemove.length}个`);
      } catch (error) {
        logger.error('清除localStorage缓存失败:', error);
      }
    }
  }

  /**
   * 获取扫描状态
   */
  public isScanning(tableName: string, databaseName: string): boolean {
    const cacheKey = this.getCacheKey(tableName, databaseName);
    return this.scanningTasks.has(cacheKey);
  }

  /**
   * 按数据库清除缓存
   * 用于数据库刷新时清除该数据库下所有表的敏感列缓存
   */
  public clearCacheByDatabase(databaseName: string): void {
    try {
      // 清除内存缓存
      const keysToDelete: string[] = [];
      const tablesToNotify: string[] = [];
      this.scanCache.forEach((_, key) => {
        if (key.startsWith(`${databaseName}.`)) {
          keysToDelete.push(key);
          // 提取表名用于通知
          const tableName = key.substring(`${databaseName}.`.length);
          tablesToNotify.push(tableName);
        }
      });
      keysToDelete.forEach((key) => this.scanCache.delete(key));

      // 清除localStorage缓存
      const orgId = login?.organizationId || 'default';
      const prefix = `${CACHE_CONFIG.STORAGE_PREFIX}-${orgId}-${databaseName}.`;
      const storageKeysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          storageKeysToRemove.push(key);
        }
      }

      storageKeysToRemove.forEach((key) => localStorage.removeItem(key));

      const totalCleared = keysToDelete.length + storageKeysToRemove.length;
      if (totalCleared > 0) {
        logger.info(`清除数据库 ${databaseName} 的敏感列缓存，共${totalCleared}个`);
        // 通知所有受影响的表
        tablesToNotify.forEach((tableName) => {
          this.notifyCacheChange(tableName, databaseName);
        });
      }
    } catch (error) {
      logger.error(`清除数据库 ${databaseName} 缓存失败:`, error);
    }
  }

  /**
   * 添加缓存变更监听器
   */
  public addCacheChangeListener(listener: (tableName: string, databaseName: string) => void): void {
    this.cacheChangeListeners.add(listener);
  }

  /**
   * 移除缓存变更监听器
   */
  public removeCacheChangeListener(
    listener: (tableName: string, databaseName: string) => void,
  ): void {
    this.cacheChangeListeners.delete(listener);
  }

  /**
   * 通知缓存变更
   */
  private notifyCacheChange(tableName: string, databaseName: string): void {
    this.cacheChangeListeners.forEach((listener) => {
      try {
        listener(tableName, databaseName);
      } catch (error) {
        logger.error('缓存变更监听器执行失败:', error);
      }
    });
  }
}

// 导出单例
export const sensitiveColumnScanner = new SensitiveColumnScanner();
export default sensitiveColumnScanner;

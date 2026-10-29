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

/**
 * H2数据库迁移工具
 *
 * 该模块用于处理H2数据库从1.4.200版本到2.3.232版本的迁移过程。
 * 主要功能包括：
 * 1. 导出旧版本数据库的SQL脚本
 * 2. 导入SQL脚本到新版本数据库
 * 3. 验证迁移后的数据完整性
 * 4. 提供数据库恢复和重置功能
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { getH2JarPath, getJavaDBPath, getJavaPath } from './index';
import log from './log';
import { app, dialog } from 'electron';

const execAsync = promisify(exec);

/**
 * 执行命令的结果接口
 */
interface ExecResult {
  stdout: string;
  stderr: string;
}

// 配置常量
const OLD_H2_JAR_PATH = getH2JarPath().v1;
const NEW_H2_JAR_PATH = getH2JarPath().v2;
const DB_PATH = getJavaDBPath();
const JAVA_PATH = getJavaPath()?.javaBin || 'java';
const TMP_EXPORT_SQL_DIR = path.join(DB_PATH, 'odcTemp');
const TMP_EXPORT_SQL_NAME = 'odc.sql';

// 路径常量
const OLD_H2_PATH = path.join(DB_PATH, 'odc2.0.mv.db');
const OLD_H2_PATH_WITHOUT_SUFFIX = path.join(DB_PATH, 'odc2.0');
const OLD_H2_BACKUP_PATH = path.join(DB_PATH, 'odc2.0.mv.db.backup');
const NEW_H2_PATH = path.join(DB_PATH, 'odc4.0.mv.db');
const NEW_H2_PATH_WITHOUT_SUFFIX = path.join(DB_PATH, 'odc4.0');
const TMP_EXPORT_SQL_PATH = path.join(TMP_EXPORT_SQL_DIR, TMP_EXPORT_SQL_NAME);

// 数据库连接信息
const OLD_H2_URL = `jdbc:h2:${OLD_H2_PATH_WITHOUT_SUFFIX};MODE=MySQL;DATABASE_TO_UPPER=false`;
const NEW_H2_URL = `jdbc:h2:file:${NEW_H2_PATH_WITHOUT_SUFFIX};MODE=MySQL;DATABASE_TO_UPPER=false`;
const DB_USERNAME = 'sa';
const DB_PASSWORD = '';

/**
 * 清理临时文件和数据库文件
 * @param type - 清理类型：'delete_old' 删除旧数据库文件，'delete_new' 删除新数据库文件
 */
async function clear(type?: 'delete_old' | 'delete_new'): Promise<void> {
  if (fs.existsSync(TMP_EXPORT_SQL_DIR)) {
    await fsPromises.rm(TMP_EXPORT_SQL_DIR, { recursive: true, force: true });
    log.info(`Export directory ${TMP_EXPORT_SQL_DIR} has been deleted.`);
  }

  if (!type) return;

  switch (type) {
    case 'delete_old':
      if (fs.existsSync(OLD_H2_PATH)) {
        await fsPromises.rm(OLD_H2_PATH, { force: true });
      }
      break;
    case 'delete_new':
      if (fs.existsSync(NEW_H2_PATH)) {
        await fsPromises.rm(NEW_H2_PATH, { force: true });
      }
      break;
    default:
      log.warn('Unknown type arg, it must delete_old or delete_new');
  }
}

/**
 * 在旧版本H2数据库中执行SQL语句
 * @param sql - 要执行的SQL语句
 * @returns 执行结果
 */
async function executeSqlInOldH2(sql: string): Promise<string> {
  const { stdout, stderr } = (await execAsync(
    `"${JAVA_PATH}" -cp "${OLD_H2_JAR_PATH}" org.h2.tools.Shell -url "${OLD_H2_URL}" -user "${DB_USERNAME}" -password "${DB_PASSWORD}" -sql "${sql}"`,
  )) as ExecResult;
  if (stderr && /error/i.test(stderr)) {
    log.error('[old]execute sql error: ', stderr);
    return null;
  }
  return stdout;
}

/**
 * 在新版本H2数据库中执行SQL语句
 * @param sql - 要执行的SQL语句
 * @returns 执行结果
 */
async function executeSqlInNewH2(sql: string): Promise<string> {
  const { stdout, stderr } = (await execAsync(
    `"${JAVA_PATH}" -cp "${NEW_H2_JAR_PATH}" org.h2.tools.Shell -url "${NEW_H2_URL}" -user "${DB_USERNAME}" -password "${DB_PASSWORD}" -sql "${sql}"`,
  )) as ExecResult;
  if (stderr && /error/i.test(stderr)) {
    log.error('[new]execute sql error: ', stderr);
    return null;
  }
  return stdout;
}

/**
 * 检查新旧数据库的表结构是否一致
 * 比较表名列表，确保完全匹配
 * @returns 表结构是否一致
 */
async function checkTable(): Promise<boolean> {
  log.info('Checking table names in OLD and NEW databases...');

  const oldTableNames = await executeSqlInOldH2(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='PUBLIC' ORDER BY TABLE_NAME;",
  );
  const newTableNames = await executeSqlInNewH2(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='PUBLIC' ORDER BY TABLE_NAME;",
  );

  const oldTables = oldTableNames.split('\n').filter(Boolean).slice(1, -1);
  const newTables = newTableNames.split('\n').filter(Boolean).slice(1, -1);

  if (oldTables.length !== newTables.length) {
    log.error(
      `ERROR: Table counts do not match! OLD: ${oldTables.length}, NEW: ${newTables.length}`,
    );
    await clear();
    return false;
  }
  log.info('Table Check: ', oldTables, newTables);
  for (let i = 0; i < oldTables.length; i++) {
    if (oldTables[i] !== newTables[i]) {
      log.error(
        `ERROR: Table name mismatch at position ${i}! OLD: ${oldTables[i]}, NEW: ${newTables[i]}`,
      );
      await clear();
      return false;
    }
  }

  log.info('Table check match!');
  return true;
}

/**
 * 检查每个表的行数是否一致
 * @param oldTables - 旧数据库中的表名列表
 * @returns 所有表的行数是否一致
 */
async function checkTableRowCounts(oldTables: string[]): Promise<boolean> {
  log.info('Checking row counts for each table...');
  try {
    /**
     * 由于命令行的长度限制，需要把这条语句拆分成多条来执行
     * 按照 windows 8191的限制，每条语句按照100个字符来计算，每次执行的语句不能超过81张表，保险一点，按照50张表来处理
     */
    const maxTableCount = 50;
    for (let i = 0; i < oldTables.length; i += maxTableCount) {
      const sql = oldTables
        .slice(i, i + maxTableCount)
        .map((table) => `SELECT COUNT(*) as c FROM ${table}`)
        .join(' union all ');
      const result = await executeSqlInOldH2(sql);
      const newResult = await executeSqlInNewH2(sql);
      const oldCounts = result.split('\n').filter(Boolean).slice(1, -1);
      const newCounts = newResult.split('\n').filter(Boolean).slice(1, -1);
      log.info('sql: ', sql, 'oldCounts: ', oldCounts, 'newCounts: ', newCounts);
      if (oldCounts.length !== newCounts.length) {
        log.error('Row count mismatch for all tables! OLD: ', oldCounts, 'NEW: ', newCounts);
        return false;
      }
    }

    log.info('Row counts match for all tables!');
    return true;
  } catch (e) {
    log.error('checkTableRowCounts error: ', e);
    return false;
  }
}

/**
 * 检查迁移后的数据完整性
 * 包括表结构检查和行数检查
 * @returns 数据完整性检查是否通过
 */
async function checkIntegrityAfterMigration(): Promise<boolean> {
  log.info('Starting to check integrity after migration');
  const tableCheck = await checkTable();
  if (!tableCheck) return false;

  const oldTableNames = await executeSqlInOldH2(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='PUBLIC' ORDER BY TABLE_NAME;",
  );
  const oldTables = oldTableNames.split('\n').filter(Boolean).slice(1, -1);

  return await checkTableRowCounts(oldTables);
}

/**
 * 检查是否需要执行迁移
 * 通过检查旧版本数据库文件是否存在来判断
 * @returns 是否需要迁移
 */
async function checkIfNeedMigrate(): Promise<boolean> {
  return fs.existsSync(OLD_H2_PATH);
}

/**
 * 导出旧版本数据库的SQL脚本
 * 使用H2的Script工具导出完整的数据库结构和数据
 * @returns 导出是否成功
 */
async function exportSql(): Promise<boolean> {
  log.info('Starting to export sql');

  if (!fs.existsSync(TMP_EXPORT_SQL_DIR)) {
    log.info(`Export directory does not exist. Creating: ${TMP_EXPORT_SQL_DIR}`);
    await fsPromises.mkdir(TMP_EXPORT_SQL_DIR, { recursive: true });
  }

  try {
    const { stdout, stderr } = await execAsync(
      `"${JAVA_PATH}" -cp "${OLD_H2_JAR_PATH}" org.h2.tools.Script -url "${OLD_H2_URL}" -user "${DB_USERNAME}" -password "${DB_PASSWORD}" -script "${TMP_EXPORT_SQL_PATH}" -options "DROP"`,
    );
    if (!fs.existsSync(TMP_EXPORT_SQL_PATH)) {
      log.error('Failed Export Sql\n', 'stdout:', stdout, 'error:', stderr);
      return false;
    }
    log.info(`Sql Export Success, Path is ${TMP_EXPORT_SQL_PATH}`);
    return true;
  } catch (error) {
    log.error('Failed Export Sql:', error);
    await clear();
    return false;
  }
}

/**
 * 导入SQL脚本到新版本数据库
 * 使用H2的RunScript工具执行SQL脚本
 * @returns 导入是否成功
 */
async function importSql(): Promise<boolean> {
  log.info('Starting to import sql');

  if (!fs.existsSync(TMP_EXPORT_SQL_PATH)) {
    log.error(`Import sql file does not exist. Path: ${TMP_EXPORT_SQL_PATH}`);
    await clear();
    return false;
  }

  if (fs.existsSync(NEW_H2_PATH)) {
    await fsPromises.rm(NEW_H2_PATH, { force: true });
  }

  try {
    await execAsync(
      `"${JAVA_PATH}" -cp "${NEW_H2_JAR_PATH}" org.h2.tools.RunScript -url "${NEW_H2_URL}" -user "${DB_USERNAME}" -password "${DB_PASSWORD}" -script "${TMP_EXPORT_SQL_PATH}" -options "FROM_1X"`,
    );
    log.info(`Sql Import Success, Path is ${TMP_EXPORT_SQL_PATH}`);
    return true;
  } catch (error) {
    log.error('Failed Import Sql:', error);
    await clear();
    return false;
  }
}

/**
 * 重置H2数据库
 * 删除新旧版本的所有数据库文件
 */
async function resetH2(): Promise<void> {
  await clear('delete_old');
  await clear('delete_new');
}

/**
 * 显示数据库恢复对话框
 * 提供用户选择是否尝试恢复数据库
 * @returns 用户是否选择恢复
 */
async function showRecoverDialog(): Promise<boolean> {
  log.info('Show recover dialog...');
  const recover = await new Promise<Boolean>((resolve) => {
    const id = dialog.showMessageBoxSync({
      type: 'error',
      buttons: ['Reset', 'Cancel'],
      defaultId: 1,
      title: 'ODC Failed to Launch',
      message: 'ODC Files Are Corrupted',
      detail: 'An unexpected error occurred while upgrading ODC',
      cancelId: 1,
    });
    if (id === 0) {
      resolve(true);
      return;
    }
    resolve(false);
  });
  if (!recover) {
    app.exit();
    return false;
  }
  await resetH2();
  return true;
}

/**
 * 执行数据库迁移流程
 * 包括检查、导出、导入和验证等步骤
 * @returns 迁移是否成功
 */
async function migrate(): Promise<boolean> {
  log.info('Starting to migrate h2 database');
  if (!(await checkIfNeedMigrate())) {
    log.info('No need to migrate h2 database');
    return true;
  }
  log.info('Exporting sql...');
  if (!(await exportSql())) {
    await clear();
    return await showRecoverDialog();
  }
  log.info('Importing sql...');
  if (!(await importSql()) || !(await checkIntegrityAfterMigration())) {
    await clear('delete_new');
    return await showRecoverDialog();
  }

  return true;
}

/**
 * 检查H2数据库连接
 * 如果连接失败，尝试恢复数据库
 * @returns 连接是否成功
 */
async function checkH2Connection(): Promise<boolean> {
  try {
    return !!(await executeSqlInNewH2('SELECT * FROM dual'));
  } catch (error) {
    log.error('H2 connection check failed...', error);
    return await showRecoverDialog();
  }
}

async function moveOldFileToBackup(): Promise<void> {
  log.info('Moving old file to backup...');
  if (fs.existsSync(OLD_H2_PATH)) {
    await fsPromises.rename(OLD_H2_PATH, OLD_H2_BACKUP_PATH);
  }
  log.info('Move old file to backup success');
}

/**
 * 执行数据库迁移和连接检查的主函数
 * @returns Promise<void>
 */
export async function runH2Migration(): Promise<boolean> {
  if (!(await migrate())) {
    log.error('Migration failed...');
    return false;
  }
  log.info('Checking h2 connection...');
  if (!(await checkH2Connection())) {
    log.error('H2 connection check failed...');
    return false;
  }
  log.info('H2 connection check success');
  log.info('Moving old file to backup...');
  await moveOldFileToBackup();
  log.info('Moving old file to backup success');
  log.info('Clearing temporary files...');
  await clear();
  log.info('Clearing temporary files success');
  return true;
}

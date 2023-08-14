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

import { formatMessage } from '@/util/intl';

export default [
  {
    title: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.TaskCenter',
    }), //任务中心
    describe: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.TheTaskCenterProvidesUnified',
    }), //任务中心提供统一的数据库变更管控，原异步执行功能升级为数据库变更，可按照管理员定义的审批流程，对公共只读连接发起数据库变更
    img: 'task.gif',
  },

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.OperationRecords',
    }), //操作记录
    describe: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.ProvidesFullBusinessOperationRecords',
    }), //提供全量的业务操作记录功能，保证用户的操作可追溯，支持记录的查看、筛选
    img: 'record.jpg',
  },

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.Workbench',
    }), //工作台
    describe: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.OptimizedScriptManagementAllowsYou',
    }), //优化脚本管理，可查看和管理保存的脚本文件，同时支持脚本的批量上传与下载
    img: 'workspace.jpg',
  },

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.ObjectManagement',
    }), //对象管理
    describe: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.YouCanRightClickTable',
    }), //表对象右键能力增强，同时支持将表对象拖放至SQL 窗口快速生成语句
    img: 'drag.gif',
  },

  {
    title: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.SqlWindow',
    }), //SQL 窗口
    describe: formatMessage({
      id: 'odc.component.VersionModal.newVersionConfig.PersonalSettingsSupportSwitchingIndependent',
    }), //个人设置支持切换独立 session，各个 SQL 窗口可并发执行 SQL 语句
    img: 'sqlconsole.jpg',
  },
];

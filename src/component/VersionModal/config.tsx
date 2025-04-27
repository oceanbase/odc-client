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

import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Typography } from 'antd';
import type { VersionMenuType } from './index';
import styles from './index.less';

const { Text } = Typography;
const { Paragraph } = Typography;

function getVersionModalImg(fileName: string) {
  return `${window.publicPath}img/versionImg/${fileName}`;
}

const webVersionInfo: VersionMenuType[] = [
  {
    title: formatMessage({ id: 'src.component.VersionModal.FF9A170D', defaultMessage: '协同开发' }),
    content: (
      <div>
        <Paragraph className={styles.paragraph}>
          {formatMessage({
            id: 'src.component.VersionModal.F8067D93',
            defaultMessage: '三步开启团队协同机制。',
          })}
        </Paragraph>
        <Paragraph className={styles.paragraph}>
          {formatMessage({
            id: 'src.component.VersionModal.4EBCB43A',
            defaultMessage:
              '第一步：系统管理员角色创建项目，录入数据源并将数据源绑定项目。普通用户申请加入项目成为项目成员并申请指定库的权限。',
          })}
        </Paragraph>
        <Paragraph className={styles.paragraph}>
          {formatMessage({
            id: 'src.component.VersionModal.88CE7B93',
            defaultMessage:
              '第二步：项目成员进入项目选定数据库进行开发，请求内容先经过 SQL 窗口规范再经过 SQL\n          检查规范校验，校验都通过之后再判定请求是否可以直接执行。',
          })}
        </Paragraph>
        <Paragraph className={styles.paragraph}>
          {formatMessage({
            id: 'src.component.VersionModal.163C4203',
            defaultMessage:
              '第三步：若请求需要先走审批才能执行，需要先确定变更所命中的风险等级，再根据风险等级对应的审批流设置走审批流程，审批完成后请求才会进入执行阶段。',
          })}
        </Paragraph>
      </div>
    ),

    img: 'user.png',
  },

  {
    title: formatMessage({ id: 'src.component.VersionModal.44E513D9', defaultMessage: 'SQL 开发' }),
    content: (
      <div>
        <Paragraph className={styles.paragraph}>
          {formatMessage({
            id: 'src.component.VersionModal.E0038FA1',
            defaultMessage:
              '项目成员进入项目后可对有权限的数据库进行 SQL 开发。SQL 开发主要包括数据库对象管理、SQL\n          编辑与执行、结果集查看与编辑、执行详情与诊断、导入导出五个方面。',
          })}
        </Paragraph>
        <Paragraph className={styles.paragraph}>
          {formatMessage({
            id: 'src.component.VersionModal.F74D331B',
            defaultMessage:
              '在 SQL 编辑与执行模块，ODC 提供了代码片段能力，通过该功能可快速复用高频片段，提高 SQL\n          开发效率，同时在结果集查看与编辑模块提供类 EXCEL\n          的操作交互，支持冻结行、通过快捷键多选行和多选列等操作。此外在执行详情与诊断模块，提供了完善的\n          SQL 执行计划剖析能力，可帮助您大幅度减少定位 SQL 问题的耗时。',
          })}
        </Paragraph>
      </div>
    ),

    img: 'sql.png',
  },

  {
    title: formatMessage({
      id: 'src.component.VersionModal.58DCFDF2',
      defaultMessage: '数据安全合规',
    }),
    content: (
      <div>
        <Paragraph className={styles.paragraph}>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.56FE6F7A',
              defaultMessage:
                '数据安全合规主要表现在两个方面，一个是敏感数据脱敏另一个是用户行为记录。',
            })}
          </div>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.F2D66594',
              defaultMessage:
                '敏感数据脱敏：针对项目内的敏感字段，项目负责人可对其配置脱敏规则，配置完成后，项目内的成员再访问就是脱敏后的效果，以保障敏感数据安全。',
            })}
          </div>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.B5B97F2A',
              defaultMessage:
                '用户行为记录：ODC\n            平台所有用户操作均会记录到「操作记录」模块，方便系统管理员进行用户行为审计。',
            })}
          </div>
        </Paragraph>
      </div>
    ),

    img: 'security.png',
  },

  {
    title: formatMessage({ id: 'src.component.VersionModal.EFD3D7AA', defaultMessage: '历史库' }),
    content: (
      <div>
        <Paragraph className={styles.paragraph}>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.6EA941D9',
              defaultMessage:
                '项目成员发起数据归档作业，配置提交作业后，进入作业调度阶段。ODC\n            会根据您的配置定时发起数据归档任务。ODC 的归档能力具有以下特性：',
            })}
          </div>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.0AC91070',
              defaultMessage: '多线程并发：任务采用多个线程并发处理机制来保证数据传输的性能。',
            })}
          </div>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.1B82FD78',
              defaultMessage:
                '多重限流：任务运行过程中出现流量风险会采用主动+被动双重限流机制来保障系统安全。',
            })}
          </div>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.DAF7B635',
              defaultMessage: '断点续传：若任务中途异常，排障后可从断点处继续运行。',
            })}
          </div>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.D816AA11',
              defaultMessage: '数据校验：已归档数据清理时会先校验再删除，保障数据安全。',
            })}
          </div>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.6E4E725B',
              defaultMessage:
                '支持回滚：任务完成后，发现异常可一键将数据从历史库恢复到在线库，以降低变更风险。',
            })}
          </div>
        </Paragraph>
        <Paragraph className={styles.paragraph}>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.F098BB83',
              defaultMessage: '功能价值：',
            })}
          </div>
          <div>
            {formatMessage({
              id: 'src.component.VersionModal.A28A4B50',
              defaultMessage:
                '使用归档功能将在线库中的冷数据迁移到成本更低的历史库中，不仅可以降低成本，同时也能提高在线库的性能和运维效率。',
            })}
          </div>
        </Paragraph>
      </div>
    ),

    img: 'history.png',
  },

  {
    title: formatMessage({
      id: 'src.component.VersionModal.89F339D3',
      defaultMessage: '个性化开发',
    }),
    content: (
      <div>
        <Paragraph className={styles.paragraph}>
          {formatMessage({
            id: 'src.component.VersionModal.161C0656',
            defaultMessage:
              '您进入导航栏「设置」模块，可根据自己的开发习惯调整配置项，目前涵盖了数据库设置、执行设置、对象设置、编辑器设置及外观等设置项。通过这些设置项可调整编辑器字体大小、运行快捷键、调整主题颜色、样式等。',
          })}
        </Paragraph>
      </div>
    ),

    img: 'personal.png',
  },
].filter(Boolean);

const clientVersionInfo = webVersionInfo;

export const getCurrentVersionInfo = function () {
  const versionInfo = isClient() ? clientVersionInfo : webVersionInfo;
  return versionInfo.map((info) => {
    return {
      ...info,
      img: getVersionModalImg(info.img),
    };
  });
};

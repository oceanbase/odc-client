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

import { listDatabases } from '@/common/network/database';
import { getTableColumnList, getTableListByDatabaseName } from '@/common/network/table';
import { getTriggerCreateSQL } from '@/common/network/trigger';
import { ITriggerBaseInfoForm } from '@/d.ts';
import { openCreateTriggerSQLPage } from '@/store/helper/page';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Collapse, Layout } from 'antd';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import AdvancedInfoForm from './component/AdvancedInfoFrom';
import BaseInfoForm from './component/BaseInfoForm';
import styles from './index.less';
import { ICollapseHeader, IProps, IState, Step, StepStatus } from './type';

const { Content } = Layout;
const { Panel } = Collapse;

const CollapseHeader = ({ status, text }: ICollapseHeader) => {
  const collapseHeaderIconMap = {
    [StepStatus.EDITING]: EditOutlined,
    [StepStatus.SAVED]: CheckOutlined,
    [StepStatus.UNSAVED]: CheckOutlined,
    [StepStatus.ERROR]: CloseOutlined,
  };
  const Icon = collapseHeaderIconMap[status];
  return (
    <>
      <span className={classNames(styles.icon, styles[status.toLowerCase()])}>
        <Icon />
      </span>
      <span className={styles.title}>{text}</span>
    </>
  );
};

const customPanelStyle = {
  background: 'var(--tab-background-color)',
  borderRadius: 4,
  overflow: 'hidden',
};
@inject('sqlStore', 'pageStore', 'sessionManagerStore')
@observer
class CreateTriggerPage extends Component<IProps & { session: SessionStore }, IState> {
  public readonly state = {
    baseInfo: null,
    adancedInfo: null,
    tables: [],
    columns: [],
    baseInfoStatus: StepStatus.EDITING,
    advancedStatus: StepStatus.UNSAVED,
    activeKey: Step.BASEINFO,
    databases: [],
  };

  private advancedInfoFormRef = null;

  componentDidMount() {
    const {
      session,
      params: { preData = null },
    } = this.props;
    if (preData) {
      this.setState(
        {
          baseInfo: preData.baseInfo,
          adancedInfo: preData.adancedInfo,
          baseInfoStatus: StepStatus.SAVED,
          advancedStatus: StepStatus.SAVED,
          activeKey: Step.ADVANCED,
        },
        () => {
          const { baseInfo } = this.state;
          this.enableSubmit();
          this.loadSchemaMode(baseInfo?.schemaMode);
          this.loadColumns(baseInfo?.schemaName);
        },
      );
    } else {
      this.loadSchemaMode(session?.odcDatabase?.name);
    }
    this.loadDatabases();
  } // 获取 step对应的状态
  private async loadDatabases() {
    const res = await listDatabases(
      null,
      this.props?.session?.connection?.id,
      1,
      9999,
      null,
      null,
      null,
      true,
    );
    this.setState({
      databases: res?.contents || [],
    });
  }
  private getStepStatus = (step: Step): StepStatus => {
    const { baseInfoStatus, advancedStatus } = this.state;
    let status: StepStatus;
    if (step === Step.BASEINFO) {
      status = baseInfoStatus;
    } else if (step === Step.ADVANCED) {
      status = advancedStatus;
    }

    return status;
  }; // 设置 step对应的状态为 status

  private setStepStatus = (step: Step, status: StepStatus) => {
    if (step === Step.BASEINFO) {
      this.setState({
        activeKey: Step.BASEINFO,
        baseInfoStatus: status,
      });
    } else if (step === Step.ADVANCED) {
      this.setState({
        activeKey: Step.ADVANCED,
        advancedStatus: status,
      });
    }
  };
  public handleStepChanged = (currentStep: Step) => {
    const { activeKey } = this.state; // 如果前一步在编辑状态，切换成未保存状态 EDITING -> UNSAVED

    if (this.getStepStatus(activeKey) === StepStatus.EDITING) {
      this.setStepStatus(activeKey, StepStatus.UNSAVED);
    } // 处理当前步骤状态 UNSAVED -> EDITING

    if (this.getStepStatus(currentStep) === StepStatus.UNSAVED) {
      this.setStepStatus(currentStep, StepStatus.EDITING);
    } // 切换 collapse

    this.setState({
      activeKey: currentStep,
    });
  }; // 保存信息

  public handleSaveInfo = (step: Step, info: any) => {
    // todo 1.setStepStatus(step, StepStatus.SAVED); 2. .next() ==> activeKey: Step.ADVANCED,
    if (step === Step.BASEINFO) {
      // 基本信息标记为已保存，并切换到下一步
      this.setState({
        baseInfo: info,
        baseInfoStatus: StepStatus.SAVED,
        activeKey: Step.ADVANCED,
      });
    } else if (step === Step.ADVANCED) {
      // 高级配置标记为已保存，并收起表单面板
      this.setState({
        adancedInfo: info,
        advancedStatus: StepStatus.SAVED,
        activeKey: null,
      });
    }
  }; // 是否允许提交表单

  private enableSubmit = (): boolean => {
    const { baseInfoStatus, advancedStatus } = this.state; // 基本信息完成，并且高级设置无错误就可以提交

    return baseInfoStatus === StepStatus.SAVED && advancedStatus !== StepStatus.ERROR;
  }; // 最终提交创建表单

  public handleSubmit = async () => {
    const { baseInfo, adancedInfo } = this.state; // todo 表单信息提交&页面跳转
    // todo 点击 上一步，在不修改表单的情况下，应该也是可以提交的

    const { session, pageStore, pageKey, params } = this.props;
    const {
      triggerMode,
      triggerType,
      triggerGrade,
      sqlExpression,
      triggerEvents,
      triggerColumns,
      referencesNewValue,
      referencesOldValue,
    } = adancedInfo || {};
    const serverData = {
      ...baseInfo,
      triggerMode,
      triggerType,
      rowLevel: triggerGrade === 'row',
      sqlExpression,
    };
    const pass = this.setEvents(serverData, triggerEvents, triggerColumns);

    if (!pass) {
      return false;
    }

    if (referencesNewValue) {
      this.setReferences(serverData, 'NEW', referencesNewValue);
    }
    if (referencesOldValue) {
      this.setReferences(serverData, 'OLD', referencesOldValue);
    }

    const sql = await getTriggerCreateSQL(
      'TEST_TRIGGER',
      serverData,
      session?.sessionId,
      session?.database?.dbName,
    );
    await openCreateTriggerSQLPage(
      sql,
      {
        baseInfo: { ...baseInfo },
        adancedInfo: { ...adancedInfo },
      },
      session?.odcDatabase?.id,
      session?.database?.dbName,
    );

    await pageStore.close(pageKey);
  };
  private setEvents = (data, events, columns) => {
    if (!data.triggerEvents) {
      data.triggerEvents = [];
    } // UPDATE 事件需要和 column 关联

    if (events.includes('UPDATE')) {
      for (let i = 0, len = columns.length; i < len; i++) {
        data.triggerEvents.push({
          dmlEvent: 'UPDATE',
          column: columns[i],
        });
      }
    } // 除 UPDATE 事件外，其余的事件不需要和column关联

    for (let i = 0, len = events.length; i < len; i++) {
      if (events[i] !== 'UPDATE') {
        data.triggerEvents.push({
          dmlEvent: events[i],
          column: null,
        });
      }
    }

    return true;
  };
  private setReferences = (data, key, value) => {
    if (!data.references) {
      data.references = [];
    }

    const index = data.references.findIndex((item) => item.referenceType === key);

    if (index !== -1) {
      data.references[index].referName = value;
    } else {
      data.references.push({
        referenceType: key,
        referName: value,
      });
    }
  };

  reloadSchemaMode = async (value: string) => {
    this.loadSchemaMode(value);
    this.resetColumns();
  };

  loadSchemaMode = async (value: string) => {
    const { session } = this.props;
    const tables = await getTableListByDatabaseName(session?.sessionId, value);
    this.setState({
      tables,
      columns: [],
    });
  };

  reloadColumns = async (value: string) => {
    this.resetColumns();
    this.loadColumns(value);
  };

  loadColumns = async (value: string) => {
    const { session } = this.props;
    const columns = await getTableColumnList(value, session?.database?.dbName, session.sessionId);
    this.setState({
      columns,
    });
  };

  resetColumns = () => {
    this.advancedInfoFormRef?.current?.setFieldsValue({
      triggerColumns: [],
    });
  };

  setFormRef = (ref) => {
    this.advancedInfoFormRef = ref;
  };

  public render() {
    const {
      session,
      params: { preData = null },
    } = this.props;
    const sessionId = session?.sessionId;
    const dbName = session?.database?.dbName;
    const { tables, columns, activeKey, baseInfoStatus, advancedStatus, databases } = this.state;
    const defaultBaseInfo = {
      schemaType: 'TABLE',
      schemaMode: dbName,
    };

    return (
      <>
        <Content className={styles.content}>
          <Collapse
            className={styles.collapse}
            accordion
            activeKey={activeKey}
            onChange={this.handleStepChanged as (key: string | string[]) => void}
          >
            <Panel
              showArrow={false}
              header={
                <CollapseHeader
                  status={baseInfoStatus}
                  text={formatMessage({
                    id: 'odc.components.CreateTriggerPage.StepBasicInformation',
                  })}
                  /*第一步：基本信息*/
                />
              }
              key={Step.BASEINFO}
              style={customPanelStyle}
            >
              <BaseInfoForm
                onSave={this.handleSaveInfo}
                setStepStatus={this.setStepStatus}
                reloadSchemaMode={this.reloadSchemaMode}
                reloadColumns={this.reloadColumns}
                databases={databases}
                tables={tables}
                initialValues={preData?.baseInfo || (defaultBaseInfo as ITriggerBaseInfoForm)}
                enableTriggerAlterStatus={session?.supportFeature?.enableTriggerAlterStatus}
              />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <CollapseHeader
                  status={advancedStatus}
                  text={formatMessage({
                    id: 'odc.components.CreateTriggerPage.StepAdvancedSettings',
                  })}
                  /*第二步：高级设置*/
                />
              }
              key={Step.ADVANCED}
              style={customPanelStyle}
            >
              <AdvancedInfoForm
                columns={columns}
                onSave={this.handleSaveInfo}
                setStepStatus={this.setStepStatus}
                setFormRef={this.setFormRef}
                initialValues={preData?.adancedInfo}
                enableTriggerReferences={session?.supportFeature?.enableTriggerReferences}
              />
            </Panel>
          </Collapse>
          <Button
            disabled={!this.enableSubmit()}
            onClick={this.handleSubmit}
            size="small"
            type="primary"
          >
            {
              formatMessage({
                id: 'odc.components.CreateTriggerPage.NextConfirmTheSqlStatement',
              }) /*下一步：确认SQL*/
            }
          </Button>
        </Content>
      </>
    );
  }
}

export default WrapSessionPage(function (props: IProps) {
  return (
    <SessionContext.Consumer>
      {({ session }) => {
        return <CreateTriggerPage {...props} session={session} />;
      }}
    </SessionContext.Consumer>
  );
});

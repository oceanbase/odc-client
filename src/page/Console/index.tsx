import { formatMessage, getLocalDocs, getOBDocsUrl } from '@/util/intl';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useMount, useRequest } from 'ahooks';
import dayjs, { Dayjs } from 'dayjs';
import { Card, Col, Divider, Row, Select, Spin, Typography, DatePicker } from 'antd';
import odc from '@/plugins/odc';
import { getImg } from '@/util/intl';

import { ReactComponent as DownloadSvg } from '@/svgr/download-fill.svg';
import { ReactComponent as GithubSvg } from '@/svgr/github.svg';
import { ReactComponent as SendSvg } from '@/svgr/send-fill.svg';
import Icon, { ClockCircleOutlined } from '@ant-design/icons';
import LabelWithIcon from '../../component/LabelWithIcon';
import ScheduleItem from './components/ScheduleItem';
import BarChart from './components/BarChart';
import { ConsoleTextConfig, ScheduleTitle, ELayoutKey, TaskTypes } from './const';
import styles from './index.less';
import RecentlyDatabase from './components/RecentlyDatabase';
import { useNavigate } from '@umijs/max';
import { getFlowScheduleTodo, getTaskStat } from '@/common/network/task';
import {
  IGetFlowScheduleTodoParams,
  ITaskStatParam,
  TaskPageType,
  TaskType,
  TaskStatus,
} from '@/d.ts';
import { getScheduleStat } from '@/common/network/schedule';
import { IPageType } from '@/d.ts/_index';
import { TaskTab } from '@/component/Task/interface';
import { ScheduleTab } from '@/component/Schedule/interface';
import login from '@/store/login';
import QrCodeWithIcon from './components/QRCodeWithIcon';
import ScheduleCounter from './components/ScheduleCounter';
import PersonalizeLayoutSetting, { showJobDivider } from './components/PersonalizeLayoutSetting';
import {
  PersonalizeLayoutContext,
  PersonalizeLayoutProvider,
} from '@/page/Console/PersonalizeLayoutContext';
import { TimeOptions } from '@/component/TimeSelect';

import { listProjects } from '@/common/network/project';
import QuickStart from './components/QuickStart';
import { ScheduleStatus, ScheduleType } from '@/d.ts/schedule';

const { RangePicker } = DatePicker;
const cacheProjectIdKey = `odc-front-page-project-${login.organizationId}`;
const cacheTimeKey = `odc-front-page-time-${login.organizationId}`;
const cacheDateKey = `odc-front-page-date-${login.organizationId}`;

const aboutUsIcons = [
  <Icon component={DownloadSvg} style={{ color: '#006AFF', fontSize: 14 }} />,
  <Icon component={SendSvg} style={{ color: '#52c41a', fontSize: 14 }} />,
  <Icon component={GithubSvg} style={{ fontSize: 14 }} />,
];

const ConsoleMain = () => {
  const { aboutUs, bestPractice } = ConsoleTextConfig;
  const { status, statusColor } = ConsoleTextConfig.schdules;
  const cacheTimeValue = localStorage.getItem(cacheTimeKey);
  const cacheDateValue = localStorage.getItem(cacheDateKey);

  const [timeValue, setTimeValue] = useState<number | string>(() => {
    if (!cacheTimeValue) return 7;
    try {
      return JSON.parse(cacheTimeValue);
    } catch (error) {
      console.error('Failed to parse cached time value:', error);
      return 7;
    }
  });
  const [dateValue, setDateValue] = useState<[Dayjs, Dayjs] | null>(() => {
    if (!cacheDateValue) return null;
    try {
      const timestamps = JSON.parse(cacheDateValue);
      if (Array.isArray(timestamps) && timestamps.length === 2) {
        return [dayjs(timestamps[0]), dayjs(timestamps[1])];
      }
    } catch (error) {
      console.error('Failed to parse cached date value:', error);
    }
    return null;
  });

  const { checkedKeys, getOrderedScheduleTypes } = useContext(PersonalizeLayoutContext);
  const cacheProjectId = localStorage.getItem(cacheProjectIdKey);

  const [selectedProjectId, setSelectedProjectId] = useState(
    cacheProjectId && Number(cacheProjectId) > -1 ? Number(cacheProjectId) : undefined,
  );

  const navigate = useNavigate();

  const { run: runListProjects, data: projects } = useRequest(listProjects, {
    defaultParams: [null, null, null],
  });

  const { data: todosData, run: runGetFlowScheduleTodo } = useRequest(
    (params: IGetFlowScheduleTodoParams) => getFlowScheduleTodo(params),
    {
      manual: true,
    },
  );

  const {
    data: schedulesData,
    loading: scheduleLoading,
    run: runGetScheduleStat,
  } = useRequest((params: ITaskStatParam) => getScheduleStat(params), {
    manual: true,
  });

  const {
    data: taskResData,
    loading: taskLoading,
    run: runGetTaskStat,
  } = useRequest((params: ITaskStatParam) => getTaskStat(params), {
    manual: true,
  });

  useMount(() => {
    runListProjects(null, null, null);
  });

  useEffect(() => {
    runGetFlowScheduleTodo({
      currentOrganizatonId: login.organizationId,
      projectId: selectedProjectId,
    });
    runGetScheduleStat({
      currentOrganizationId: login.organizationId,
      types: ['DATA_ARCHIVE', 'SQL_PLAN', 'DATA_DELETE', 'PARTITION_PLAN'],
      ...timeSetting,
      projectId: selectedProjectId,
    });
    runGetTaskStat({
      currentOrganizationId: login.organizationId,
      types: TaskTypes,
      ...timeSetting,
      projectId: selectedProjectId,
    });
  }, [selectedProjectId, timeValue, dateValue]);

  const projectOptions = useMemo(() => {
    return projects?.contents.map((item) => ({ label: item.name, value: item.id })) || [];
  }, [projects]);

  const boardVisible = useMemo(() => {
    const isChecked = (key: ELayoutKey) => checkedKeys.includes(key);

    return {
      [ELayoutKey.AboutUs]: isChecked(ELayoutKey.AboutUs),
      [ELayoutKey.BestPractices]: isChecked(ELayoutKey.BestPractices),
      [ELayoutKey.QuickStart]: isChecked(ELayoutKey.QuickStart),
      [ELayoutKey.RecentDatabases]: isChecked(ELayoutKey.RecentDatabases),
      [ELayoutKey.TaskOverview]: isChecked(ELayoutKey.TaskOverview),
    };
  }, [checkedKeys]);

  const timeSetting = useMemo(() => {
    if (String(timeValue) === 'ALL') {
      return {};
    }
    if (String(timeValue) === 'custom' && dateValue?.[0] && dateValue?.[1]) {
      return {
        startTime: dateValue[0].valueOf(),
        endTime: dateValue[1].valueOf(),
      };
    }
    return {
      startTime: Date.now() - 1000 * 60 * 60 * 24 * Number(timeValue),
      endTime: Date.now(),
    };
  }, [timeValue, dateValue]);

  const articles = useMemo(() => {
    return checkedKeys.includes(ELayoutKey.RecentDatabases)
      ? bestPractice.articles
      : bestPractice.articles?.slice(0, 5);
  }, [checkedKeys]);

  const schedules = useMemo(() => {
    // Get ordered schedule types from dragged tree structure
    const orderedTypes = getOrderedScheduleTypes();

    // Filter by checked keys and map to schedule objects
    return orderedTypes
      .filter((item) => checkedKeys.includes(item))
      .map((type) => ({
        title: ScheduleTitle[type],
        type,
      }));
  }, [checkedKeys, getOrderedScheduleTypes]);

  return (
    <>
      <div className={styles.consoleBackgroud} />
      <div className={styles.consoleWrapper}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>
              {formatMessage({
                id: 'src.page.Console.BEABD6A7',
                defaultMessage: '欢迎使用 OceanBase 开发者中心',
              })}
            </div>
            <div className={styles.subTitle}>
              {formatMessage({
                id: 'src.page.Console.94172A72',
                defaultMessage: '开源的数据库开发和数据库管控协同工具',
              })}
            </div>
          </div>
          <PersonalizeLayoutSetting />
        </div>
        <div className={styles.content}>
          <Spin spinning={scheduleLoading && taskLoading} className={styles.topAreaFilter}>
            <div className={styles.top}>
              {boardVisible[ELayoutKey.QuickStart] && <QuickStart />}
              {boardVisible[ELayoutKey.TaskOverview] && (
                <div className={schedules.length > 2 ? styles.schedules : styles.schedulesVertical}>
                  <Card className={styles.card}>
                    <div className={styles.header}>
                      <div className={styles.consoleCardTitle}>任务概览</div>
                      <div>
                        <Select
                          className={styles.filter}
                          prefix={<ClockCircleOutlined style={{ fontSize: 14 }} />}
                          defaultValue={timeValue || TimeOptions[0].value}
                          options={TimeOptions}
                          onChange={(value: number) => {
                            setTimeValue(value);
                            localStorage.setItem(cacheTimeKey, JSON.stringify(value));
                          }}
                        />
                        {String(timeValue) === 'custom' && (
                          <RangePicker
                            suffixIcon={null}
                            value={dateValue}
                            onChange={(value) => {
                              setDateValue(value);
                              // 将 Dayjs 对象转换为时间戳进行存储
                              const dateForStorage = value
                                ? [value[0]?.valueOf(), value[1]?.valueOf()]
                                : null;
                              localStorage.setItem(cacheDateKey, JSON.stringify(dateForStorage));
                            }}
                          />
                        )}
                        <Select
                          className={styles.filter}
                          placeholder="请选择项目"
                          style={{ maxWidth: 200, border: 'none' }}
                          options={[{ label: '全部项目', value: -1 }, ...projectOptions]}
                          defaultValue={cacheProjectId ? Number(cacheProjectId) : -1}
                          onChange={(value) => {
                            setSelectedProjectId(value === -1 ? undefined : value);
                            localStorage.setItem(cacheProjectIdKey, value + '');
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.jobsCounter}>
                      <div className={styles.counterGrid}>
                        <ScheduleCounter
                          title="待审批工单"
                          counter={todosData?.FLOW?.count?.FLOW_WAIT_ME_APPROVAL}
                          onClick={() => {
                            navigate(`/${IPageType.Task}?tab=${TaskTab.approveByCurrentUser}`);
                          }}
                        />
                        <ScheduleCounter
                          title="待执行工单"
                          counter={todosData?.FLOW?.count?.FLOW_WAIT_ME_EXECUTION}
                          onClick={() => {
                            navigate(`/${IPageType.Task}?tab=${TaskTab.executionByCurrentUser}`);
                          }}
                        />
                        <ScheduleCounter
                          title="待审批作业"
                          counter={todosData?.SCHEDULE?.count?.SCHEDULE_WAIT_ME_APPROVAL}
                          onClick={() => {
                            navigate(
                              `/${IPageType.Schedule}?tab=${ScheduleTab.approveByCurrentUser}`,
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className={
                        schedules.length > 2
                          ? styles.chartsContainer
                          : styles.chartsContainerVertical
                      }
                    >
                      <div className={styles.barChartSection}>
                        <BarChart data={taskResData} />
                      </div>
                      {checkedKeys.some((item) =>
                        showJobDivider.includes(item as ScheduleType),
                      ) && <Divider type="vertical" className={styles.divider} />}
                      <div className={styles.pieChartSection}>
                        <div className={styles.scheduleItems}>
                          {schedules.map((item, index) => {
                            return (
                              <ScheduleItem
                                key={index}
                                title={item.title}
                                progress={schedulesData?.[item.type]}
                                type={item.type}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className={styles.legend}>
                      {status.map((item, index) => {
                        return (
                          <LabelWithIcon
                            key={index}
                            icon={
                              <span
                                className={styles.icon}
                                style={{
                                  backgroundColor: statusColor[index],
                                }}
                              />
                            }
                            label={<span className={styles.label}>{item}</span>}
                            gap={8}
                          />
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </Spin>
          <Row className={styles.bottom}>
            {boardVisible[ELayoutKey.RecentDatabases] && (
              <Col span={18} className={styles.recently}>
                <Card className={styles.card}>
                  <div className={styles.consoleCardTitle}>
                    {formatMessage({
                      id: 'src.page.Console.7492F9E4',
                      defaultMessage: '最近访问数据库',
                    })}
                  </div>
                  <RecentlyDatabase />
                </Card>
              </Col>
            )}
            <Col
              span={boardVisible[ELayoutKey.RecentDatabases] ? 6 : 24}
              className={
                boardVisible[ELayoutKey.RecentDatabases]
                  ? styles.docWrapper
                  : styles.docWrapperVertical
              }
            >
              {boardVisible[ELayoutKey.AboutUs] && (
                <Card
                  className={
                    boardVisible[ELayoutKey.BestPractices]
                      ? styles.aboutUs
                      : styles.aboutUsLargeVersion
                  }
                >
                  <div className={styles.consoleCardTitle}>
                    {formatMessage({ id: 'src.page.Console.3A3E34F5', defaultMessage: '关于我们' })}
                  </div>
                  <div className={styles.aboutUsContent}>
                    <div className={styles.docsWrapper}>
                      {aboutUs.helps.map((help, index) => {
                        return (
                          <div className={styles.aboutUsHelpDocItem}>
                            <LabelWithIcon
                              gap={9}
                              icon={aboutUsIcons[index]}
                              label={
                                <div
                                  className={styles.docs}
                                  onClick={() => {
                                    window.open(getOBDocsUrl(aboutUs.urlKeys[index]));
                                  }}
                                >
                                  {help}
                                </div>
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                    <LabelWithIcon
                      align={['vertical', 'center']}
                      icon={<QrCodeWithIcon />}
                      gap={4}
                      label={
                        <Typography.Text type="secondary">
                          {formatMessage({
                            id: 'src.page.Console.30113922',
                            defaultMessage: '钉钉群：67365031753',
                          })}
                        </Typography.Text>
                      }
                    />
                  </div>
                </Card>
              )}
              {boardVisible[ELayoutKey.BestPractices] && (
                <Card
                  className={
                    boardVisible[ELayoutKey.AboutUs] ? styles.practice : styles.practiceLargeVerion
                  }
                >
                  <div className={styles.consoleCardTitle}>
                    {formatMessage({ id: 'src.page.Console.41EC22B4', defaultMessage: '最佳实践' })}

                    <span
                      className={styles.showMore}
                      onClick={() => {
                        window.open(
                          odc.appConfig.docs.url
                            ? getOBDocsUrl('100.sql-development-common-techniques.html')
                            : getLocalDocs('100.sql-development-common-techniques.html'),
                        );
                      }}
                    >
                      {formatMessage({ id: 'src.page.Console.E60EAE10', defaultMessage: '更多 >' })}
                    </span>
                  </div>
                  {articles?.map((article) => {
                    return (
                      <div
                        className={styles.article}
                        onClick={() => {
                          window.open(
                            odc.appConfig.docs.url
                              ? getOBDocsUrl(article.fragmentIdentifier)
                              : getLocalDocs(article.fragmentIdentifier),
                          );
                        }}
                      >
                        {article.title}
                      </div>
                    );
                  })}
                </Card>
              )}
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

const Console = () => {
  return (
    <PersonalizeLayoutProvider>
      <ConsoleMain />
    </PersonalizeLayoutProvider>
  );
};

export default Console;

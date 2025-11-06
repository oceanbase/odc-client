import { formatMessage, getLocalDocs, getOBDocsUrl } from '@/util/intl';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useMount, useRequest } from 'ahooks';
import dayjs, { Dayjs } from 'dayjs';
import { Card, Col, Divider, Row, Select, Spin, Typography, DatePicker } from 'antd';
import odc from '@/plugins/odc';
import ModalHelpAbout from '@/component/HelpMenus/components/ModalHelpAbout';
import Icon, { ClockCircleOutlined } from '@ant-design/icons';
import LabelWithIcon from '../../component/LabelWithIcon';
import ScheduleItem from './components/ScheduleItem';
import BarChart from './components/BarChart';
import { ConsoleTextConfig, ScheduleTitle, ELayoutKey, TaskTypes } from './const';
import styles from './index.less';
import RecentlyDatabase from './components/RecentlyDatabase';
import { useNavigate } from '@umijs/max';
import { getFlowScheduleTodo, getTaskStat } from '@/common/network/task';
import { IGetFlowScheduleTodoParams, ITaskStatParam, TaskPageType } from '@/d.ts';
import { getScheduleStat } from '@/common/network/schedule';
import { IPageType } from '@/d.ts/_index';
import { TaskTab } from '@/component/Task/interface';
import { ScheduleTab } from '@/component/Schedule/interface';
import login from '@/store/login';
import ScheduleCounter from './components/ScheduleCounter';
import PersonalizeLayoutSetting, { showJobDivider } from './components/PersonalizeLayoutSetting';
import {
  PersonalizeLayoutContext,
  PersonalizeLayoutProvider,
} from '@/page/Console/PersonalizeLayoutContext';
import { TimeOptions } from '@/component/TimeSelect';

import { listProjects } from '@/common/network/project';
import QuickStart from './components/QuickStart';
import { ScheduleType, SchedulePageType } from '@/d.ts/schedule';
import { ReactComponent as SendSvg } from '@/svgr/send-fill.svg';
import { ReactComponent as HatSvg } from '@/svgr/hat.svg';
import { ReactComponent as QuestionSvg } from '@/svgr/question.svg';
import { ReactComponent as InfoSvg } from '@/svgr/info.svg';

const { RangePicker } = DatePicker;
const getCacheProjectIdKey = () => `odc-front-page-project-${login.user?.id}`;
const getCacheTimeKey = () => `odc-front-page-time-${login.user?.id}`;
const getCacheDateKey = () => `odc-front-page-date-${login.user?.id}`;

const aboutUsIcons = [
  <Icon component={SendSvg} style={{ color: '#52c41a', fontSize: 13 }} />,
  <Icon component={QuestionSvg} style={{ fontSize: 13 }} />,
  <Icon component={HatSvg} style={{ fontSize: 13 }} />,
  <Icon component={InfoSvg} style={{ fontSize: 13 }} />,
];

const ConsoleMain = () => {
  const { aboutUs, bestPractice } = ConsoleTextConfig;
  const { status, statusColor, taskStatus, taskStatusColor } = ConsoleTextConfig.schdules;
  const cacheTimeValue = localStorage.getItem(getCacheTimeKey());
  const cacheDateValue = localStorage.getItem(getCacheDateKey());
  const [showModalAbout, setShowModalAbout] = useState(false);

  const handleAboutUsClick = (help: string, index: number) => {
    switch (help) {
      case 'helpDocs':
        window.open(odc.appConfig.docs.url || getLocalDocs());
        break;
      case 'versions':
        setShowModalAbout(true);
        break;
      default:
        window.open(getOBDocsUrl(aboutUs.urlKeys[index]));
        break;
    }
  };

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
  const cacheProjectId = localStorage.getItem(getCacheProjectIdKey());

  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(() => {
    if (cacheProjectId) {
      const projectId = Number(cacheProjectId);
      return projectId > -1 ? projectId : undefined;
    }
    return undefined;
  });

  const [selectDisplayValue, setSelectDisplayValue] = useState<number>(() => {
    if (cacheProjectId) {
      return Number(cacheProjectId);
    }
    return -1;
  });

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

    const hasTaskOrScheduleChecked =
      TaskTypes.some((type) => checkedKeys.includes(type)) ||
      getOrderedScheduleTypes().some((type) => checkedKeys.includes(type));

    return {
      [ELayoutKey.AboutUs]: isChecked(ELayoutKey.AboutUs),
      [ELayoutKey.BestPractices]: isChecked(ELayoutKey.BestPractices),
      [ELayoutKey.QuickStart]: isChecked(ELayoutKey.QuickStart),
      [ELayoutKey.RecentDatabases]: isChecked(ELayoutKey.RecentDatabases),
      [ELayoutKey.TaskOverview]: hasTaskOrScheduleChecked,
    };
  }, [checkedKeys]);

  const hasTaskChecked = useMemo(() => {
    return TaskTypes.some((type) => checkedKeys.includes(type));
  }, [checkedKeys]);

  const timeSetting = useMemo(() => {
    if (String(timeValue) === 'ALL') {
      return {};
    }
    if (String(timeValue) === 'custom') {
      if (dateValue?.[0] && dateValue?.[1]) {
        return {
          startTime: dateValue[0].valueOf(),
          endTime: dateValue[1].valueOf(),
        };
      } else {
        return {};
      }
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

  const buildNavigateUrlWithFilters = (basePath: string, tab: string) => {
    const params = new URLSearchParams();
    params.set('tab', tab);

    // Add time filter
    if (timeValue) {
      params.set('timeValue', String(timeValue));
    }

    // Add custom date range if applicable
    if (String(timeValue) === 'custom' && dateValue?.[0] && dateValue?.[1]) {
      params.set('startTime', String(dateValue[0].valueOf()));
      params.set('endTime', String(dateValue[1].valueOf()));
    }

    // Add project filter
    if (selectedProjectId) {
      params.set('projectId', String(selectedProjectId));
    }

    return `${basePath}?${params.toString()}`;
  };

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
          <div className={styles.topAreaFilter}>
            <div className={styles.top}>
              {boardVisible[ELayoutKey.QuickStart] && <QuickStart />}
              {boardVisible[ELayoutKey.TaskOverview] && (
                <div className={schedules.length > 2 ? styles.schedules : styles.schedulesVertical}>
                  <Card className={styles.card}>
                    <div className={styles.header}>
                      <div className={styles.consoleCardTitle}>
                        {formatMessage({
                          id: 'src.page.Console.7B084A6B',
                          defaultMessage: '任务概览',
                        })}
                      </div>
                    </div>

                    <div className={styles.jobsCounter}>
                      <div className={styles.counterGrid}>
                        <ScheduleCounter
                          title={formatMessage({
                            id: 'src.page.Console.F03B2F0A',
                            defaultMessage: '待审批工单',
                          })}
                          counter={todosData?.FLOW?.count?.FLOW_WAIT_ME_APPROVAL}
                          onClick={() => {
                            navigate(
                              `/${IPageType.Task}?tab=${TaskTab.approveByCurrentUser}&taskType=${TaskPageType.ALL}&projectId=clearAll&timeRange=ALL`,
                            );
                          }}
                        />

                        <ScheduleCounter
                          title={formatMessage({
                            id: 'src.page.Console.728721B8',
                            defaultMessage: '待执行工单',
                          })}
                          counter={todosData?.FLOW?.count?.FLOW_WAIT_ME_EXECUTION}
                          onClick={() => {
                            navigate(
                              `/${IPageType.Task}?tab=${TaskTab.executionByCurrentUser}&taskType=${TaskPageType.ALL}&projectId=clearAll&timeRange=ALL`,
                            );
                          }}
                        />

                        <ScheduleCounter
                          title={formatMessage({
                            id: 'src.page.Console.05FDDC9F',
                            defaultMessage: '待审批作业',
                          })}
                          counter={todosData?.SCHEDULE?.count?.SCHEDULE_WAIT_ME_APPROVAL}
                          onClick={() => {
                            navigate(
                              `/${IPageType.Schedule}?tab=${ScheduleTab.approveByCurrentUser}&scheduleType=${SchedulePageType.ALL}&projectId=clearAll&timeRange=ALL`,
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.filterContainer}>
                      <Select
                        className={styles.filter}
                        prefix={<ClockCircleOutlined style={{ fontSize: 14 }} />}
                        defaultValue={timeValue || TimeOptions[0].value}
                        options={TimeOptions}
                        onChange={(value: number) => {
                          setTimeValue(value);
                          localStorage.setItem(getCacheTimeKey(), JSON.stringify(value));
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
                            localStorage.setItem(getCacheDateKey(), JSON.stringify(dateForStorage));
                          }}
                        />
                      )}
                      <Select
                        className={styles.filter}
                        placeholder={formatMessage({
                          id: 'src.page.Console.609E3208',
                          defaultMessage: '请选择项目',
                        })}
                        popupMatchSelectWidth={false}
                        style={{ maxWidth: 200, border: 'none' }}
                        options={[
                          {
                            label: formatMessage({
                              id: 'src.page.Console.C4433E9F',
                              defaultMessage: '全部项目',
                            }),
                            value: -1,
                          },
                          ...projectOptions,
                        ]}
                        value={selectDisplayValue}
                        onChange={(value) => {
                          setSelectDisplayValue(value);
                          setSelectedProjectId(value === -1 ? undefined : value);
                          localStorage.setItem(getCacheProjectIdKey(), value + '');
                        }}
                      />
                    </div>
                    <div
                      className={
                        schedules.length > 2
                          ? styles.chartsContainer
                          : styles.chartsContainerVertical
                      }
                    >
                      {hasTaskChecked && (
                        <div className={styles.barChartSection}>
                          <BarChart
                            data={taskResData}
                            selectedProjectId={selectedProjectId}
                            timeValue={timeValue}
                            dateValue={dateValue}
                          />

                          <div className={styles.legend}>
                            {taskStatus.map((item, index) => {
                              return (
                                <LabelWithIcon
                                  key={index}
                                  icon={
                                    <span
                                      className={styles.taskLegendIcon}
                                      style={{
                                        backgroundColor: taskStatusColor[index],
                                      }}
                                    />
                                  }
                                  label={<span className={styles.label}>{item}</span>}
                                  gap={8}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {hasTaskChecked &&
                        checkedKeys.some((item) =>
                          showJobDivider.includes(item as ScheduleType),
                        ) && <Divider type="vertical" className={styles.divider} />}
                      <div
                        className={
                          hasTaskChecked ? styles.pieChartSection : styles.pieChartSectionFull
                        }
                      >
                        <div
                          className={
                            hasTaskChecked ? styles.scheduleItems : styles.scheduleItemsHorizontal
                          }
                        >
                          {schedules.map((item, index) => {
                            return (
                              <ScheduleItem
                                key={index}
                                title={item.title}
                                progress={schedulesData?.[item.type]}
                                type={item.type}
                                timeValue={timeValue}
                                dateValue={dateValue}
                                selectedProjectId={selectedProjectId}
                              />
                            );
                          })}
                        </div>
                        {hasTaskChecked &&
                          checkedKeys.some((item) =>
                            showJobDivider.includes(item as ScheduleType),
                          ) && (
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
                          )}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
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
              {boardVisible[ELayoutKey.AboutUs] && (
                <Card
                  className={
                    boardVisible[ELayoutKey.BestPractices]
                      ? styles.aboutUs
                      : boardVisible[ELayoutKey.RecentDatabases]
                      ? styles.aboutUsLargeVersion
                      : styles.aboutUsMiniVersion
                  }
                >
                  <div className={styles.consoleCardTitle}>
                    {formatMessage({ id: 'src.page.Console.3A3E34F5', defaultMessage: '关于我们' })}
                  </div>
                  <div className={styles.aboutUsContent}>
                    <div className={styles.docsWrapper}>
                      {aboutUs.helps.map((help, index) => {
                        return (
                          <div key={index} className={styles.aboutUsHelpDocItem}>
                            <LabelWithIcon
                              gap={9}
                              icon={aboutUsIcons[index]}
                              label={
                                <div
                                  className={styles.docs}
                                  onClick={() => {
                                    handleAboutUsClick(aboutUs.urlKeys[index], index);
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
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        </div>
      </div>

      <ModalHelpAbout
        showModal={showModalAbout}
        onCancel={() => {
          setShowModalAbout(false);
        }}
      />
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

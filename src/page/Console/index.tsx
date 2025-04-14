import { useCallback, useEffect, useState } from 'react';
import { useMount, useRequest } from 'ahooks';
import modal from '@/store/modal';
import {
  Button,
  Card,
  Col,
  Divider,
  Popconfirm,
  Popover,
  QRCode,
  Radio,
  Row,
  Spin,
  Typography,
} from 'antd';
import { ReactComponent as DownloadSvg } from '@/svgr/download-fill.svg';
import { ReactComponent as GithubSvg } from '@/svgr/github.svg';
import { ReactComponent as SendSvg } from '@/svgr/send-fill.svg';
import { getImg } from '@/util/intl';

import Icon, { ExperimentOutlined } from '@ant-design/icons';
import LabelWithIcon from './components/LabelWithIcon';
import ScheduleItem from './components/ScheduleItem';
import { areaLayout, ConsoleTextConfig, EQuickStartRole, gridConfig } from './const';
import styles from './index.less';
import RecentlyDatabase from './components/RecentlyDatabase';
import { useNavigate } from '@umijs/max';
import { getScheduleStat } from '@/common/network/task';
import { ICycleTaskStatParam, TaskPageType } from '@/d.ts';
import login from '@/store/login';
import setting from '@/store/setting';
import { IPageType } from '@/d.ts/_index';
import { gotoSQLWorkspace } from '@/util/route';
import { URL_ACTION } from '@/util/hooks/useUrlAction';
import QrCodeWithIcon from './components/QRCodeWithIcon';
import { sumTaskStats } from '@/util/utils';

const paddingCal = (currentLayout) => {
  return currentLayout === gridConfig.all ? 0 : 8;
};

const aboutUsIcons = [
  <Icon component={DownloadSvg} style={{ color: '#1890ff', fontSize: 14 }} />,
  <Icon component={SendSvg} style={{ color: '#52c41a', fontSize: 14 }} />,
  <Icon component={GithubSvg} style={{ fontSize: 14 }} />,
];
const Console = () => {
  const { quickStart, aboutUs, bestPractice, schdules } = ConsoleTextConfig;
  const [currentQuickStartRole, setCurrentQuickStartRole] = useState(EQuickStartRole.Admin);
  const [currentQuickStartStep, setCurrentQuickStartStep] = useState(-1);
  const [topAreaLayout, setTopAreaLayout] = useState(areaLayout.both);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentQuickStartStep(-1);
  }, [currentQuickStartRole]);

  const {
    data,
    loading: scheduleLoading,
    run: runGetScheduleStat,
    refresh,
  } = useRequest((params: ICycleTaskStatParam) => getScheduleStat(params), {
    manual: true,
  });
  const res = {};
  data?.forEach((item) => {
    const taskStat = sumTaskStats(item.taskStats);
    const schedule = { ...item, taskStat };
    res[item?.type] = schedule;
  });

  useEffect(() => {
    const enable = setting.configurations['odc.user.guidePromptEnabled'];
    const guidePromptEnabled = enable !== 'true';
    const hasData = data?.length > 0;
    if (guidePromptEnabled) {
      setTopAreaLayout(hasData ? areaLayout.schedules : areaLayout.hideTop);
    } else {
      setTopAreaLayout(hasData ? areaLayout.both : areaLayout.quickStart);
    }
  }, [data]);

  useMount(() => {
    runGetScheduleStat({
      currentOrganizationId: login.organizationId,
      types: ['DATA_ARCHIVE', 'SQL_PLAN', 'DATA_DELETE', 'PARTITION_PLAN'],
      startTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
      endTime: Date.now(),
    });
  });

  const quickStartMenu = {
    [`${EQuickStartRole.Admin}_0`]: () => {
      navigate(`/${IPageType.Datasource}?action=${URL_ACTION.newDatasource}`);
    },
    [`${EQuickStartRole.Admin}_1`]: () => {
      navigate(`/${IPageType.Project}?action=${URL_ACTION.newProject}`);
    },
    [`${EQuickStartRole.Admin}_2`]: () => {
      navigate(`/secure/riskLevel`);
    },
    [`${EQuickStartRole.Admin}_3`]: () => {
      navigate(`/${IPageType.Task}?action=${URL_ACTION.newTask}`);
    },
    [`${EQuickStartRole.Develepor}_0`]: () => {
      navigate(`/${IPageType.Project}?action=${URL_ACTION.newApply}`);
    },
    [`${EQuickStartRole.Develepor}_1`]: () => {
      navigate(`/${IPageType.Task}?action=${URL_ACTION.newDataMock}&task=${TaskPageType.DATAMOCK}`);
    },
    [`${EQuickStartRole.Develepor}_2`]: () => {
      gotoSQLWorkspace();
    },
  };

  const renderScheduleCard = useCallback(() => {
    const { status, statusColor } = ConsoleTextConfig.schdules;
    return (
      <Card className={styles.card}>
        <div className={styles.consoleCardTitle}>
          <span className={styles.title}>定时任务概览</span>
          <span className={styles.subTitle}>(近 7 天)</span>
        </div>
        <div className={styles.legend}>
          {status.map((item, index) => {
            return (
              <LabelWithIcon
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
        <div className={styles.scheduleItems}>
          {schdules?.scheduleTitle.map((title, index) => {
            return (
              <ScheduleItem
                title={title}
                progress={res[schdules.scheduleType[index]]}
                type={schdules.scheduleType[index]}
              />
            );
          })}
        </div>
      </Card>
    );
  }, [res]);
  return (
    <>
      <div className={styles.consoleBackgroud} />
      <div className={styles.consoleWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>欢迎使用 OceanBase 开发者中心</div>
          <div className={styles.subTitle}>开源的数据库开发和数据库管控协同工具</div>
        </div>
        <div className={styles.content}>
          <Spin
            spinning={
              scheduleLoading && setting.configurations['odc.user.guidePromptEnabled'] === 'true'
            }
            className={styles.topAreaFilter}
          >
            {topAreaLayout.guide || topAreaLayout.schedule ? (
              <Row className={styles.top}>
                <Col
                  span={topAreaLayout.schedule}
                  className={styles.schedules}
                  style={{ paddingRight: paddingCal(topAreaLayout.schedule) }}
                >
                  {renderScheduleCard()}
                </Col>
                <Col
                  span={topAreaLayout.guide}
                  className={styles.quickStart}
                  style={{ paddingLeft: paddingCal(topAreaLayout.guide) }}
                >
                  <Card className={styles.card}>
                    <div className={styles.consoleCardTitle}>
                      快速上手
                      <Popconfirm
                        placement="bottom"
                        title={
                          <>
                            {' '}
                            <div>
                              <Typography.Text>确认要隐藏快速上手内容吗？</Typography.Text>
                            </div>
                            <div>
                              <Typography.Text>你也可以在帮助中重新查看。</Typography.Text>
                            </div>
                          </>
                        }
                        onConfirm={() => {
                          setting.updateOneUserConfig({
                            key: 'odc.user.guidePromptEnabled',
                            value: false,
                          });
                          setTopAreaLayout(
                            data?.length > 0 ? areaLayout.schedules : areaLayout.hideTop,
                          );
                        }}
                      >
                        <span className={styles.hide}>不再提示</span>
                      </Popconfirm>
                    </div>
                    <div className={styles.quickStartContent}>
                      <div className={styles.leftWrapper}>
                        <Radio.Group
                          className={styles.tabs}
                          onChange={(e) => {
                            setCurrentQuickStartRole(e.target.value);
                          }}
                          value={currentQuickStartRole}
                          style={{ marginBottom: 8 }}
                        >
                          {quickStart.role.map((item, index) => {
                            return <Radio.Button value={index}>{item}</Radio.Button>;
                          })}
                        </Radio.Group>
                        <div className={styles.descriptions}>
                          <Typography.Paragraph
                            type="secondary"
                            ellipsis={{
                              rows: 2,
                            }}
                          >
                            {quickStart.descriptions[currentQuickStartRole]}
                          </Typography.Paragraph>
                        </div>
                        <div
                          className={styles.steps}
                          onMouseLeave={() => {
                            setCurrentQuickStartStep(-1);
                          }}
                        >
                          {quickStart.steps[currentQuickStartRole].map((step, index) => {
                            return (
                              <div
                                className={styles.stepItem}
                                onMouseEnter={() => {
                                  setCurrentQuickStartStep(index);
                                }}
                                onClick={() =>
                                  quickStartMenu?.[`${currentQuickStartRole}_${index}`]?.()
                                }
                              >
                                <LabelWithIcon
                                  gap={8}
                                  icon={
                                    step && (
                                      <span
                                        className={`${styles.stepIcon} ${
                                          currentQuickStartStep === index ? styles.active : ''
                                        }`}
                                      >
                                        {index + 1}
                                      </span>
                                    )
                                  }
                                  label={
                                    <span
                                      className={`${styles.stepLabel} ${
                                        currentQuickStartStep === index ? styles.active : ''
                                      }`}
                                    >
                                      {step}
                                    </span>
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                        <Divider variant="dashed" style={{ margin: '20px 0' }} />
                        <LabelWithIcon
                          gap={8}
                          icon={<ExperimentOutlined />}
                          label={
                            <span
                              className={`${styles.articleTitleTypograpy} ${styles.moreFunctionIntro}`}
                              onClick={() => modal.changeVersionModalVisible(true)}
                            >
                              更多功能介绍
                            </span>
                          }
                        />
                      </div>
                      {topAreaLayout.guide === gridConfig.all && (
                        <div className={styles.rightWrapper}>
                          <img
                            style={{ width: 550, height: 278 }}
                            src={getImg(
                              currentQuickStartStep > -1
                                ? `/guide/${currentQuickStartRole}-${currentQuickStartStep}.png`
                                : `/guide/default-${currentQuickStartRole}.png`,
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            ) : null}
          </Spin>
          <Row className={styles.bottom}>
            <Col span={18} className={styles.recently}>
              <Card className={styles.card}>
                <div className={styles.consoleCardTitle}>最近访问数据库</div>
                <RecentlyDatabase />
              </Card>
            </Col>
            <Col span={6} className={styles.docWrapper}>
              <Card className={styles.aboutUs}>
                <div className={styles.consoleCardTitle}>关于我们</div>
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
                                  window.open(aboutUs.urls[index]);
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
                    label={<Typography.Text type="secondary">钉钉群：67365031753</Typography.Text>}
                  />
                </div>
              </Card>
              <Card className={styles.practice}>
                <div className={styles.consoleCardTitle}>
                  最佳实践
                  <span
                    className={styles.showMore}
                    onClick={() =>
                      window.open('https://www.oceanbase.com/docs/common-odc-1000000002687235')
                    }
                  >
                    {'更多 >'}
                  </span>
                </div>
                {bestPractice.articles.map((article) => {
                  return (
                    <div className={styles.article} onClick={() => window.open(article.url)}>
                      {article.title}
                    </div>
                  );
                })}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default Console;

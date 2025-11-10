import { formatMessage, getImg } from '@/util/intl';
import { Card, Divider, Radio, Tooltip, Typography } from 'antd';
import styles from './index.less';
import { useState, memo } from 'react';
import { ConsoleTextConfig, EQuickStartRole } from '../../const';
import { gotoSQLWorkspace } from '@/util/route';
import { URL_ACTION } from '@/util/hooks/useUrlAction';
import { TaskPageType } from '@/d.ts';
import { useNavigate } from '@umijs/max';
import { IPageType } from '@/d.ts/_index';
import LabelWithIcon from '@/component/LabelWithIcon';
import { ExperimentOutlined } from '@ant-design/icons';
import modal from '@/store/modal';

/**
 * Quick start guide component for console page
 * Provides role-based quick start steps for administrators and developers
 */
const QuickStart = memo(() => {
  const [currentQuickStartRole, setCurrentQuickStartRole] = useState(EQuickStartRole.Admin);
  const [currentQuickStartStep, setCurrentQuickStartStep] = useState(-1);
  const { quickStart } = ConsoleTextConfig;

  const navigate = useNavigate();

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
    [`${EQuickStartRole.Developer}_0`]: () => {
      navigate(`/${IPageType.Project}?action=${URL_ACTION.newApply}`);
    },
    [`${EQuickStartRole.Developer}_1`]: () => {
      navigate(`/${IPageType.Task}?action=${URL_ACTION.newDataMock}&task=${TaskPageType.DATAMOCK}`);
    },
    [`${EQuickStartRole.Developer}_2`]: () => {
      gotoSQLWorkspace();
    },
  };
  return (
    <div className={styles.quickStart}>
      <Card className={styles.card}>
        <div className={styles.consoleCardTitle}>
          {formatMessage({
            id: 'src.page.Console.D52989BC',
            defaultMessage: '快速上手',
          })}
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
              <Tooltip title={quickStart.descriptions[currentQuickStartRole]}>
                <Typography.Paragraph
                  type="secondary"
                  ellipsis={{
                    rows: 2,
                  }}
                >
                  {quickStart.descriptions[currentQuickStartRole]}
                </Typography.Paragraph>
              </Tooltip>
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
                    onClick={() => quickStartMenu?.[`${currentQuickStartRole}_${index}`]?.()}
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
              icon={<ExperimentOutlined style={{ color: 'var(--icon-color-normal)' }} />}
              label={
                <span
                  className={`${styles.articleTitleTypograpy} ${styles.moreFunctionIntro}`}
                  onClick={() => modal.changeVersionModalVisible(true)}
                >
                  {formatMessage({
                    id: 'src.page.Console.39E600CA',
                    defaultMessage: '更多功能介绍',
                  })}
                </span>
              }
            />
          </div>
          <div className={styles.rightWrapper}>
            <img
              className={styles.img}
              src={getImg(
                currentQuickStartStep > -1
                  ? `guide/${currentQuickStartRole}-${currentQuickStartStep}.png`
                  : `guide/default-${currentQuickStartRole}.png`,
              )}
            />
          </div>
        </div>
      </Card>
    </div>
  );
});

QuickStart.displayName = 'QuickStart';

export default QuickStart;

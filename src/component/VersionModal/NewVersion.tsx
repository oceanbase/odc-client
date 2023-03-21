import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';
import { Button, Image, notification, Radio, Space, Typography } from 'antd';
import React, { useState } from 'react';
import styles from './index.less';
import config from './newVersionConfig';

import setting from '@/store/setting';
import WelComeSvg from '@/svgr/emoji_welcome.svg';
import NewOpenSvg from '@/svgr/newopen.svg';
import { getLocalImg } from '@/util/intl';

const newVersionModalKey = 'new-version-modal-key-odc';

function getNewVersionImg(fileName: string) {
  return getLocalImg(`newVersion/${fileName}`);
}

interface IProps {}

const NewVersion: React.FC<IProps> = () => {
  const [isShowMore, setIsShowMore] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);

  if (isShowMore) {
    const currentCard = config[cardIdx];
    const count = config.length;
    return (
      <Space direction="vertical">
        <Typography.Title level={5}>{currentCard?.title}</Typography.Title>
        <div>{currentCard?.describe}</div>
        {currentCard?.img ? <Image width="100%" src={getNewVersionImg(currentCard?.img)} /> : null}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Radio.Group
            className={styles.radiogroup}
            value={cardIdx}
            onChange={(e) => {
              setCardIdx(e.target.value);
            }}
          >
            {new Array(count).fill(null).map((v, idx) => {
              return <Radio value={idx} />;
            })}
          </Radio.Group>
          <Space>
            {cardIdx > 0 && (
              <Button
                onClick={() => {
                  setCardIdx(cardIdx - 1);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.component.VersionModal.NewVersion.Previous',
                  })

                  /* 上一个 */
                }
              </Button>
            )}

            {cardIdx === count - 1 ? (
              <Button
                onClick={() => {
                  notification.close(newVersionModalKey);
                }}
                type="primary"
              >
                {
                  formatMessage({
                    id: 'odc.component.VersionModal.NewVersion.GotIt',
                  })

                  /* 知道了 */
                }
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  setCardIdx(cardIdx + 1);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.component.VersionModal.NewVersion.Next',
                  })

                  /* 下一个 */
                }
              </Button>
            )}
          </Space>
        </div>
      </Space>
    );
  }

  return (
    <Space direction="vertical">
      <Typography.Title style={{ display: 'flex', alignItems: 'center' }} level={5}>
        <Icon component={WelComeSvg} style={{ marginRight: 8, fontSize: 20 }} />
        {
          formatMessage({
            id: 'odc.component.VersionModal.NewVersion.OdcOptimizationUpdate',
          })

          /* 新版本 ODC 优化更新 */
        }
      </Typography.Title>
      <div style={{ marginLeft: 26 }}>
        {
          formatMessage({
            id: 'odc.component.VersionModal.NewVersion.TheNewDarkThemeHas',
          }) /*全新暗色主题已上线*/
        }
      </div>
      <Space style={{ float: 'right', paddingTop: 5 }}>
        <a target={'oceanbase_odc_help'} href="https://www.oceanbase.com/product/odc">
          <Space>
            <Icon component={NewOpenSvg} />
            {
              formatMessage({
                id: 'odc.component.VersionModal.NewVersion.MoreProductTrends',
              })

              /* 更多产品动态 */
            }
          </Space>
        </a>
        <Button
          type="primary"
          onClick={() => {
            setting.setTheme('odc-dark');
          }}
        >
          {
            formatMessage({
              id: 'odc.component.VersionModal.NewVersion.DarkTheme',
            }) /*暗色主题*/
          }
        </Button>
        <Button
          type="primary"
          onClick={() => {
            setIsShowMore(true);
          }}
        >
          {
            formatMessage({
              id: 'odc.component.VersionModal.NewVersion.LearnMore',
            })

            /* 了解详情 */
          }
        </Button>
      </Space>
    </Space>
  );
};

export default function openNewVersionTip() {
  notification.open({
    message: '',
    description: <NewVersion />,
    duration: null,
    key: newVersionModalKey,
    className: styles.newVersion,
  });
}

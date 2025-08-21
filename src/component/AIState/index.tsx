import Icon from '@ant-design/icons';

import setting from '@/store/setting';
import { ReactComponent as AIDisableSvg } from '@/svgr/ai_disable.svg';
import { ReactComponent as AIEnableSvg } from '@/svgr/ai_enable.svg';
import { Spin, Tooltip } from 'antd';
import classNames from 'classnames';
import Lottie from 'lottie-react';
import { observer } from 'mobx-react';
import aiLoading from './AI_Loading.json';
import styles from './index.less';

export default observer(function AIState() {
  const workspaceAIEnabled = setting.AIEnabled;
  const userAIEnabled = setting.enableAIInlineCompletion;
  if (setting.isAIThinking) {
    return (
      <Tooltip title="AI 思考中...">
        <Spin
          indicator={<Lottie style={{ fontSize: 16 }} animationData={aiLoading} loop={true} />}
          className={classNames(styles.btn)}
        />
      </Tooltip>
    );
  }
  if (!workspaceAIEnabled) {
    return (
      <Tooltip title="当前工作空间内暂未启用 AI 服务，请联系管理员">
        <Icon component={AIDisableSvg} className={classNames(styles.btn, styles.disabled)} />
      </Tooltip>
    );
  } else if (!userAIEnabled) {
    return (
      <Tooltip title="AI 服务未生效">
        <Icon
          onClick={() => {
            setting.enableAI();
          }}
          component={AIDisableSvg}
          className={styles.btn}
        />
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title="AI 服务生效中，您可以选择使用建议的 AI 生成内容">
        <span
          style={{
            display: 'inline-flex',
            backgroundImage: 'linear-gradient(135deg, #c766ff26 0%, #0181fd26 100%)',
            borderRadius: 4,
          }}
        >
          <Icon
            onClick={() => {
              setting.disableAI();
            }}
            component={AIEnableSvg}
            className={styles.btn}
          />
        </span>
      </Tooltip>
    );
  }
});

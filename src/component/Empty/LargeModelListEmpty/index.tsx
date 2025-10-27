import { formatMessage } from '@/util/intl';
import { ReactComponent as NoModelSVG } from '@/svgr/noModels.svg';
import Icon from '@ant-design/icons';
import { Typography } from 'antd';
import styles from './index.less';
import { IModelProvider } from '@/d.ts/llm';

interface IProps {
  selectedProvider?: string;
  providers?: IModelProvider[];
}

const LargeModelListEmpty = ({ selectedProvider, providers }: IProps) => {
  // 根据当前选中的供应商判断是否显示API Key提示
  const currentProviderInfo = providers?.find((provider) => provider.provider === selectedProvider);

  const shouldShowApiKeyTip =
    selectedProvider && currentProviderInfo?.configurateMethods?.includes('predefined-model');

  return (
    <div className={styles.largeModelListEmpty}>
      <Icon className={styles.icon} component={NoModelSVG} />
      <Typography.Text className={styles.description}>
        {formatMessage({
          id: 'src.component.Empty.LargeModelListEmpty.19445EB5',
          defaultMessage: '暂无模型',
        })}
      </Typography.Text>
      {shouldShowApiKeyTip && (
        <Typography.Text type="secondary">
          {formatMessage({
            id: 'src.component.Empty.LargeModelListEmpty.C3B17CD7',
            defaultMessage: '请先配置模型供应商的 API KEY 获取模型',
          })}
        </Typography.Text>
      )}
    </div>
  );
};

export default LargeModelListEmpty;

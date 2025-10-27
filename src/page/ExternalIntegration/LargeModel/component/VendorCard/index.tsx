import { formatMessage } from '@/util/intl';
import { Button, Divider, Tag, Tooltip, Typography } from 'antd';
import { EditOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import styles from './index.less';
import { VendorsConfig, TEXT_CONSTANTS } from '../../constant';
import {
  EConfigurationMethod,
  type EditModalRef,
  type APIKeyConfigModalRef,
  type DescriptionModelRef,
  IModelProvider,
} from '@/d.ts/llm';
import {
  stopPropagation,
  createStatusDotStyle,
  supportsConfigurationMethod,
  formatModelCount,
} from '../../utils';

interface IProps {
  title: string;
  tags: string[];
  apiKey?: string;
  canConfigApiKey?: boolean;
  provider?: IModelProvider;
  isActive?: boolean;
  onClick?: () => void;
  // Modal refs
  editModalRef?: React.RefObject<EditModalRef>;
  apiKeyConfigModalRef?: React.RefObject<APIKeyConfigModalRef>;
  descriptionModelRef?: React.RefObject<DescriptionModelRef>;
  onRefreshModels?: () => void;
}

const VendorCard = ({
  title,
  tags,
  apiKey,
  canConfigApiKey,
  provider,
  isActive = false,
  onClick,
  editModalRef,
  apiKeyConfigModalRef,
  descriptionModelRef,
  onRefreshModels,
}: IProps) => {
  // 从 store 中获取模型数量
  const count = provider?.modelCounts || 0;

  const handleConfigAPIKey = stopPropagation(() => {
    if (provider && apiKeyConfigModalRef?.current) {
      apiKeyConfigModalRef.current.open(provider);
    }
  });

  const handleAddModel = stopPropagation(() => {
    if (provider && editModalRef?.current) {
      editModalRef.current.open({ provider });
    }
  });

  const handleEditDescription = stopPropagation(() => {
    if (provider && descriptionModelRef?.current) {
      descriptionModelRef.current.open(provider);
    }
  });
  const renderOperation = () => {
    if (count === 0) {
      return (
        <div className={styles.statusInfo}>
          <InfoCircleOutlined className={styles.statusIcon} />
          {TEXT_CONSTANTS.NO_MODELS}
        </div>
      );
    }

    if (count > 0) {
      return <div className={styles.count}>{formatModelCount(count)}</div>;
    }

    if (canConfigApiKey && !apiKey) {
      return (
        <div className={styles.statusInfo}>
          <InfoCircleOutlined className={styles.statusIcon} />
          {TEXT_CONSTANTS.CONFIGURE_API_KEY_FIRST}
        </div>
      );
    }
  };

  return (
    <div className={`${styles.vendorCard} ${isActive ? styles.active : ''}`} onClick={onClick}>
      <div className={styles.header}>
        <div className={styles.vendorInfo}>
          <Icon
            className={styles.vendorIcon}
            component={VendorsConfig?.[provider?.provider]?.icon}
          />

          <div className={styles.vendorDetails}>
            <div className={styles.vendorTitle}>{title}</div>
          </div>
        </div>

        {canConfigApiKey && (
          <div className={styles.configSection}>
            <Button onClick={handleConfigAPIKey} className={styles.configBtn}>
              <span className={styles.apiKeyText}>
                {formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.VendorCard.3C83974E',
                  defaultMessage: '配置 API KEY',
                })}
              </span>
              <span className={styles.statusDot} style={createStatusDotStyle(!!apiKey)} />
            </Button>
          </div>
        )}
      </div>

      <div className={styles.contentSection}>
        <div className={styles.tagsAndRemark}>
          {tags?.map((tag, index) => (
            <Tag key={`${tag}-${index}`} className={styles.modelTag}>
              {tag}
            </Tag>
          ))}

          <div className={styles.remarkSection}>
            {provider?.description ? (
              <Tag className={styles.remarkTag}>
                <Tooltip
                  title={
                    <div className={styles.remarkTooltip}>
                      <span className={styles.remarkText}>{provider?.description}</span>
                      <EditOutlined className={styles.editIcon} onClick={handleEditDescription} />
                    </div>
                  }
                >
                  <Typography.Text type="secondary">
                    <InfoCircleOutlined />
                  </Typography.Text>
                </Tooltip>
              </Tag>
            ) : (
              <Tooltip
                title={formatMessage({
                  id: 'src.page.ExternalIntegration.LargeModel.component.VendorCard.060E6243',
                  defaultMessage: '添加备注',
                })}
              >
                <Button
                  type="dashed"
                  onClick={handleEditDescription}
                  className={styles.addRemarkBtn}
                >
                  <PlusOutlined className={styles.addIcon} />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <Divider className={styles.divider} />

      <div className={styles.operations}>
        {renderOperation()}

        {supportsConfigurationMethod(provider, EConfigurationMethod.CUSTOMIZABLE_MODEL) && (
          <Button type="link" className={styles.addModelBtn} onClick={handleAddModel}>
            <PlusOutlined />
            {formatMessage({
              id: 'src.page.ExternalIntegration.LargeModel.component.VendorCard.CC14FA7B',
              defaultMessage: '添加模型',
            })}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VendorCard;

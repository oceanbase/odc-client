import YamlEditor from '@/component/YamlEditor';
import type { IManagerIntegration } from '@/d.ts';
import { IManagerDetailTabs } from '@/d.ts';
import { getLocalFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Space } from 'antd';
import React from 'react';
import styles from '../../index.less';

const Detail: React.FC<{
  title: string;
  data: IManagerIntegration;
}> = ({ title, data }) => {
  const {
    name,
    enabled,
    description,
    encryption,
    creatorName,
    createTime,
    updateTime,
    configuration,
  } = data;

  return (
    <>
      <Descriptions column={1}>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label={`${title}名称`}>
          {name}
        </Descriptions.Item>
        <Descriptions.Item label={`${title}状态`}>{enabled ? '开启' : '停用'}</Descriptions.Item>
        <Descriptions.Item>{`${title}配置`}</Descriptions.Item>
        <Descriptions.Item>
          <div className={styles.editor}>
            <YamlEditor defaultValue={configuration} readOnly />
          </div>
        </Descriptions.Item>
        {
          <Descriptions.Item>
            <Space direction="vertical" size={5} className={styles['block-wrapper']}>
              <Space>
                <span>加密状态</span>
                <span>{encryption?.enabled ? '启用' : '未启用'}</span>
              </Space>
              {encryption?.enabled && (
                <Space className={styles.block} split=":">
                  <span>加密算法</span>
                  <span>{encryption?.algorithm}</span>
                </Space>
              )}
            </Space>
          </Descriptions.Item>
        }
        <Descriptions.Item label="备注">{description || '-'}</Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions column={1}>
        <Descriptions.Item label="创建人">{creatorName}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{getLocalFormatDateTime(createTime)}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{getLocalFormatDateTime(updateTime)}</Descriptions.Item>
      </Descriptions>
    </>
  );
};

const DetailContent: React.FC<{
  title: string;
  activeKey: IManagerDetailTabs;
  data: IManagerIntegration;
  handleCloseAndReload: () => void;
}> = ({ activeKey, ...rest }) => {
  return <Detail {...rest} />;
};

export default DetailContent;

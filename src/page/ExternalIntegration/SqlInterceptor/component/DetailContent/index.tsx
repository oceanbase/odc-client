import { deleteIntegration } from '@/common/network/manager';
import { CommonDeleteModal } from '@/component/Manage/DeleteModal';
import YamlEditor from '@/component/YamlEditor';
import type { IManagerIntegration } from '@/d.ts';
import { IManagerDetailTabs } from '@/d.ts';
import { getLocalFormatDateTime } from '@/util/utils';
import { Button, Descriptions, Divider, message, Space } from 'antd';
import React, { useState } from 'react';
import styles from '../../index.less';
const Detail: React.FC<{
  data: IManagerIntegration;
  handleCloseAndReload: () => void;
}> = ({ data, handleCloseAndReload }) => {
  const { name, id, description, creatorName, createTime, updateTime, configuration } = data;
  const [visible, setVisible] = useState(false);

  const handleDelete = async () => {
    const res = await deleteIntegration(id);
    if (res) {
      message.success('删除成功');
      setVisible(false);
      handleCloseAndReload();
    } else {
      message.error('删除失败');
    }
  };

  return (
    <>
      <Descriptions column={1}>
        <Descriptions.Item contentStyle={{ whiteSpace: 'pre' }} label="SQL 审核集成名称">
          {name}
        </Descriptions.Item>
        <Descriptions.Item>SQL 审核集成配置</Descriptions.Item>
        <Descriptions.Item>
          <div className={styles.editor}>
            <YamlEditor defaultValue={configuration} readOnly />
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="备注">{description}</Descriptions.Item>
      </Descriptions>
      <Descriptions column={1}>
        <Descriptions.Item label="创建人">{creatorName}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{getLocalFormatDateTime(createTime)}</Descriptions.Item>
        <Descriptions.Item label="更新时间">{getLocalFormatDateTime(updateTime)}</Descriptions.Item>
      </Descriptions>
      <Divider />
      <Space size={5}>
        <span>删除 SQL 审核集成，赋予该连接的用户将无法访问</span>
        <Button
          type="link"
          onClick={() => {
            setVisible(true);
          }}
        >
          删除 SQL 审核集成
        </Button>
      </Space>
      <CommonDeleteModal
        type="SQL 审核集成"
        description="删除SQL 审核集成，赋予该SQL 审核集成的用户将丢失相关公共资源"
        name={name}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={handleDelete}
      />
    </>
  );
};

const DetailContents = {
  [IManagerDetailTabs.DETAIL]: Detail,
};

const DetailContent: React.FC<{
  title: string;
  activeKey: IManagerDetailTabs;
  data: IManagerIntegration;
  handleCloseAndReload: () => void;
}> = ({ activeKey, ...rest }) => {
  const DetailContent = DetailContents[activeKey];
  return <DetailContent {...rest} />;
};

export default DetailContent;

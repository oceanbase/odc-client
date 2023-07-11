import { detailSensitiveRule } from '@/common/network/sensitiveRule';
import { CommonTableMode } from '@/component/CommonTable/interface';
import MonacoEditor from '@/component/MonacoEditor';
import { ISensitiveRule, SensitiveRuleType } from '@/d.ts/sensitiveRule';
import { DetectRuleTypeMap } from '@/page/Project/Sensitive/interface';
import SecureTable from '@/page/Secure/components/SecureTable';
import { CommonTableBodyMode } from '@/page/Secure/components/SecureTable/interface';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Button, Descriptions, Divider, Drawer } from 'antd';
import { useEffect, useLayoutEffect, useState } from 'react';
import styles from './index.less';

const renderByType = (type: SensitiveRuleType, params?: any) => {
  switch (type) {
    case SensitiveRuleType.PATH: {
      const { pathIncludes = [], pathExcludes = [] } = params;
      return (
        <>
          <Descriptions.Item label={'路径识别表达式'}>
            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div>匹配：{pathIncludes.join(',')}</div>
              <div>排除：{pathExcludes.join(',') || '-'}</div>
            </span>
          </Descriptions.Item>
        </>
      );
    }
    case SensitiveRuleType.REGEX: {
      const {
        databaseRegexExpression = '',
        tableRegexExpression = '',
        columnRegexExpression = '',
        columnCommentRegexExpression = '',
      } = params;
      const dataSource = [];
      if (databaseRegexExpression !== '') {
        dataSource.push({
          name: '库名',
          content: databaseRegexExpression,
        });
      }
      if (tableRegexExpression !== '') {
        dataSource.push({
          name: '表名',
          content: tableRegexExpression,
        });
      }
      if (columnRegexExpression !== '') {
        dataSource.push({
          name: '列名',
          content: columnRegexExpression,
        });
      }
      if (columnCommentRegexExpression !== '') {
        dataSource.push({
          name: '列备注',
          content: columnCommentRegexExpression,
        });
      }
      return (
        <>
          <Descriptions.Item label={'识别规则'}>&nbsp;</Descriptions.Item>
          <div
            style={{
              width: '500px',
            }}
          >
            <SecureTable
              mode={CommonTableMode.SMALL}
              body={CommonTableBodyMode.SMALL}
              titleContent={null}
              showToolbar={false}
              showPagination={false}
              filterContent={{
                searchPlaceholder: formatMessage({
                  id: 'odc.components.UserPage.EnterAUserOrAccount',
                }),
                /* 请输入用户/账号搜索 */
              }}
              operationContent={{
                options: [],
              }}
              onLoad={null}
              tableProps={{
                columns: [
                  {
                    title: '规则名称',
                    width: 170,
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: '正则表达式',
                    width: 170,
                    dataIndex: 'content',
                    key: 'content',
                  },
                ],
                dataSource: dataSource,
                rowKey: 'id',
                pagination: false,
                scroll: {
                  x: 564,
                },
              }}
            />
          </div>
        </>
      );
    }
    case SensitiveRuleType.GROOVY: {
      const { groovyScript = '' } = params;
      return (
        <>
          <Descriptions.Item label={'识别规则'}>&nbsp;</Descriptions.Item>
          <div
            style={{
              position: 'relative',
              height: '300px',
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--neutral-grey1-color)',
            }}
          >
            <div
              style={{
                paddingBottom: '8px',
                height: '300px',
                width: '100%',
                position: 'relative',
                overflowY: 'hidden',
              }}
            >
              <MonacoEditor
                language={'groovy'}
                defaultValue={groovyScript}
                readOnly={true}
                {...{
                  lineNumbers: 'off',
                }}
              />
            </div>
          </div>
        </>
      );
    }
  }
};
const ViewSensitiveRuleDrawer = ({
  viewDrawerVisible,
  handleViewDrawerClose,
  projectId,
  sensitiveRuleId,
  selectedRecord,
  maskingAlgorithmIdMap,
}) => {
  const [record, setRecord] = useState<ISensitiveRule>(selectedRecord);
  const getDetailSensitiveRule = async (projectId: number, sensitiveRuleId: number) => {
    const rawData = await detailSensitiveRule(projectId, sensitiveRuleId);
    setRecord({
      ...selectedRecord,
      ...rawData,
    });
  };

  useEffect(() => {
    if (viewDrawerVisible && sensitiveRuleId && projectId) {
      getDetailSensitiveRule(projectId, sensitiveRuleId);
    }
  }, [viewDrawerVisible]);

  useLayoutEffect(() => {
    setRecord(selectedRecord);
  }, [selectedRecord]);
  return (
    <Drawer
      width={596}
      title={'查看识别规则'}
      open={viewDrawerVisible}
      onClose={handleViewDrawerClose}
      destroyOnClose={true}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button onClick={handleViewDrawerClose}>关闭</Button>
        </div>
      }
      className={styles.drawer}
    >
      <Descriptions column={1}>
        <Descriptions.Item label={'规则名称'}>{record?.name}</Descriptions.Item>
        <Descriptions.Item label={'规则状态'}>
          {record?.enabled ? '启用' : '未启用'}
        </Descriptions.Item>
        <Descriptions.Item label={'识别方式'}>{DetectRuleTypeMap[record?.type]}</Descriptions.Item>
        <Divider />
        {renderByType(record?.type, record)}
        <Descriptions.Item label={'脱敏算法'}>
          {maskingAlgorithmIdMap[record?.maskingAlgorithmId]}
        </Descriptions.Item>
        <Descriptions.Item label={'规则描述'}>{record?.description || '-'}</Descriptions.Item>
        <Divider />
        <Descriptions.Item label={'创建人'}>{record?.creator?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label={'创建时间'}>
          {getLocalFormatDateTime(record?.createTime)}
        </Descriptions.Item>
        <Descriptions.Item label={'更新时间'}>
          {getLocalFormatDateTime(record?.updateTime)}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default ViewSensitiveRuleDrawer;

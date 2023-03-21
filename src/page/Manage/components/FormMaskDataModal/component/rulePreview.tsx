import { MaskRuleType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Button, Form, Input, Space } from 'antd';
import React from 'react';
import styles from '../index.less';
interface IProps {
  result: string;
  type: MaskRuleType;
  isTestValueRequired?: boolean;
  onValidate: () => void;
}

const RulePreview: React.FC<IProps> = (props) => {
  const { result, isTestValueRequired = false, type, onValidate } = props;
  return (
    <div className={styles.preview}>
      <Form.Item
        label={formatMessage({
          id: 'odc.FormMaskDataModal.component.rulePreview.TestData',
        })}
        /*测试数据*/ required
      >
        <Space>
          <Form.Item
            name="testValue"
            noStyle
            rules={[
              {
                required: isTestValueRequired,
                message: formatMessage({
                  id: 'odc.FormMaskDataModal.component.rulePreview.PleaseEnterTestData',
                }),
              },
            ]}
          >
            <Input
              placeholder={formatMessage({
                id: 'odc.FormMaskDataModal.component.rulePreview.PleaseEnterTestData',
              })}
              /*请输入测试数据*/ style={{ width: '240px' }}
            />
          </Form.Item>
          <Button onClick={onValidate}>
            {
              formatMessage({
                id: 'odc.FormMaskDataModal.component.rulePreview.DesensitizationVerification',
              }) /*脱敏验证*/
            }
          </Button>
        </Space>
      </Form.Item>
      <Form.Item
        label={formatMessage({
          id: 'odc.FormMaskDataModal.component.rulePreview.ResultPreview',
        })}
        /*结果预览*/ style={{ width: '240px' }}
        required
      >
        <Input
          placeholder={formatMessage({
            id: 'odc.FormMaskDataModal.component.rulePreview.PreviewOfDesensitizationResults',
          })}
          /*脱敏结果预览*/ disabled
          value={type === MaskRuleType.NULL ? ' ' : result}
        />
      </Form.Item>
    </div>
  );
};

export default RulePreview;

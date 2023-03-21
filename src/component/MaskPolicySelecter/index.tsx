import MaskPolicyManager from '@/component/MaskPolicyManager';
import { IMaskRule } from '@/d.ts';
import { getMaskTypesMap } from '@/page/Manage/components/MaskDataPage';
import type { TaskStore } from '@/store/task';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled, SettingOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Popover, Select, Space, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';

const { Option } = Select;
const FormItem = Form.Item;
const maskTypesMap = getMaskTypesMap();

interface IContentProps {
  label: string;
  rules: IMaskRule[];
}

export const RuleContent: React.FC<IContentProps> = (props) => {
  const { label, rules } = props;
  return (
    <Space
      direction="vertical"
      style={{
        lineHeight: '20px',
        maxHeight: '320px',
        overflowY: 'auto',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{label}</div>
      <Space size={4} direction="vertical">
        {rules?.map((item, index) => {
          const showNumber = index + 1;
          return (
            <Typography.Text key={index} disabled={!item.enabled}>
              <span>
                {
                  formatMessage(
                    {
                      id: 'odc.component.MaskPolicySelecter.DesensitizationRuleShownumber',
                    },
                    { showNumber: showNumber },
                  ) //`脱敏规则${showNumber}: `
                }
              </span>
              {item?.name}
              <span>
                {
                  formatMessage(
                    {
                      id: 'odc.component.MaskPolicySelecter.Masktypesmapitemtype',
                    },

                    { maskTypesMapItemType: maskTypesMap[item.type] },
                  )

                  //`（${maskTypesMap[item.type]}）`
                }
              </span>
              {!item.enabled && (
                <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />
              )}
            </Typography.Text>
          );
        })}
      </Space>
    </Space>
  );
};

interface IMaskPolicySelecterProps {
  taskStore?: TaskStore;
  required?: boolean;
  width?: number;
}

const MaskPolicySelecter: React.FC<IMaskPolicySelecterProps> = inject('taskStore')(
  observer((props) => {
    const {
      taskStore: { policys, getPolicys },
      required = false,
      width = 152,
    } = props;
    const [visible, setVisible] = useState(false);

    const options = policys?.map(({ name, id, ruleApplyings }) => {
      return {
        label: name,
        value: id,
        rules: ruleApplyings?.map((item) => item.rule),
      };
    });

    const handleShowModal = () => {
      setVisible(true);
    };

    const handleClose = () => {
      setVisible(false);
    };

    useEffect(() => {
      getPolicys();
    }, []);

    return (
      <>
        <FormItem
          name="maskingPolicyId"
          label={formatMessage({
            id: 'odc.component.MaskPolicySelecter.DataDesensitization',
          })}
          /*数据脱敏*/ required={required}
        >
          <Select
            style={{ width }}
            placeholder={formatMessage({
              id: 'odc.component.MaskPolicySelecter.NonDesensitization',
            })}
            /*不脱敏*/
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Button type="link" icon={<SettingOutlined />} onClick={handleShowModal}>
                  {
                    formatMessage({
                      id: 'odc.component.MaskPolicySelecter.ManageDesensitizationPolicies',
                    })

                    /*管理脱敏策略*/
                  }
                </Button>
              </>
            )}
          >
            <Option key={undefined} value={undefined}>
              <span>
                {
                  formatMessage({
                    id: 'odc.component.MaskPolicySelecter.NonDesensitization',
                  })
                  /*不脱敏*/
                }
              </span>
            </Option>
            {options?.map(({ label, value, rules }) => (
              <Option key={value} value={value}>
                <Popover content={<RuleContent label={label} rules={rules} />} placement="left">
                  <span>{label}</span>
                </Popover>
              </Option>
            ))}
          </Select>
        </FormItem>
        <MaskPolicyManager visible={visible} onClose={handleClose} />
      </>
    );
  }),
);

export default MaskPolicySelecter;

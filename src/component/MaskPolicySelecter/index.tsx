import { IMaskRule } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import React from 'react';
import { maskOptions } from './config';

const getMaskTypesMap = () => {
  const types = {};
  maskOptions.forEach(({ label, value }) => {
    types[value] = label;
  });
  return types;
};

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

import { testMaskRule } from '@/common/network/manager';
import HelpDoc from '@/component/helpDoc';
import type { IMaskRule } from '@/d.ts';
import { MaskRuleCustomSegmentsType, MaskRuleType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Descriptions, Divider, Form, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { useRef, useState } from 'react';
import Status from './CommonStatus';
import { segementInfosMap } from './FormMaskDataModal/component/customSegement';
import RulePreview from './FormMaskDataModal/component/rulePreview';
import { getSliderData, segmentsMap } from './FormMaskDataModal/config';
import { getMaskTypesMap } from './index';
import styles from './index.less';

export const MaskRuleDetail: React.FC<{
  data: IMaskRule;
}> = ({ data }) => {
  const { getPrecisionOption } = getSliderData();
  const [preResult, setPreResult] = useState('');
  const formRef = useRef<FormInstance>(null);
  const maskTypesMap = getMaskTypesMap();
  const {
    name,
    type,
    segmentsType,
    segments,
    replacedCharacters,
    decimal,
    precision,
    hashType,
    characterCollection,
    creator,
    createTime,
    updateTime,
    enabled,
  } = data;
  const segment = segmentsMap[type]?.find((item) => item.value === segmentsType);
  let precisionLabel = '';

  if (type === MaskRuleType.ROUNDING) {
    precisionLabel = getPrecisionOption(decimal, precision)?.label;
  }

  const handleTest = async (values: Partial<IMaskRule>) => {
    const res = await testMaskRule(values);
    setPreResult(res);
  };

  const handleValidate = () => {
    formRef.current
      .validateFields()
      .then((values) => {
        const formData = {
          ...data,
          testValue: values.testValue,
        };

        handleTest(formData);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  return (
    <>
      <div className={styles.header}>
        <Space>
          <span style={{ whiteSpace: 'pre' }}>
            {
              formatMessage({
                id: 'odc.components.MaskDataPage.component.RuleName',
              }) /*规则名称 :*/
            }
          </span>
          <span>{name}</span>
        </Space>
        <Status enabled={enabled} />
      </div>
      <div className={styles.card}>
        <div className={styles.label}>
          {
            formatMessage({
              id: 'odc.components.MaskDataPage.component.DesensitizationDetails',
            }) /*脱敏详情*/
          }
        </div>
        <Descriptions column={1} className={styles.ruleDetail}>
          <Descriptions.Item
            label={formatMessage({
              id: 'odc.components.MaskDataPage.component.DesensitizationMethod',
            })} /*脱敏方式*/
          >
            {maskTypesMap[type]}
          </Descriptions.Item>
          {segment && (
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.components.MaskDataPage.component.SegmentSelection',
              })} /*分段选择*/
            >
              {segment.label}
            </Descriptions.Item>
          )}
          {segments && (
            <Descriptions.Item
              label={
                <HelpDoc leftText isTip doc="customSegement">
                  {
                    formatMessage({
                      id: 'odc.components.MaskDataPage.component.CustomSegmentation',
                    }) /*自定义分段*/
                  }
                </HelpDoc>
              }
            >
              {
                <Space direction="vertical" size={2}>
                  {segments.map((item, i) => {
                    const segementInfo = segementInfosMap[item.type];
                    const maskLabel = segment?.options?.find((it) => it.value === item.mask)?.label;
                    const title =
                      item.type === MaskRuleCustomSegmentsType.LEFT_OVER
                        ? segementInfo.title
                        : `${segementInfo.title}${item[segementInfo.name]}`;
                    return (
                      <Space key={i}>
                        <span>{title}</span>
                        <span>{maskLabel}</span>
                      </Space>
                    );
                  })}
                </Space>
              }
            </Descriptions.Item>
          )}

          {replacedCharacters && (
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.components.MaskDataPage.component.ReplacementValue',
              })} /*替换值*/
            >
              {replacedCharacters}
            </Descriptions.Item>
          )}

          {type === MaskRuleType.ROUNDING && (
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.components.MaskDataPage.component.RetainValidNumbersPrecision',
              })} /*保留有效数字/精度*/
            >
              {precisionLabel}
            </Descriptions.Item>
          )}

          {hashType && (
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.components.MaskDataPage.component.EncryptionAlgorithm',
              })} /*加密算法*/
            >
              {hashType}
            </Descriptions.Item>
          )}
          {characterCollection && (
            <Descriptions.Item
              label={formatMessage({
                id: 'odc.components.MaskDataPage.component.SpecifyACharacterSet',
              })} /*指定字符集*/
            >
              {characterCollection?.join(',')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>
      <Form ref={formRef} layout="vertical" requiredMark="optional" initialValues={null}>
        <Form.Item
          label={formatMessage({
            id: 'odc.components.MaskDataPage.component.DesensitizationEffect',
          })}
          /*脱敏效果*/ required
        >
          <RulePreview
            onValidate={handleValidate}
            result={preResult}
            type={type}
            isTestValueRequired
          />
        </Form.Item>
      </Form>

      <Divider style={{ margin: '12px 0' }} />
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.MaskDataPage.component.Founder',
          })} /*创建人*/
        >
          {creator.name}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.MaskDataPage.component.CreationTime',
          })} /*创建时间*/
        >
          {getLocalFormatDateTime(createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.components.MaskDataPage.component.UpdateTime',
          })} /*更新时间*/
        >
          {getLocalFormatDateTime(updateTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

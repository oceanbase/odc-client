import { MaskRuleHashType, MaskRuleSegmentsType, MaskRuleType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Input, Radio, Select, Slider, Space } from 'antd';
import React from 'react';
import { getSliderData, maskOptions } from '../config';
import styles from '../index.less';
import CustomSegement from './customSegement';

interface IProps {
  onFieldChange: (label: string, value: any) => void;
}

const RuleDetail: React.FC<IProps> = (props) => {
  const { onFieldChange } = props;
  const { masks, options: sliderOptions } = getSliderData();
  const options = maskOptions.map(({ label, value }) => {
    return {
      label,
      value,
    };
  });

  const handleChange = (value) => {
    onFieldChange('precision', value);
    onFieldChange('precisionSlider', value);
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    const defaultValueMap = {
      [MaskRuleType.MASK]: MaskRuleSegmentsType.PRE_1_POST_1,
      [MaskRuleType.SUBSTITUTION]: MaskRuleSegmentsType.ALL,
      [MaskRuleType.HASH]: MaskRuleHashType.MD5,
    };

    const defaultValue = defaultValueMap[value];
    const segmentsType = [MaskRuleType.MASK, MaskRuleType.SUBSTITUTION].includes(value)
      ? defaultValue
      : null;
    onFieldChange('segmentsType', segmentsType);
    onFieldChange('segments', [{}]);
    onFieldChange('hashType', value === MaskRuleType.HASH ? defaultValue : null);
  };

  return (
    <div className={styles.ruleDetail}>
      <Form.Item name="type" className={styles.tabs}>
        <Radio.Group options={options} optionType="button" onChange={handleTypeChange} />
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          const ruleConfig = maskOptions.find((item) => item?.value === type);
          const tips = ruleConfig?.tips;
          return (
            <>
              <div className={styles.tips}>{tips}</div>
              {ruleConfig?.segmentOptions && (
                <Form.Item
                  className={styles['block-item']}
                  name="segmentsType"
                  label={formatMessage({
                    id: 'odc.FormMaskDataModal.component.ruleDetail.SegmentSelection',
                  })}
                  /*分段选择*/
                  required
                >
                  <Radio.Group options={ruleConfig.segmentOptions} />
                </Form.Item>
              )}

              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const segmentsValue = getFieldValue('segmentsType');
                  const segments = ruleConfig?.segmentOptions?.find(
                    (item) => item.value === segmentsValue,
                  );

                  return (
                    <>
                      {type === MaskRuleType.MASK &&
                        segmentsValue === MaskRuleSegmentsType.CUSTOM && (
                          <Form.Item
                            label={formatMessage({
                              id: 'odc.FormMaskDataModal.component.ruleDetail.CustomSegmentation',
                            })}
                            /*自定义分段*/ required
                          >
                            <Space direction="vertical">
                              <div className={styles.tips}>
                                {
                                  formatMessage({
                                    id: 'odc.FormMaskDataModal.component.ruleDetail.SegmentTheCharactersFromLeft',
                                  })
                                  /*将字符按从左至右的顺序进行分段，并选择是否掩盖*/
                                }
                              </div>
                              {segments?.options && (
                                <CustomSegement
                                  maskOptions={segments?.options}
                                  type={MaskRuleType.MASK}
                                />
                              )}
                            </Space>
                          </Form.Item>
                        )}

                      {type === MaskRuleType.SUBSTITUTION && (
                        <>
                          {segmentsValue === MaskRuleSegmentsType.CUSTOM ? (
                            <Form.Item
                              label={formatMessage({
                                id: 'odc.FormMaskDataModal.component.ruleDetail.CustomSegmentation',
                              })}
                              /*自定义分段*/ required
                            >
                              <Space direction="vertical">
                                <div className={styles.tips}>
                                  {
                                    formatMessage({
                                      id: 'odc.FormMaskDataModal.component.ruleDetail.SegmentTheCharactersFromLeft.1',
                                    })
                                    /*将字符按从左至右的顺序进行分段，并选择是否替换*/
                                  }
                                </div>
                                {segments?.options && (
                                  <CustomSegement
                                    maskOptions={segments?.options}
                                    type={MaskRuleType.SUBSTITUTION}
                                  />
                                )}
                              </Space>
                            </Form.Item>
                          ) : (
                            <Form.Item
                              name="replacedCharacters"
                              label={formatMessage({
                                id: 'odc.FormMaskDataModal.component.ruleDetail.ReplacementValue',
                              })}
                              /*替换值*/
                              required
                              style={{ width: '240px' }}
                              rules={[
                                {
                                  required: true,
                                  message: formatMessage({
                                    id: 'odc.FormMaskDataModal.component.ruleDetail.PleaseEnterAReplacementValue',
                                  }),
                                  //请输入替换值
                                },
                              ]}
                            >
                              <Input
                                placeholder={formatMessage({
                                  id: 'odc.FormMaskDataModal.component.ruleDetail.PleaseEnterAReplacementValue',
                                })}
                                /*请输入替换值*/
                              />
                            </Form.Item>
                          )}
                        </>
                      )}
                    </>
                  );
                }}
              </Form.Item>
              {type === MaskRuleType.PSEUDO && (
                <Space direction="vertical">
                  <Form.Item
                    className={styles['block-item']}
                    name="characterCollection"
                    label={formatMessage({
                      id: 'odc.FormMaskDataModal.component.ruleDetail.SpecifyACharacterSet',
                    })}
                    /*指定字符集*/
                    rules={[
                      {
                        required: true,
                        message: formatMessage({
                          id: 'odc.FormMaskDataModal.component.ruleDetail.EnterACharacterSet',
                        }),
                        //请输入字符集
                      },
                      {
                        pattern: /^[a-zA-Z0-9\,\~]+$/,
                        message: formatMessage({
                          id: 'odc.FormMaskDataModal.component.ruleDetail.SupportsCombinationsOfEnglishNumbers',
                        }), //支持英文、数字和特殊字符的组合(即：,~)
                      },
                    ]}
                  >
                    <Input
                      placeholder={formatMessage({
                        id: 'odc.FormMaskDataModal.component.ruleDetail.YouCanEnterUppercaseAnd',
                      })}
                      /*可输入大小写字母、数字区间，多个字符或区间用英文逗号隔开*/
                    />
                  </Form.Item>
                  <div className={styles.tips}>
                    {
                      formatMessage({
                        id: 'odc.FormMaskDataModal.component.ruleDetail.ForExampleTheDataBefore',
                      })
                      /*如：示例，脱敏前数据是0~3和a~d的数字字母组合，脱敏后也是这个范围内的数字和字母*/
                    }
                  </div>
                </Space>
              )}

              {type === MaskRuleType.HASH && (
                <Form.Item
                  className={styles['block-item']}
                  name="hashType"
                  label={formatMessage({
                    id: 'odc.FormMaskDataModal.component.ruleDetail.EncryptionAlgorithm',
                  })}
                  /*加密算法*/
                  initialValue={ruleConfig.hashOptions[0].value}
                  required
                >
                  <Radio.Group options={ruleConfig.hashOptions} />
                </Form.Item>
              )}

              {type === MaskRuleType.ROUNDING && (
                <>
                  <Form.Item
                    className={styles['block-item']}
                    label={formatMessage({
                      id: 'odc.FormMaskDataModal.component.ruleDetail.RetainValidNumbersPrecision',
                    })}
                    /*保留有效数字/精度*/
                    style={{ width: '120px' }}
                    name="precision"
                    required
                  >
                    <Select options={sliderOptions} onChange={handleChange} />
                  </Form.Item>
                  <Form.Item name="precisionSlider">
                    <Slider
                      dots
                      min={0}
                      max={140}
                      step={10}
                      marks={masks}
                      onChange={handleChange}
                      tipFormatter={(value) =>
                        sliderOptions.find((item) => item.value === value).label
                      }
                    />
                  </Form.Item>
                </>
              )}
            </>
          );
        }}
      </Form.Item>
    </div>
  );
};

export default RuleDetail;

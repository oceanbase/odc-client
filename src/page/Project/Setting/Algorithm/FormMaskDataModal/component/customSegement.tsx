import { MaskRuleCustomSegmentsType, MaskRuleType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Popover, Select, Space } from 'antd';
import classnames from 'classnames';
import React from 'react';
import styles from '../index.less';

const { Option } = Select;

interface IProps {
  type: MaskRuleType;
  maskOptions: {
    label: string;
    value: boolean;
  }[];
}

const getTipOptions = (type: MaskRuleCustomSegmentsType) => {
  return Array(8)
    .fill(0)
    .map((_, i) =>
      type === MaskRuleCustomSegmentsType.DELIMITER && i === 4 ? { label: '@' } : null,
    );
};

interface IContentProps {
  options: {
    label?: string;
  }[];

  activeIndex?: number;
  message: string;
}

const Content: React.FC<IContentProps> = (props) => {
  const { message, options, activeIndex = 0 } = props;
  return (
    <Space direction="vertical">
      <span>{message}</span>
      <Space className={styles['color-tags']} size={4}>
        {options?.map((item, index) => {
          return (
            <span
              className={classnames(styles['tag-item'], {
                [styles.active]: index < activeIndex,
              })}
            >
              {item?.label}
            </span>
          );
        })}
      </Space>
    </Space>
  );
};

const segementOptions = [
  {
    label: formatMessage({
      id: 'odc.FormMaskDataModal.component.customSegement.NumberOfDigits',
    }), //位数
    value: MaskRuleCustomSegmentsType.DIGIT,
    tip: {
      activeIndex: 3,
      message: formatMessage({
        id: 'odc.FormMaskDataModal.component.customSegement.SetsTheNumberOfCharacters',
      }), //设置分段的字符数量。例如设置分段：「位数，3，掩盖」
    },
  },

  {
    label: formatMessage({
      id: 'odc.FormMaskDataModal.component.customSegement.DigitRatio',
    }), //位数比例
    value: MaskRuleCustomSegmentsType.DIGIT_PERCENTAGE,
    tip: {
      activeIndex: 2,
      message: formatMessage({
        id: 'odc.FormMaskDataModal.component.customSegement.SetsTheProportionOfSegments',
      }), //设置分段占总字符的比例。例如设置分段：「位数比例，25%，掩盖」
    },
  },

  {
    label: formatMessage({
      id: 'odc.FormMaskDataModal.component.customSegement.BeforeTheDelimiterIsSpecified',
    }), //指定分隔符前
    value: MaskRuleCustomSegmentsType.DELIMITER,
    tip: {
      activeIndex: 4,
      message: formatMessage({
        id: 'odc.FormMaskDataModal.component.customSegement.SetsTheIdentifierForThe',
      }), //设置分段末位的识别符。例如设置分段：「指定分隔符前，@，掩盖」
    },
  },

  {
    label: formatMessage({
      id: 'odc.FormMaskDataModal.component.customSegement.OtherDigits',
    }), //其他位数
    value: MaskRuleCustomSegmentsType.LEFT_OVER,
    tip: {
      activeIndex: 6,
      message: formatMessage({
        id: 'odc.FormMaskDataModal.component.customSegement.SetsTheNumberOfSegments',
      }), //设置无法判断数量的分段。例如设置分段：「其他位数，掩盖」「位数，2，不掩盖」
    },
  },
];

export const segementInfosMap = {
  [MaskRuleCustomSegmentsType.DIGIT]: {
    title: formatMessage({
      id: 'odc.FormMaskDataModal.component.customSegement.NumberOfDigits',
    }), //位数
    name: 'digitNumber',
    type: 'number',
  },

  [MaskRuleCustomSegmentsType.DIGIT_PERCENTAGE]: {
    title: formatMessage({
      id: 'odc.FormMaskDataModal.component.customSegement.DigitRatio',
    }), //位数比例
    name: 'digitPercentage',
    type: 'number',
  },

  [MaskRuleCustomSegmentsType.DELIMITER]: {
    title: formatMessage({
      id: 'odc.FormMaskDataModal.component.customSegement.BeforeTheDelimiterIsSpecified',
    }), //指定分隔符前
    name: 'delimiter',
  },

  [MaskRuleCustomSegmentsType.LEFT_OVER]: {
    title: formatMessage({
      id: 'odc.FormMaskDataModal.component.customSegement.OtherDigits',
    }), //其他位数
    name: 'digitNumber',
    type: 'number',
  },
};

const CustomSegement: React.FC<IProps> = (props) => {
  const { type, maskOptions } = props;
  const isSubstitution = type === MaskRuleType.SUBSTITUTION;
  return (
    <div className={styles['custom-section']}>
      <Form.List name="segments">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const segments = getFieldValue('segments');
                  const currentValue = segments[name]?.type ?? '';
                  const showReplaceInput = isSubstitution && segments[name]?.mask;
                  const { title, name: indexName, type } = segementInfosMap[currentValue] ?? {};
                  const typeMessage = formatMessage(
                    {
                      id: 'odc.FormMaskDataModal.component.customSegement.EnterTitle',
                    },
                    { title: title },
                  ); //`请输入${title}`
                  const showIndex = currentValue !== MaskRuleCustomSegmentsType.LEFT_OVER;
                  const maskInputWidth = isSubstitution ? '208px' : '120px';
                  const typeInputWidth = isSubstitution ? '208px' : '248px';
                  return (
                    <Space key={key} style={{ display: 'flex' }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        initialValue={segementOptions[0].value}
                      >
                        <Select
                          style={{
                            width: showIndex ? '120px' : typeInputWidth,
                          }}
                        >
                          {segementOptions.map(({ label, value, tip }) => (
                            <Option value={value} title={label} key={value}>
                              <Popover
                                overlayStyle={{ width: '300px' }}
                                content={<Content options={getTipOptions(value)} {...tip} />}
                                placement="right"
                              >
                                <Space style={{ width: '100%' }}>
                                  <span>{label}</span>
                                  <QuestionCircleOutlined />
                                </Space>
                              </Popover>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      {showIndex && (
                        <Form.Item
                          {...restField}
                          name={[name, indexName]}
                          rules={[{ required: true, message: typeMessage }]}
                          style={{ width: isSubstitution ? '80px' : '120px' }}
                        >
                          {type === 'number' ? (
                            <InputNumber
                              placeholder={typeMessage}
                              min={0}
                              style={{
                                width: isSubstitution ? '80px' : '120px',
                              }}
                            />
                          ) : (
                            <Input placeholder={typeMessage} />
                          )}
                        </Form.Item>
                      )}

                      <Form.Item
                        {...restField}
                        name={[name, 'mask']}
                        initialValue={maskOptions[0].value}
                      >
                        <Select
                          options={maskOptions}
                          style={{
                            width: showReplaceInput ? '80px' : maskInputWidth,
                          }}
                        />
                      </Form.Item>
                      {showReplaceInput && (
                        <Form.Item
                          {...restField}
                          name={[name, 'replacedCharacters']}
                          initialValue={'@'}
                          style={{ width: '120px' }}
                        >
                          <Input placeholder={typeMessage} />
                        </Form.Item>
                      )}

                      <DeleteOutlined
                        onClick={() => {
                          if (segments?.length > 1) {
                            remove(name);
                          }
                        }}
                      />
                    </Space>
                  );
                }}
              </Form.Item>
            ))}

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const segments = getFieldValue('segments');
                return (
                  <Button
                    type="dashed"
                    disabled={segments?.length >= 10}
                    style={{ width: isSubstitution ? '424px' : '376px' }}
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    {
                      formatMessage(
                        {
                          id: 'odc.FormMaskDataModal.component.customSegement.AddSegmentsFieldslength',
                        },
                        { fieldsLength: fields.length },
                      ) /*添加分段（{fieldsLength}/10）*/
                    }
                  </Button>
                );
              }}
            </Form.Item>
          </>
        )}
      </Form.List>
    </div>
  );
};

export default CustomSegement;

import { formatMessage } from '@/util/intl';
import { AutoComplete, Form, Input, Select, Space, Tag } from 'antd';
import { rules, suffixOptions } from '../const';
import styles from '../index.less';
import HelpDoc from '@/component/helpDoc';
import { PartitionBound } from '@/constant';

const PreSuffixNamingRules = ({ partitionKeyOptions }) => {
  return (
    <Space size={8} align="start" style={{ width: '100%', flexWrap: 'wrap' }}>
      <Form.Item
        validateFirst
        className={styles.noMarginBottom}
        name="namingPrefix"
        rules={rules.namingPrefix}
        style={{ width: 140 }}
      >
        <Input
          addonBefore={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.7D91EBA7',
              defaultMessage: '前缀',
            }) /*"前缀"*/
          }
          placeholder={
            formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.D2573F4C',
              defaultMessage: '请输入前缀',
            }) /*"请输入前缀"*/
          }
        />
      </Form.Item>
      <Input.Group compact>
        <Tag className={styles.suffix}>
          <HelpDoc
            leftText
            isTip
            title={formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.BB3B1843',
              defaultMessage: '后缀根据指定的分区键取值策略生成',
            })}
          >
            {
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.0F79EE9C' /*后缀*/,
                defaultMessage: '后缀',
              }) /* 后缀 */
            }
          </HelpDoc>
        </Tag>
        <Form.Item
          name="refPartitionKey"
          className={styles.noMarginBottom}
          rules={rules.refPartitionKey}
        >
          <Select
            placeholder={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.B7A571C8',
                defaultMessage: '请选择',
              }) /*"请选择"*/
            }
            optionLabelProp="label"
            options={partitionKeyOptions}
            dropdownMatchSelectWidth={154}
            style={{ width: 135 }}
          />
        </Form.Item>
        <Form.Item
          name="namingSuffixExpression"
          className={styles.noMarginBottom}
          rules={rules.namingSuffixExpression}
        >
          <AutoComplete
            filterOption={(inputValue, option) =>
              option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
            placeholder={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.0259BAC2',
                defaultMessage: '请选择',
              }) /*"请选择"*/
            }
            style={{ width: 124 }}
            dropdownMatchSelectWidth={200}
            options={suffixOptions}
          />
        </Form.Item>
      </Input.Group>
      <Input.Group compact>
        <Tag className={styles.suffix}>
          {formatMessage({
            id: 'src.component.Task.component.PartitionPolicyFormTable.7B83EDD7',
            defaultMessage: '取值策略',
          })}
        </Tag>
        <Form.Item
          name="namingSuffixStrategy"
          className={styles.noMarginBottom}
          rules={rules.namingSuffixStrategy}
        >
          <Select
            placeholder={formatMessage({
              id: 'src.component.Task.component.PartitionPolicyFormTable.ACFEE807',
              defaultMessage: '请选择',
            })}
            dropdownMatchSelectWidth={100}
            style={{ width: 100 }}
            options={[
              {
                label: formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.602BD66C',
                  defaultMessage: '分区上界',
                }),
                value: PartitionBound.PARTITION_UPPER_BOUND,
              },
              {
                label: formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.2384A1C3',
                  defaultMessage: '分区下界',
                }),
                value: PartitionBound.PARTITION_LOWER_BOUND,
              },
            ]}
          />
        </Form.Item>
      </Input.Group>
    </Space>
  );
};

export default PreSuffixNamingRules;

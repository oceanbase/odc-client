import CommonIDE from '@/component/CommonIDE';
import { SensitiveRuleType } from '@/d.ts/sensitiveRule';
import { Form, Input, Radio, RadioChangeEvent, Space } from 'antd';
import { useEffect, useState } from 'react';
import CheckboxInput from './CheckboxInput';
import styles from './index.less';

const DetectWay = ({ key, script, setScript, originType = SensitiveRuleType.PATH }) => {
  const [type, setType] = useState<SensitiveRuleType>(originType);
  const handleScriptChange = (v: string) => {
    setScript(v);
  };
  const handleTypeChange = (e: RadioChangeEvent) => {
    setType(e.target.value);
  };
  useEffect(() => {
    setScript(script);
  }, [script]);
  useEffect(() => {
    setType(type);
  }, [type]);
  return (
    <>
      <div style={{ marginBottom: '4px' }}>识别方式</div>
      <div className={styles.detectWay}>
        <Form.Item name="type" label="" required>
          <Radio.Group onChange={handleTypeChange}>
            <Radio.Button value={SensitiveRuleType.PATH}>路径</Radio.Button>
            <Radio.Button value={SensitiveRuleType.REGEX}>正则</Radio.Button>
            <Radio.Button value={SensitiveRuleType.GROOVY}>脚本</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {type === SensitiveRuleType.PATH && (
          <div>
            <div className={styles.tip}>
              使用「*」作为通配符，使用「,」作为分割符，例如：db*.table.*a,*.*.name
            </div>
            <Form.Item
              label="匹配的规则"
              name="pathIncludes"
              required
              rules={[
                {
                  required: true,
                  message: '请输入匹配的规则',
                },
              ]}
            >
              <Input.TextArea placeholder="请输入" rows={4}></Input.TextArea>
            </Form.Item>
            <Form.Item label="排除的规则" name="pathExcludes" required>
              <Input.TextArea placeholder="请输入" rows={4}></Input.TextArea>
            </Form.Item>
          </div>
        )}
        {type === SensitiveRuleType.REGEX && (
          <div>
            <div className={styles.tip}>请先勾选识别对象，再填写对应的表达式</div>
            <div>
              <Form.Item name={'regExp'} fieldKey={'regExp'} noStyle>
                <Form.Item
                  name={['regExp', 'databaseRegexExpression']}
                  fieldKey={['regExp', 'databaseRegexExpression']}
                  className={styles.formItemGroup}
                  noStyle
                >
                  <CheckboxInput
                    key={[key, 'databaseRegexExpression'].join('_')}
                    hasLabel
                    name={['regExp', 'databaseRegexExpression']}
                    checkValue={'databaseRegexExpression'}
                  />
                </Form.Item>
                <Form.Item
                  name={['regExp', 'tableRegexExpression']}
                  fieldKey={['regExp', 'tableRegexExpression']}
                  className={styles.formItemGroup}
                  noStyle
                >
                  <CheckboxInput
                    key={[key, 'tableRegexExpression'].join('_')}
                    name={['regExp', 'tableRegexExpression']}
                    checkValue={'tableRegexExpression'}
                  />
                </Form.Item>
                <Form.Item
                  name={['regExp', 'columnRegexExpression']}
                  fieldKey={['regExp', 'columnRegexExpression']}
                  className={styles.formItemGroup}
                  noStyle
                >
                  <CheckboxInput
                    key={[key, 'columnRegexExpression'].join('_')}
                    name={['regExp', 'columnRegexExpression']}
                    checkValue={'columnRegexExpression'}
                  />
                </Form.Item>
                <Form.Item
                  name={['regExp', 'columnCommentRegexExpression']}
                  fieldKey={['regExp', 'columnCommentRegexExpression']}
                  className={styles.formItemGroup}
                  noStyle
                >
                  <CheckboxInput
                    key={[key, 'columnCommentRegexExpression'].join('_')}
                    name={['regExp', 'columnCommentRegexExpression']}
                    checkValue={'columnCommentRegexExpression'}
                  />
                </Form.Item>
              </Form.Item>
            </div>
          </div>
        )}
        {type === SensitiveRuleType.GROOVY && (
          <div
            style={{
              height: '250px',
              overflowY: 'hidden',
            }}
          >
            <Space size={4} style={{ marginBottom: '5px' }}>
              <div>Groovy脚本</div>
              {/* <a onClick={() => message.error('文档未就位')}>查看文档</a> */}
            </Space>
            <CommonIDE
              session={null}
              bordered={true}
              language={'groovy'}
              initialSQL={script}
              onSQLChange={(script) => {
                handleScriptChange(script);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};
export default DetectWay;

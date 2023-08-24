/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import CommonIDE from '@/component/CommonIDE';
import { SensitiveRuleType } from '@/d.ts/sensitiveRule';
import { formatMessage, getLocalDocs } from '@/util/intl';
import { Form, Input, Radio, RadioChangeEvent, Space } from 'antd';
import { useEffect, useState } from 'react';
import CheckboxInput from './CheckboxInput';
import styles from './index.less';
import odc from '@/plugins/odc';
const DetectWay = ({
  key,
  script,
  formRef,
  hasValidated,
  setScript,
  originType = SensitiveRuleType.PATH,
}) => {
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
      <div
        style={{
          marginBottom: '4px',
        }}
      >
        {
          formatMessage({
            id: 'odc.SensitiveRule.components.DetectWay.IdentificationMethod',
          }) /*识别方式*/
        }
      </div>
      <div className={styles.detectWay}>
        <Form.Item name="type" label="" required>
          <Radio.Group onChange={handleTypeChange}>
            <Radio.Button value={SensitiveRuleType.PATH}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.Path',
                }) /*路径*/
              }
            </Radio.Button>
            <Radio.Button value={SensitiveRuleType.REGEX}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.Regular',
                }) /*正则*/
              }
            </Radio.Button>
            <Radio.Button value={SensitiveRuleType.GROOVY}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.Script',
                }) /*脚本*/
              }
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        {type === SensitiveRuleType.PATH && (
          <div>
            <div className={styles.tip}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.UseAsTheWildcardAnd',
                }) /*使用「*」作为通配符，使用「,」作为分割符，例如：db*.table.*a,*.*.name*/
              }
            </div>
            <Form.Item
              label={formatMessage({
                id: 'odc.SensitiveRule.components.DetectWay.MatchingRules',
              })}
              /*匹配的规则*/ name="pathIncludes"
              required
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'odc.SensitiveRule.components.DetectWay.EnterAMatchingRule',
                  }), //请输入匹配的规则
                },
              ]}
            >
              <Input.TextArea
                placeholder={formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.PleaseEnter',
                })}
                /*请输入*/ rows={4}
              ></Input.TextArea>
            </Form.Item>
            <Form.Item
              label={formatMessage({
                id: 'odc.SensitiveRule.components.DetectWay.ExcludedRules',
              })}
              /*排除的规则*/ name="pathExcludes"
              required
            >
              <Input.TextArea
                placeholder={formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.PleaseEnter',
                })}
                /*请输入*/ rows={4}
              ></Input.TextArea>
            </Form.Item>
          </div>
        )}

        {type === SensitiveRuleType.REGEX && (
          <div>
            <div className={styles.tip}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.SelectTheRecognitionObjectBefore',
                }) /*请先勾选识别对象，再填写对应的表达式*/
              }
            </div>
            <div>
              <Form.Item name={'regExp'} fieldKey={'regExp'} noStyle>
                <Form.Item
                  name={['regExp', 'databaseRegexExpression']}
                  fieldKey={['regExp', 'databaseRegexExpression']}
                  className={styles.formItemGroup}
                  rules={[
                    {
                      required: true,
                      message: 'required',
                    },
                  ]}
                  noStyle
                >
                  <CheckboxInput
                    formRef={formRef}
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
                    formRef={formRef}
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
                    formRef={formRef}
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
                    formRef={formRef}
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
          <>
            <div className={styles.editor}>
              <Space
                size={4}
                style={{
                  marginBottom: '5px',
                }}
              >
                <div>
                  {
                    formatMessage({
                      id: 'odc.SensitiveRule.components.DetectWay.GroovyScript',
                    }) /*Groovy脚本*/
                  }
                </div>
                <a
                  href={odc.appConfig?.docs?.url || getLocalDocs('1.data-desensitization.html')}
                  target={'_blank'}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  rel="noreferrer"
                >
                  {
                    formatMessage({
                      id:
                        'odc.src.page.Project.Sensitive.components.SensitiveRule.components.LookAtTheDocumentation',
                    }) /* 
                  查看文档
                 */
                  }
                </a>
              </Space>
              <div
                style={{
                  height: '250px',
                  paddingBottom: '12px',
                }}
              >
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
            </div>
            <div className={hasValidated ? styles.errorTip : styles.errorTipHidden}>
              {
                formatMessage({
                  id: 'odc.SensitiveRule.components.DetectWay.PleaseEnterGroovyScript',
                }) /*请输入Groovy脚本*/
              }
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default DetectWay;

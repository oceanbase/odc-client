import { createSensitiveRule, updateSensitiveRule } from '@/common/network/sensitiveRule';
import { ISensitiveRule, SensitiveRuleType } from '@/d.ts/sensitiveRule';
import { Button, Drawer, Form, Input, message, Radio, Select, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useContext, useEffect, useState } from 'react';
import ProjectContext from '../../../../ProjectContext';
import SensitiveContext from '../../../SensitiveContext';
import DetectWay from './DetectWay';
import styles from './index.less';

const FormSensitiveRuleDrawer = ({
  formDrawerVisible,
  handleFormDrawerClose,
  isEdit,
  selectedRecord,
}) => {
  const [formRef] = useForm();
  const context = useContext(ProjectContext);
  const sensitiveContext = useContext(SensitiveContext);
  const [script, setScript] = useState<string>('');
  const handleSubmit = async () => {
    const rawData = await formRef.validateFields().catch();
    const { enabled, maskingAlgorithmId, name, type, regExp = {}, description } = rawData;
    let data: Partial<ISensitiveRule> = {
      enabled,
      maskingAlgorithmId,
      name,
      type,
      projectId: context.projectId,
      description,
    };
    const wrapPath = (origin: string) => {
      if (origin?.includes(',')) {
        return origin?.split(',')?.map((o) => o.trim());
      }
      return origin === '' ? [] : [origin];
    };
    switch (type) {
      case SensitiveRuleType.PATH: {
        data = {
          ...data,
          pathIncludes: wrapPath(
            Array.isArray(rawData.pathIncludes)
              ? rawData?.pathIncludes?.join(',')
              : rawData.pathIncludes,
          ),
          pathExcludes: wrapPath(
            Array.isArray(rawData.pathExcludes)
              ? rawData?.pathExcludes?.join(',')
              : rawData.pathExcludes,
          ),
        };
        break;
      }
      case SensitiveRuleType.REGEX: {
        const resRegExp = {};
        Object.keys(regExp)?.forEach((key) => {
          resRegExp[`${key}`] = regExp[key].regExp;
        });
        data = {
          ...data,
          ...resRegExp,
        };
        break;
      }
      case SensitiveRuleType.GROOVY: {
        data = {
          ...data,
          groovyScript: script,
        };
        break;
      }
    }
    if (isEdit) {
      const result = await updateSensitiveRule(
        context.projectId,
        selectedRecord.id,
        data as ISensitiveRule,
      );
      if (result) {
        message.success('更新成功');
        handleFormDrawerClose(formRef.resetFields);
      } else {
        message.error('更新失败');
      }
    } else {
      const result = await createSensitiveRule(context.projectId, data);
      if (result) {
        message.success('新建成功');
        handleFormDrawerClose();
      } else {
        message.error('新建失败');
      }
    }
  };
  const onCancel = () => {
    handleFormDrawerClose();
    formRef.resetFields();
  };
  useEffect(() => {
    if (isEdit) {
      const {
        name,
        enabled,
        pathIncludes,
        pathExcludes,
        type,
        maskingAlgorithmId,
        groovyScript,
        databaseRegexExpression = '',
        tableRegexExpression = '',
        columnRegexExpression = '',
        columnCommentRegexExpression = '',
        description = '',
      } = selectedRecord;
      const hasDatabaseRegexExpression = databaseRegexExpression !== '';
      const hasTableRegexExpression = tableRegexExpression !== '';
      const hasColumnRegexExpression = columnRegexExpression !== '';
      const hasColumnCommentRegexExpression = columnCommentRegexExpression !== '';
      setScript(groovyScript);
      formRef.setFieldsValue({
        name,
        enabled,
        pathIncludes,
        pathExcludes,
        type: SensitiveRuleType[type],
        groovyScript,
        regExp: {
          databaseRegexExpression: {
            label: '库名',
            checked: hasDatabaseRegexExpression ? ['databaseRegexExpression'] : [],
            regExp: databaseRegexExpression,
          },
          tableRegexExpression: {
            label: '表名',
            checked: hasTableRegexExpression ? ['tableRegexExpression'] : [],
            regExp: tableRegexExpression,
          },
          columnRegexExpression: {
            label: '列名',
            checked: hasColumnRegexExpression ? ['columnRegexExpression'] : [],
            regExp: columnRegexExpression,
          },
          columnCommentRegexExpression: {
            label: '列备注',
            checked: hasColumnCommentRegexExpression ? ['columnCommentRegexExpression'] : [],
            regExp: columnCommentRegexExpression,
          },
        },
        maskingAlgorithmId: maskingAlgorithmId,
        description,
      });
    } else {
      setScript('');
      formRef.setFieldsValue({
        name: undefined,
        enabled: true,
        pathIncludes: '',
        pathExcludes: '',
        type: SensitiveRuleType.PATH,
        groovyScript: '',
        regExp: {
          databaseRegexExpression: {
            label: '库名',
            checked: [],
            regExp: '',
          },
          tableRegexExpression: {
            label: '表名',
            checked: [],
            regExp: '',
          },
          columnRegexExpression: {
            label: '列名',
            checked: [],
            regExp: '',
          },
          columnCommentRegexExpression: {
            label: '列备注',
            checked: [],
            regExp: '',
          },
        },
        maskingAlgorithmId: undefined,
        description: '',
      });
    }
  }, [formDrawerVisible, isEdit, selectedRecord]);

  return (
    <Drawer
      open={formDrawerVisible}
      title={isEdit ? '编辑识别规则' : '新建识别规则'}
      width={596}
      onClose={onCancel}
      destroyOnClose={true}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          </Space>
        </div>
      }
      className={styles.drawer}
    >
      <Form form={formRef} layout="vertical" requiredMark="optional">
        <Form.Item
          label={'规则名称'}
          name={'name'}
          required
          rules={[
            {
              required: true,
              message: '请输入规则名称',
            },
          ]}
        >
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item
          label={'规则状态'}
          name={'enabled'}
          required
          rules={[
            {
              required: true,
              message: '请选择规则状态',
            },
          ]}
        >
          <Radio.Group>
            <Radio value={true}>启用</Radio>
            <Radio value={false}>停用</Radio>
          </Radio.Group>
        </Form.Item>
        <DetectWay
          key="detectWay"
          {...{
            script,
            setScript,
            originType: isEdit ? SensitiveRuleType[selectedRecord.type] : undefined,
          }}
        />
        <Form.Item
          label={'脱敏算法'}
          name={'maskingAlgorithmId'}
          required
          rules={[
            {
              required: true,
              message: '请选择脱敏算法',
            },
          ]}
        >
          <Select
            placeholder={'请选择'}
            options={sensitiveContext.maskingAlgorithmOptions}
            style={{
              width: '262px',
            }}
          />
        </Form.Item>
        <Form.Item label={'规则描述'} name={'description'}>
          <Input.TextArea rows={4} placeholder={'请输入'} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default FormSensitiveRuleDrawer;

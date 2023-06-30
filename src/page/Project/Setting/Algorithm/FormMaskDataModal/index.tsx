import {
  createMaskRule,
  getMaskRule,
  getMaskRuleExists,
  testMaskRule,
  updateMaskRule,
} from '@/common/network/manager';
import type { IMaskRule } from '@/d.ts';
import { MaskRuleHashType, MaskRuleSegmentsType, MaskRuleType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { validTrimEmptyWithWarn } from '@/util/valid';
import type { RadioChangeEvent } from 'antd';
import { Button, Drawer, Form, Input, message, Modal, Radio, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React, { useEffect, useRef, useState } from 'react';
import RuleDetail from './component/ruleDetail';
import RulePreview from './component/rulePreview';
import { getSliderData } from './config';
import styles from './index.less';

interface IProps {
  visible: boolean;
  editId?: number;
  onClose: () => void;
  handleStatusChange?: (status: boolean, resourceGroup: IMaskRule, callback: () => void) => void;
  reloadData?: () => void;
}

interface IIMaskRuleFormData extends IMaskRule {
  precisionSlider: number;
}
const FormMaskDataModal: React.FC<IProps> = (props) => {
  const { visible, editId } = props;
  const [hasChange, setHasChange] = useState(false);
  const [data, setData] = useState<Partial<IIMaskRuleFormData>>(null);
  const [preResult, setPreResult] = useState('');
  const [isTestValueRequired, setIsTestValueRequired] = useState(false);
  const formRef = useRef<FormInstance>(null);
  const { options, getPrecisionOption, getDecimalAndPrecision } = getSliderData();
  const defaultPrecision = options.find((item) => item.label === '0').value;
  const isEdit = !!editId;

  const loadDetailDate = async (id: number) => {
    const res = await getMaskRule(id);
    if (res) {
      const { characterCollection, decimal, precision } = res;
      let detail: Partial<IIMaskRuleFormData> = { ...res };
      if (characterCollection) {
        // @ts-ignore
        detail.characterCollection = characterCollection.join(',');
      }
      if (precision !== undefined) {
        const _precision = getPrecisionOption(decimal, precision)?.value;
        detail.precision = _precision;
        detail.precisionSlider = _precision;
      }
      setData(detail);
      formRef.current.setFieldsValue(detail);
    }
  };

  useEffect(() => {
    if (editId) {
      loadDetailDate(editId);
    }
  }, [editId, visible]);

  const handleClose = () => {
    formRef.current?.resetFields();
    setData(null);
    props.onClose();
  };

  const handleCreate = async (values: Partial<IMaskRule>) => {
    const res = await createMaskRule(values);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.FormMaskDataModal.RuleCreatedSuccessfully',
        }), //规则创建成功
      );
      props.reloadData();
      handleClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormMaskDataModal.RuleCreationFailed',
        }), //规则创建失败
      );
    }
  };

  const handleEdit = async (values: Partial<IMaskRule>) => {
    const res = await updateMaskRule({
      ...values,
      id: editId,
    });

    if (res) {
      message.success(
        formatMessage({
          id: 'odc.components.FormMaskDataModal.TheRuleIsSavedSuccessfully',
        }), //规则保存成功
      );
      props.reloadData();
      handleClose();
    } else {
      message.error(
        formatMessage({
          id: 'odc.components.FormMaskDataModal.FailedToSaveTheRule',
        }), //规则保存失败
      );
    }
  };

  const handleTest = async (values: Partial<IMaskRule>) => {
    const res = await testMaskRule({
      ...values,
      id: editId,
    });

    setPreResult(res);
  };

  const getFormData = (values: Record<string, any>) => {
    const { characterCollection, precision } = values;
    const formData: Partial<IMaskRule> = {
      ...values,
    };
    if (characterCollection) {
      formData.characterCollection = characterCollection.split(',');
    }
    if (precision !== undefined) {
      const { decimal, precision: _precision } = getDecimalAndPrecision(precision);
      formData.decimal = decimal;
      formData.precision = _precision;
    }
    return formData;
  };

  const handleSubmit = () => {
    setIsTestValueRequired(false);
    formRef.current
      .validateFields()
      .then(({ precisionSlider, ...values }) => {
        const formData = getFormData(values);
        if (editId) {
          handleEdit(formData);
        } else {
          handleCreate(formData);
        }
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const handleValidate = () => {
    setIsTestValueRequired(true);
    formRef.current
      .validateFields()
      .then(({ precisionSlider, ...values }) => {
        const formData = getFormData(values);
        handleTest(formData);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
      });
  };

  const handleCancel = () => {
    if (hasChange) {
      Modal.confirm({
        title: isEdit
          ? formatMessage({
              id: 'odc.components.FormMaskDataModal.AreYouSureYouWant',
            }) //确定要取消编辑吗？取消保存后，所编辑的内容将不生效
          : formatMessage({
              id: 'odc.components.FormMaskDataModal.AreYouSureYouWant.1',
            }), //确定要取消新建吗?
        cancelText: formatMessage({
          id: 'odc.components.FormMaskDataModal.Cancel',
        }), //取消
        okText: formatMessage({ id: 'odc.components.FormMaskDataModal.Ok' }), //确定
        centered: true,
        onOk: () => {
          setHasChange(false);
          handleClose();
        },
      });
    } else {
      handleClose();
    }
  };

  const handleEditStatus = () => {
    setHasChange(true);
  };

  const handleStatusChange = (e: RadioChangeEvent) => {
    if (!e.target.value && isEdit) {
      props.handleStatusChange(e.target.value, null, () => {
        formRef.current.setFieldsValue({
          status: true,
        });
      });
    }
  };

  const handleFieldChange = (label: string, value: any) => {
    if (preResult?.length) {
      setPreResult('');
    }
    if (isTestValueRequired) {
      setIsTestValueRequired(false);
    }
    formRef.current.setFieldsValue({
      [label]: value,
    });
  };

  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name || (isEdit && data?.name === name)) {
      return;
    }
    const isRepeat = await getMaskRuleExists(name);
    if (isRepeat) {
      throw new Error();
    }
  };

  return (
    <>
      <Drawer
        width={720}
        title={isEdit ? '编辑脱敏算法' : '新建脱敏算法'}
        className={styles.maskData}
        footer={
          <Space>
            <Button onClick={handleCancel}>
              {
                formatMessage({
                  id: 'odc.components.FormMaskDataModal.Cancel',
                }) /*取消*/
              }
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {
                isEdit
                  ? formatMessage({
                      id: 'odc.components.FormMaskDataModal.Save',
                    }) //保存
                  : formatMessage({
                      id: 'odc.components.FormMaskDataModal.Create',
                    }) //新建
              }
            </Button>
          </Space>
        }
        destroyOnClose
        visible={visible}
        onClose={handleCancel}
      >
        <Form
          ref={formRef}
          layout="vertical"
          requiredMark="optional"
          initialValues={
            data || {
              enabled: true,
              type: MaskRuleType.MASK,
              segmentsType: MaskRuleSegmentsType.PRE_1_POST_1,
              precision: defaultPrecision,
              precisionSlider: defaultPrecision,
              hashType: MaskRuleHashType.MD5,
              segments: [{}],
            }
          }
          onFieldsChange={handleEditStatus}
        >
          <Form.Item
            label={'算法名称'}
            name="name"
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.FormMaskDataModal.EnterARuleName',
                }), //请输入规则名称
              },
              {
                max: 64,
                message: formatMessage({
                  id: 'odc.components.FormMaskDataModal.TheRuleNameCannotExceed.1',
                }), //规则名称不超过 64个字符
              },
              {
                validator: validTrimEmptyWithWarn(
                  formatMessage({
                    id: 'odc.components.FormMaskDataModal.TheRuleNameContainsSpaces',
                  }), //规则名称首尾包含空格
                ),
              },
              {
                message: formatMessage({
                  id: 'odc.components.FormMaskDataModal.TheRuleNameAlreadyExists',
                }), //规则名称已存在
                validator: checkNameRepeat,
              },
            ]}
          >
            <Input
              placeholder={formatMessage({
                id: 'odc.components.FormMaskDataModal.EnterARuleName',
              })} /*请输入规则名称*/
            />
          </Form.Item>
          <Form.Item
            label="算法状态"
            name="enabled"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.FormMaskDataModal.SelectAStatus',
                }), //请选择状态
              },
            ]}
          >
            <Radio.Group onChange={handleStatusChange}>
              <Radio value={true}>
                {
                  formatMessage({
                    id: 'odc.components.FormMaskDataModal.Enable',
                  }) /*启用*/
                }
              </Radio>
              <Radio value={false}>
                {
                  formatMessage({
                    id: 'odc.components.FormMaskDataModal.Disable',
                  }) /*停用*/
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label={'算法详情'} required>
            <RuleDetail onFieldChange={handleFieldChange} />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.components.FormMaskDataModal.DesensitizationEffect',
            })}
            shouldUpdate
            /*脱敏效果*/ required
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              return (
                <RulePreview
                  onValidate={handleValidate}
                  type={type}
                  result={preResult}
                  isTestValueRequired={isTestValueRequired}
                />
              );
            }}
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
export default FormMaskDataModal;

import { getSynonymList } from '@/common/network/synonym';
import { getTableListByDatabaseName } from '@/common/network/table';
import { getViewListByDatabaseName } from '@/common/network/view';
import { ISynonym, ITable, SynonymType } from '@/d.ts';
import { SessionManagerStore } from '@/store/sessionManager';
import { formatMessage } from '@/util/intl';
import { Button, Form, Input, Modal, Select, Space } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './index.less';

interface IProps {
  model: Partial<ISynonym>;
  onSave: (values: ISynonym) => void;
  visible: boolean;
  onCancel: () => void;
  sessionId: string;
  sessionManagerStore?: SessionManagerStore;
}

interface IState {
  objectList: ITable[];
  tableOwner: string;
  objectType: ObjectType;
  synonyms: {
    COMMON: ISynonym[];
    PUBLIC: ISynonym[];
  };
}

export enum CheckOption {
  NONE = 'NONE',
}

enum ObjectType {
  TABLE = 'TABLE',
  VIEW = 'VIEW',
}

const { Option } = Select;

@inject('sessionManagerStore')
@observer
export default class CreateSynonymModal extends Component<IProps, IState> {
  public readonly state = {
    objectList: [],
    tableOwner: null,
    objectType: ObjectType.TABLE,
    synonyms: {
      COMMON: [],
      PUBLIC: [],
    },
  };

  private formRef = React.createRef<FormInstance>();

  public componentDidMount() {
    const session = this.props.sessionManagerStore.getMasterSession();
    this.handleChangeTableOwner(session?.database?.dbName);
  }

  componentDidUpdate(prevProps) {
    const { tableOwner } = this.state;
    if (prevProps.visible !== this.props.visible) {
      this.formRef.current.resetFields();
      this.handleChangeTableOwner(tableOwner);
      this.loadSynoymList();
    }
  }

  private loadSynoymList = async () => {
    const session = this.props.sessionManagerStore.getMasterSession();
    const commonList = await getSynonymList(
      SynonymType.COMMON,
      session.database.dbName,
      session.sessionId,
    );
    const publicList = await getSynonymList(
      SynonymType.PUBLIC,
      session.database.dbName,
      session.sessionId,
    );
    this.setState({
      synonyms: {
        COMMON: commonList,
        PUBLIC: publicList,
      },
    });
  };

  private handleConfirm = () => {
    this.formRef.current
      .validateFields()
      .then((values: ISynonym) => {
        this.props.onSave(values);
      })
      .catch((errorInfo) => {
        console.error(errorInfo);
      });
  };

  private getSynonymNameRepeaStatus = (type: SynonymType, value: string) => {
    const { synonyms } = this.state;
    const synonym = synonyms[type];
    return synonym?.length && synonym.find((item) => item.synonymName === value);
  };

  private checkSynonymNameRepeat = async (ruler, value) => {
    const type = this.formRef.current.getFieldValue('synonymType') || SynonymType.COMMON;
    if (this.getSynonymNameRepeaStatus(type, value)) {
      throw new Error();
    }
  };

  private handleChangeTableOwner = async (value: string) => {
    const { objectType } = this.state;
    const objectList = await this.getObjectList(value, objectType);
    this.formRef.current?.setFieldsValue({
      tableName: null,
    });

    this.setState({
      objectList,
      tableOwner: value,
    });
  };

  private handleChangeObjectType = async (value: ObjectType) => {
    const { tableOwner } = this.state;
    const objectList = await this.getObjectList(tableOwner, value);
    this.formRef.current?.setFieldsValue({
      tableName: null,
    });

    this.setState({
      objectList,
      objectType: value,
    });
  };

  private getObjectList = async (owner: string, type: ObjectType) => {
    let objectList = [];
    const session = this.props.sessionManagerStore.getMasterSession();
    if (type === ObjectType.VIEW) {
      objectList = await getViewListByDatabaseName(owner);
    } else {
      objectList = await getTableListByDatabaseName(session.sessionId, owner);
    }
    return objectList;
  };

  private handleSearch = (value: string, option: any) => {
    return option?.children?.toLowerCase().includes(value.toLowerCase());
  };

  private handleTypeChange = (type: SynonymType) => {
    const nameValue = this.formRef.current.getFieldValue('synonymName');
    const nameRepeatMessage = formatMessage({
      id: 'odc.component.CreateSynonymModal.TheSynonymNameAlreadyExists',
    });
    if (nameValue && nameValue.length < 128) {
      const errors = this.getSynonymNameRepeaStatus(type, nameValue) ? [nameRepeatMessage] : [];
      this.formRef.current.setFields([
        {
          name: 'synonymName',
          errors,
        },
      ]);
    }
  };

  public render() {
    const { visible, sessionManagerStore, onCancel } = this.props;
    const { objectList, tableOwner, objectType } = this.state;
    const formItemStyle = { width: '328px' };
    const session = sessionManagerStore.getMasterSession();
    const databases = session.databases;
    return (
      <Modal
        width={480}
        title={formatMessage({
          id: 'odc.component.CreateSynonymModal.CreateSynonym',
        })}
        visible={visible}
        onCancel={onCancel}
        maskClosable={false}
        centered
        footer={
          <Space>
            <Button onClick={onCancel}>
              {
                formatMessage({
                  id: 'odc.component.CreateSynonymModal.Cancel',
                })
                /* 取消 */
              }
            </Button>
            <Button type="primary" onClick={this.handleConfirm}>
              {
                formatMessage({
                  id: 'odc.component.CreateSynonymModal.NextConfirmTheSqlStatement',
                })

                /* 下一步：确认SQL */
              }
            </Button>
          </Space>
        }
        className={styles.synonymModal}
      >
        <Form layout="vertical" requiredMark={false} ref={this.formRef}>
          <Form.Item
            name="synonymName"
            label={formatMessage({
              id: 'odc.component.CreateSynonymModal.Synonym',
            })}
            /* 同义词名称 */
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.CreateSynonymModal.EnterASynonymName',
                }),
                // 请输入同义词名称
              },
              {
                max: 128,
                message: formatMessage({
                  id: 'odc.component.CreateSynonymModal.TheLengthCannotExceedCharacters',
                }),

                // 长度不超过 128 个字符
              },
              {
                message: formatMessage({
                  id: 'odc.component.CreateSynonymModal.TheSynonymNameAlreadyExists',
                }), // 同义词名称已存在
                validator: this.checkSynonymNameRepeat,
              },
            ]}
          >
            <Input
              placeholder={formatMessage({
                id: 'odc.component.CreateSynonymModal.EnterASynonymName',
              })}

              /* 请输入同义词名称 */
            />
          </Form.Item>
          <Form.Item
            style={formItemStyle}
            name="tableOwner"
            label={formatMessage({
              id: 'odc.component.CreateSynonymModal.ObjectOwner',
            })}
            /* 对象所有者 */
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.CreateSynonymModal.EnterAnObjectOwner',
                }),

                // 请输入对象所有者
              },
            ]}
            initialValue={tableOwner}
          >
            <Select
              placeholder={formatMessage({
                id: 'odc.component.CreateSynonymModal.EnterAnObjectOwner',
              })}
              onChange={this.handleChangeTableOwner}
              showSearch
              filterOption={this.handleSearch}
            >
              {databases.length &&
                databases.map((db) => {
                  return (
                    <Option key={db.name} value={db.name}>
                      {db.name}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
          <Form.Item
            style={formItemStyle}
            name="objectType"
            label={formatMessage({
              id: 'odc.component.CreateSynonymModal.ObjectType',
            })}
            /* 对象类型 */
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.CreateSynonymModal.SelectAnObjectType',
                }),
                // 请选择对象类型
              },
            ]}
            initialValue={objectType}
          >
            <Select
              placeholder={formatMessage({
                id: 'odc.component.CreateSynonymModal.SelectAnObjectType',
              })}
              /* 请选择对象类型 */ onChange={this.handleChangeObjectType}
            >
              <Option key={ObjectType.TABLE} value={ObjectType.TABLE}>
                {ObjectType.TABLE}
              </Option>
              <Option key={ObjectType.VIEW} value={ObjectType.VIEW}>
                {ObjectType.VIEW}
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            style={formItemStyle}
            name="tableName"
            label={formatMessage({
              id: 'odc.component.CreateSynonymModal.ObjectName',
            })}
            /* 对象名称 */
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.CreateSynonymModal.TheObjectNameMustBe',
                }),

                // 对象名称不能为空
              },
            ]}
          >
            <Select
              placeholder={formatMessage({
                id: 'odc.component.CreateSynonymModal.EnterAnObjectName',
              })}
              showSearch
              filterOption={this.handleSearch}
            >
              {objectList.length &&
                objectList.map((item) => {
                  const objectName =
                    objectType === ObjectType.VIEW ? item.viewName : item.tableName;
                  return (
                    <Option key={objectName} value={objectName}>
                      {objectName}
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
          <Form.Item
            style={{ width: '105px' }}
            name="synonymType"
            label={formatMessage({
              id: 'odc.component.CreateSynonymModal.SynonymType',
            })}
            /* 同义词类型 */
            initialValue={SynonymType.COMMON}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.component.CreateSynonymModal.EnterASynonymType',
                }),

                // 请输入同义词类型
              },
            ]}
          >
            <Select onChange={this.handleTypeChange}>
              <Option value={SynonymType.COMMON}>
                {
                  formatMessage({
                    id: 'odc.component.CreateSynonymModal.CommonSynonym',
                  })

                  /* 普通同义词 */
                }
              </Option>
              <Option value={SynonymType.PUBLIC}>
                {
                  formatMessage({
                    id: 'odc.component.CreateSynonymModal.CommonSynonyms',
                  })

                  /* 公用同义词 */
                }
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

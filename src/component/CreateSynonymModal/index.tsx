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

import { listDatabases } from '@/common/network/database';
import { getSynonymCreateSQL, getSynonymList } from '@/common/network/synonym';
import { getTableListByDatabaseName } from '@/common/network/table';
import { getViewListByDatabaseName } from '@/common/network/view';
import { ISynonym, ITable, SynonymType } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import SessionContextWrap from '@/page/Workspace/components/SessionContextWrap';
import { openCreateSynonymPage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { SessionManagerStore } from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import { Button, Form, Input, Modal, Select, Space } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import styles from './index.less';

interface IProps {
  sessionManagerStore?: SessionManagerStore;
  modalStore?: ModalStore;
}

interface IState {
  objectList: ITable[];
  tableOwner: string;
  objectType: ObjectType;
  databases: IDatabase[];
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

class CreateSynonymModal extends Component<IProps & { session: SessionStore }, IState> {
  public readonly state = {
    objectList: [],
    tableOwner: null,
    objectType: ObjectType.TABLE,
    databases: [],
    synonyms: {
      COMMON: [],
      PUBLIC: [],
    },
  };

  private formRef = React.createRef<FormInstance>();

  public componentDidMount() {
    const { createSynonymModalData } = this.props.modalStore;
    const { dbName } = createSynonymModalData;
    if (this.props.session) {
      this.loadSynoymList();
      this.handleChangeTableOwner(dbName);
      this.loadDatabases();
    }
  }

  componentDidUpdate(
    prevProps: Readonly<IProps & { session: SessionStore }>,
    prevState: Readonly<IState>,
    snapshot?: any,
  ): void {
    if (prevProps.session !== this.props.session && this.props.session) {
      this.loadSynoymList();
      this.handleChangeTableOwner(this.props.modalStore?.createSynonymModalData?.dbName);
      this.loadDatabases();
    }
  }

  private async loadDatabases() {
    const res = await listDatabases(
      null,
      this.props.session?.connection?.id,
      1,
      9999,
      null,
      null,
      null,
      true,
    );
    this.setState({
      databases: res?.contents || [],
    });
  }

  private loadSynoymList = async () => {
    const { session } = this.props;
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
    const { createSynonymModalData } = this.props.modalStore;
    const { dbName } = createSynonymModalData;
    this.formRef.current
      .validateFields()
      .then(async (values: ISynonym) => {
        const sql = await getSynonymCreateSQL(
          values.synonymName,
          values,
          this.props.session?.sessionId,
          dbName,
        );
        if (sql) {
          openCreateSynonymPage(
            sql,
            values.synonymType,
            this.props.session?.odcDatabase?.id,
            dbName,
          );
          this.close();
        }
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
    const { session } = this.props;
    if (type === ObjectType.VIEW) {
      objectList = await getViewListByDatabaseName(owner, session?.sessionId);
    } else {
      objectList = await getTableListByDatabaseName(session?.sessionId, owner);
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

  public close = () => {
    this.props.modalStore.changeCreateSynonymModalVisible(false);
  };

  public render() {
    const { sessionManagerStore, modalStore, session } = this.props;
    const { objectList, tableOwner, objectType, databases } = this.state;
    const formItemStyle = { width: '328px' };
    return (
      <Modal
        width={480}
        title={formatMessage({
          id: 'odc.component.CreateSynonymModal.CreateSynonym',
        })}
        open={modalStore.createSynonymModalVisible}
        onCancel={this.close}
        maskClosable={false}
        centered
        footer={
          <Space>
            <Button onClick={this.close}>
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
export default inject(
  'sessionManagerStore',
  'modalStore',
)(
  observer(function (props: IProps) {
    return (
      <SessionContextWrap
        defaultDatabaseId={props?.modalStore?.createSynonymModalData?.databaseId}
        defaultMode="datasource"
      >
        {({ session }) => {
          return <CreateSynonymModal {...props} session={session} />;
        }}
      </SessionContextWrap>
    );
  }),
);

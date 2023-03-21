import { ConnectTypeText } from '@/constant/label';
import {
  ConnectType,
  IConnectionLabel,
  IConnectionType,
  IManagerPublicConnection,
  IManagerResourceGroup,
} from '@/d.ts';
import { haveOCP } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Select } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import React from 'react';
import NameItems from './NameItems';
import ParseURLItem from './ParseURLItem';

interface IProps {
  onlySys: boolean;
  isEdit: boolean;
  connectionType: IConnectionType;
  labels?: IConnectionLabel[];
  resourceList?: IManagerResourceGroup[];
  formData: Partial<IManagerPublicConnection>;
  extendData: Record<string, any>;
  baseWidth: number;
  typeInValidMessage: string;
  onChangeExtendData: (values: any) => void;
  handleChangeFormData: (values: Record<string, any>) => void;
  onChangeLabelManageVisible?: (visible: boolean) => void;
  handleStatusChange?: (
    status: boolean,
    connection: IManagerPublicConnection,
    callback: () => void,
  ) => void;
}

const BaseInfoItems: React.FC<IProps> = function (props) {
  const {
    isEdit,
    onlySys,
    connectionType,
    labels,
    extendData,
    formData,
    resourceList,
    baseWidth,
    typeInValidMessage,
    onChangeExtendData,
    handleStatusChange,
    handleChangeFormData,
    onChangeLabelManageVisible,
  } = props;

  const isPrivate = connectionType === IConnectionType.PRIVATE;
  const isOrganization = connectionType === IConnectionType.ORGANIZATION;
  return (
    <>
      <NameItems
        baseWidth={baseWidth}
        onlySys={onlySys}
        isEdit={isEdit}
        isPrivate={isPrivate}
        extendData={extendData}
        labels={labels}
        formData={formData}
        resourceList={resourceList}
        isOrganization={isOrganization}
        connectionType={connectionType}
        onChangeExtendData={onChangeExtendData}
        handleStatusChange={handleStatusChange}
        handleChangeFormData={handleChangeFormData}
        onChangeLabelManageVisible={onChangeLabelManageVisible}
      />

      {!haveOCP() && (
        <ParseURLItem
          autoType={!isEdit}
          onlySys={onlySys}
          handleChangeFormData={handleChangeFormData}
        />
      )}
      {!haveOCP() && (
        <FormItem
          label={formatMessage({
            id: 'odc.component.AddConnectionForm.BaseInfoItems.ConnectionType',
          })} /*连接类型*/
          shouldUpdate
          name="type"
          validateStatus={!!typeInValidMessage ? 'error' : null}
          help={typeInValidMessage}
        >
          <Select disabled={isEdit} style={{ width: 230 }}>
            {[
              ConnectType.OB_ORACLE,
              ConnectType.OB_MYSQL,
              ConnectType.CLOUD_OB_ORACLE,
              ConnectType.CLOUD_OB_MYSQL,
              ConnectType.ODP_SHARDING_OB_MYSQL,
            ].map((v) => (
              <Select.Option key={v} value={v}>
                {ConnectTypeText[v]}
              </Select.Option>
            ))}
          </Select>
        </FormItem>
      )}
    </>
  );
};

export default BaseInfoItems;

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

import { batchCreateSensitiveColumns } from '@/common/network/sensitiveColumn';
import { ESensitiveColumnType, ISensitiveColumn } from '@/d.ts/sensitiveColumn';
import ProjectContext from '@/page/Project/ProjectContext';
import { AddSensitiveColumnType, ScanTableData } from '@/page/Project/Sensitive/interface';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { Button, Drawer, message, Space } from 'antd';
import { useForm, useWatch } from 'antd/es/form/Form';
import { merge } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import SensitiveRule from '../../SensitiveRule';
import styles from './index.less';
import ScanForm from './ScanForm';
export const defaultScanTableData: Array<ScanTableData> = [];
export const checkResult = (resData: Array<ScanTableData> = []) =>
  resData?.length > 0 ? resData : defaultScanTableData;

export function getTitle(addSensitiveColumnType: AddSensitiveColumnType) {
  return addSensitiveColumnType === AddSensitiveColumnType.Manual
    ? formatMessage({
        id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.ManuallyAddSensitiveColumns',
      }) //手动添加敏感列
    : formatMessage({
        id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.ScanToAddSensitiveColumns',
      }); //扫描添加敏感列
}
const FormSensitiveColumnDrawer = ({
  isEdit,
  visible,
  projectId,
  onClose,
  onOk,
  addSensitiveColumnType,
}) => {
  const [formRef] = useForm();
  const [_formRef] = useForm();
  const ref = useRef<any>(null);
  const scanTableData = useWatch('scanTableData', _formRef);
  const context = useContext(ProjectContext);
  const [submiting, setSubmiting] = useState<boolean>(false);
  const [sensitiveColumns, setSensitiveColumns] = useState<ISensitiveColumn[]>([]);
  const [manageSensitiveRuleDrawerOpen, setManageSensitiveRuleDrawerOpen] =
    useState<boolean>(false);
  const [formData, setFormData] = useState<Object>({});

  const parseData = (rawFormData: Object) => {
    const obj = {};
    Object.keys(rawFormData)?.forEach((database) => {
      if (rawFormData[database]?.[ESensitiveColumnType.TABLE_COLUMN]) {
        for (const tableName in rawFormData[database]?.[ESensitiveColumnType.TABLE_COLUMN]) {
          for (const columnName in rawFormData[database]?.[ESensitiveColumnType.TABLE_COLUMN][
            tableName
          ]) {
            obj[`${database}_${ESensitiveColumnType.TABLE_COLUMN}_${tableName}_${columnName}`] =
              rawFormData[database]?.[ESensitiveColumnType.TABLE_COLUMN][tableName][columnName];
          }
        }
      }
      if (rawFormData[database]?.[ESensitiveColumnType.VIEW_COLUMN]) {
        for (const viewName in rawFormData[database]?.[ESensitiveColumnType.VIEW_COLUMN]) {
          for (const columnName in rawFormData[database]?.[ESensitiveColumnType.VIEW_COLUMN][
            viewName
          ]) {
            obj[`${database}_${ESensitiveColumnType.VIEW_COLUMN}_${viewName}_${columnName}`] =
              rawFormData[database]?.[ESensitiveColumnType.VIEW_COLUMN][viewName][columnName];
          }
        }
      }
    });
    return obj;
  };
  const handleScanSubmit = async () => {
    await formRef.validateFields().catch();
    const { scanTableData: rawFormData } = await _formRef.validateFields().catch();
    const rawData = [];
    const sensitiveColumnMap = ref.current?.getColumnMap() || new Map();
    const map = parseData(merge(formData, rawFormData));
    sensitiveColumns.forEach((sensitiveColumn) => {
      const key = `${sensitiveColumn.database.name}_${sensitiveColumn.type}_${sensitiveColumn.tableName}`;
      if (sensitiveColumnMap.has(key)) {
        const column = sensitiveColumnMap
          .get(key)
          ?.dataSource.find((item) => item.columnName === sensitiveColumn.columnName);
        if (column) {
          rawData.push({
            ...sensitiveColumn,
            enabled: true,
            maskingAlgorithmId: map[`${key}_${sensitiveColumn.columnName}`],
          });
        }
      }
    });
    setSubmiting(true);
    const res = await batchCreateSensitiveColumns(context.projectId, rawData);
    setSubmiting(false);
    if (res) {
      tracert.click('a3112.b64002.c330861.d367391');
      message.success(
        formatMessage({
          id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.New',
        }), //新建成功
      );
      onOk(async () => {
        await formRef?.resetFields();
        await _formRef?.resetFields();
        setSubmiting(false);
        setManageSensitiveRuleDrawerOpen(false);
        setFormData({});
        ref.current?.reset();
        ref.current = null;
      });
      ref.current?.reset();
    } else {
      message.error(
        formatMessage({
          id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.FailedToCreate',
        }), //新建失败
      );
    }
  };

  const hanldeClose = () => {
    onClose(async () => {
      await formRef?.resetFields();
      await _formRef?.resetFields();
      setSubmiting(false);
      setManageSensitiveRuleDrawerOpen(false);
      setFormData({});
      ref.current?.reset();
      ref.current = null;
    });
  };

  useEffect(() => {
    if (!isEdit) {
      formRef.setFieldsValue({
        manual: [
          {
            dataSource: undefined,
            database: undefined,
            tableName: undefined,
            columnName: undefined,
            maskingAlgorithmId: undefined,
          },
        ],
      });
    }
  }, [isEdit, visible]);
  const title = getTitle(addSensitiveColumnType);
  const DrawerFooter = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Space>
        <Button onClick={hanldeClose}>
          {
            formatMessage({
              id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.Cancel',
            }) /*取消*/
          }
        </Button>
        <Button type="primary" disabled={submiting || !scanTableData} onClick={handleScanSubmit}>
          {
            formatMessage({
              id: 'odc.SensitiveColumn.components.FormSensitiveColumnDrawer.Submit',
            }) /*提交*/
          }
        </Button>
      </Space>
    </div>
  );
  return (
    <>
      <Drawer
        title={title}
        width={724}
        open={visible}
        onClose={hanldeClose}
        destroyOnClose={true}
        footer={<DrawerFooter />}
        className={styles.drawer}
      >
        <ScanForm
          formRef={formRef}
          _formRef={_formRef}
          ref={ref}
          setManageSensitiveRuleDrawerOpen={setManageSensitiveRuleDrawerOpen}
          setSensitiveColumns={setSensitiveColumns}
          setFormData={setFormData}
        />
      </Drawer>

      <Drawer
        open={manageSensitiveRuleDrawerOpen}
        title={
          formatMessage({
            id: 'odc.src.page.Project.Sensitive.components.SensitiveColumn.components.ManagementRecognitionRules',
          }) //'管理识别规则'
        }
        width={720}
        destroyOnClose
        onClose={() => {
          setManageSensitiveRuleDrawerOpen(false);
        }}
      >
        <SensitiveRule projectId={projectId} />
      </Drawer>
    </>
  );
};
export default FormSensitiveColumnDrawer;

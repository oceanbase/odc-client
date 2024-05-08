import { formatMessage } from '@/util/intl';
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

import { Popover, Space, Typography } from 'antd';
import styles from './index.less';
const { Text, Link } = Typography;
const example1 = "create_time<'2023-01-01'";
const example2 = formatMessage({
  id: 'odc.src.component.Task.component.ArchiveRangeTip.FilterConditionCreateTime.1',
}); //"过滤条件：create_time<'${bizdate}'"
const Content: React.FC<{
  label: string;
}> = ({ label }) => {
  return (
    <Space direction="vertical" size={20}>
      <Space direction="vertical" size={5}>
        <Text>
          {
            formatMessage({
              id: 'odc.src.component.Task.component.ArchiveRangeTip.SuchAsChoice',
            }) /* 如选择 */
          }
          {label}
          {
            formatMessage({
              id: 'odc.src.component.Task.component.ArchiveRangeTip.DataBeforeJanuary01',
            }) /*  2023 年 01 月 01 日前的数据，可设置： */
          }
        </Text>
        <div className={styles.blockCard}>
          <Text type="secondary">{example1}</Text>
        </div>
      </Space>
      <Space
        direction="vertical"
        style={{
          width: '100%',
        }}
      >
        <Text>
          {
            formatMessage({
              id: 'odc.src.component.Task.component.ArchiveRangeTip.IfYouChooseRegular',
            }) /* 如选择定期 */
          }
          {label}
          {
            formatMessage({
              id: 'odc.src.component.Task.component.ArchiveRangeTip.Data7DaysAgo',
            }) /*  7 天前的数据，可设置： */
          }
        </Text>
        <Space className={styles.blockCard} direction="vertical" size={12}>
          <Text type="secondary">{example2}</Text>
          <Space direction="vertical" size={4}>
            <Text type="secondary">
              {
                formatMessage({
                  id: 'odc.src.component.Task.component.ArchiveRangeTip.CustomVariableSettings',
                }) /* 自定义变量设置 */
              }
            </Text>
            <Text type="secondary">
              {
                formatMessage({
                  id: 'odc.src.component.Task.component.ArchiveRangeTip.VariableNameBizdate',
                }) /* 变量名称：bizdate */
              }
            </Text>
            <Text type="secondary">
              {
                formatMessage({
                  id: 'odc.src.component.Task.component.ArchiveRangeTip.TimeFormatYyyyMm',
                }) /* 时间格式：yyyy-mm-dd */
              }
            </Text>
            <Text type="secondary">
              {
                formatMessage({
                  id: 'odc.src.component.Task.component.ArchiveRangeTip.TimeOffsetMinus7',
                }) /* 时间偏移：减 7 日 */
              }
            </Text>
          </Space>
        </Space>
      </Space>
    </Space>
  );
};
interface IProps {
  label: string;
}
const ArchiveRangeTip: React.FC<IProps> = (props) => {
  return (
    <Popover
      placement="bottom"
      content={<Content label={props.label} />}
      trigger={['click', 'hover']}
    >
      <Link>
        {
          formatMessage({
            id: 'odc.src.component.Task.component.ArchiveRangeTip.SceneExample',
          }) /* 场景示例 */
        }
      </Link>
    </Popover>
  );
};
export default ArchiveRangeTip;

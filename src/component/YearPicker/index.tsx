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

import { formatMessage } from '@/util/intl';
import { DatePicker } from 'antd';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import { Component } from 'react';

export default class YearPicker extends Component<
  {
    defaultValue: dayjs.Dayjs;
    onChange: (year: string) => void;
  },
  {
    isopen: boolean;
    time: dayjs.Dayjs;
  }
> {
  public readonly state = {
    isopen: false,
    time: this.props.defaultValue,
  };

  public render() {
    const { onChange } = this.props;
    const { isopen, time } = this.state;
    return (
      <DatePicker
        size="small"
        locale={locale}
        value={time}
        open={isopen}
        mode="year"
        placeholder={formatMessage({
          id: 'odc.component.YearPicker.SelectAYear',
          defaultMessage: '请选择年份',
        })}
        format="YYYY"
        onOpenChange={(status) => {
          if (status) {
            this.setState({ isopen: true });
          } else {
            this.setState({ isopen: false });
          }
        }}
        onPanelChange={(v) => {
          this.setState(
            {
              time: v,
              isopen: false,
            },

            () => {
              onChange(this.state.time.format('YYYY'));
            },
          );
        }}
        onChange={() => {
          this.setState({ time: null });
        }}
      />
    );
  }
}

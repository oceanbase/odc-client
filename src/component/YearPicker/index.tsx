import { formatMessage } from '@/util/intl';
import { DatePicker } from 'antd';
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
import { Component } from 'react';

export default class YearPicker extends Component<
  {
    defaultValue: moment.Moment;
    onChange: (year: string) => void;
  },
  {
    isopen: boolean;
    time: moment.Moment;
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

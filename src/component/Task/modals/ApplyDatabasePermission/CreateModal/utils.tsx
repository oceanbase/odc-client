import { formatMessage } from '@/util/intl';
import dayjs from 'dayjs';
import { permissionOptionsMap } from './const';
import HelpDoc from '@/component/helpDoc';

const MAX_DATE = '9999-12-31 23:59:59';
const MAX_DATE_LABEL = '9999-12-31';

export const getExpireTime = (expireTime, customExpireTime, isCustomExpireTime) => {
  if (isCustomExpireTime) {
    return customExpireTime?.valueOf();
  } else {
    const [offset, unit] = expireTime.split(',') ?? [];
    return offset === 'never' ? dayjs(MAX_DATE)?.valueOf() : dayjs().add(offset, unit)?.valueOf();
  }
};

export const getExpireTimeLabel = (expireTime) => {
  const label = dayjs(expireTime).format('YYYY-MM-DD');
  return label === MAX_DATE_LABEL
    ? formatMessage({
        id: 'src.component.Task.ApplyDatabasePermission.CreateModal.B5C7760D',
        defaultMessage: '永不过期',
      })
    : label;
};

const Label: React.FC<{
  text: string;
  docKey: string;
}> = ({ text, docKey }) => (
  <HelpDoc leftText isTip doc={docKey}>
    {text}
  </HelpDoc>
);

export const permissionOptions = Object.values(permissionOptionsMap)?.map(
  ({ text, docKey, ...rest }) => ({
    ...rest,
    label: <Label text={text} docKey={docKey} />,
  }),
);

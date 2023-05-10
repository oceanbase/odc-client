import { formatMessage } from '@/util/intl';
import Icon from '@ant-design/icons';

import ODCColorSvg from '@/svgr/odc_logo_color.svg';

export default function ({ collapsed }) {
  if (collapsed) {
    return (
      <Icon style={{ fontSize: 16, marginBottom: 12, marginLeft: 5 }} component={ODCColorSvg} />
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
        marginBottom: 12,
        color: 'var(--text-color-primary)',
      }}
    >
      <Icon style={{ fontSize: 27 }} component={ODCColorSvg} />
      <div
        style={{
          wordBreak: 'break-word',
          marginLeft: 10,
          fontSize: 14,
          fontFamily: 'DIN-Bold, Alibaba-puhui-title, PingFangSC-Medium, Microsoft YaHei',
        }}
      >
        OceanBase
        <br />
        {
          formatMessage({
            id: 'odc.Index.Sider.Logo.DeveloperCenter',
          }) /*开发者中心*/
        }
      </div>
    </div>
  );
}

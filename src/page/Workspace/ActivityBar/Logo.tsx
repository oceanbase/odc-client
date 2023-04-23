import ODCBlackSvg from '@/svgr/odc_logo_color.svg';
import Icon from '@ant-design/icons';

export default function Logo() {
  return <Icon component={ODCBlackSvg} style={{ fontSize: 18, marginBottom: 20, marginTop: 12 }} />;
}

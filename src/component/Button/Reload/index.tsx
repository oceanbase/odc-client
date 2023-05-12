import { ReloadOutlined } from '@ant-design/icons';

export default function Reload({
  size = '13px',
  onClick,
}: {
  size?: string;
  onClick?: () => void;
}) {
  return <ReloadOutlined onClick={onClick} style={{ fontSize: size, cursor: 'pointer' }} />;
}

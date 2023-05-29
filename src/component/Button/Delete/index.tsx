import { DeleteOutlined } from '@ant-design/icons';

export default function Delete({
  size = '13px',
  onClick,
}: {
  size?: string;
  onClick?: () => void;
}) {
  return (
    <DeleteOutlined
      onClick={onClick}
      style={{ fontSize: size, cursor: 'pointer', color: 'var(--icon-color-disable)' }}
    />
  );
}

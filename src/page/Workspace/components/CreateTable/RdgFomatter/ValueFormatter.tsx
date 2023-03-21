export default function WrapValueFormatter(func) {
  return ({ row }) => {
    return func(row) || '';
  };
}

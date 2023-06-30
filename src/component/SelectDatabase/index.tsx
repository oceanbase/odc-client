import ReactDom from 'react-dom';
import SelectModal from './component';

export default async function SelectDatabase(): Promise<[number]> {
  return new Promise((resolve) => {
    const mountDom = document.createElement('div');
    document.body.appendChild(mountDom);
    function unmount() {
      ReactDom.unmountComponentAtNode(mountDom);
    }
    ReactDom.render(
      <SelectModal
        open={true}
        onClose={() => {
          resolve([null]);
          unmount();
        }}
        onOk={(v) => {
          resolve([v]);
          unmount();
        }}
      />,
      mountDom,
    );
  });
}

import { Template, getTemplateList, detailTemplate } from '@/common/network/databaseChange';
import { IDatabase } from '@/d.ts/database';
import login from '@/store/login';
import { SettingOutlined, DownOutlined } from '@ant-design/icons';
import { Form, Popover, Empty, Divider, Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { useContext, useState, useLayoutEffect } from 'react';
import { MultipleAsyncContext } from '../../CreateModal/MultipleAsyncContext';
import styles from './index.less';
import ManageTemplate from './ManageTemplate';
import ShowTemplate from './ShowTemplate';

const SelectTemplate: React.FC<{
  manageTemplateModalOpen: boolean;
  setManageTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectTemplateModalOpen: boolean;
  setSelectTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  manageTemplateModalOpen,
  setManageTemplateModalOpen,
  selectTemplateModalOpen,
  setSelectTemplateModalOpen,
}) => {
  const { projectId } = useContext(MultipleAsyncContext);
  const form = Form.useFormInstance();
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const loadTemplateList = async () => {
    const response = await getTemplateList({
      projectId,
      currentOrganizationId: login.organizationId?.toString(),
    });
    if (response?.contents?.length) {
      setTemplateList(response?.contents);
    } else {
      setTemplateList([]);
    }
  };
  useLayoutEffect(() => {
    if (selectTemplateModalOpen && projectId) {
      loadTemplateList();
    }
  }, [selectTemplateModalOpen, projectId]);
  const handleTemplateItemClick = async (template: Template) => {
    if (!template?.enabled) {
      return;
    }
    setSelectTemplateModalOpen(false);
    const response = await detailTemplate(template?.id, login?.organizationId?.toString());
    const rawData = ((response as any)?.databaseSequenceList as IDatabase[][])?.reduce(
      (pre: number[][], cur) => {
        pre?.push(
          cur?.map((db) => {
            return db?.id;
          }),
        );
        return pre;
      },
      [],
    );
    form.setFieldValue(['parameters', 'orderedDatabaseIds'], rawData);
  };
  return (
    <>
      <div>
        <Popover
          placement="bottom"
          trigger="click"
          showArrow={false}
          open={selectTemplateModalOpen}
          overlayStyle={{
            padding: 0,
          }}
          overlayInnerStyle={{
            padding: 0,
          }}
          overlayClassName={styles.selectTemplatePopover}
          onOpenChange={(open) => {
            if (!Boolean(projectId)) {
              return;
            }
            setSelectTemplateModalOpen(open);
          }}
          content={
            <div
              className={styles.template}
              onMouseLeave={() => {
                setSelectTemplateModalOpen(false);
              }}
            >
              {templateList?.length === 0 && (
                <div
                  style={{
                    height: '140px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              )}
              <div className={styles.options}>
                {templateList?.map((template, index) => {
                  const databaseIdsMap = {};
                  template?.databaseSequenceList.forEach((dbs) => {
                    dbs?.forEach((item) => {
                      databaseIdsMap[item?.id] = item;
                    }, {});
                  });
                  const orderedDatabaseIds = template?.databaseSequenceList?.map((dbs) => {
                    return dbs.map((db) => db.id);
                  });
                  return template?.enabled ? (
                    <Popover
                      placement="left"
                      showArrow={false}
                      key={index}
                      overlayInnerStyle={{
                        padding: '16px',
                      }}
                      content={
                        <ShowTemplate
                          orderedDatabaseIds={orderedDatabaseIds}
                          databaseIdsMap={databaseIdsMap}
                        />
                      }
                    >
                      <div
                        key={index}
                        className={styles.templateItem}
                        onClick={() => handleTemplateItemClick(template)}
                      >
                        {template?.name}
                      </div>
                    </Popover>
                  ) : (
                    <Tooltip key={index} title="模版已失效" placement="left">
                      <div
                        className={classNames(styles.templateItem, styles.templateItemDisabled)}
                        onClick={() => handleTemplateItemClick(template)}
                      >
                        {template?.name}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
              <Divider style={{ padding: 0, margin: 0 }} />
              <Button
                type="link"
                block
                className={styles.blockLinkBtn}
                icon={<SettingOutlined />}
                onClick={() => {
                  if (!Boolean(projectId)) {
                    return;
                  }
                  setSelectTemplateModalOpen(false);
                  setManageTemplateModalOpen(true);
                }}
              >
                管理模版
              </Button>
            </div>
          }
        >
          <Tooltip title={!Boolean(projectId) ? '请先选择项目' : null}>
            <Button
              disabled={!Boolean(projectId)}
              className={styles.linkBtn}
              type="link"
              style={{
                padding: 0,
                margin: 0,
              }}
              onClick={() => {
                setSelectTemplateModalOpen(!selectTemplateModalOpen);
              }}
            >
              选择模版
              <DownOutlined />
            </Button>
          </Tooltip>
        </Popover>
      </div>
      <ManageTemplate
        manageTemplateModalOpen={manageTemplateModalOpen}
        setManageTemplateModalOpen={setManageTemplateModalOpen}
        reload={loadTemplateList}
      />
    </>
  );
};

export default SelectTemplate;

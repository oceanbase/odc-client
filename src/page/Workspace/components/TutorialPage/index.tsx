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

import editorUtils from '@/util/editor';
import React, { useRef, useState } from 'react';
import { SQLPage } from '../SQLPage';

import { getTutorialById } from '@/common/network/other';
import { TutorialPage as TutorialPageModel } from '@/store/helper/page/pages';
import page from '@/store/page';
import { useRequest } from 'ahooks';
import { Skeleton } from 'antd';
import { Base64 } from 'js-base64';
import { renderMd } from './helper';
import styles from './index.less';

interface IProps {
  params: TutorialPageModel['pageParams'];
  pageKey?: string;
  closeSelf: () => void;
}

const TutorialPage: React.FC<IProps> = function (props) {
  const [mdHtml, setMdHtml] = useState('');
  const { params, closeSelf } = props;
  const { loading, data } = useRequest(getTutorialById, {
    defaultParams: [params?.docId],
    onSuccess: (data, params) => {
      setMdHtml(renderMd(data?.content));
      page.updatePage(props.pageKey, { title: data?.name });
    },
  });
  const ref = useRef<SQLPage>();

  return (
    <div className={styles.main}>
      <div className={styles.sqlPage}>
        <SQLPage ref={ref} {...props} />
      </div>
      <div className={styles.doc}>
        <div className={styles.docTitle}>
          <div className={styles.docTitleLabel}>{data?.name}</div>
          <div className={styles.docTitleBtn}>
            {/* <a
              onClick={() => {
                closeSelf();
              }}
            >
              退出
            </a> */}
          </div>
        </div>
        {loading ? (
          <Skeleton />
        ) : (
          <div
            onClick={(e) => {
              const target = e.target;
              if (target instanceof HTMLButtonElement && target.getAttribute('data-insert')) {
                editorUtils.replaceText(
                  ref.current.editor,
                  Base64.decode(target.getAttribute('data-insert')),
                );
              } else if (
                target instanceof HTMLAnchorElement &&
                target.getAttribute('data-anchor')
              ) {
                e.preventDefault();
                e.stopPropagation();
                const anthor = target.getAttribute('data-anchor').slice(1);
                const targetAnthor = Array.from(document.querySelectorAll('h2')).find(
                  (el) => el.textContent === anthor,
                );
                if (targetAnthor) {
                  e.currentTarget.scrollTo({
                    top: Math.max(targetAnthor.offsetTop - targetAnthor.offsetHeight - 15, 0),
                  });
                }
              }
            }}
            dangerouslySetInnerHTML={{ __html: mdHtml }}
            className={styles.docContent}
          />
        )}
      </div>
    </div>
  );
};

export default TutorialPage;

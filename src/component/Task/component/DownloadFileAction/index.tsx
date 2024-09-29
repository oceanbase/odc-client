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

import Action from '@/component/Action';
import { formatMessage } from '@/util/intl';
import { downloadFile } from '@/util/utils';

interface IProps {
  url: string;
}

export const DownloadFileAction: React.FC<IProps> = (props) => {
  const { url } = props;

  const handleDownloadFile = async () => {
    downloadFile(url);
  };

  return url ? (
    <Action.Link onClick={handleDownloadFile}>
      {
        formatMessage({
          id: 'odc.component.DownloadFileAction.DownloadBackupRollbackSolution',
          defaultMessage: '下载备份回滚方案',
        }) /*下载备份回滚方案*/
      }
    </Action.Link>
  ) : null;
};

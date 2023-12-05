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

import {
  EllipsisOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { ComponentClass, FunctionComponent } from 'react';
import commonIcon from './commonIcon';

//@ts-ignore
import { ReactComponent as StartSvg } from '@/svgr/Automaticoperation.svg';
//@ts-ignore
import { ReactComponent as SubmitSvg } from '@/svgr/Submit.svg';
//@ts-ignore
import { ReactComponent as RollbackSvg } from '@/svgr/Roll-back.svg';
// @ts-ignore
import { ReactComponent as TerminationSvg } from '@/svgr/Termination.svg';
// @ts-ignore
import { ReactComponent as LowercaseSvg } from '@/svgr/Lowercase.svg';
// @ts-ignore
import { ReactComponent as CapitalizedSvg } from '@/svgr/Capitalized.svg';
// @ts-ignore
import { ReactComponent as UppercasingSvg } from '@/svgr/Uppercasing.svg';
// @ts-ignore
import { ReactComponent as AddNoteSvg } from '@/svgr/Add_notes.svg';
// @ts-ignore
import { ReactComponent as DeleleNoteSvg } from '@/svgr/Delete_notes.svg';
// @ts-ignore
import { ReactComponent as AutomaticRunSvg } from '@/svgr/AutomaticRun.svg';
// @ts-ignore
import { ReactComponent as StepInSvg } from '@/svgr/Step_in.svg';
// @ts-ignore
import { ReactComponent as StepOutSvg } from '@/svgr/Step_out.svg';
// @ts-ignore
import { ReactComponent as StepOverSvg } from '@/svgr/Step_over.svg';
// @ts-ignore
import { ReactComponent as ExecuteSectionSvg } from '@/svgr/execute.svg';
// @ts-ignore
import { ReactComponent as DeleteSectionSvg } from '@/svgr/DeleteSection.svg';
// @ts-ignore
import { ReactComponent as AddSectionSvg } from '@/svgr/AddSection.svg';
import { ReactComponent as SnippetSvg } from '@/svgr/Snippet.svg';

import { ReactComponent as CompileSvg } from '@/svgr/Compile.svg';
import { ReactComponent as ExpainSvg } from '@/svgr/Expain.svg';
import { ReactComponent as FormatSvg } from '@/svgr/Format.svg';
import { ReactComponent as LintSvg } from '@/svgr/lintIcon.svg';

export enum IConStatus {
  INIT,
  RUNNING,
  DISABLE,
  ACTIVE,
}

export interface IStatefulIconProps {
  status: IConStatus;
  iconProps?: any;
}

export const commonIconLoadingStyle = {
  outline: '5px solid #E6F7FF',
  background: '#E6F7FF',
  color: '#3fa3ff',
};

const iconMap: {
  [key: string]: ComponentClass<IStatefulIconProps> | FunctionComponent<IStatefulIconProps>;
} = {
  SQL_RUN: commonIcon({ component: StartSvg }),
  SQL_RUN_SECTION: commonIcon({ component: ExecuteSectionSvg }),
  SQL_COMMIT: commonIcon({ component: SubmitSvg }),
  SQL_ROLLBACK: commonIcon({ component: RollbackSvg }),
  SQL_STOP: commonIcon({ component: TerminationSvg }),
  TEXT_UPPERCASE: commonIcon({ component: CapitalizedSvg }),
  TEXT_LOWERCASE: commonIcon({ component: LowercaseSvg }),
  TEXT_FIRST_UPPERCASE: commonIcon({ component: UppercasingSvg }),
  TEXT_INDENT: commonIcon({ type: MenuUnfoldOutlined }),
  TEXT_UN_INDENT: commonIcon({ type: MenuFoldOutlined }),
  TEXT_COMMENT: commonIcon({ component: AddNoteSvg }),
  TEXT_UN_COMMENT: commonIcon({ component: DeleleNoteSvg }),
  PL_RUN: commonIcon({ type: PlayCircleOutlined }),
  PL_COMPILE: commonIcon({ type: CompileSvg }),
  PL_AUTO_RUN: commonIcon({ component: AutomaticRunSvg }),
  PL_STEP_IN: commonIcon({ component: StepInSvg }),
  PL_STEP_OUT: commonIcon({ component: StepOutSvg }),
  PL_STEP_SKIP: commonIcon({ component: StepOverSvg }),
  GRAMMER_HELP: commonIcon({ type: 'book' }),
  ADD_SNIPPET_SECTION: commonIcon({ component: AddSectionSvg }),
  REMOVE_SNIPPET_SECTION: commonIcon({ component: DeleteSectionSvg }),
  ELLIPSIS_MENU: commonIcon({ type: EllipsisOutlined }),
  SNIPPET: commonIcon({ component: SnippetSvg }),
  EXPAIN: commonIcon({ component: ExpainSvg }),
  FORMAT: commonIcon({ component: FormatSvg }),
  LINT: commonIcon({ component: LintSvg }),
};

export default iconMap;

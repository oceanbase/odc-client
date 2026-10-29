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

import React, { useContext } from 'react';
import PrimaryConstaint from './Primary';
import MViewContext from '../context/MaterializedViewContext';

interface IProps {
  modified?: boolean;
}

const Constraint: React.FC<IProps> = (props) => {
  const { modified } = props;
  const mviewContext = useContext(MViewContext);
  const { session, columns, primaryConstraints, setPrimaryConstraints } = mviewContext;

  return (
    <PrimaryConstaint
      session={session}
      columns={columns}
      primaryConstraints={primaryConstraints}
      setPrimaryConstraints={setPrimaryConstraints}
      editMode={false}
      modified={modified}
    />
  );
};
export default Constraint;

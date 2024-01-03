/*
 * Copyright 2024 OceanBase
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

import Icon from '@ant-design/icons';

const LoadingSvg = () => (
  <svg
    version="1.1"
    id="dc-spinner"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="1em"
    height="1em"
    stroke="currentColor"
    viewBox="3 3 34 34"
    preserveAspectRatio="xMinYMin meet"
  >
    <path
      strokeWidth="1"
      strokeMiterlimit="10"
      d="M5.203,20
			c0-8.159,6.638-14.797,14.797-14.797V5C11.729,5,5,11.729,5,20s6.729,15,15,15v-0.203C11.841,34.797,5.203,28.159,5.203,20z"
      transform="rotate(278.217 20 20)"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 20 20"
        to="360 20 20"
        calcMode="spline"
        keySplines="0.2, 0.2, 0.2, 0.2"
        keyTimes="0;1"
        dur="1.2s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const iconLoading = (props) => <Icon component={LoadingSvg} {...props} />;

export default iconLoading;

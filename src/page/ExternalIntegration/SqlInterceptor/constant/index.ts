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

import { formatMessage } from '@/util/intl';
export const APPROVAL_TEMPLATE = `# This is a template for integrating a custom approval system.
# You must fill in all required fields according to the regulation to adapt to your approval system.


# Approval timeout in seconds
# ODC will actively terminate the external process instance if this time is exceeded
approvalTimeoutSeconds: 86400

# HTTP configurations
http:
  # HTTP connection timeout in second
  connectTimeoutSeconds: 5
  # HTTP socket timeout in second
  socketTimeoutSeconds: 30

# API configurations
api:
  # API configurations used to start a process instance
  start:
    # Request method, supported values: GET | POST | PUT | PATCH
    method: ~
    # Request URI
    url: ~
    # Request headers, the format is: <key: value>
    headers:
      # Sample of headers
      Content-Type: application/json;charset=UTF-8
      Accept: application/json
    # Request query parameters, the format is: <key: value>
    queryParameters: ~
    # Request body
    body:
      # Type of request body, supported values: FORM_DATA | RAW
      type: RAW
      # Content of request body, the format is: <String> for RAW type or <key: value> for FORM_DATA type
      # Sample of request content in type of RAW
      content: |-
        {
          "userId": "\${user.id}",
          "userName": "\${user.name}",
          "taskType": "\${task.type}",
          "connection": "\${connection.name}",
          "tenant": "\${connection.tenant}"
        }
    # Mark whether the request body is encrypted
    requestEncrypted: false
    # Expression to judge whether the request is successful based on the response body analysis, using the SPEL syntax
    requestSuccessExpression: '[success] == true'
    # Mark whether the response body is encrypted
    responseEncrypted: false
    # Expression to extract ID of process instance created by the external system based on the response body analysis, using the SPEL syntax
    extractInstanceIdExpression: '[content][processInstanceId]'
  # API configurations used to query the status of a process instance
  # Usage of the parameter with the same name is consistent with that described above
  status:
    method: ~
    url: ~
    headers: ~
    queryParameters: ~
    body:
      type: FORM_DATA
      # Sample of request content in type of FORM_DATA
      content:
        processInstanceId: \${process.instance.id}
        authKey: this-is-an-example
    requestEncrypted: false
    requestSuccessExpression: '[success] == true'
    responseEncrypted: false
    # Expression to judge that the process instance is waiting for approval based on the response body analysis, using the SPEL syntax
    processPendingExpression: '[content][processInstanceStatus] == "RUNNING"'
    # Expression to judge that the process instance is approved based on the response body analysis, using the SPEL syntax
    processApprovedExpression: '[content][outResult] == "APPROVED"'
    # Expression to judge that the process instance is rejected based on the response body analysis, using the SPEL syntax
    processRejectedExpression: '[content][outResult] == "REJECTED"'
    # Expression to judge that the process instance is terminated based on the response body analysis, using the SPEL syntax
    processTerminatedExpression: '[content][processInstanceStatus]=="TERMINATED"'
  # API configurations used to cancel a process instance
  # Usage of the parameter with the same name is consistent with that described above
  cancel:
    method: ~
    url: ~
    headers: ~
    queryParameters: ~
    body:
      type: RAW
      # Sample of request content in type of RAW
      content: |-
        {
          "processInstanceId": "\${processInstanceId}"
        }
    requestEncrypted: false
    requestSuccessExpression: '[success] == true'
    responseEncrypted: false

# Advanced parameters
advanced:
  # Expression to build URL for jumping to external system to view ticket details
  hyperlinkExpression: http://localhost:5678/instanceDetails/?procInsId=\${process.instance.id}
`;

export const SQL_INTERCEPTOR_TEMPLATE = formatMessage({
  id: 'odc.SqlInterceptor.constant.ThisIsATemplateFor.1',
});

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
    # Request method, supported values: GET ｜ POST ｜ PUT ｜ PATCH
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
    extractInstanceIdExpression: '[content].[processInstanceId]'
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

export const SQL_INTERCEPTOR_TEMPLATE = `# This is a template for integrating a custom SQL interceptor system.
# You must fill in the required fields according to the regulation to adapt to your SQL interceptor system.


# HTTP configurations
http:
  # HTTP connection timeout in second
  connectTimeoutSeconds: 5
  # HTTP socket timeout in second
  socketTimeoutSeconds: 30

# API configurations
api:
  # API configurations used to check the SQL content
  check:
    # Request method, supported values: GET ｜ POST ｜ PUT ｜ PATCH
    method: ~
    # Request URI
    url: ~
    # Request headers, the format is: <key: value>
    headers:
      # Sample of request headers
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
          "sqlStatement":"\${sql.content}"
        }
    # Mark whether the request body is encrypted
    requestEncrypted: false
    # Expression to judge whether the request is successful based on the response body analysis, using the SPEL syntax
    requestSuccessExpression: '[resultCode] == 0'
    # Mark whether the response body is encrypted
    responseEncrypted: false
    # Expression to judge whether the SQL to be executed is in the white list based on the response body analysis, using the SPEL syntax
    inWhiteListExpression: '[checkResult] == 1'
    # Expression to judge whether the SQL to be executed is in the black list based on the response body analysis, using the SPEL syntax
    inBlackListExpression: '[checkResult] == 2'
    # Expression to judge whether the SQL to be executed need review based on the response body analysis, using the SPEL syntax
    needReviewExpression: '[checkResult] == 3' 
`;

resource "aws_api_gateway_vpc_link" "apigateway" {
    name = "csc2-link"
    target_arns = [aws_lb.nlb.arn]
}

resource "aws_api_gateway_rest_api" "apigateway" {
    name = "csc2-gateway"
    description = "API gateway for CSC assignment 2"
    # body = data.template_file.aws_api_swagger.rendered

    endpoint_configuration {
        types = ["REGIONAL"]
    }

    binary_media_types = [ "multipart/form-data" ]
}

# proxying
resource "aws_api_gateway_resource" "default" {
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    parent_id = aws_api_gateway_rest_api.apigateway.root_resource_id
    path_part = "{proxy+}"
}

resource "aws_api_gateway_method" "default" {
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    resource_id = aws_api_gateway_resource.default.id

    http_method = "ANY"
    authorization = "NONE"

    request_parameters = {
        "method.request.path.proxy" = true
    }
}

resource "aws_api_gateway_integration" "default" {
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    resource_id = aws_api_gateway_resource.default.id
    http_method = aws_api_gateway_method.default.http_method

    type = "HTTP_PROXY"
    uri = "http://${aws_lb.nlb.dns_name}/{proxy}"
    integration_http_method = "ANY"

    connection_type = "VPC_LINK"
    connection_id = aws_api_gateway_vpc_link.apigateway.id

    cache_key_parameters = ["method.request.path.proxy"]

    # timeout_milliseconds = 29000
    request_parameters = {
        "integration.request.path.proxy" = "method.request.path.proxy"
    }

}

# lambda
resource "aws_api_gateway_resource" "lambda" {
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    parent_id = aws_api_gateway_rest_api.apigateway.root_resource_id
    path_part = "lambda"
}

resource "aws_api_gateway_resource" "lambdaHash" {
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    parent_id = aws_api_gateway_resource.lambda.id
    path_part = "hash"
}

resource "aws_api_gateway_method" "lambdaHash" {
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    resource_id = aws_api_gateway_resource.lambdaHash.id

    http_method = "POST"
    authorization = "NONE"

    # request_parameters = {
    #     "method.request.path.proxy" = true
    # }
}

resource "aws_api_gateway_integration" "lambdaHash" {
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    resource_id = aws_api_gateway_resource.lambdaHash.id
    http_method = aws_api_gateway_method.lambdaHash.http_method

    type = "AWS"
    integration_http_method = "POST"
    uri = aws_lambda_function.hashFunction.invoke_arn

}

# have to recreate method manually even though it is the exact same display on the dashboard
resource "aws_api_gateway_method_response" "lambdaHashSuccess" {
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    resource_id = aws_api_gateway_resource.lambdaHash.id
    http_method = aws_api_gateway_method.lambdaHash.http_method
    status_code = "200"

    response_models = {
        "application/json" = "Empty"
    }
}

# resource "aws_api_gateway_integration_response" "lambdaHash" {
#     rest_api_id = aws_api_gateway_rest_api.apigateway.id
#     resource_id = aws_api_gateway_resource.lambdaHash.id
#     http_method = aws_api_gateway_method.lambdaHash.http_method
#     status_code = aws_api_gateway_method_response.lambdaHashSuccess.status_code

    
# }

resource "aws_api_gateway_deployment" "default" {
    depends_on = [
        aws_api_gateway_integration.default,
        aws_api_gateway_integration.lambdaHash
    ]
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
}

resource "aws_api_gateway_stage" "default" {
    deployment_id = aws_api_gateway_deployment.default.id
    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    stage_name  = "deployment"

    access_log_settings {
        destination_arn = aws_cloudwatch_log_group.accessLogs.arn
        format = "$context.identity.sourceIp $context.identity.caller $context.identity.user [$context.requestTime] \"$context.httpMethod $context.resourcePath $context.protocol\" $context.status $context.responseLength $context.requestId"
    }
}

/*
    cloudwatch logging
*/
resource "aws_api_gateway_account" "name" {
    cloudwatch_role_arn = aws_iam_role.cloudwatch.arn
}

# specifically for access logging
resource "aws_cloudwatch_log_group" "accessLogs" {
    name = "accessLogs"
}

resource "aws_iam_role" "cloudwatch" {
    name = "api_gateway_cloudwatch_global"

    assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "apigateway.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
}

resource "aws_iam_role_policy" "cloudwatch" {
    role = aws_iam_role.cloudwatch.id

    policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams",
                "logs:PutLogEvents",
                "logs:GetLogEvents",
                "logs:FilterLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}
resource "aws_iam_policy_attachment" "api_gateway_logs" {
    name = "api_gateway_logs_policy_attach"
    roles = [aws_iam_role.cloudwatch.id]
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}  

resource "aws_api_gateway_method_settings" "default" {
    depends_on = [ aws_iam_policy_attachment.api_gateway_logs ]

    rest_api_id = aws_api_gateway_rest_api.apigateway.id
    stage_name  = aws_api_gateway_stage.default.stage_name
    method_path = "*/*"

    settings {
        metrics_enabled = true
        logging_level = "INFO"
        data_trace_enabled = true
    }
}

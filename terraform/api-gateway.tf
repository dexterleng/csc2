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
}

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

resource "aws_api_gateway_deployment" "default" {
    depends_on = [
        "aws_api_gateway_integration.default"
    ]
    rest_api_id = "${aws_api_gateway_rest_api.apigateway.id}"
    stage_name  = "deployment"
}

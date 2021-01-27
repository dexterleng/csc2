resource "aws_api_gateway_vpc_link" "apigateway" {
    name = "csc2-link"
    target_arns = [aws_lb.nlb.arn]
}

# TODO: create the /{proxy+} endpoint here and assign the stage variables
resource "aws_api_gateway_rest_api" "apigateway" {
    name = "csc2-gateway"
    description = "API gateway for CSC assignment 2"
    body = data.template_file.aws_api_swagger.rendered

    endpoint_configuration {
        types = ["REGIONAL"]
    }
}


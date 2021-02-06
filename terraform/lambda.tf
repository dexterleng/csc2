resource "aws_iam_role" "iam_for_lambda" {
	name = "iam_for_lambda"

	assume_role_policy = <<EOF
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Action": "sts:AssumeRole",
			"Principal": {
				"Service": "lambda.amazonaws.com"
			},
			"Effect": "Allow",
			"Sid": ""
		}
	]
}
EOF
}

resource "aws_lambda_function" "hashFunction" {
	function_name = "hashFunction"
	filename = var.hash_function_lambda
	role = aws_iam_role.iam_for_lambda.arn
	handler = "index.handler"

	source_code_hash = filebase64sha256(var.hash_function_lambda)

	runtime = "nodejs12.x"

	# environment {
	# 	variables = {
	# 		foo = "bar"
	# 	}
	# }
}
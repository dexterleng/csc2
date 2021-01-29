variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_session_token" {}
variable "swagger_file_path" {}
# variable "aws_key_path" {}
# variable "aws_key_name" {}

variable "aws_region" {
    description = "EC2 Region for the VPC"
    default = "us-east-1"
}

variable "amis" {
    description = "AMIs by region"
    default = {
        us-east-1 = "ami-0885b1f6bd170450c"
    }
}

variable "vpc_cidr" {
    description = "CIDR for the whole VPC"
    default = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
    description = "CIDR for the Public Subnet"
    default = "10.0.0.0/24"
}

variable "private_subnet_cidr" {
    description = "CIDR for the Private Subnet"
    default = "10.0.1.0/24"
}

variable "private_subnet1_cidr" {
    description = "CIDR for the Second Private Subnet"
    default = "10.0.2.0/24"
}

# data "template_file" "aws_api_swagger" {
#     template = file(var.swagger_file_path)
# }

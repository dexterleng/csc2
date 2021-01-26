# Setup

## Terraform
Make sure [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli?in=terraform/aws-get-started) is installed and setup

1. `cd ./terraform`
2. Create a file named: `terraform.tfvars` with the following template
```
aws_access_key=""
aws_secret_key=""
aws_session_token=""
```
3. Go to vocareum dashboard and navigate to `Account Details > AWS CLI` then fill out `terraform.tfvars`

### Useful commands

#### Performing apply or first time setup
`terraform apply -var-file=terraform.tfvars`

#### Extract private key for ec2 instance
`terraform output private_key > ssh.pem`\
Make sure to remove the line padding from the top and bottom

#### Connecting to ec2 instance
Go to ec2 dashboard and click on the instance and copy the public ip
`ssh ubuntu@PUBLIC_IP -i ssh.pem`

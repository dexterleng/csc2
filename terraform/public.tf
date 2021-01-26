/*
    Web Servers
*/
resource "aws_security_group" "web" {
    name = "vpc_web"
    description = "Allow incoming HTTP connections."

    ingress {
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress {
        from_port = 443
        to_port = 443
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    ingress {
        from_port = -1
        to_port = -1
        protocol = "icmp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress { # SQL Server
        from_port = 1433
        to_port = 1433
        protocol = "tcp"
        cidr_blocks = [var.private_subnet_cidr]
    }
    egress { # MySQL
        from_port = 3306
        to_port = 3306
        protocol = "tcp"
        cidr_blocks = [var.private_subnet_cidr]
    }

    vpc_id = aws_vpc.default.id

    tags = {
        Name = "WebServerSG"
    }
}

resource "tls_private_key" "csc2-app" {
    algorithm = "RSA"
    rsa_bits  = 4096
}

resource "aws_key_pair" "csc2-app" {
    key_name   = "csc2-app"
    public_key = tls_private_key.csc2-app.public_key_openssh
}

resource "aws_instance" "csc2-app" {
    ami = lookup(var.amis, var.aws_region)
    availability_zone = "us-east-1a"
    instance_type = "t2.micro"
    key_name = aws_key_pair.csc2-app.key_name
    vpc_security_group_ids = [aws_security_group.web.id]
    subnet_id = aws_subnet.csc2-public.id
    associate_public_ip_address = true
    source_dest_check = false


    tags = {
        Name = "Web Server 1"
    }
}

output "private_key" {
    value = tls_private_key.csc2-app.private_key_pem
}

resource "aws_eip" "csc2-app" {
    instance = aws_instance.csc2-app.id
    vpc = true
}

/*
    network load balancer for public ec2 instances
*/
resource "aws_lb" "nlb" {
    name = "csc2-nlb"
    internal = true
    load_balancer_type = "network"
    # subnets = aws_subnet.csc2-public.id

    # enable_deletion_protection = true

    subnet_mapping {
        subnet_id = aws_subnet.csc2-public.id
    }

}

resource "aws_lb_target_group" "nlb" {
    name     = "csc2-app"
    port     = 80
    protocol = "HTTP"
    vpc_id   = aws_vpc.default.id
}
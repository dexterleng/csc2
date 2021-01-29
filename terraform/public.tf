/*
    Web Servers
*/
resource "aws_security_group" "web" {
    name = "vpc_web"
    description = "Allow incoming HTTP connections."

    ingress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
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

    egress { # MySQL
        from_port = 3306
        to_port = 3306
        protocol = "tcp"
        cidr_blocks = [var.private_subnet_cidr]
    }
    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
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

resource "aws_lb_listener" "nlb" {
    load_balancer_arn = aws_lb.nlb.arn
    port = "80"
    protocol = "TCP"

    default_action {
        type = "forward"
        target_group_arn = aws_lb_target_group.nlb.arn
    }
}

resource "aws_lb_target_group_attachment" "test" {
    target_group_arn = aws_lb_target_group.nlb.arn
    target_id = aws_instance.csc2-app.id
    port = 80
}


resource "aws_lb_target_group" "nlb" {
    name = "csc2-app"
    port = 80
    protocol = "TCP"
    target_type = "instance"
    vpc_id   = aws_vpc.default.id
}

resource "aws_s3_bucket" "s3" {
  bucket = "csc2-bucket"
  acl    = "private"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

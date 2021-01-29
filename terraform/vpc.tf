resource "aws_vpc" "default" {
    cidr_block = var.vpc_cidr
    enable_dns_hostnames = true
    tags = {
        Name = "csc2-vpc"
    }
}

resource "aws_internet_gateway" "default" {
    vpc_id = aws_vpc.default.id
}

/*
    NAT Instance
*/
resource "aws_security_group" "nat" {
    name = "csc2-public"
    description = "Allow traffic to pass from the private subnet to the internet"

    ingress {
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = [var.private_subnet_cidr]
    }
    ingress {
        from_port = 443
        to_port = 443
        protocol = "tcp"
        cidr_blocks = [var.private_subnet_cidr]
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

    egress {
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    egress {
        from_port = 443
        to_port = 443
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    egress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = [var.vpc_cidr]
    }
    egress {
        from_port = -1
        to_port = -1
        protocol = "icmp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    vpc_id = aws_vpc.default.id

    tags = {
        Name = "NATSG"
    }
}

/*
resource "aws_instance" "nat" {
    ami = "ami-30913f47" # this is a special ami preconfigured to do NAT
    availability_zone = "eu-west-1a"
    instance_type = "m1.small"
    key_name = var.aws_key_name
    vpc_security_group_ids = [aws_security_group.nat.id]
    subnet_id = aws_subnet.csc2-public.id
    associate_public_ip_address = true
    source_dest_check = false

    tags = {
        Name = "VPC NAT"
    }
}
*/

resource "aws_eip" "nat" {
    # instance = aws_instance.nat.id
    vpc = true
}

resource "aws_nat_gateway" "nat" {
    allocation_id = aws_eip.nat.id
    subnet_id = aws_subnet.csc2-public.id
    
    tags = {
        Name = "VPC NAT"
    }
}


/*
    Public Subnet
*/
resource "aws_subnet" "csc2-public" {
    vpc_id = aws_vpc.default.id

    cidr_block = var.public_subnet_cidr
    availability_zone = "us-east-1a"

    tags = {
        Name = "Public Subnet"
    }
}

resource "aws_route_table" "csc2-public" {
    vpc_id = aws_vpc.default.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.default.id
    }

    tags = {
        Name = "Public Subnet"
    }
}

resource "aws_route_table_association" "csc2-public" {
    subnet_id = aws_subnet.csc2-public.id
    route_table_id = aws_route_table.csc2-public.id
}

/*
    Private Subnet
*/
resource "aws_subnet" "csc2-private" {
    vpc_id = aws_vpc.default.id

    cidr_block = var.private_subnet_cidr
    availability_zone = "us-east-1a"

    tags = {
        Name = "Private Subnet"
    }
}

resource "aws_subnet" "csc2-private1" {
    vpc_id = aws_vpc.default.id

    cidr_block = var.private_subnet1_cidr
    availability_zone = "us-east-1b"

    tags = {
        Name = "Private Subnet"
    }
}

resource "aws_route_table" "csc2-private" {
    vpc_id = aws_vpc.default.id

    route {
        cidr_block = "0.0.0.0/0"
        nat_gateway_id = aws_nat_gateway.nat.id
    }

    tags = {
        Name = "Private Subnet"
    }
}

resource "aws_route_table_association" "csc2-private" {
    subnet_id = aws_subnet.csc2-private.id
    route_table_id = aws_route_table.csc2-private.id
}

resource "aws_route_table_association" "csc2-private1" {
    subnet_id = aws_subnet.csc2-private1.id
    route_table_id = aws_route_table.csc2-private.id
}

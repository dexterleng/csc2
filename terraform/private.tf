/*
    Database
*/
resource "aws_security_group" "db" {
    name = "vpc_db"
    description = "Allow incoming database connections."

    ingress {
        from_port = 3306
        to_port = 3306
        protocol = "tcp"
        security_groups = [aws_security_group.web.id]
    }

    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = [var.vpc_cidr]
    }
    ingress {
        from_port = -1
        to_port = -1
        protocol = "icmp"
        cidr_blocks = [var.vpc_cidr]
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

    vpc_id = aws_vpc.default.id

    tags = {
        Name = "DBServerSG"
    }
}

resource "aws_db_subnet_group" "default" {
    name       = "csc2-db-subnet"
    subnet_ids = [aws_subnet.csc2-private.id, aws_subnet.csc2-private1.id]
}

resource "aws_db_instance" "db" {
    name = "csc2db"
    vpc_security_group_ids = [aws_security_group.db.id]

    engine = "mysql"
    instance_class = "db.t2.micro"

    allocated_storage = 20
    db_subnet_group_name = aws_db_subnet_group.default.id

    username = "admin"
    password = "VA5ptkSpp5sf"

    tags = {
        Name = "csc2-db"
    }

    # parameter_group_name = "default.mysql5.7"
}

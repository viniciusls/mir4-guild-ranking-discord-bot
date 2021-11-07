# Create EC2 Mongo Redis security group
resource "aws_security_group" "ec2_mongo_redis_sg" {
  count  = var.should_create_ec2 == "true"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "ec2_mongo_redis" {
  count                       = var.should_create_ec2 == "true"
  ami                         = var.ami_id
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  key_name                    = var.ec2_key_name
  security_groups = [
    aws_security_group.ec2_mongo_redis_sg[count.index].name
  ]

  credit_specification {
    cpu_credits = "unlimited"
  }

  root_block_device {
    volume_size = 10
    volume_type = "gp2"
  }

  tags = {
    Name = "EC2 Mongo Redis"
  }
}

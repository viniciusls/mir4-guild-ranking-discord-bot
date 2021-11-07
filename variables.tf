//----------------------------------------------------------------------
// Shared Variables
//----------------------------------------------------------------------
variable "region" {
  default = "sa-east-1"
}

variable "environment" {
  default = "prod"
}

variable "s3_bucket_name" {
  default = "mir4-guild-ranking-discord-bot-bucket"
}

variable "mongodb_personal_host" {
  description = "The personal host for MongoDB connection"
  type        = string
  sensitive   = true
  default     = ""
}

variable "mongodb_user" {
  description = "The username for MongoDB connection"
  type        = string
  sensitive   = true
}

variable "mongodb_password" {
  description = "The password for MongoDB connection"
  type        = string
  sensitive   = true
}

variable "mongodb_database" {
  description = "The database for MongoDB connection"
  type        = string
  sensitive   = true
}

variable "mongodb_collection" {
  description = "The collection for querying analysis results in MongoDB"
  type        = string
}

variable "redis_personal_host" {
  description = "The personal host for Redis connection"
  type        = string
  sensitive   = true
  default     = ""
}

variable "redis_user" {
  description = "The username for Redis connection"
  type        = string
  sensitive   = true
}

variable "redis_password" {
  description = "The password for Redis connection"
  type        = string
  sensitive   = true
}

variable "redis_port" {
  description = "The port for Redis connection"
  type        = string
  default     = "6379"
  sensitive   = true
}

variable "ec2_key_name" {
  description = "The key name for Key/Pair auth on EC2 instance"
  type        = string
  sensitive   = true
}

variable "should_create_ec2" {
  default = "true"
}
variable "ami_id" {}
variable "vpc_id" {}

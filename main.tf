# Simple AWS Lambda Terraform Example
# requires 'index.js' in the same directory
# to test: run `terraform plan`
# to deploy: run `terraform apply`

terraform {
  backend "s3" {
    bucket = "viniciusls-terraform"
    key    = "mir4-guild-ranking-discord-bot/terraform.tfstate"
    region = "sa-east-1"
  }
}

provider "aws" {
  region = var.region
}

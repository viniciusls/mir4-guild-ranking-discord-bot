data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = path.module
  output_path = "./lambda/handler/handler_lambda.zip"
  excludes = [
    ".gitignore",
    "handler_lambda.zip",
    "main.tf",
    "outputs.tf",
    "variables.tf",
    "yarn.lock"
  ]
}

resource "aws_iam_role" "iam_for_handler_lambda" {
  name = "mir4-guild-ranking-discord-bot-iam_for_handler_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sts:AssumeRole"
        ]
        Principal = {
          Service : "lambda.amazonaws.com"
        }
        Effect = "Allow"
      },
    ]
  })

  managed_policy_arns = [
    data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn,
    aws_iam_policy.file_read_policy.arn,
    aws_iam_policy.file_upload_policy.arn
  ]
}

data "aws_iam_policy" "AWSLambdaBasicExecutionRole" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "handler_lambda" {
  filename         = "./lambda/handler/handler_lambda.zip"
  function_name    = "handler_lambda"
  role             = aws_iam_role.iam_for_handler_lambda.arn
  handler          = "app.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs14.x"
  timeout          = 10
  memory_size      = 128

  environment_variables = {
    ENVIRONMENT                         = var.environment
    MONGODB_USER                        = var.mongodb_user
    MONGODB_PASSWORD                    = var.mongodb_password
    MONGODB_HOST                        = var.should_create_ec2 == "true" ? aws_instance.ec2_mongo_redis.public_dns : var.mongodb_personal_host
    MONGODB_DATABASE                    = var.mongodb_database
    MONGODB_COLLECTION                  = var.mongodb_collection
    S3_BUCKET_NAME                      = var.s3_bucket_name
    REDIS_HOST                          = var.should_create_ec2 == "true" ? aws_instance.ec2_mongo_redis.public_dns : var.redis_personal_host
    REDIS_PORT                          = var.redis_port
    REDIS_USER                          = var.redis_user
    REDIS_PASSWORD                      = var.redis_password
  }
}

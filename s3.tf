resource "aws_s3_bucket" "file_upload_bucket" {
  bucket = var.s3_bucket_name
  acl    = "private"

  tags = {
    Name        = var.s3_bucket_name
    Environment = var.environment
  }
}

resource "aws_iam_policy" "file_upload_policy" {
  name        = "${var.s3_bucket_name}-file-upload-policy"
  path        = "/"
  description = "s3 file upload policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:s3:::${var.s3_bucket_name}/*"
      },
    ]
  })
}

resource "aws_iam_policy" "file_read_policy" {
  name        = "${var.s3_bucket_name}-file-read-policy"
  path        = "/"
  description = "s3 file upload policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:GetObject",
        ]
        Effect   = "Allow"
        Resource = "arn:aws:s3:::${var.s3_bucket_name}/*"
      },
    ]
  })
}

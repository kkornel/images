#!/bin/sh
set -eu

BUCKET_NAME="${AWS_S3_BUCKET}"
REGION="${INIT_AWS_REGION}"

echo "Ensuring S3 bucket '${BUCKET_NAME}' exists in LocalStack for region '${REGION}'..."

if awslocal --region "${REGION}" s3api head-bucket --bucket "${BUCKET_NAME}" >/dev/null 2>&1; then
  echo "Bucket '${BUCKET_NAME}' already exists."
  exit 0
fi

awslocal --region "${REGION}" s3api create-bucket \
  --bucket "${BUCKET_NAME}" \
  --create-bucket-configuration "LocationConstraint=${REGION}"

echo "Bucket '${BUCKET_NAME}' is ready."

#!/bin/bash

# Function to check if all required environment variables are set
check_environment() {
    # Check if AWS_ACCESS_KEY_ID is set
    if [ -z "$AWS_ACCESS_KEY_ID" ]; then
        echo "AWS_ACCESS_KEY_ID is not set"
        exit 1
    fi

    # Check if AWS_SECRET_ACCESS_KEY is set
    if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        echo "AWS_SECRET_ACCESS_KEY is not set"
        exit 1
    fi

    # Check if AWS_DEFAULT_REGION is set
    if [ -z "$AWS_DEFAULT_REGION" ]; then
        echo "AWS_DEFAULT_REGION is not set"
        exit 1
    fi

    # Check if ECR_REPOSITORY is set
    if [ -z "$ECR_REPOSITORY" ]; then
        echo "ECR_REPOSITORY is not set"
        exit 1
    fi

    # Check if ECS_CLUSTER is set
    if [ -z "$ECS_CLUSTER" ]; then
        echo "ECS_CLUSTER is not set"
        exit 1
    fi

    # Check if ECS_SERVICE is set
    if [ -z "$ECS_SERVICE" ]; then
        echo "ECS_SERVICE is not set"
        exit 1
    fi
}

# Function to build Docker image for the application
build_docker_image() {
    # Build Docker image using docker build command
    docker build -t $ECR_REPOSITORY:latest .

    # Tag the image with ECR repository and version
    docker tag $ECR_REPOSITORY:latest $ECR_REPOSITORY:$VERSION
}

# Function to push Docker image to Amazon ECR
push_to_ecr() {
    # Authenticate Docker to Amazon ECR
    aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY

    # Push the Docker image to ECR repository
    docker push $ECR_REPOSITORY:latest
    docker push $ECR_REPOSITORY:$VERSION
}

# Function to update ECS service with the new Docker image
update_ecs_service() {
    # Update ECS task definition with new image URI
    sed -i.bak -e "s|{{ECR_REPOSITORY}}|$ECR_REPOSITORY:$VERSION|g" task-definition.json
    NEW_TASK_DEFINITION=$(aws ecs register-task-definition --cli-input-json file://task-definition.json)
    NEW_REVISION=$(echo $NEW_TASK_DEFINITION | jq --raw-output '.taskDefinition.revision')

    # Update ECS service to use the new task definition
    aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --task-definition $NEW_REVISION
}

# Function to run database migrations
run_database_migrations() {
    # Connect to the ECS cluster
    TASK_ARN=$(aws ecs run-task --cluster $ECS_CLUSTER --task-definition $MIGRATION_TASK_DEFINITION --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[$SUBNET],securityGroups=[$SECURITY_GROUP]}" --query 'tasks[0].taskArn' --output text)

    # Run database migration task
    aws ecs wait tasks-stopped --cluster $ECS_CLUSTER --tasks $TASK_ARN
    EXIT_CODE=$(aws ecs describe-tasks --cluster $ECS_CLUSTER --tasks $TASK_ARN --query 'tasks[0].containers[0].exitCode' --output text)

    if [ $EXIT_CODE -ne 0 ]; then
        echo "Database migration failed"
        exit 1
    fi
}

# Function to invalidate CloudFront cache for updated static assets
invalidate_cloudfront_cache() {
    # Create CloudFront invalidation for '/*' path
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
}

# Function to run smoke tests to verify deployment
run_smoke_tests() {
    # Wait for ECS service to stabilize
    aws ecs wait services-stable --cluster $ECS_CLUSTER --services $ECS_SERVICE

    # Run basic health check on the application endpoints
    HEALTH_CHECK_URL="https://$APPLICATION_URL/health"
    HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)

    if [ $HEALTH_STATUS -ne 200 ]; then
        echo "Health check failed"
        exit 1
    fi

    # Verify critical functionality is working
    # Add more smoke tests here
}

# Function to send deployment status notification
notify_deployment_status() {
    if [ $? -eq 0 ]; then
        # If deployment successful, send success notification
        aws sns publish --topic-arn $SNS_TOPIC_ARN --message "Deployment successful for version $VERSION"
    else
        # If deployment failed, send failure notification
        aws sns publish --topic-arn $SNS_TOPIC_ARN --message "Deployment failed for version $VERSION"
    fi
}

# Main function to orchestrate the deployment process
main() {
    check_environment
    build_docker_image
    push_to_ecr
    update_ecs_service
    run_database_migrations
    invalidate_cloudfront_cache
    run_smoke_tests
    notify_deployment_status
}

# Set -e to exit on error
set -e

# Call main function
main
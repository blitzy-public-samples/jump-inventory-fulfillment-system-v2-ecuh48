#!/bin/bash

# Set -e to exit on error
set -e

# Function to check if all required environment variables are set
check_environment() {
    # Check if DB_HOST is set
    [ -z "$DB_HOST" ] && echo "DB_HOST is not set" && exit 1
    # Check if DB_PORT is set
    [ -z "$DB_PORT" ] && echo "DB_PORT is not set" && exit 1
    # Check if DB_NAME is set
    [ -z "$DB_NAME" ] && echo "DB_NAME is not set" && exit 1
    # Check if DB_USER is set
    [ -z "$DB_USER" ] && echo "DB_USER is not set" && exit 1
    # Check if DB_PASSWORD is set
    [ -z "$DB_PASSWORD" ] && echo "DB_PASSWORD is not set" && exit 1
    # Check if AWS_ACCESS_KEY_ID is set
    [ -z "$AWS_ACCESS_KEY_ID" ] && echo "AWS_ACCESS_KEY_ID is not set" && exit 1
    # Check if AWS_SECRET_ACCESS_KEY is set
    [ -z "$AWS_SECRET_ACCESS_KEY" ] && echo "AWS_SECRET_ACCESS_KEY is not set" && exit 1
    # Check if AWS_DEFAULT_REGION is set
    [ -z "$AWS_DEFAULT_REGION" ] && echo "AWS_DEFAULT_REGION is not set" && exit 1
    # Check if S3_BUCKET is set
    [ -z "$S3_BUCKET" ] && echo "S3_BUCKET is not set" && exit 1
}

# Function to create a backup of the MongoDB database
create_backup() {
    # Generate timestamp for backup file name
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_DIR="backup_${TIMESTAMP}"
    BACKUP_FILE="${BACKUP_DIR}.tar.gz"

    # Use mongodump to create a backup of the database
    mongodump --host $DB_HOST --port $DB_PORT --db $DB_NAME --username $DB_USER --password $DB_PASSWORD --out $BACKUP_DIR

    # Compress the backup files into a single archive
    tar -czf $BACKUP_FILE $BACKUP_DIR
}

# Function to upload the backup file to Amazon S3
upload_to_s3() {
    # Use AWS CLI to upload the compressed backup file to S3
    aws s3 cp $BACKUP_FILE s3://$S3_BUCKET/$BACKUP_FILE

    # Verify the upload was successful
    if [ $? -eq 0 ]; then
        echo "Backup successfully uploaded to S3"
    else
        echo "Failed to upload backup to S3"
        exit 1
    fi
}

# Function to remove local backup files after successful upload
cleanup_local_backup() {
    # Remove the uncompressed backup directory
    rm -rf $BACKUP_DIR

    # Remove the compressed backup file
    rm $BACKUP_FILE
}

# Function to remove old backups from S3 to maintain storage limits
rotate_backups() {
    # List all backups in S3 bucket
    BACKUPS=$(aws s3 ls s3://$S3_BUCKET/ | grep backup_ | sort -r)

    # Keep the most recent 7 daily backups
    DAILY_KEEP=7
    # Keep the most recent 4 weekly backups
    WEEKLY_KEEP=4
    # Keep the most recent 3 monthly backups
    MONTHLY_KEEP=3

    # Counter for each type of backup
    DAILY_COUNT=0
    WEEKLY_COUNT=0
    MONTHLY_COUNT=0

    # Iterate through backups
    while read -r line; do
        BACKUP_DATE=$(echo $line | awk '{print $4}' | cut -d_ -f2 | cut -d. -f1)
        
        # Check if it's a daily, weekly, or monthly backup
        if [[ $BACKUP_DATE == *"01"* ]]; then
            if [ $MONTHLY_COUNT -lt $MONTHLY_KEEP ]; then
                MONTHLY_COUNT=$((MONTHLY_COUNT+1))
            else
                aws s3 rm s3://$S3_BUCKET/$(echo $line | awk '{print $4}')
            fi
        elif [[ $BACKUP_DATE == *"Sun"* ]]; then
            if [ $WEEKLY_COUNT -lt $WEEKLY_KEEP ]; then
                WEEKLY_COUNT=$((WEEKLY_COUNT+1))
            else
                aws s3 rm s3://$S3_BUCKET/$(echo $line | awk '{print $4}')
            fi
        else
            if [ $DAILY_COUNT -lt $DAILY_KEEP ]; then
                DAILY_COUNT=$((DAILY_COUNT+1))
            else
                aws s3 rm s3://$S3_BUCKET/$(echo $line | awk '{print $4}')
            fi
        fi
    done <<< "$BACKUPS"
}

# Function to send notification about backup status
notify_backup_status() {
    # If backup successful, send success notification
    if [ $? -eq 0 ]; then
        echo "Backup completed successfully" | mail -s "Backup Success" admin@example.com
    # If backup failed, send failure notification
    else
        echo "Backup failed" | mail -s "Backup Failure" admin@example.com
    fi
}

# Main function to orchestrate the backup process
main() {
    # Call check_environment
    check_environment

    # Call create_backup
    create_backup

    # Call upload_to_s3
    upload_to_s3

    # Call cleanup_local_backup
    cleanup_local_backup

    # Call rotate_backups
    rotate_backups

    # Call notify_backup_status
    notify_backup_status
}

# Call main function
main
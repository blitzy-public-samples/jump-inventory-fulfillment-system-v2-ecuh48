#!/bin/bash

# Set -e to exit on error
set -e

# Function to check if required dependencies are installed
check_dependencies() {
    echo "Checking dependencies..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "Node.js is not installed. Please install Node.js and try again."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "Docker is not installed. Please install Docker and try again."
        exit 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    fi
    
    echo "All dependencies are installed."
}

# Function to set up the environment variables
setup_environment() {
    echo "Setting up environment variables..."
    
    # Copy .env.example to .env if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env
        echo ".env file created. Please fill in the required variables."
    else
        echo ".env file already exists."
    fi
    
    # Prompt user to fill in required environment variables
    echo "Please fill in the required environment variables in the .env file."
    read -p "Press enter when you're done."
}

# Function to install project dependencies
install_dependencies() {
    echo "Installing project dependencies..."
    
    # Run npm install for backend dependencies
    echo "Installing backend dependencies..."
    cd backend && npm install
    cd ..
    
    # Run npm install for frontend dependencies
    echo "Installing frontend dependencies..."
    cd frontend && npm install
    cd ..
}

# Function to set up the MongoDB database
setup_database() {
    echo "Setting up MongoDB database..."
    
    # Start MongoDB container using docker-compose
    docker-compose up -d mongodb
    
    # Wait for MongoDB to be ready
    echo "Waiting for MongoDB to be ready..."
    sleep 10
    
    # Run database initialization script
    echo "Initializing database..."
    node scripts/init-db.js
}

# Function to set up Shopify integration
setup_shopify() {
    echo "Setting up Shopify integration..."
    
    # Prompt user for Shopify API credentials
    read -p "Enter Shopify API Key: " shopify_api_key
    read -p "Enter Shopify API Secret: " shopify_api_secret
    read -p "Enter Shopify Shop Name: " shopify_shop_name
    
    # Update .env file with Shopify credentials
    sed -i "s/SHOPIFY_API_KEY=.*/SHOPIFY_API_KEY=$shopify_api_key/" .env
    sed -i "s/SHOPIFY_API_SECRET=.*/SHOPIFY_API_SECRET=$shopify_api_secret/" .env
    sed -i "s/SHOPIFY_SHOP_NAME=.*/SHOPIFY_SHOP_NAME=$shopify_shop_name/" .env
}

# Function to set up Sendle integration
setup_sendle() {
    echo "Setting up Sendle integration..."
    
    # Prompt user for Sendle API credentials
    read -p "Enter Sendle API Key: " sendle_api_key
    read -p "Enter Sendle Sandbox Mode (true/false): " sendle_sandbox_mode
    
    # Update .env file with Sendle credentials
    sed -i "s/SENDLE_API_KEY=.*/SENDLE_API_KEY=$sendle_api_key/" .env
    sed -i "s/SENDLE_SANDBOX_MODE=.*/SENDLE_SANDBOX_MODE=$sendle_sandbox_mode/" .env
}

# Function to run database migrations
run_migrations() {
    echo "Running database migrations..."
    
    # Execute database migration scripts
    node scripts/run-migrations.js
}

# Function to generate test data for development
generate_test_data() {
    echo "Generating test data..."
    
    # Run script to generate sample orders, inventory items, and users
    node scripts/generate-test-data.js
}

# Function to set up development environment
setup_development_environment() {
    echo "Setting up development environment..."
    
    # Install development dependencies
    npm install --only=dev
    
    # Set up pre-commit hooks
    npx husky install
    
    # Configure ESLint and Prettier
    cp .eslintrc.example .eslintrc.json
    cp .prettierrc.example .prettierrc.json
}

# Main function to orchestrate the setup process
main() {
    check_dependencies
    setup_environment
    install_dependencies
    setup_database
    setup_shopify
    setup_sendle
    run_migrations
    generate_test_data
    setup_development_environment
    
    echo "Setup completed successfully!"
}

# Call main function
main
# Deployment Guide

## Local Testing

```bash
# Build Docker image
docker build -t poc-mywealth-ui .

# Run locally
docker run -p 8080:80 poc-mywealth-ui

# Visit http://localhost:8080
```

## AWS Elastic Beanstalk Deployment

### Prerequisites
- AWS CLI installed and configured
- EB CLI installed: `pip install awsebcli`

### Deploy

```bash
# Initialize Elastic Beanstalk
eb init -p docker poc-mywealth-ui --region us-east-1

# Create environment
eb create poc-mywealth-prod

# Deploy updates
eb deploy

# Open application
eb open
```

### Configuration

Set environment variables in AWS Console or via CLI:

```bash
eb setenv REACT_APP_GRAPHQL_ENDPOINT=https://your-api.com/graphql
```

That's it! Your application is now running on AWS Elastic Beanstalk.

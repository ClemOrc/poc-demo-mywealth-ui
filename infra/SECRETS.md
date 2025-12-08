# 🔐 Secrets Configuration Guide

Ce document liste tous les secrets nécessaires pour le déploiement de MyWealth UI sur AWS.

> ⚠️ **IMPORTANT** : Ne **JAMAIS** commiter de vraies valeurs de secrets dans ce repository.

---

## 📋 GitHub Actions Secrets

Les secrets suivants doivent être configurés dans **Settings → Secrets and variables → Actions** :

### 1. Secrets AWS

| Nom du Secret | Description | Où le trouver | Exemple |
|---------------|-------------|---------------|---------|
| `AWS_ACCESS_KEY_ID` | Access Key ID AWS | IAM → Users → Security credentials | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key AWS | IAM → Users → Security credentials | `wJalrXUtn...` |
| `AWS_REGION` | Région AWS par défaut | - | `eu-west-1` ou `us-east-1` |

### 2. Secrets ECR

| Nom du Secret | Description | Valeur |
|---------------|-------------|--------|
| `ECR_REPOSITORY` | Nom du repository ECR | `mywealth-ui` |
| `ECR_REGISTRY` | URL du registry ECR | `<account-id>.dkr.ecr.<region>.amazonaws.com` |

### 3. Secrets Elastic Beanstalk

| Nom du Secret | Description | Valeur Actuelle |
|---------------|-------------|-----------------|
| `EB_APPLICATION_NAME` | Nom de l'application EB | `poc-mywealth-ui` |
| `EB_ENVIRONMENT_NAME` | Nom de l'environnement EB | `poc-mywealth-ui-dev` |
| `EB_S3_BUCKET` | Bucket S3 pour artefacts | `elasticbeanstalk-us-east-1-682740202133` |

### 4. Secrets Terraform (Optionnel)

| Nom du Secret | Description | Exemple |
|---------------|-------------|---------|
| `TF_STATE_BUCKET` | Bucket S3 pour Terraform state | `mywealth-ui-terraform-state` |
| `TF_STATE_LOCK_TABLE` | Table DynamoDB pour lock | `terraform-state-lock` |
| `TF_API_TOKEN` | Token Terraform Cloud (si utilisé) | `***` |

---

## 🔧 Configuration des Secrets GitHub Actions

### Via l'interface GitHub

1. Aller sur : `https://github.com/ClemOrc/poc-demo-mywealth-ui/settings/secrets/actions`
2. Cliquer sur **"New repository secret"**
3. Entrer le nom et la valeur
4. Cliquer sur **"Add secret"**

### Via GitHub CLI

```bash
# Installation de gh CLI
brew install gh  # macOS
# ou: https://cli.github.com/

# Authentification
gh auth login

# Ajouter un secret
gh secret set AWS_ACCESS_KEY_ID --body "AKIA..."
gh secret set AWS_SECRET_ACCESS_KEY --body "wJalrXUtn..."
gh secret set AWS_REGION --body "eu-west-1"
gh secret set ECR_REPOSITORY --body "mywealth-ui"
gh secret set EB_APPLICATION_NAME --body "poc-mywealth-ui"
gh secret set EB_ENVIRONMENT_NAME --body "poc-mywealth-ui-dev"
```

---

## 🔑 Création des Credentials AWS

### Option 1 : IAM User (Pour CI/CD)

```bash
# Créer un utilisateur IAM dédié pour GitHub Actions
aws iam create-user --user-name github-actions-mywealth-ui

# Créer une Access Key
aws iam create-access-key --user-name github-actions-mywealth-ui

# Attacher les policies nécessaires
aws iam attach-user-policy \
  --user-name github-actions-mywealth-ui \
  --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkFullAccess

aws iam attach-user-policy \
  --user-name github-actions-mywealth-ui \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-user-policy \
  --user-name github-actions-mywealth-ui \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

### Option 2 : OIDC (Recommandé - Sans Access Keys)

**Plus sécurisé** : Utilise OIDC pour authentification sans credentials statiques.

```yaml
# Dans .github/workflows/deploy.yml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole
    aws-region: eu-west-1
```

Configuration IAM :

```bash
# Créer un role avec trust policy pour GitHub OIDC
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://trust-policy.json
```

**trust-policy.json** :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:ClemOrc/poc-demo-mywealth-ui:*"
        }
      }
    }
  ]
}
```

---

## 🏗️ Secrets Terraform

### Backend Configuration

Les secrets suivants sont nécessaires pour le backend Terraform :

```hcl
# infra/terraform/backend.tf
terraform {
  backend "s3" {
    bucket         = "mywealth-ui-terraform-state"
    key            = "environments/dev/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

### Création du Backend

```bash
# Créer le bucket S3
aws s3 mb s3://mywealth-ui-terraform-state --region eu-west-1

# Activer le versioning
aws s3api put-bucket-versioning \
  --bucket mywealth-ui-terraform-state \
  --versioning-configuration Status=Enabled

# Activer l'encryption
aws s3api put-bucket-encryption \
  --bucket mywealth-ui-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Créer la table DynamoDB pour le lock
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-1
```

---

## 🔐 AWS Secrets Manager (Pour l'Application)

Pour les secrets utilisés par l'application (API keys, tokens, etc.) :

### Créer un Secret

```bash
# Via AWS CLI
aws secretsmanager create-secret \
  --name mywealth-ui/dev/graphql-endpoint \
  --description "GraphQL API endpoint for MyWealth UI" \
  --secret-string "https://api.example.com/graphql" \
  --region eu-west-1

# Via Terraform
resource "aws_secretsmanager_secret" "graphql_endpoint" {
  name        = "mywealth-ui/dev/graphql-endpoint"
  description = "GraphQL API endpoint"
}

resource "aws_secretsmanager_secret_version" "graphql_endpoint" {
  secret_id     = aws_secretsmanager_secret.graphql_endpoint.id
  secret_string = var.graphql_endpoint
}
```

### Utilisation dans Elastic Beanstalk

```json
// Dans .ebextensions/environment.config
{
  "option_settings": [
    {
      "namespace": "aws:elasticbeanstalk:application:environment",
      "option_name": "REACT_APP_GRAPHQL_ENDPOINT",
      "value": "{{resolve:secretsmanager:mywealth-ui/dev/graphql-endpoint}}"
    }
  ]
}
```

---

## 📝 Checklist de Sécurité

### Avant de Déployer

- [ ] Tous les secrets GitHub Actions sont configurés
- [ ] Les Access Keys AWS ont les permissions minimales nécessaires
- [ ] Le bucket S3 Terraform a le versioning et l'encryption activés
- [ ] Les secrets sensibles ne sont PAS dans le code source
- [ ] `.env` est dans `.gitignore`
- [ ] Les logs ne contiennent pas de secrets

### Après le Déploiement

- [ ] Vérifier que les secrets sont correctement injectés dans l'application
- [ ] Tester l'accès aux ressources AWS
- [ ] Monitorer les logs CloudWatch pour détecter des erreurs d'auth
- [ ] Configurer la rotation des secrets (AWS Secrets Manager)

### Rotation des Secrets

```bash
# Créer une nouvelle Access Key
aws iam create-access-key --user-name github-actions-mywealth-ui

# Mettre à jour dans GitHub Actions
gh secret set AWS_ACCESS_KEY_ID --body "NEW_KEY"
gh secret set AWS_SECRET_ACCESS_KEY --body "NEW_SECRET"

# Supprimer l'ancienne Access Key
aws iam delete-access-key \
  --user-name github-actions-mywealth-ui \
  --access-key-id OLD_KEY_ID
```

---

## 🚨 En cas de Compromission

### Étapes Immédiates

1. **Révoquer les credentials compromis** :
   ```bash
   aws iam delete-access-key --user-name USER --access-key-id KEY_ID
   ```

2. **Créer de nouveaux credentials** :
   ```bash
   aws iam create-access-key --user-name USER
   ```

3. **Mettre à jour GitHub Actions** :
   ```bash
   gh secret set AWS_ACCESS_KEY_ID --body "NEW_KEY"
   gh secret set AWS_SECRET_ACCESS_KEY --body "NEW_SECRET"
   ```

4. **Vérifier les logs CloudTrail** pour détecter une utilisation non autorisée :
   ```bash
   aws cloudtrail lookup-events --lookup-attributes AttributeKey=Username,AttributeValue=USER
   ```

5. **Notifier l'équipe de sécurité**

---

## 📚 Ressources

- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [GitHub Actions Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Terraform AWS Provider Authentication](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration)

---

**Dernière mise à jour** : 2025-12-08  
**Maintenu par** : Infrastructure Team
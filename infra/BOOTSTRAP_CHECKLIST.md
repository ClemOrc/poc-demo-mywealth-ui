# ✅ Bootstrap Checklist - MyWealth UI Infrastructure

Ce document fournit une checklist complète pour l'opérateur humain afin de finaliser le bootstrap de l'infrastructure.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration GitHub Actions](#configuration-github-actions)
3. [Configuration AWS](#configuration-aws)
4. [Terraform Setup](#terraform-setup)
5. [Déploiement Initial](#déploiement-initial)
6. [Validation](#validation)
7. [Next Steps](#next-steps)

---

## 1️⃣ Prérequis

### Outils Requis

- [ ] **AWS CLI** installé et configuré
  ```bash
  aws --version  # >= 2.x
  aws configure
  ```

- [ ] **Terraform** installé
  ```bash
  terraform --version  # >= 1.6.0
  ```

- [ ] **Docker** installé
  ```bash
  docker --version  # >= 24.0
  ```

- [ ] **GitHub CLI** installé (optionnel)
  ```bash
  gh --version
  gh auth login
  ```

- [ ] **Node.js** installé
  ```bash
  node --version  # >= 18.x
  npm --version
  ```

### Accès Requis

- [ ] Accès au repository GitHub : `ClemOrc/poc-demo-mywealth-ui`
- [ ] Permissions AWS Admin ou équivalent
- [ ] Accès au compte AWS (Account ID: `682740202133`)

---

## 2️⃣ Configuration GitHub Actions

### Secrets à Configurer

Aller sur : `https://github.com/ClemOrc/poc-demo-mywealth-ui/settings/secrets/actions`

#### Secrets AWS (Obligatoires)

- [ ] `AWS_ACCESS_KEY_ID`
  - Valeur : `AKIA...` (depuis IAM Console)
  - Comment obtenir : IAM → Users → github-actions-mywealth-ui → Security credentials

- [ ] `AWS_SECRET_ACCESS_KEY`
  - Valeur : `wJalrXUtn...` (affiché une seule fois à la création)
  - **Important** : Sauvegarder dans un password manager sécurisé

- [ ] `AWS_REGION`
  - Valeur : `eu-west-1` (ou `us-east-1` si l'infrastructure est déjà là-bas)

#### Secrets ECR (Obligatoires)

- [ ] `ECR_REPOSITORY`
  - Valeur : `mywealth-ui`

- [ ] `ECR_REGISTRY`
  - Valeur : `682740202133.dkr.ecr.eu-west-1.amazonaws.com`
  - Format : `<account-id>.dkr.ecr.<region>.amazonaws.com`

#### Secrets Elastic Beanstalk (Déjà configurés)

- [x] `EB_APPLICATION_NAME` : `poc-mywealth-ui`
- [x] `EB_ENVIRONMENT_NAME` : `poc-mywealth-ui-dev`
- [x] `EB_S3_BUCKET` : `elasticbeanstalk-us-east-1-682740202133`

**Note** : Si la région est `eu-west-1`, mettre à jour le bucket S3 !

#### Secrets Terraform (Optionnels - pour Phase 2)

- [ ] `TF_STATE_BUCKET`
  - Valeur : `mywealth-ui-terraform-state`

- [ ] `TF_STATE_LOCK_TABLE`
  - Valeur : `terraform-state-lock`

### Commandes pour Configurer les Secrets

```bash
# Via GitHub CLI
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set AWS_REGION --body "eu-west-1"
gh secret set ECR_REPOSITORY --body "mywealth-ui"
gh secret set ECR_REGISTRY --body "682740202133.dkr.ecr.eu-west-1.amazonaws.com"
```

---

## 3️⃣ Configuration AWS

### Étape 3.1 : Créer l'Utilisateur IAM pour GitHub Actions

```bash
# 1. Créer l'utilisateur
aws iam create-user --user-name github-actions-mywealth-ui

# 2. Créer l'Access Key
aws iam create-access-key --user-name github-actions-mywealth-ui > github-actions-keys.json

# 3. Récupérer les clés (sauvegarder dans un password manager!)
cat github-actions-keys.json | jq -r '.AccessKey.AccessKeyId'
cat github-actions-keys.json | jq -r '.AccessKey.SecretAccessKey'

# 4. Supprimer le fichier (sécurité)
rm github-actions-keys.json
```

### Étape 3.2 : Attacher les Policies IAM

```bash
# Policy pour Elastic Beanstalk
aws iam attach-user-policy \
  --user-name github-actions-mywealth-ui \
  --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkFullAccess

# Policy pour ECR
aws iam attach-user-policy \
  --user-name github-actions-mywealth-ui \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

# Policy pour S3
aws iam attach-user-policy \
  --user-name github-actions-mywealth-ui \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Vérification
aws iam list-attached-user-policies --user-name github-actions-mywealth-ui
```

### Étape 3.3 : Créer le Repository ECR

```bash
# Créer le repository
aws ecr create-repository \
  --repository-name mywealth-ui \
  --region eu-west-1 \
  --image-scanning-configuration scanOnPush=true

# Configurer la lifecycle policy (garder 10 dernières images)
aws ecr put-lifecycle-policy \
  --repository-name mywealth-ui \
  --region eu-west-1 \
  --lifecycle-policy-text '{
    "rules": [{
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": { "type": "expire" }
    }]
  }'

# Vérifier
aws ecr describe-repositories --repository-names mywealth-ui --region eu-west-1
```

### Étape 3.4 : Vérifier Elastic Beanstalk

```bash
# Lister les applications
aws elasticbeanstalk describe-applications --region us-east-1

# Vérifier l'environnement
aws elasticbeanstalk describe-environments \
  --environment-names poc-mywealth-ui-dev \
  --region us-east-1

# Obtenir l'URL
aws elasticbeanstalk describe-environments \
  --environment-names poc-mywealth-ui-dev \
  --region us-east-1 \
  --query 'Environments[0].CNAME' \
  --output text
```

---

## 4️⃣ Terraform Setup (Phase 2 - Optionnel)

### Étape 4.1 : Créer le Backend Terraform

```bash
# 1. Créer le bucket S3 pour le state
aws s3 mb s3://mywealth-ui-terraform-state --region eu-west-1

# 2. Activer le versioning
aws s3api put-bucket-versioning \
  --bucket mywealth-ui-terraform-state \
  --versioning-configuration Status=Enabled

# 3. Activer l'encryption
aws s3api put-bucket-encryption \
  --bucket mywealth-ui-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      },
      "BucketKeyEnabled": true
    }]
  }'

# 4. Bloquer l'accès public
aws s3api put-public-access-block \
  --bucket mywealth-ui-terraform-state \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 5. Créer la table DynamoDB pour le lock
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-1

# Vérifier
aws s3 ls | grep terraform-state
aws dynamodb describe-table --table-name terraform-state-lock --region eu-west-1
```

### Étape 4.2 : Initialiser Terraform (Quand les modules seront créés)

```bash
cd infra/terraform/environments/dev
terraform init
terraform validate
terraform plan
```

---

## 5️⃣ Déploiement Initial

### Étape 5.1 : Merger la Branch Bootstrap

- [ ] Créer une Pull Request depuis `infra/bootstrap-20251208-145333` vers `main`
- [ ] Review des fichiers ajoutés :
  - `Dockerfile.production`
  - `infra/README.md`
  - `infra/terraform/README.md`
  - `infra/k8s/README.md`
  - `infra/SECRETS.md`
  - `infra/BOOTSTRAP_CHECKLIST.md`
- [ ] Merger la PR

### Étape 5.2 : Tester le Build Docker Local

```bash
# Clone le repo (si pas déjà fait)
git clone https://github.com/ClemOrc/poc-demo-mywealth-ui.git
cd poc-demo-mywealth-ui

# Checkout la branch bootstrap
git checkout infra/bootstrap-20251208-145333

# Build avec le nouveau Dockerfile
docker build -f Dockerfile.production -t mywealth-ui:test .

# Vérifier la taille de l'image
docker images mywealth-ui:test

# Tester localement
docker run -d -p 8080:80 --name mywealth-test mywealth-ui:test

# Vérifier
curl http://localhost:8080
open http://localhost:8080

# Cleanup
docker stop mywealth-test
docker rm mywealth-test
```

### Étape 5.3 : Push vers ECR (Manuel)

```bash
# Login à ECR
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin \
  682740202133.dkr.ecr.eu-west-1.amazonaws.com

# Tag l'image
docker tag mywealth-ui:test \
  682740202133.dkr.ecr.eu-west-1.amazonaws.com/mywealth-ui:latest

# Push vers ECR
docker push 682740202133.dkr.ecr.eu-west-1.amazonaws.com/mywealth-ui:latest

# Vérifier
aws ecr list-images --repository-name mywealth-ui --region eu-west-1
```

### Étape 5.4 : Déclencher le Workflow GitHub Actions

```bash
# Option 1 : Push sur main (si la PR est mergée)
git checkout main
git pull origin main
git push origin main

# Option 2 : Déclencher manuellement (si workflow_dispatch est activé)
gh workflow run deploy.yml
```

---

## 6️⃣ Validation

### Validation du Déploiement

- [ ] **GitHub Actions** : Le workflow s'exécute sans erreur
  - URL : `https://github.com/ClemOrc/poc-demo-mywealth-ui/actions`

- [ ] **ECR** : L'image Docker est dans ECR
  ```bash
  aws ecr describe-images --repository-name mywealth-ui --region eu-west-1
  ```

- [ ] **Elastic Beanstalk** : L'environnement est "Green" (Healthy)
  ```bash
  aws elasticbeanstalk describe-environment-health \
    --environment-name poc-mywealth-ui-dev \
    --region us-east-1 \
    --attribute-names All
  ```

- [ ] **Application** : L'application est accessible
  ```bash
  # Obtenir l'URL
  EB_URL=$(aws elasticbeanstalk describe-environments \
    --environment-names poc-mywealth-ui-dev \
    --region us-east-1 \
    --query 'Environments[0].CNAME' \
    --output text)
  
  # Tester
  curl -I http://$EB_URL
  ```

- [ ] **Health Check** : Les health checks passent
  ```bash
  curl -f http://$EB_URL || echo "Health check failed"
  ```

### Validation des Logs

- [ ] **CloudWatch Logs** : Les logs sont accessibles
  ```bash
  aws logs describe-log-groups --region us-east-1 | grep mywealth
  ```

- [ ] **Elastic Beanstalk Events** : Pas d'erreurs récentes
  ```bash
  aws elasticbeanstalk describe-events \
    --environment-name poc-mywealth-ui-dev \
    --region us-east-1 \
    --max-items 20
  ```

---

## 7️⃣ Next Steps

### Phase 1 : Infrastructure as Code (Haute Priorité)

- [ ] **Créer les modules Terraform**
  - Module ECR
  - Module Elastic Beanstalk
  - Module IAM
  - Module Monitoring (CloudWatch)

- [ ] **Configurer les environnements**
  - `infra/terraform/environments/dev/`
  - `infra/terraform/environments/staging/` (futur)
  - `infra/terraform/environments/prod/` (futur)

- [ ] **Intégrer Terraform dans GitHub Actions**
  - Workflow `terraform-plan.yml` sur PR
  - Workflow `terraform-apply.yml` sur merge

**Agent Responsable** : `TerraformInfraAgent`

### Phase 2 : CI/CD Avancé (Haute Priorité)

- [ ] **Améliorer le workflow deploy.yml**
  - Ajouter le push vers ECR
  - Ajouter tests automatisés (linting, unit tests)
  - Ajouter security scanning (Trivy, Snyk)

- [ ] **Créer des workflows additionnels**
  - `build-and-test.yml` : Sur chaque PR
  - `security-scan.yml` : Scan de vulnérabilités
  - `dependency-update.yml` : Dependabot/Renovate

- [ ] **Blue-Green Deployment**
  - Setup d'un environnement staging
  - Swap automatique après validation

**Agent Responsable** : `DeploymentCICDAgent`

### Phase 3 : Monitoring & Alerting (Moyenne Priorité)

- [ ] **CloudWatch Dashboards**
  - Dashboard applicatif (requests, errors, latency)
  - Dashboard infrastructure (EC2, ALB, Auto Scaling)

- [ ] **CloudWatch Alarms**
  - CPU > 80%
  - Erreurs 5xx > seuil
  - Latency > 2s

- [ ] **Notifications**
  - SNS topic pour les alertes
  - Integration Slack/Email

### Phase 4 : Sécurité (Moyenne Priorité)

- [ ] **AWS WAF** devant l'ALB
- [ ] **SSL/TLS** avec AWS Certificate Manager
- [ ] **Secrets Manager** pour les secrets applicatifs
- [ ] **Security Hub** pour l'audit continu
- [ ] **Penetration Testing**

### Phase 5 : Kubernetes (Basse Priorité - Optionnel)

- [ ] **Évaluation EKS vs Elastic Beanstalk**
- [ ] **POC sur EKS**
- [ ] **Migration progressive**

---

## 📊 Success Metrics

### Objectifs de la Phase Bootstrap (Complétés ✅)

- [x] Dockerfile optimisé créé
- [x] Structure `infra/` créée
- [x] Documentation complète rédigée
- [x] Branch `infra/bootstrap-20251208-145333` créée
- [x] Checklist opérateur fournie

### KPIs à Suivre

- **Build Time** : < 5 minutes
- **Deploy Time** : < 10 minutes
- **Image Size** : < 50 MB
- **Uptime** : > 99.9%
- **Latency** : < 500ms (p95)

---

## 🆘 Troubleshooting

### Problème : GitHub Actions échoue avec "AccessDeniedException"

**Solution** :
```bash
# Vérifier les policies IAM
aws iam list-attached-user-policies --user-name github-actions-mywealth-ui

# Vérifier les secrets GitHub
gh secret list
```

### Problème : ECR Push échoue

**Solution** :
```bash
# Re-login à ECR
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin \
  682740202133.dkr.ecr.eu-west-1.amazonaws.com

# Vérifier que le repository existe
aws ecr describe-repositories --repository-names mywealth-ui --region eu-west-1
```

### Problème : Elastic Beanstalk environment "Degraded" ou "Severe"

**Solution** :
```bash
# Consulter les événements récents
aws elasticbeanstalk describe-events \
  --environment-name poc-mywealth-ui-dev \
  --region us-east-1 \
  --max-items 50

# Consulter les logs
aws elasticbeanstalk retrieve-environment-info \
  --environment-name poc-mywealth-ui-dev \
  --info-type tail
```

### Problème : Docker build échoue

**Solution** :
```bash
# Build avec --no-cache
docker build --no-cache -f Dockerfile.production -t mywealth-ui:test .

# Vérifier les logs
docker build -f Dockerfile.production -t mywealth-ui:test . --progress=plain
```

---

## 📞 Support

### Contacts

- **Repository Owner** : ClemOrc
- **Infrastructure Team** : À définir
- **AWS Account ID** : `682740202133`

### Ressources

- [Repository GitHub](https://github.com/ClemOrc/poc-demo-mywealth-ui)
- [AWS Console](https://console.aws.amazon.com/)
- [Documentation Infra](./README.md)
- [Secrets Guide](./SECRETS.md)

---

**Document créé le** : 2025-12-08  
**Dernière mise à jour** : 2025-12-08  
**Version** : 1.0.0  
**Statut** : ✅ Prêt pour exécution
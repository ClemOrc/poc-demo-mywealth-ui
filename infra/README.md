# 🏗️ Infrastructure Documentation - MyWealth UI

Ce document décrit l'architecture d'infrastructure pour le déploiement de MyWealth UI sur AWS.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Containerisation](#containerisation)
4. [Terraform](#terraform)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Kubernetes (Futur)](#kubernetes-futur)
7. [Sécurité](#sécurité)
8. [Monitoring](#monitoring)
9. [Prochaines Étapes](#prochaines-étapes)

---

## 🎯 Vue d'ensemble

MyWealth UI est une application web React/TypeScript déployée sur **AWS Elastic Beanstalk** avec Docker.

### Technologies Utilisées

- **Frontend**: React 18 + TypeScript + Webpack
- **Container**: Docker multi-stage build
- **Web Server**: Nginx 1.25-alpine
- **Cloud Provider**: AWS (Elastic Beanstalk + ECR)
- **IaC**: Terraform (à venir)
- **CI/CD**: GitHub Actions

### Environnements

| Environnement | URL | Branch | Statut |
|---------------|-----|--------|--------|
| **Development** | `poc-mywealth-ui-dev.elasticbeanstalk.com` | `main` | ✅ Actif |
| **Staging** | À définir | `staging` | 🚧 Prévu |
| **Production** | À définir | `production` | 🚧 Prévu |

---

## 🏛️ Architecture

### Architecture Actuelle (Elastic Beanstalk)

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Route 53    │  (DNS)
                  └──────┬───────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Application LB     │  (HTTPS/HTTP)
              └─────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│  EC2 Instance   │            │  EC2 Instance   │
│  (Auto Scaling) │            │  (Auto Scaling) │
│                 │            │                 │
│  ┌───────────┐  │            │  ┌───────────┐  │
│  │  Docker   │  │            │  │  Docker   │  │
│  │  Nginx    │  │            │  │  Nginx    │  │
│  │  React App│  │            │  │  React App│  │
│  └───────────┘  │            │  └───────────┘  │
└─────────────────┘            └─────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  CloudWatch  │  (Logs & Metrics)
                  └──────────────┘
```

### Flux de Déploiement

```
GitHub Push → GitHub Actions → Build Docker → Push to ECR → Deploy to EB
```

---

## 🐳 Containerisation

### Dockerfile Production

Le `Dockerfile.production` utilise un **multi-stage build** pour optimiser la taille et la sécurité :

#### Stage 1: Builder
- Base: `node:18-alpine`
- Install build dependencies
- `npm ci` avec frozen lockfile
- Build de l'application React

#### Stage 2: Production
- Base: `nginx:1.25-alpine`
- Copy des artefacts buildés depuis Stage 1
- Configuration Nginx optimisée
- Health checks intégrés
- User non-root pour sécurité

### Optimisations

✅ **Image légère** : ~25 MB (vs ~1.2 GB avec Node)
✅ **Sécurité** : User nginx, pas de root
✅ **Cache** : Layers optimisés pour CI/CD
✅ **Health checks** : Monitoring automatique
✅ **Compression** : Gzip activé dans Nginx

### Build Local

```bash
# Build de l'image
docker build -f Dockerfile.production -t mywealth-ui:latest .

# Test local
docker run -p 8080:80 mywealth-ui:latest

# Accès: http://localhost:8080
```

---

## ☁️ Terraform

### Objectif

Infrastructure-as-Code pour provisionner et gérer l'infrastructure AWS de manière reproductible.

### Ressources à Créer

#### 1. ECR (Elastic Container Registry)
```hcl
# Repository pour les images Docker
resource "aws_ecr_repository" "mywealth_ui" {
  name                 = "mywealth-ui"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  lifecycle_policy {
    # Garder les 10 dernières images
  }
}
```

#### 2. Elastic Beanstalk
```hcl
# Application
resource "aws_elastic_beanstalk_application" "mywealth_ui" {
  name        = "poc-mywealth-ui"
  description = "MyWealth UI Application"
}

# Environment
resource "aws_elastic_beanstalk_environment" "dev" {
  name                = "poc-mywealth-ui-dev"
  application         = aws_elastic_beanstalk_application.mywealth_ui.name
  solution_stack_name = "64bit Amazon Linux 2 v3.x running Docker"
  
  # Configuration settings
  # ...
}
```

#### 3. IAM Roles
- Elastic Beanstalk service role
- EC2 instance profile
- ECR access policies

#### 4. S3 Buckets
- Artefacts de déploiement
- Terraform state
- Logs (optionnel)

#### 5. CloudWatch
- Log groups
- Métriques personnalisées
- Alarmes

### Structure Terraform

```
infra/terraform/
├── main.tf              # Resources principales
├── variables.tf         # Variables
├── outputs.tf           # Outputs
├── backend.tf           # S3 + DynamoDB backend
├── versions.tf          # Provider versions
├── modules/
│   ├── ecr/
│   ├── elastic-beanstalk/
│   ├── iam/
│   └── monitoring/
└── environments/
    ├── dev/
    ├── staging/
    └── prod/
```

### Commandes

```bash
# Initialisation
cd infra/terraform/environments/dev
terraform init

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan

# Destroy (attention!)
terraform destroy
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

Le workflow `.github/workflows/deploy.yml` existant gère :

1. **Build** : Compilation de l'app React
2. **Test** : Linting et type checking
3. **Containerisation** : Build de l'image Docker
4. **Push** : Upload vers ECR (à ajouter)
5. **Deploy** : Déploiement sur Elastic Beanstalk
6. **Verify** : Health checks
7. **Rollback** : En cas d'échec

### Améliorations Prévues

#### Ajouter ECR Push

```yaml
- name: Login to Amazon ECR
  uses: aws-actions/amazon-ecr-login@v2

- name: Build and push Docker image
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    ECR_REPOSITORY: mywealth-ui
    IMAGE_TAG: ${{ github.sha }}
  run: |
    docker build -f Dockerfile.production -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
```

#### Terraform Integration

```yaml
- name: Terraform Plan
  if: github.event_name == 'pull_request'
  run: |
    cd infra/terraform/environments/dev
    terraform plan -no-color

- name: Terraform Apply
  if: github.ref == 'refs/heads/main'
  run: |
    cd infra/terraform/environments/dev
    terraform apply -auto-approve
```

### Secrets GitHub Actions Requis

| Secret | Description | Exemple |
|--------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `wJalrXUtn...` |
| `AWS_REGION` | Région AWS | `eu-west-1` |
| `ECR_REPOSITORY` | Nom du repo ECR | `mywealth-ui` |
| `EB_APPLICATION_NAME` | Nom de l'app EB | `poc-mywealth-ui` |
| `EB_ENVIRONMENT_NAME` | Nom de l'env EB | `poc-mywealth-ui-dev` |

---

## ☸️ Kubernetes (Futur)

Le dossier `infra/k8s/` prépare une migration future vers **AWS EKS** (Elastic Kubernetes Service) si nécessaire.

### Avantages de Kubernetes

- **Portabilité** : Multi-cloud
- **Scalabilité** : HPA, Cluster Autoscaler
- **Orchestration** : Gestion avancée des containers
- **Écosystème** : Helm, Operators, etc.

### Quand migrer ?

- Besoin de multi-cloud
- Architecture microservices complexe
- Besoins avancés d'orchestration
- Équipe familière avec K8s

### Migration Path

1. Créer cluster EKS avec Terraform
2. Convertir config EB en manifests K8s
3. Setup Ingress Controller (AWS LB Controller)
4. Migrer le trafic progressivement
5. Décommissionner EB

---

## 🔒 Sécurité

### Best Practices Implémentées

✅ **Container Security**
- User non-root dans Docker
- Image scanning avec ECR
- Minimal base image (alpine)

✅ **Network Security**
- HTTPS only (via ALB)
- Security headers dans Nginx
- CORS configuré

✅ **Secrets Management**
- Pas de secrets en clair dans le code
- Variables d'environnement via EB
- AWS Secrets Manager (recommandé)

✅ **IAM**
- Principe du moindre privilège
- Roles spécifiques par service
- Pas de credentials en dur

### À Améliorer

🚧 **WAF** : AWS WAF devant l'ALB
🚧 **DDoS Protection** : AWS Shield
🚧 **SSL/TLS** : Certificate Manager
🚧 **Vulnerability Scanning** : Automatique sur ECR
🚧 **Compliance** : AWS Config

---

## 📊 Monitoring

### CloudWatch

- **Logs** : Application logs centralisés
- **Metrics** : CPU, Memory, Requests, Latency
- **Alarms** : Alerts sur anomalies

### Métriques Clés

| Métrique | Seuil | Action |
|----------|-------|--------|
| CPU > 80% | 5 min | Scale up |
| Erreurs 5xx | > 10/min | Alert |
| Latency | > 2s | Investigate |
| Disk | > 85% | Clean up |

### Dashboards

- **Application Dashboard** : Requests, errors, latency
- **Infrastructure Dashboard** : EC2, ALB, Auto Scaling
- **Cost Dashboard** : Coûts par service

---

## 📝 Prochaines Étapes

### Phase 1 : Terraform (Priorité Haute)

- [ ] Créer modules Terraform pour ECR, EB, IAM
- [ ] Configurer backend S3 + DynamoDB
- [ ] Créer environments dev/staging/prod
- [ ] Intégrer Terraform dans CI/CD
- [ ] Documenter les variables et outputs

**Agent Responsable** : `TerraformInfraAgent`

### Phase 2 : CI/CD Avancé (Priorité Haute)

- [ ] Ajouter push vers ECR dans le workflow
- [ ] Intégrer tests automatisés (unit + e2e)
- [ ] Ajouter security scanning (Trivy, Snyk)
- [ ] Implémenter blue-green deployment
- [ ] Configurer notifications Slack/Email

**Agent Responsable** : `DeploymentCICDAgent`

### Phase 3 : Monitoring & Observabilité (Priorité Moyenne)

- [ ] Setup CloudWatch dashboards
- [ ] Configurer alarmes CloudWatch
- [ ] Intégrer APM (AWS X-Ray ou Datadog)
- [ ] Logs structurés (JSON format)
- [ ] Distributed tracing

### Phase 4 : Sécurité (Priorité Moyenne)

- [ ] AWS WAF devant ALB
- [ ] SSL/TLS avec Certificate Manager
- [ ] AWS Secrets Manager pour secrets
- [ ] Vulnerability scanning automatique
- [ ] Penetration testing

### Phase 5 : Kubernetes (Priorité Basse - Optionnel)

- [ ] Évaluation EKS vs EB
- [ ] Création cluster EKS avec Terraform
- [ ] Conversion en manifests K8s
- [ ] Setup Helm charts
- [ ] Migration progressive

---

## 🔗 Ressources Utiles

### Documentation AWS
- [Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [EKS Documentation](https://docs.aws.amazon.com/eks/)

### Outils
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions](https://docs.github.com/en/actions)

### Sécurité
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 📞 Contact & Support

Pour toute question sur l'infrastructure :

- **GitHub Issues** : Ouvrir un issue avec le label `infrastructure`
- **Documentation** : Consulter ce README et les sous-dossiers
- **Agents Spécialisés** :
  - `TerraformInfraAgent` pour Terraform
  - `DeploymentCICDAgent` pour CI/CD
  - `KubernetesAgent` pour K8s (si nécessaire)

---

**Dernière mise à jour** : 2025-12-08  
**Version** : 1.0.0  
**Statut** : ✅ Infrastructure bootstrap complétée
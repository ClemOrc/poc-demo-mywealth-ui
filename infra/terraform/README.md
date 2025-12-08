# Terraform Infrastructure

Ce dossier contiendra l'infrastructure-as-code pour le déploiement de MyWealth UI sur AWS.

## 🏗️ Architecture Prévue

L'infrastructure Terraform sera configurée par l'agent spécialisé **TerraformInfraAgent** et comprendra :

### Composants AWS

1. **ECR (Elastic Container Registry)**
   - Repository privé pour les images Docker
   - Politique de cycle de vie pour la gestion des images
   - Scan de sécurité automatique

2. **Elastic Beanstalk**
   - Environnement Docker pour l'application web
   - Auto-scaling configuré
   - Load balancer avec SSL/TLS
   - Health checks et monitoring

3. **IAM Roles & Policies**
   - Rôles pour Elastic Beanstalk
   - Policies pour ECR et S3
   - Principe du moindre privilège

4. **S3 Buckets**
   - Bucket pour les artefacts de déploiement
   - Versioning activé
   - Encryption au repos

5. **CloudWatch**
   - Logs centralisés
   - Métriques et alarmes
   - Dashboards de monitoring

## 📁 Structure Prévue

```
infra/terraform/
├── main.tf                 # Configuration principale
├── variables.tf            # Variables d'environnement
├── outputs.tf              # Outputs (URLs, ARNs, etc.)
├── backend.tf              # Configuration du backend Terraform
├── versions.tf             # Versions des providers
├── modules/
│   ├── ecr/               # Module ECR
│   ├── elastic-beanstalk/ # Module Elastic Beanstalk
│   ├── iam/               # Module IAM
│   └── monitoring/        # Module CloudWatch
└── environments/
    ├── dev/               # Configuration dev
    ├── staging/           # Configuration staging
    └── prod/              # Configuration production
```

## 🚀 Prochaines Étapes

1. **TerraformInfraAgent** créera :
   - Modules réutilisables pour chaque composant AWS
   - Configurations par environnement (dev/staging/prod)
   - Variables sensibles via AWS Secrets Manager
   - Documentation détaillée

2. **Backend Terraform**
   - S3 pour le state file
   - DynamoDB pour le state locking
   - Encryption du state

3. **Workflows CI/CD**
   - Plan automatique sur PR
   - Apply automatique sur merge
   - Validation avec `terraform validate` et `tflint`

## ⚠️ Important

- **Ne jamais commiter de secrets** dans ce dossier
- Utiliser AWS Secrets Manager ou Parameter Store pour les valeurs sensibles
- Toujours valider avec `terraform plan` avant `terraform apply`
- Suivre les conventions de nommage AWS

## 📚 Documentation

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Elastic Beanstalk on Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/elastic_beanstalk_environment)
- [ECR on Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_repository)
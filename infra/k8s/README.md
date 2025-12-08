# Kubernetes Manifests

Ce dossier contiendra les manifests Kubernetes pour le déploiement de MyWealth UI (optionnel, pour migration future vers EKS/K8s).

## 🎯 Objectif

Bien que le déploiement initial utilise **AWS Elastic Beanstalk**, ce dossier prépare une migration future vers **Kubernetes (EKS)** si nécessaire.

## 📁 Structure Prévue

```
infra/k8s/
├── base/                      # Manifests de base (Kustomize)
│   ├── deployment.yaml        # Deployment de l'application
│   ├── service.yaml           # Service ClusterIP
│   ├── ingress.yaml           # Ingress controller
│   ├── configmap.yaml         # Configuration non-sensible
│   └── kustomization.yaml     # Kustomize base
├── overlays/
│   ├── dev/                   # Overlay pour dev
│   │   ├── kustomization.yaml
│   │   └── patches/
│   ├── staging/               # Overlay pour staging
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── prod/                  # Overlay pour production
│       ├── kustomization.yaml
│       └── patches/
├── secrets/                   # Sealed Secrets (chiffrés)
└── helm/                      # Helm Chart (alternative)
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
```

## 🏗️ Composants Kubernetes

### 1. Deployment
- Réplicat sets pour haute disponibilité
- Rolling updates
- Health checks (liveness & readiness probes)
- Resource limits et requests

### 2. Service
- ClusterIP pour communication interne
- LoadBalancer ou NodePort pour exposition externe
- Session affinity si nécessaire

### 3. Ingress
- Routing HTTP/HTTPS
- SSL/TLS termination
- Path-based routing pour micro-frontends
- Rate limiting et WAF (via annotations)

### 4. ConfigMaps & Secrets
- ConfigMaps pour configuration non-sensible
- Kubernetes Secrets ou **Sealed Secrets** pour données sensibles
- External Secrets Operator pour AWS Secrets Manager

### 5. HPA (Horizontal Pod Autoscaler)
- Auto-scaling basé sur CPU/Memory
- Métriques personnalisées (requests/sec, etc.)

### 6. Network Policies
- Isolation réseau entre namespaces
- Whitelist des communications

## 🚀 Outils Recommandés

### Kustomize
- Gestion des configurations par environnement
- Patches et overlays
- Pas de templating complexe

```bash
# Apply avec Kustomize
kubectl apply -k infra/k8s/overlays/dev
```

### Helm (Alternative)
- Packaging d'application
- Gestion des dépendances
- Releases et rollbacks simplifiés

```bash
# Deploy avec Helm
helm upgrade --install mywealth-ui ./infra/k8s/helm \
  --namespace mywealth \
  --create-namespace \
  -f values-dev.yaml
```

### Sealed Secrets
- Encryption des secrets avant commit Git
- Controller dans le cluster pour decryption

```bash
# Créer un sealed secret
kubeseal -f secret.yaml -w sealed-secret.yaml
```

## 📊 Monitoring & Observabilité

### Prometheus & Grafana
- Métriques applicatives
- Dashboards personnalisés
- Alerting

### ELK Stack ou Loki
- Logs centralisés
- Recherche et analyse

### Jaeger ou Tempo
- Distributed tracing
- Performance analysis

## 🔄 CI/CD Integration

Le workflow GitHub Actions pourra déployer sur Kubernetes avec :
- `kubectl apply` ou `kustomize build`
- Helm charts
- ArgoCD ou FluxCD pour GitOps

## ⚠️ Important

- **Ne pas commiter de secrets en clair**
- Utiliser Sealed Secrets ou External Secrets Operator
- Toujours tester dans un namespace de dev
- Utiliser `kubectl diff` avant apply
- Implémenter des resource quotas et limit ranges

## 🔗 Ressources

- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Kustomize](https://kustomize.io/)
- [Helm](https://helm.sh/)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)

## 📝 Notes

Ce dossier est actuellement **vide** car le déploiement initial utilise Elastic Beanstalk.

Il sera populé par un agent spécialisé **KubernetesAgent** si une migration vers EKS est requise.
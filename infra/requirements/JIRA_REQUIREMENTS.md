# Exigences Infrastructure & CI/CD - Projet CGIAIT (mywealth-ui)

## 📋 Vue d'ensemble

**Projet Jira:** CGIAIT  
**Repository:** https://github.com/ClemOrc/poc-demo-mywealth-ui  
**Service:** mywealth-ui (React Microfrontend)  
**Date d'analyse:** 2024  
**Scope JQL:** `project = CGIAIT AND statusCategory != Done`  

---

## 🎯 Résumé exécutif

L'analyse du projet CGIAIT a révélé **12 tickets actifs** (statut "À faire"), dont **0 tickets explicitement liés à l'infrastructure/CI/CD** selon les critères de recherche initiaux.

Les tickets analysés concernent principalement des **fonctionnalités métier** pour le Dashboard des Agreements, mais contiennent des **contraintes techniques importantes** qui impactent l'architecture, la performance, et le déploiement de l'application.

---

## 📊 Inventaire des tickets Jira

| Clé | Type | Statut | Résumé | Impact Infra/CI/CD |
|-----|------|--------|--------|-------------------|
| **CGIAIT-12** | Submit a request or incident | À faire | Implement Action Menu for Agreement Approval/Decline in Dashboard | ⚠️ **CRITIQUE** - Exigences de performance & state management |
| **CGIAIT-11** | Submit a request or incident | À faire | Story Test CGIAIT-11 - Fonctionnalité de Test | ℹ️ Minimal - Tests & validation QA |
| **CGIAIT-10** | Submit a request or incident | À faire | Add Approve/Decline Context Menu for Pending Agreements and Update Pending Counter Dynamically | ⚠️ **CRITIQUE** - Performance & réactivité UI |
| **CGIAIT-9** | Submit a request or incident | À faire | User Story — Approve/Decline Context Menu for Pending Agreements 2 | ⚠️ Modéré - Intégration GraphQL |
| **CGIAIT-8** | Submit a request or incident | À faire | User Story — Approve/Decline Context Menu for Pending Agreements | ⚠️ Modéré - Intégration GraphQL |
| **CGIAIT-7** | Submit a request or incident | À faire | Add Approve/Decline Context Menu for Pending Approval Agreements | ⚠️ Modéré - Architecture & performance |
| **CGIAIT-6** | Submit a request or incident | À faire | Ticket test - Validation des fonctionnalités | ℹ️ Minimal - Ticket de test |
| **CGIAIT-5** | Submit a request or incident | À faire | Tâche de test - Priorité basse | ℹ️ Minimal - Ticket de test |
| **CGIAIT-4** | Submit a request or incident | À faire | Tâche de test simple - Difficulté minimale | ℹ️ Minimal - Ticket de test |
| **CGIAIT-3** | Submit a request or incident | À faire | Test Task - Validation de la création de tickets | ℹ️ Minimal - Ticket de test |
| **CGIAIT-2** | Submit a request or incident | À faire | test2 | ℹ️ Minimal - Ticket de test |
| **CGIAIT-1** | Submit a request or incident | À faire | test | ℹ️ Minimal - Ticket de test |

---

## 🔍 Exigences fonctionnelles & non-fonctionnelles extraites

### 1. **Performance & Réactivité (CRITIQUES)**

#### Source: CGIAIT-12, CGIAIT-10
**Contraintes identifiées:**

- ✅ **INTERDIT:** Utilisation de `window.location.reload()` ou rechargement forcé de page
- ✅ **REQUIS:** Le Dashboard doit rester **complètement réactif** après les mises à jour d'état
- ✅ **REQUIS:** La liste des agreements en attente doit se mettre à jour **instantanément** (sans délai visible)
- ✅ **REQUIS:** Le compteur "Pending (x)" doit se rafraîchir **dynamiquement sans reload**
- ✅ **REQUIS:** Utilisation obligatoire de **state management local/global** (Redux, Context API, ou similaire)
- ✅ **CRITIQUE:** Les mises à jour doivent déclencher un re-render de la liste et du compteur

**Impact CI/CD:**
- Tests de performance obligatoires pour valider l'absence de rechargements de page
- Métriques de réactivité UI à surveiller
- Tests E2E pour valider le comportement dynamique

---

### 2. **Architecture Frontend (React Microfrontend)**

#### Contraintes techniques identifiées:

**Framework & Stack:**
- ✅ React 18.2 avec TypeScript 5.3
- ✅ Material-UI 5.15 pour les composants UI
- ✅ Apollo Client 3.8 pour GraphQL
- ✅ Webpack 5 avec Module Federation (architecture microfrontend)
- ✅ Formik 2.4 + Yup 1.3 pour la gestion des formulaires

**Patterns d'architecture:**
- ✅ **State Management:** Context API (confirmé dans le code)
- ✅ **Caching Strategy:** Cache-first pour données statiques, cache-and-network pour données dynamiques
- ✅ **GraphQL Optimization:** Fragments (CLIENT_FRAGMENT, CLIENT_MINIMAL_FRAGMENT), pagination protégée

**Impact CI/CD:**
- Build process doit supporter Webpack Module Federation
- Tests de build pour générer `remoteEntry.js`
- Validation de l'intégration microfrontend

---

### 3. **Intégration GraphQL API**

#### Source: CGIAIT-12, CGIAIT-9, CGIAIT-8, CGIAIT-7
**Mutations requises:**

- ✅ `APPROVE_AGREEMENT` - Mise à jour du statut vers ACTIVE
- ✅ `DECLINE_AGREEMENT` - Mise à jour du statut vers EXPIRED
- ✅ Accepte: agreement ID (obligatoire), reason/comments (optionnel)
- ✅ Retourne: objet Agreement mis à jour avec nouveau statut
- ✅ Le cache Apollo doit être mis à jour correctement après les mutations

**Gestion d'erreurs:**
- ✅ Si l'appel API échoue → afficher un toast d'erreur
- ✅ Si l'appel API échoue → **NE PAS** mettre à jour l'UI
- ✅ Les utilisateurs doivent pouvoir réessayer les actions échouées

**Impact CI/CD:**
- Environnements de test doivent avoir accès à un BFF GraphQL fonctionnel
- Tests d'intégration pour valider les mutations
- Simulation d'erreurs réseau dans les tests

---

### 4. **Qualité & Tests**

#### Source: CGIAIT-11, CGIAIT-12
**Exigences de test:**

- ✅ **Tests unitaires:** Couverture ≥ 80% pour nouveaux composants/fonctions
- ✅ **Tests d'intégration:** Validation des mutations GraphQL
- ✅ **Tests E2E:** Scénarios de navigation et workflows complets
- ✅ **Tests manuels:** Validation en environnement de développement
- ✅ **Edge cases:** Erreurs réseau, erreurs de validation, timeouts

**Definition of Done (DoD) standard:**
- [ ] Code développé et testé localement
- [ ] Tests unitaires créés et passent avec succès
- [ ] Revue de code effectuée et approuvée
- [ ] Documentation mise à jour
- [ ] Déployé en environnement de test
- [ ] Validation QA effectuée
- [ ] Build complète avec succès (zéro erreur)
- [ ] Pas de bugs critiques ouverts
- [ ] Pas de console errors/warnings en mode dev
- [ ] Pas de violations ESLint
- [ ] Standards d'accessibilité respectés (WCAG 2.1 AA minimum)

**Impact CI/CD:**
- Pipeline CI doit inclure: lint, type-check, tests unitaires, tests d'intégration
- Quality gates basés sur la couverture de code (≥80%)
- Étape de build validation avant déploiement

---

### 5. **Conteneurisation & Déploiement (État actuel)**

#### Analyse du repository existant:

**Containerization (✅ Déjà en place):**
- ✅ `Dockerfile` multi-stage build (Node 18 + Nginx Alpine)
- ✅ `.dockerignore` configuré
- ✅ Configuration Nginx personnalisée (`nginx.conf`)
- ✅ Build optimisé: `npm ci --only=production=false --ignore-scripts`
- ✅ Image de production légère basée sur `nginx:alpine`

**Déploiement AWS Elastic Beanstalk (✅ Configuré):**
- ✅ `Dockerrun.aws.json` présent
- ✅ `.ebextensions/` configuré
- ✅ `.platform/` configuré
- ✅ Documentation dans `DEPLOYMENT.md`

**Configuration applicative:**
- ✅ `.env.example` avec `REACT_APP_GRAPHQL_ENDPOINT`
- ✅ Variables d'environnement injectables au runtime
- ✅ Support pour mocks BFF (`REACT_APP_USE_MOCKS=true`)

**Impact CI/CD:**
- Dockerfile validé et fonctionnel (pas de modifications requises)
- Déploiement EB prêt pour automatisation
- Stratégie de rollback à documenter

---

### 6. **Environnements & Variables**

#### Configuration requise par environnement:

| Variable | Dev | Staging | Production | Description |
|----------|-----|---------|------------|-------------|
| `REACT_APP_GRAPHQL_ENDPOINT` | `http://localhost:8080/graphql` | `https://api-staging.mywealth.com/graphql` | `https://api.mywealth.com/graphql` | Endpoint GraphQL du BFF |
| `REACT_APP_USE_MOCKS` | `true` (optionnel) | `false` | `false` | Activation du mock BFF |
| `NODE_ENV` | `development` | `production` | `production` | Mode Node.js |

**Endpoints GraphQL à valider:**
- Dev: Backend local ou mock
- Staging: Backend de test
- Prod: Backend de production

**Impact CI/CD:**
- Gestion des variables d'environnement par environnement
- Secrets management pour les endpoints de production
- Configuration différenciée selon les branches (dev/main)

---

### 7. **Sécurité & Compliance**

#### Contraintes implicites identifiées:

**Code Quality:**
- ✅ Pas de console logs en production
- ✅ Gestion d'erreurs appropriée
- ✅ TypeScript strict (zero compilation errors)
- ✅ ESLint configuré (`.eslintrc.json`)

**Accessibilité:**
- ✅ WCAG 2.1 AA minimum (mentionné dans CGIAIT-7)
- ✅ Composants navigables au clavier
- ✅ Labels ARIA sur éléments interactifs

**Sécurité des dépendances:**
- ⚠️ **À VALIDER:** Audit de sécurité npm (`npm audit`)
- ⚠️ **À VALIDER:** Mise à jour des dépendances vulnérables

**Impact CI/CD:**
- Audit de sécurité automatisé dans le pipeline
- Scan de vulnérabilités des images Docker
- Validation des standards d'accessibilité (axe-core)

---

### 8. **Performance & Optimisation GraphQL**

#### Optimisations existantes (à maintenir):

**Stratégie de cache:**
- ✅ `cache-first`: Données statiques (clients, comptes, politiques, frais, produits) - 14 queries
- ✅ `cache-and-network`: Données dynamiques (stats dashboard, demandes de modification) - 3 queries
- ✅ 100% des queries (17/17) ont des policies de cache définies

**Fragments:**
- ✅ `CLIENT_FRAGMENT` (12 champs) - Requêtes complètes
- ✅ `CLIENT_MINIMAL_FRAGMENT` (2 champs) - Autocomplete optimisé (réduction de 83% du payload)

**Pagination:**
- ✅ Limites de résultats sur les recherches (20-50 items)
- ✅ Protection contre les runaway queries

**Métriques de performance:**
- ✅ ReviewStep: 100% de réduction des appels réseau (5 queries → 0 queries)
- ✅ Autocomplete: 83% de réduction du payload (12 fields → 2 fields)

**Impact CI/CD:**
- Tests de performance GraphQL (temps de réponse, taille des payloads)
- Monitoring des requêtes en production
- Alertes sur les performances dégradées

---

## 🚨 Contraintes critiques pour l'infrastructure

### ⚠️ **CRITIQUE 1: Pas de rechargement de page forcé**
**Source:** CGIAIT-12, CGIAIT-10  
**Exigence:** L'application doit rester complètement réactive. Aucun `window.location.reload()` autorisé.  
**Impact:**
- Architecture frontend doit supporter le state management global
- Tests E2E doivent valider l'absence de rechargements
- Monitoring de la réactivité UI en production

### ⚠️ **CRITIQUE 2: Mise à jour dynamique sans délai**
**Source:** CGIAIT-12, CGIAIT-10  
**Exigence:** Les mises à jour d'état doivent être instantanées (pas de flicker ou délai visible).  
**Impact:**
- Performance frontend critique
- Tests de performance UI
- Optimisation du rendu React

### ⚠️ **CRITIQUE 3: Gestion d'erreurs API**
**Source:** CGIAIT-12, CGIAIT-9, CGIAIT-8  
**Exigence:** Si l'API échoue, ne pas mettre à jour l'UI. Afficher un toast d'erreur.  
**Impact:**
- Tests d'intégration avec simulation d'erreurs
- Stratégies de retry
- Monitoring des erreurs API en production

### ⚠️ **CRITIQUE 4: Architecture Microfrontend**
**Source:** README.md, webpack.config.js  
**Exigence:** L'application doit être consommable via Module Federation.  
**Impact:**
- Build process spécifique (génération de `remoteEntry.js`)
- Tests d'intégration avec host apps
- Documentation pour les consommateurs

---

## ✅ Points positifs identifiés

### Infrastructure & CI/CD déjà en place:
- ✅ **Dockerfile multi-stage** optimisé (Node 18 + Nginx Alpine)
- ✅ **Configuration Nginx** personnalisée pour SPA
- ✅ **AWS Elastic Beanstalk** configuré (Dockerrun.aws.json, .ebextensions)
- ✅ **Variables d'environnement** documentées (.env.example)
- ✅ **ESLint & TypeScript** configurés
- ✅ **Mock BFF System** pour développement isolé

### Architecture applicative:
- ✅ **Module Federation** configuré (webpack.config.js)
- ✅ **GraphQL optimisé** (fragments, cache, pagination)
- ✅ **Performance metrics** documentés (100% cache coverage)
- ✅ **Documentation complète** (README, DEPLOYMENT, MOCK_SYSTEM_GUIDE)

---

## ❌ Points d'attention & risques

### Manques identifiés:

#### 1. **CI/CD Pipeline (🔴 MANQUANT)**
**Statut:** Aucune configuration GitHub Actions, GitLab CI, ou Jenkins détectée  
**Risques:**
- Pas d'automatisation des tests
- Pas de quality gates
- Déploiement manuel (risque d'erreur humaine)

**Actions requises:**
- ✅ Créer pipeline CI/CD (GitHub Actions recommandé)
- ✅ Automatiser: lint, type-check, tests, build, deploy
- ✅ Configurer quality gates (couverture ≥80%)

#### 2. **Tests automatisés (🟡 PARTIEL)**
**Statut:** Aucun fichier de test détecté dans le repository  
**Risques:**
- Pas de validation automatique des fonctionnalités
- Pas de tests de non-régression
- DoD (Definition of Done) non respecté

**Actions requises:**
- ✅ Créer tests unitaires (Jest + React Testing Library)
- ✅ Créer tests d'intégration (GraphQL mocks)
- ✅ Créer tests E2E (Playwright ou Cypress)

#### 3. **Stratégie de rollback (🔴 NON DOCUMENTÉE)**
**Statut:** Aucune documentation de rollback  
**Risques:**
- Pas de plan B en cas de déploiement défaillant
- Temps de résolution d'incident prolongé

**Actions requises:**
- ✅ Documenter la stratégie de rollback EB
- ✅ Tester le rollback en environnement de staging
- ✅ Automatiser le rollback en cas de health check failed

#### 4. **Monitoring & Observabilité (🔴 NON CONFIGURÉ)**
**Statut:** Aucun outil de monitoring mentionné  
**Risques:**
- Pas de visibilité sur les performances en production
- Pas d'alertes en cas d'incident
- Pas de métriques GraphQL

**Actions requises:**
- ✅ Configurer APM (Application Performance Monitoring)
- ✅ Configurer error tracking (Sentry, Rollbar)
- ✅ Configurer métriques GraphQL (Apollo Studio)
- ✅ Configurer dashboards AWS CloudWatch

#### 5. **Sécurité des dépendances (🟡 À VALIDER)**
**Statut:** Pas d'audit de sécurité automatisé détecté  
**Risques:**
- Vulnérabilités npm non détectées
- Images Docker non scannées

**Actions requises:**
- ✅ Intégrer `npm audit` dans le pipeline CI
- ✅ Configurer Dependabot ou Renovate
- ✅ Scanner les images Docker (Trivy, Snyk)

#### 6. **Environnements multiples (🟡 PARTIEL)**
**Statut:** Configuration pour dev/prod, staging non mentionné  
**Risques:**
- Pas d'environnement de pré-production
- Tests en production (risqué)

**Actions requises:**
- ✅ Créer environnement de staging (Elastic Beanstalk)
- ✅ Documenter la stratégie de promotion (dev → staging → prod)
- ✅ Configurer blue/green deployment ou canary releases

---

## 🎯 Questions ouvertes pour les Product Owners

### Infrastructure & Déploiement:
1. **Régions AWS:** Quelle(s) région(s) AWS doit-on cibler pour la production? (Actuellement: us-east-1)
2. **Multi-région:** Faut-il prévoir un déploiement multi-région pour la haute disponibilité?
3. **CDN:** Doit-on utiliser CloudFront pour distribuer les assets statiques?
4. **Environnements:** Combien d'environnements sont requis? (dev, staging, prod, sandbox?)

### Performance & SLA:
5. **SLA/SLO:** Quels sont les objectifs de disponibilité? (99.9%, 99.95%, 99.99%?)
6. **Performance:** Quel est le temps de réponse maximal acceptable pour le chargement du Dashboard?
7. **Scaling:** Doit-on prévoir un auto-scaling pour gérer les pics de trafic?

### Sécurité & Compliance:
8. **HTTPS:** HTTPS obligatoire en production? (Recommandation: OUI)
9. **Authentification:** Quel mécanisme d'auth doit être intégré? (OAuth2, OIDC, Cognito?)
10. **Data Residency:** Y a-t-il des contraintes de localisation des données?
11. **Compliance:** Quelles normes de sécurité doivent être respectées? (SOC2, ISO27001, GDPR?)

### Monitoring & Alerting:
12. **Outils de monitoring:** Quels outils sont déjà utilisés dans l'organisation? (DataDog, New Relic, CloudWatch?)
13. **Error tracking:** Doit-on intégrer Sentry ou équivalent?
14. **Alerting:** Quels sont les canaux d'alerte préférés? (Slack, PagerDuty, email?)

### CI/CD:
15. **Fréquence de déploiement:** Quelle est la cadence de release souhaitée? (continue, hebdomadaire, mensuelle?)
16. **Approval process:** Les déploiements en production nécessitent-ils une approbation manuelle?
17. **Rollback automatique:** Doit-on configurer un rollback automatique en cas d'échec des health checks?

---

## 📝 Prochaines étapes recommandées

### Pour le **WebContainerizationAgent**:
- ✅ Dockerfile déjà optimisé → **Pas d'action requise**
- ⚠️ Valider la configuration Nginx pour les SPA (gestion du routing React)
- ⚠️ Ajouter un health check endpoint (`/health` ou `/api/health`)
- ⚠️ Documenter le build process pour l'architecture microfrontend

### Pour le **TerraformInfraAgent**:
- 🔴 **ACTION CRITIQUE:** Créer l'infrastructure Terraform pour:
  - AWS Elastic Beanstalk (environments: dev, staging, prod)
  - Application Load Balancer (ALB) avec HTTPS
  - Auto Scaling Group (ASG) avec politiques de scaling
  - CloudFront distribution (CDN) pour assets statiques
  - Route53 pour DNS management
  - S3 buckets pour artifacts et logs
  - IAM roles et policies
  - CloudWatch alarms et dashboards
  - Secrets Manager pour variables sensibles

### Pour le **DeploymentCICDAgent**:
- 🔴 **ACTION CRITIQUE:** Créer le pipeline CI/CD (GitHub Actions recommandé):
  - **Stage 1 - Lint & Type Check:**
    - `npm run lint`
    - `npm run type-check`
  - **Stage 2 - Tests:**
    - Tests unitaires (Jest + React Testing Library)
    - Tests d'intégration (GraphQL mocks)
    - Tests E2E (Playwright ou Cypress)
    - Quality gate: couverture ≥80%
  - **Stage 3 - Build:**
    - `npm run build`
    - Validation de la génération de `remoteEntry.js`
    - Build de l'image Docker
    - Scan de sécurité de l'image (Trivy)
  - **Stage 4 - Deploy:**
    - Push de l'image Docker vers ECR
    - Déploiement vers Elastic Beanstalk (dev, staging, prod)
    - Health checks post-déploiement
    - Rollback automatique si échec
  - **Stage 5 - Monitoring:**
    - Vérification des métriques CloudWatch
    - Alertes Slack/PagerDuty si anomalie détectée

### Pour l'**Opérateur humain**:
- 📋 Répondre aux **17 questions ouvertes** ci-dessus
- 📋 Valider les **exigences de performance** (SLA/SLO)
- 📋 Définir la **stratégie de rollback**
- 📋 Choisir les **outils de monitoring et alerting**
- 📋 Confirmer les **environnements requis** (dev/staging/prod)
- 📋 Valider les **contraintes de sécurité et compliance**

---

## 📚 Documentation de référence

### Jira:
- **Projet:** CGIAIT
- **URL:** https://cgi-team-h8y15voc.atlassian.net/jira/core/projects/CGIAIT/
- **Issues analysées:** 12 tickets actifs (statut "À faire")

### Repository:
- **URL:** https://github.com/ClemOrc/poc-demo-mywealth-ui
- **Langage principal:** TypeScript
- **Framework:** React 18.2
- **Branche par défaut:** main

### Fichiers clés:
- `README.md` - Documentation applicative complète
- `DEPLOYMENT.md` - Guide de déploiement AWS EB
- `Dockerfile` - Configuration de conteneurisation
- `webpack.config.js` - Configuration Module Federation
- `.env.example` - Variables d'environnement requises
- `MOCK_SYSTEM_GUIDE.md` - Documentation du système de mocks

---

## ✍️ Métadonnées

**Document créé par:** JiraRequirementsAnalysisAgent  
**Date de création:** 2024  
**Version:** 1.0  
**Statut:** ✅ Complet  
**Prochaine revue:** À chaque sprint ou modification majeure des tickets Jira  

---

## 🔖 Checklist des contraintes Infra/CI/CD

### Performance & Réactivité:
- [ ] ⚠️ **CRITIQUE:** Interdire `window.location.reload()` dans le code
- [ ] ⚠️ **CRITIQUE:** Valider la réactivité UI (mises à jour instantanées)
- [ ] ⚠️ **CRITIQUE:** Tester le state management dynamique (compteurs, listes)

### Tests & Qualité:
- [ ] 🔴 Créer tests unitaires (couverture ≥80%)
- [ ] 🔴 Créer tests d'intégration (GraphQL)
- [ ] 🔴 Créer tests E2E (workflows complets)
- [ ] 🟡 Configurer ESLint + TypeScript strict dans le CI
- [ ] 🟡 Ajouter tests d'accessibilité (axe-core)

### CI/CD Pipeline:
- [ ] 🔴 Créer pipeline GitHub Actions (ou équivalent)
- [ ] 🔴 Automatiser: lint → tests → build → deploy
- [ ] 🔴 Configurer quality gates (couverture, vulnérabilités)
- [ ] 🟡 Configurer déploiements multi-environnements (dev/staging/prod)
- [ ] 🟡 Documenter et tester la stratégie de rollback

### Infrastructure:
- [ ] 🔴 Créer infrastructure Terraform (EB, ALB, CloudFront, etc.)
- [ ] 🟡 Configurer auto-scaling pour gérer les pics de charge
- [ ] 🟡 Configurer HTTPS avec certificats SSL (ACM)
- [ ] 🟡 Configurer CloudFront pour CDN (assets statiques)
- [ ] 🟡 Configurer Route53 pour DNS management

### Monitoring & Observabilité:
- [ ] 🔴 Configurer APM (Application Performance Monitoring)
- [ ] 🔴 Configurer error tracking (Sentry, Rollbar)
- [ ] 🟡 Configurer métriques GraphQL (Apollo Studio)
- [ ] 🟡 Configurer dashboards CloudWatch
- [ ] 🟡 Configurer alertes Slack/PagerDuty

### Sécurité:
- [ ] 🔴 Intégrer `npm audit` dans le pipeline CI
- [ ] 🟡 Configurer Dependabot ou Renovate
- [ ] 🟡 Scanner les images Docker (Trivy, Snyk)
- [ ] 🟡 Configurer Secrets Manager pour variables sensibles
- [ ] 🟡 Valider les standards d'accessibilité (WCAG 2.1 AA)

### Documentation:
- [ ] 🔴 Documenter la stratégie de rollback
- [ ] 🟡 Documenter le build process microfrontend
- [ ] 🟡 Créer runbook pour incidents courants
- [ ] 🟡 Documenter les variables d'environnement par environnement

---

**🎯 Priorités:**
- 🔴 **CRITIQUE** - Bloquant pour la production
- 🟡 **IMPORTANT** - Requis mais non-bloquant
- ⚠️ **ATTENTION** - Contrainte technique à respecter

---

**📧 Contact:**
Pour toute question sur ce document, contacter l'équipe DevOps ou le Product Owner du projet CGIAIT.
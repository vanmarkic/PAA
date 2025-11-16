# Guide d'Hébergement - PAA

**Date:** 16 novembre 2025
**Version:** 2.0 (Production-Ready)

---

## Table des Matières

1. [Options d'Hébergement](#options-dhébergement)
2. [Recommandation pour Phase 1](#recommandation-pour-phase-1)
3. [Configuration pour Chaque Plateforme](#configuration-pour-chaque-plateforme)
4. [Estimation des Coûts](#estimation-des-coûts)
5. [Migration Phase 1 → Phase 2](#migration-phase-1--phase-2)

---

## Options d'Hébergement

### 🏆 Option 1: AWS (Amazon Web Services) - RECOMMANDÉ

**Niveau:** Enterprise-ready
**Complexité:** Moyenne
**Coût mensuel Phase 1:** ~400-600 EUR/mois

#### Services Utilisés

| Service | Usage | Taille Phase 1 | Coût/mois |
|---------|-------|----------------|-----------|
| **EC2** | API Server (Fastify) | t3.medium (2 vCPU, 4GB RAM) | ~40 EUR |
| **RDS PostgreSQL** | Base de données | db.t3.small (2GB RAM) | ~50 EUR |
| **ElastiCache Redis** | Cache + Queue | cache.t3.small (1.5GB RAM) | ~40 EUR |
| **Application Load Balancer** | Load balancing + SSL | - | ~25 EUR |
| **S3** | Backups + Assets | 50 GB | ~2 EUR |
| **CloudWatch** | Monitoring + Logs | - | ~10 EUR |
| **Route 53** | DNS | 1 zone | ~1 EUR |
| **Certificate Manager** | SSL/TLS gratuit | - | 0 EUR |
| **Data Transfer** | Sortant | ~100 GB | ~10 EUR |
| **Backups** | RDS + snapshots | - | ~20 EUR |

**Total:** ~200 EUR/mois (1 instance)
**Haute disponibilité (2 zones):** ~400 EUR/mois

#### Architecture AWS Phase 1

```
Internet
    ↓
Route 53 (DNS: paa.belgium.be)
    ↓
Application Load Balancer (HTTPS)
    ├─ SSL/TLS (Certificate Manager)
    └─ Health checks
    ↓
┌────────────────────────────────────────────┐
│  VPC (Virtual Private Cloud)               │
│                                            │
│  Public Subnet (2 AZs)                     │
│  ├─ EC2 Instance 1 (eu-west-1a)           │
│  │   - Fastify API                        │
│  │   - Auto Scaling Group                 │
│  └─ EC2 Instance 2 (eu-west-1b)           │
│      - Failover                            │
│                                            │
│  Private Subnet (2 AZs)                    │
│  ├─ RDS PostgreSQL (Multi-AZ)             │
│  │   - Master + Standby                    │
│  │   - Automated backups (7 jours)         │
│  └─ ElastiCache Redis (Cluster)           │
│      - 2 nodes                             │
└────────────────────────────────────────────┘
```

#### Avantages ✅
- **Fiabilité:** SLA 99.99% (Multi-AZ)
- **Scalabilité:** Auto-scaling automatique
- **Sécurité:** Conformité GDPR, certifications ISO
- **Monitoring:** CloudWatch intégré
- **Backups:** Automatiques avec point-in-time recovery
- **Support:** Support technique 24/7 (optionnel)
- **Localisation:** Data centers EU (Frankfurt, Paris, Milan)

#### Inconvénients ⚠️
- Configuration initiale complexe
- Coûts variables (attention aux dépassements)
- Courbe d'apprentissage pour l'équipe

#### Déploiement AWS

```bash
# 1. Installation AWS CLI
brew install awscli  # macOS
# ou
apt-get install awscli  # Ubuntu

# 2. Configuration
aws configure
# AWS Access Key ID: [votre clé]
# AWS Secret Access Key: [votre secret]
# Default region: eu-west-1  # Irlande
# Default output format: json

# 3. Créer infrastructure (Infrastructure as Code)
# Utiliser Terraform ou AWS CloudFormation
terraform init
terraform plan
terraform apply

# 4. Déployer l'application
# Via CI/CD (GitHub Actions, GitLab CI)
npm run build
docker build -t paa-api .
aws ecr get-login-password | docker login --username AWS --password-stdin
docker push <ecr-url>/paa-api:latest
aws ecs update-service --service paa-api --force-new-deployment
```

---

### 🥈 Option 2: DigitalOcean - SIMPLE & ABORDABLE

**Niveau:** Startup-friendly
**Complexité:** Faible
**Coût mensuel Phase 1:** ~200-300 EUR/mois

#### Services Utilisés

| Service | Usage | Taille | Coût/mois |
|---------|-------|--------|-----------|
| **App Platform** | API deployment | 2 containers (1GB RAM each) | ~24 EUR |
| **Managed PostgreSQL** | Base de données | 2GB RAM, 25GB SSD | ~30 EUR |
| **Managed Redis** | Cache + Queue | 1GB RAM | ~30 EUR |
| **Load Balancer** | HTTPS + distribution | - | ~12 EUR |
| **Spaces** | Backups (S3-compatible) | 250 GB | ~5 EUR |
| **Monitoring** | Metrics + alertes | - | ~8 EUR |
| **Bandwidth** | - | Inclus (1TB) | 0 EUR |

**Total:** ~110 EUR/mois (base)
**Haute disponibilité:** ~200 EUR/mois

#### Architecture DigitalOcean Phase 1

```
Internet
    ↓
Load Balancer (HTTPS)
    ├─ Let's Encrypt SSL (gratuit)
    └─ Health checks
    ↓
App Platform
    ├─ Container 1 (API)
    └─ Container 2 (API) - Failover
    ↓
Managed Services
    ├─ PostgreSQL (Managed Database)
    │   - 2GB RAM
    │   - Daily backups
    │   - Connection pooling
    └─ Redis (Managed Redis)
        - 1GB RAM
        - Persistence
```

#### Avantages ✅
- **Simplicité:** Interface intuitive, setup rapide
- **Prix transparent:** Pas de surprises
- **Monitoring inclus:** Dashboards built-in
- **Backups automatiques:** Daily snapshots
- **Support:** Support technique réactif
- **Documentation:** Excellente documentation
- **Localisation EU:** Data centers Amsterdam, Frankfurt

#### Inconvénients ⚠️
- Moins de services avancés qu'AWS
- Moins de certifications de conformité
- Scalabilité limitée pour Phase 3

#### Déploiement DigitalOcean

```bash
# 1. Installation doctl (CLI)
brew install doctl  # macOS
# ou
snap install doctl  # Ubuntu

# 2. Authentification
doctl auth init

# 3. Créer App Platform app
doctl apps create --spec .do/app.yaml

# .do/app.yaml
name: paa-api
region: ams  # Amsterdam
services:
  - name: api
    github:
      repo: vanmarkic/PAA
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm start
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
    instance_count: 2
    instance_size_slug: basic-xs  # 512MB RAM
databases:
  - name: paa-db
    engine: PG
    version: "15"
    size: db-s-1vcpu-2gb
  - name: paa-redis
    engine: REDIS
    version: "7"
    size: db-s-1vcpu-1gb
```

---

### 🥉 Option 3: Heroku - ULTRA-SIMPLE

**Niveau:** Prototyping
**Complexité:** Très faible
**Coût mensuel Phase 1:** ~250-400 EUR/mois

#### Services (Addons)

| Service | Addon | Plan | Coût/mois |
|---------|-------|------|-----------|
| **Dynos** | Standard | 2x Standard-1X (512MB) | ~50 EUR |
| **PostgreSQL** | Heroku Postgres | Standard-0 (64GB) | ~50 EUR |
| **Redis** | Heroku Redis | Premium-0 (100MB) | ~15 EUR |
| **SSL** | - | Inclus | 0 EUR |
| **Logs** | Papertrail | Choklad (1GB logs) | ~7 EUR |
| **Monitoring** | New Relic | - | ~25 EUR |

**Total:** ~150 EUR/mois (base)
**Performance tier:** ~300 EUR/mois

#### Avantages ✅
- **Déploiement instantané:** `git push heroku main`
- **Zéro configuration:** Tout est managé
- **Addons marketplace:** 200+ addons disponibles
- **Gratuit pour tester:** Free tier disponible
- **Localisation EU:** Region Europe disponible

#### Inconvénients ⚠️
- **Coût élevé:** Plus cher pour performance équivalente
- **Lock-in:** Difficile de migrer ailleurs
- **Moins de contrôle:** Pas d'accès SSH
- **Sleep mode:** Apps free s'endorment après 30 min
- **Limites strictes:** RAM, CPU, connexions DB

#### Déploiement Heroku

```bash
# 1. Installation Heroku CLI
brew install heroku/brew/heroku

# 2. Login
heroku login

# 3. Créer app
heroku create paa-api --region eu

# 4. Ajouter addons
heroku addons:create heroku-postgresql:standard-0
heroku addons:create heroku-redis:premium-0

# 5. Config vars
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)

# 6. Déployer
git push heroku main

# 7. Migrate DB
heroku run npm run migration:run

# 8. Open
heroku open
```

---

### 🇧🇪 Option 4: Hébergeurs Belges - CONFORMITÉ LOCALE

#### 4a. Combell (Belgique)

**Niveau:** Professional
**Complexité:** Moyenne
**Coût mensuel:** ~150-250 EUR/mois

**Services:**
- VPS Premium (4 vCPU, 8GB RAM): ~80 EUR/mois
- Managed PostgreSQL: ~40 EUR/mois
- Managed Redis: ~30 EUR/mois
- SSL certificate: ~20 EUR/an
- Backups daily: Inclus

**Avantages:**
- ✅ Support en français/néerlandais
- ✅ Data centers en Belgique
- ✅ Conformité GDPR garantie
- ✅ Support local (téléphone belgique)

**Inconvénients:**
- ⚠️ Moins de features que cloud providers
- ⚠️ Scalabilité limitée

#### 4b. OVH (France/Belgique)

**Niveau:** Professional
**Complexité:** Moyenne
**Coût mensuel:** ~100-200 EUR/mois

**Services:**
- VPS SSD 3 (2 vCPU, 8GB RAM): ~25 EUR/mois
- PostgreSQL as a Service: ~40 EUR/mois
- Redis as a Service: ~30 EUR/mois
- Load Balancer: ~20 EUR/mois

**Avantages:**
- ✅ Prix compétitifs
- ✅ Data centers EU (Gravelines, Roubaix)
- ✅ Bonne documentation
- ✅ Conformité GDPR

**Inconvénients:**
- ⚠️ Interface moins intuitive
- ⚠️ Support parfois lent

---

## Recommandation pour Phase 1

### 🎯 Recommandation: **DigitalOcean** (Option 2)

**Pourquoi DigitalOcean pour démarrer?**

1. **Rapport qualité/prix optimal:** ~200 EUR/mois pour HA
2. **Simplicité:** Setup en 1 journée vs 1 semaine sur AWS
3. **Scalabilité suffisante:** Peut supporter Phase 1 & Phase 2
4. **Support réactif:** Chat support en 2-5 minutes
5. **Documentation:** Tutoriels excellents
6. **Conformité EU:** Data centers Amsterdam/Frankfurt

### Migration vers AWS en Phase 3

Quand migrer vers AWS:
- ✅ > 500 utilisateurs simultanés
- ✅ > 100,000 requêtes/jour
- ✅ Multi-régions nécessaire (Wallonie/Flandre/Bruxelles)
- ✅ Budget > 1000 EUR/mois
- ✅ Équipe DevOps dédiée

---

## Configuration pour DigitalOcean (Recommandé)

### Étape 1: Créer un Compte

```bash
# 1. S'inscrire sur DigitalOcean
https://www.digitalocean.com/

# 2. Ajouter méthode de paiement

# 3. Créer un Personal Access Token
# Settings → API → Generate New Token
```

### Étape 2: Installer doctl

```bash
# macOS
brew install doctl

# Ubuntu
snap install doctl

# Authentification
doctl auth init
# Entrer votre Personal Access Token
```

### Étape 3: Créer l'Infrastructure

#### 3a. Créer PostgreSQL Database

```bash
doctl databases create paa-postgres \
  --engine pg \
  --version 15 \
  --region ams3 \
  --size db-s-2vcpu-4gb \
  --num-nodes 1

# Attendre 5-10 minutes

# Récupérer connection string
doctl databases connection paa-postgres
```

#### 3b. Créer Redis Database

```bash
doctl databases create paa-redis \
  --engine redis \
  --version 7 \
  --region ams3 \
  --size db-s-1vcpu-1gb \
  --num-nodes 1
```

#### 3c. Créer App Platform App

Créer fichier `.do/app.yaml`:

```yaml
name: paa-api
region: ams

services:
  - name: api
    github:
      repo: vanmarkic/PAA
      branch: main
      deploy_on_push: true

    dockerfile_path: Dockerfile

    envs:
      - key: NODE_ENV
        value: production

      - key: PORT
        value: "8080"

      - key: DATABASE_URL
        value: ${paa-postgres.DATABASE_URL}

      - key: REDIS_HOST
        value: ${paa-redis.HOSTNAME}

      - key: REDIS_PORT
        value: ${paa-redis.PORT}

      - key: REDIS_PASSWORD
        value: ${paa-redis.PASSWORD}

      - key: JWT_SECRET
        value: ${JWT_SECRET}
        type: SECRET

    health_check:
      http_path: /health
      initial_delay_seconds: 60
      period_seconds: 10
      timeout_seconds: 5
      success_threshold: 1
      failure_threshold: 3

    http_port: 8080

    instance_count: 2
    instance_size_slug: basic-xxs  # 512MB RAM, $5/month each

    routes:
      - path: /

databases:
  - name: paa-postgres
    production: true

  - name: paa-redis
    production: true
```

Déployer:

```bash
doctl apps create --spec .do/app.yaml
```

### Étape 4: Configurer le Domaine

```bash
# 1. Ajouter domaine dans DigitalOcean
doctl compute domain create paa.belgium.be

# 2. Configurer DNS
doctl compute domain records create paa.belgium.be \
  --record-type A \
  --record-name @ \
  --record-data <APP_IP>

# 3. Activer HTTPS
# Automatique avec Let's Encrypt dans App Platform
```

### Étape 5: Configurer les Backups

```bash
# PostgreSQL: backups automatiques quotidiens (inclus)
# Vérifier:
doctl databases backups list <database-id>

# Configurer Spaces pour backups applicatifs
doctl compute space create paa-backups --region ams3
```

### Étape 6: Monitoring

```bash
# App Platform a monitoring built-in
# Accéder via UI: Insights → Metrics

# Configurer alertes
doctl monitoring alert create \
  --type v1/insights/droplet/cpu \
  --compare GreaterThan \
  --value 80 \
  --window 5m \
  --emails admin@paa.belgium.be
```

---

## Estimation des Coûts Détaillée

### Phase 1 (50 users, 10K req/h)

#### DigitalOcean (Recommandé)

| Ressource | Specs | Coût/mois |
|-----------|-------|-----------|
| App Platform | 2x basic-xxs (512MB) | ~10 EUR |
| PostgreSQL | 2 vCPU, 4GB RAM, 25GB SSD | ~60 EUR |
| Redis | 1 vCPU, 1GB RAM | ~30 EUR |
| Load Balancer | - | ~12 EUR |
| Spaces | 50 GB backups | ~2 EUR |
| Monitoring | Included | 0 EUR |
| Bandwidth | 1TB (included) | 0 EUR |
| **TOTAL** | | **~114 EUR/mois** |

**Avec haute disponibilité (+1 region):** ~200 EUR/mois

---

### Phase 2 (500 users, 100K req/h)

#### DigitalOcean

| Ressource | Specs | Coût/mois |
|-----------|-------|-----------|
| App Platform | 4x professional-xs (1GB) | ~80 EUR |
| PostgreSQL | 4 vCPU, 8GB RAM, 100GB SSD | ~120 EUR |
| Redis | 2 vCPU, 2GB RAM | ~60 EUR |
| Load Balancer | 2 regions | ~24 EUR |
| Spaces | 200 GB | ~8 EUR |
| CDN | - | ~10 EUR |
| **TOTAL** | | **~302 EUR/mois** |

---

### Phase 3 (5000 users, 1M req/h)

#### AWS (Recommandé pour Phase 3)

| Ressource | Specs | Coût/mois |
|-----------|-------|-----------|
| EC2 (Auto Scaling) | 4x t3.large (2 vCPU, 8GB) | ~280 EUR |
| RDS PostgreSQL | db.r5.xlarge (4 vCPU, 32GB) Multi-AZ | ~450 EUR |
| ElastiCache Redis | cache.m5.large (2 nodes) | ~180 EUR |
| Application Load Balancer | 3 regions | ~75 EUR |
| S3 + CloudFront (CDN) | 1TB storage + 10TB transfer | ~100 EUR |
| CloudWatch | Logs + metrics | ~50 EUR |
| Route 53 | DNS | ~2 EUR |
| NAT Gateway | 3 AZs | ~120 EUR |
| Data Transfer | - | ~150 EUR |
| **TOTAL** | | **~1,407 EUR/mois** |

---

## Migration Phase 1 → Phase 2

### Timeline: Quand Migrer?

**Indicateurs de migration:**
- ✅ > 40 utilisateurs simultanés réguliers
- ✅ > 8,000 requêtes/heure
- ✅ Temps de réponse P95 > 200ms
- ✅ Taux d'erreur > 1%
- ✅ Database CPU > 70%

### Checklist de Migration

#### 1. Préparation (Semaine -2)

```bash
# 1. Backup complet
pg_dump -h <old-host> -U paa_user paa_db > backup.sql

# 2. Test de charge
# Utiliser k6, Apache Bench, ou Gatling
k6 run load-test.js

# 3. Documenter l'architecture actuelle
# Diagrammes, configs, credentials
```

#### 2. Setup Nouvelle Infrastructure (Semaine -1)

```bash
# 1. Créer nouveau database (plus gros)
doctl databases create paa-postgres-v2 \
  --size db-s-4vcpu-8gb

# 2. Créer nouveau Redis
doctl databases create paa-redis-v2 \
  --size db-s-2vcpu-2gb

# 3. Tester connectivity
psql <connection-string-v2>
```

#### 3. Migration des Données (Jour J - 2h downtime)

```bash
# 1. Mettre app en mode maintenance
doctl apps update <app-id> --spec maintenance.yaml

# 2. Dump database
pg_dump -h <old> -U paa_user -Fc paa_db > dump.backup

# 3. Restore sur nouveau
pg_restore -h <new> -U paa_user -d paa_db dump.backup

# 4. Vérifier data integrity
psql -h <new> -U paa_user -c "SELECT COUNT(*) FROM users;"

# 5. Update app config
doctl apps update <app-id> \
  --env DATABASE_URL=<new-connection-string>

# 6. Redeploy
doctl apps create-deployment <app-id>

# 7. Smoke tests
curl https://paa.belgium.be/health
curl https://paa.belgium.be/api/auth/login -X POST ...

# 8. Disable maintenance mode
```

#### 4. Post-Migration (Semaine +1)

```bash
# 1. Monitor pendant 7 jours
# - Temps de réponse
# - Taux d'erreur
# - Usage CPU/RAM
# - Coûts

# 2. Optimiser si nécessaire
# - Ajouter indexes
# - Tune connection pool
# - Adjust cache TTL

# 3. Supprimer ancienne infra (si tout OK)
doctl databases delete <old-db-id>
```

---

## Checklist de Déploiement Production

### Avant le Déploiement

- [ ] **Sécurité**
  - [ ] JWT_SECRET généré avec `openssl rand -hex 32`
  - [ ] Passwords DB forts (> 20 caractères)
  - [ ] CORS_ORIGIN restrictif (pas `*`)
  - [ ] Rate limiting activé
  - [ ] HTTPS forcé

- [ ] **Base de Données**
  - [ ] Migrations testées en staging
  - [ ] Backups automatiques configurés
  - [ ] Connection pooling configuré
  - [ ] Indexes créés

- [ ] **Monitoring**
  - [ ] Health check endpoint fonctionne
  - [ ] Logs centralisés configurés
  - [ ] Alertes configurées (CPU > 80%, erreurs > 1%)
  - [ ] Uptime monitoring (UptimeRobot, Pingdom)

- [ ] **Performance**
  - [ ] Load testing effectué
  - [ ] Cache warming script prêt
  - [ ] CDN configuré (si nécessaire)

- [ ] **Documentation**
  - [ ] Runbook de déploiement
  - [ ] Runbook d'incident
  - [ ] Contacts d'urgence
  - [ ] Changelog maintenu

### Après le Déploiement

- [ ] Smoke tests passed
- [ ] Monitoring actif
- [ ] Team notifiée
- [ ] Documentation mise à jour
- [ ] Rollback plan testé

---

## Support et Assistance

### DigitalOcean
- **Support:** https://www.digitalocean.com/support
- **Community:** https://www.digitalocean.com/community
- **Status:** https://status.digitalocean.com/

### AWS
- **Support:** https://console.aws.amazon.com/support
- **Documentation:** https://docs.aws.amazon.com/
- **Status:** https://status.aws.amazon.com/

### Heroku
- **Support:** https://help.heroku.com/
- **Status:** https://status.heroku.com/

---

## Conclusion

### Récapitulatif des Recommandations

| Phase | Hébergeur | Coût/mois | Utilisateurs | Complexité |
|-------|-----------|-----------|--------------|------------|
| **Phase 1** | DigitalOcean | ~200 EUR | 50 | Faible |
| **Phase 2** | DigitalOcean | ~300 EUR | 500 | Moyenne |
| **Phase 3** | AWS | ~1,400 EUR | 5000 | Élevée |

### Prochaines Étapes

1. **Semaine 1:** Créer compte DigitalOcean, setup infrastructure
2. **Semaine 2:** Déployer staging environment
3. **Semaine 3:** Tests de charge, tuning
4. **Semaine 4:** Déploiement production

**Questions?** Consultez la documentation ou contactez le support de votre hébergeur.

---

**Dernière mise à jour:** 16 novembre 2025
**Auteur:** Claude (Assistant IA) + Équipe PAA

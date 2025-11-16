# Roadmap Détaillée - Phases 2 & 3

**Date:** 16 novembre 2025
**Version:** 2.0
**Status:** Phase 1 Complétée ✅

---

## Vue d'Ensemble

Ce document détaille les phases 2 et 3 du projet PAA pour atteindre une scalabilité nationale et enterprise.

```
Phase 1 (ACTUELLE) ✅  →  Phase 2 (6-8 sem)  →  Phase 3 (3-4 mois)
50 users               →  500 users          →  5,000 users
10K req/h              →  100K req/h         →  1M req/h
200 EUR/mois           →  300 EUR/mois       →  1,400 EUR/mois
```

---

## Table des Matières

1. [Phase 2: Scalabilité Nationale](#phase-2-scalabilité-nationale)
2. [Phase 3: Enterprise Scale](#phase-3-enterprise-scale)
3. [Comparaison des Phases](#comparaison-des-phases)
4. [Migration Between Phases](#migration-between-phases)
5. [Risks & Mitigation](#risks--mitigation)

---

## Phase 2: Scalabilité Nationale

**Objectif:** Support de 100 CPAS en Belgique
**Timeline:** 6-8 semaines
**Budget:** 80,000-120,000 EUR (développement)
**Coût opérationnel:** ~300 EUR/mois

### Capacités Cibles

| Métrique | Phase 1 | Phase 2 |
|----------|---------|---------|
| Utilisateurs simultanés | 50 | 500 |
| CPAS supportés | 10 | 100 |
| Vérifications RIS/heure | 10,000 | 100,000 |
| Conversions texte/heure | 500 | 2,000 |
| Temps réponse P95 | < 100ms | < 50ms |
| Cache hit rate | 70% | 90% |
| Uptime SLA | 99.5% | 99.9% |

---

### 🎯 Fonctionnalités à Implémenter

#### 1. Multi-Régions (Wallonie, Flandre, Bruxelles)

**Problème actuel:**
- Toute l'infra est dans une seule région (Amsterdam)
- Latence élevée pour utilisateurs éloignés
- Pas de failover géographique

**Solution:**

##### Architecture Multi-Régions

```
                    Global Load Balancer (GeoDNS)
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
    Region 1              Region 2              Region 3
    Brussels              Wallonie              Flandre
    (Primary)             (Secondary)           (Secondary)
        ↓                     ↓                     ↓
    API + Cache           API + Cache           API + Cache
        ↓                     ↓                     ↓
         └────────────────────┴─────────────────────┘
                              ↓
                    PostgreSQL Multi-Master
                    (CockroachDB ou Citus)
```

##### Implémentation

**Étape 1: Setup GeoDNS**

```yaml
# Cloudflare Load Balancer config
load_balancers:
  - name: paa-global
    steering_policy: geo
    pools:
      - name: brussels
        region: BE
        origin: api-bru.paa.be
        weight: 100

      - name: wallonie
        region: BE-WAL
        origin: api-wal.paa.be
        weight: 100

      - name: flandre
        region: BE-VLG
        origin: api-vl.paa.be
        weight: 100

    health_checks:
      path: /health
      interval: 30
      retries: 2
      timeout: 5
```

**Étape 2: Database Sharding par Région**

```typescript
// src/database/sharding.ts
export function getShardForOrganization(organizationId: string): string {
  const org = await Organization.findById(organizationId);

  switch (org.region) {
    case 'wallonie':
      return 'DB_WALLONIE_URL';
    case 'flandre':
      return 'DB_FLANDRE_URL';
    case 'bruxelles':
      return 'DB_BRUXELLES_URL';
    default:
      return 'DB_PRIMARY_URL';
  }
}

// Automatic routing
export class ShardedDataSource {
  async query(organizationId: string, sql: string) {
    const shard = getShardForOrganization(organizationId);
    return shard.query(sql);
  }
}
```

**Coût:**
- 3x infrastructure (3 régions) = +200 EUR/mois
- GeoDNS (Cloudflare Load Balancer) = +20 EUR/mois
- **Total:** +220 EUR/mois

**Bénéfices:**
- ✅ Latence réduite de 50% pour utilisateurs locaux
- ✅ Haute disponibilité (failover automatique)
- ✅ Conformité réglementaire (data residency)

---

#### 2. Workers Pool pour Conversions de Texte

**Problème actuel:**
- Conversions bloquantes (17s/document)
- Queue unique (1 consumer)
- Pas de parallélisation

**Solution:**

##### Architecture Workers Pool

```
Bull Queue (Redis)
    ├─ Priority High Queue
    ├─ Priority Normal Queue
    └─ Priority Low Queue
    ↓
Worker Pool (5+ workers)
    ├─ Worker 1 (Container 1)
    ├─ Worker 2 (Container 2)
    ├─ Worker 3 (Container 3)
    ├─ Worker 4 (Container 4)
    └─ Worker 5 (Container 5)
    ↓
LLM API (Claude/GPT)
    ├─ Rate limiting (100 req/min)
    └─ Retry logic
```

##### Implémentation

**Étape 1: Worker Service**

```typescript
// src/workers/conversionWorker.ts
import { Worker } from 'bullmq';
import { convertLegalTextParallel } from '../services/conversionService';

const worker = new Worker(
  'legal-text-conversion',
  async (job) => {
    const { legalText } = job.data;

    // Update progress
    await job.updateProgress(0);

    try {
      const result = await convertLegalTextParallel(legalText);
      await job.updateProgress(100);
      return result;
    } catch (error) {
      // Retry logic handled by Bull
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    concurrency: 10, // Process 10 jobs in parallel per worker
    limiter: {
      max: 100, // Max 100 jobs
      duration: 60000, // per minute (rate limiting)
    },
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
```

**Étape 2: Docker Compose pour Workers**

```yaml
# docker-compose.workers.yml
version: '3.8'

services:
  worker-1:
    build: .
    command: node dist/workers/conversionWorker.js
    environment:
      WORKER_ID: worker-1
      REDIS_HOST: redis
      REDIS_PORT: 6379
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
    restart: always

  worker-2:
    build: .
    command: node dist/workers/conversionWorker.js
    environment:
      WORKER_ID: worker-2
      REDIS_HOST: redis
      REDIS_PORT: 6379
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
    restart: always

  # ... worker-3, worker-4, worker-5
```

**Coût:**
- 5x workers (DigitalOcean basic-xs) = +25 EUR/mois
- LLM API (Claude API) = ~100 EUR/mois (basé sur volume)
- **Total:** +125 EUR/mois

**Bénéfices:**
- ✅ Throughput multiplié par 5x (500 → 2,500 conversions/h)
- ✅ Pas de blocking de l'API principale
- ✅ Graceful degradation (si 1 worker crash, les autres continuent)

---

#### 3. Event Sourcing avec Kafka

**Problème actuel:**
- Audit logs stockés directement en DB
- Pas de replay possible
- Pas de pub/sub pour événements

**Solution:**

##### Architecture Event Sourcing

```
API Server
    ↓ (emit event)
Kafka Topics
    ├─ user.created
    ├─ ris-application.submitted
    ├─ ris-application.approved
    ├─ ris-application.rejected
    ├─ conversion.requested
    └─ conversion.completed
    ↓ (subscribe)
Event Consumers
    ├─ Audit Log Writer (PostgreSQL)
    ├─ Email Notification Service
    ├─ Analytics Service
    ├─ Reporting Service
    └─ Webhook Dispatcher
```

##### Implémentation

**Étape 1: Kafka Setup**

```yaml
# docker-compose.kafka.yml
version: '3.8'

services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    ports:
      - "9092:9092"
```

**Étape 2: Event Emitter**

```typescript
// src/events/eventEmitter.ts
import { Kafka, Producer } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'paa-api',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

export async function emitEvent(topic: string, event: {
  type: string;
  payload: any;
  metadata: {
    userId: string;
    timestamp: Date;
    correlationId?: string;
  };
}) {
  await producer.send({
    topic,
    messages: [
      {
        key: event.metadata.userId,
        value: JSON.stringify(event),
        timestamp: event.metadata.timestamp.getTime().toString(),
      },
    ],
  });
}

// Usage
await emitEvent('ris-application.submitted', {
  type: 'RIS_APPLICATION_SUBMITTED',
  payload: {
    applicationId: application.id,
    userId: user.id,
    eligibilityResult: result,
  },
  metadata: {
    userId: user.id,
    timestamp: new Date(),
  },
});
```

**Étape 3: Event Consumer (Audit Trail)**

```typescript
// src/events/consumers/auditConsumer.ts
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ /* ... */ });
const consumer = kafka.consumer({ groupId: 'audit-logger' });

async function run() {
  await consumer.subscribe({
    topics: [
      'user.*',
      'ris-application.*',
      'conversion.*'
    ],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());

      // Write to audit log
      await createAuditLog({
        action: event.type,
        resourceType: topic.split('.')[0],
        resourceId: event.payload.id || event.payload.applicationId,
        context: event.metadata,
        changes: event.payload.changes,
      });
    },
  });
}

run().catch(console.error);
```

**Coût:**
- Kafka managed (Confluent Cloud) = ~60 EUR/mois
- Ou self-hosted (2 vCPU, 4GB RAM) = ~40 EUR/mois
- **Total:** ~40-60 EUR/mois

**Bénéfices:**
- ✅ Event replay (pour debugging)
- ✅ Découplage des services
- ✅ Scalabilité horizontale
- ✅ Pub/sub pattern (1 event → N consumers)

---

#### 4. Advanced Caching Strategies

**Problème actuel:**
- Cache hit rate 70% (bon, mais peut être mieux)
- Pas de cache warming
- Pas de cache prefetching

**Solution:**

##### Cache Warming Strategy

```typescript
// src/cache/cacheWarming.ts

/**
 * Warm cache with most frequently accessed data
 * Run on deployment or daily at 3 AM
 */
export async function warmCache() {
  console.log('🔥 Starting cache warming...');

  // 1. Most common RIS profiles
  const commonProfiles: RISUser[] = [
    { age: 25, category: 'isolé', residencyStatus: 'belgian-citizen', monthlyIncome: 0, patrimonyValue: 0, isFullTimeStudent: false, childrenInCharge: 0 },
    { age: 30, category: 'cohabitant', residencyStatus: 'belgian-citizen', monthlyIncome: 500, patrimonyValue: 2000, isFullTimeStudent: false, childrenInCharge: 0 },
    { age: 35, category: 'famille monoparentale', residencyStatus: 'belgian-citizen', monthlyIncome: 300, patrimonyValue: 1000, isFullTimeStudent: false, childrenInCharge: 2 },
    // ... 50 most common profiles
  ];

  for (const profile of commonProfiles) {
    await checkRISEligibilityCached(profile);
  }

  // 2. Most accessed legal texts
  const popularTexts = await db.query(`
    SELECT legal_text_id, COUNT(*) as access_count
    FROM conversion_requests
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY legal_text_id
    ORDER BY access_count DESC
    LIMIT 100
  `);

  for (const { legal_text_id } of popularTexts) {
    const text = await LegalText.findById(legal_text_id);
    await convertLegalTextCached(text);
  }

  console.log('✅ Cache warming completed');
}

// Run on server startup
warmCache();

// Run daily at 3 AM
cron.schedule('0 3 * * *', () => {
  warmCache();
});
```

##### Predictive Cache Prefetching

```typescript
// src/cache/prefetching.ts

/**
 * Predict what user will request next and prefetch
 */
export async function predictivePrefe(userId: string, currentPage: string) {
  // Based on user journey analytics
  const predictions = {
    '/ris/check-eligibility': [
      '/ris/applications',         // 80% of users go here next
      '/ris/applications/new',     // 60% create application
    ],
    '/agr/check-eligibility': [
      '/agr/calculator',           // 70% use calculator
      '/ris/check-eligibility',    // 50% also check RIS
    ],
  };

  const nextPages = predictions[currentPage] || [];

  // Prefetch data for likely next pages
  for (const nextPage of nextPages) {
    if (nextPage === '/ris/applications') {
      // Prefetch user's RIS applications
      const cacheKey = `ris:applications:${userId}`;
      await getCached(cacheKey, async () => {
        return RISApplication.find({ userId });
      });
    }
  }
}
```

**Coût:**
- Pas de coût additionnel (optimisation)

**Bénéfices:**
- ✅ Cache hit rate: 70% → 90%
- ✅ Perceived latency réduite de 50%
- ✅ Meilleure expérience utilisateur

---

#### 5. Database Read Replicas

**Problème actuel:**
- Toutes les requêtes (read + write) sur master DB
- Bottleneck quand > 100 req/sec

**Solution:**

##### Master-Replica Setup

```
Write Requests
    ↓
Master DB (Primary)
    ↓ (replication)
    ├─ Replica 1 (Read)  ← Read Requests (region 1)
    ├─ Replica 2 (Read)  ← Read Requests (region 2)
    └─ Replica 3 (Read)  ← Read Requests (region 3)
```

##### Implémentation

```typescript
// src/database/replication.ts
import { DataSource } from 'typeorm';

export const MasterDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_MASTER_HOST,
  port: 5432,
  username: 'paa_user',
  password: process.env.DB_PASSWORD,
  database: 'paa_db',
  // ... other config
});

export const ReplicaDataSource = new DataSource({
  type: 'postgres',
  replication: {
    master: {
      host: process.env.DB_MASTER_HOST,
      port: 5432,
      username: 'paa_user',
      password: process.env.DB_PASSWORD,
      database: 'paa_db',
    },
    slaves: [
      {
        host: process.env.DB_REPLICA_1_HOST,
        port: 5432,
        username: 'paa_user',
        password: process.env.DB_PASSWORD,
        database: 'paa_db',
      },
      {
        host: process.env.DB_REPLICA_2_HOST,
        port: 5432,
        username: 'paa_user',
        password: process.env.DB_PASSWORD,
        database: 'paa_db',
      },
    ],
  },
  // TypeORM automatically routes SELECT to replicas
});

// Usage
export function getDataSource(operation: 'read' | 'write') {
  return operation === 'write' ? MasterDataSource : ReplicaDataSource;
}
```

**Coût:**
- 2x read replicas = +100 EUR/mois (DigitalOcean)

**Bénéfices:**
- ✅ Throughput read multiplié par 3x
- ✅ Master DB déchargé (focus sur writes)
- ✅ Latence réduite (replicas près des users)

---

### 📊 Phase 2 - Résumé

#### Timeline (6-8 semaines)

| Semaine | Tâches | Livrables |
|---------|--------|-----------|
| **S1-S2** | Multi-régions setup | 3 régions déployées |
| **S3-S4** | Workers pool + Kafka | Event sourcing opérationnel |
| **S5-S6** | Cache optimization + Read replicas | Cache hit 90% |
| **S7** | Load testing + tuning | 100K req/h supported |
| **S8** | Documentation + formation | Équipe formée |

#### Budget

| Poste | Coût |
|-------|------|
| **Développement** | |
| - 2 développeurs seniors × 8 sem | 80,000 EUR |
| - 1 DevOps engineer × 4 sem | 20,000 EUR |
| - 1 QA engineer × 2 sem | 8,000 EUR |
| **Infrastructure (setup)** | |
| - Migration | 5,000 EUR |
| - Load testing tools | 2,000 EUR |
| **Total Phase 2** | **115,000 EUR** |

#### Coût Opérationnel Mensuel

| Ressource | Coût/mois |
|-----------|-----------|
| Base infrastructure (Phase 1) | 200 EUR |
| Multi-régions (+2 regions) | +200 EUR |
| Workers pool (5 workers) | +25 EUR |
| Kafka managed | +60 EUR |
| Read replicas (2x) | +100 EUR |
| LLM API (Claude) | +100 EUR |
| Monitoring enhanced | +20 EUR |
| **TOTAL Phase 2** | **~705 EUR/mois** |

---

## Phase 3: Enterprise Scale

**Objectif:** Support de 1000+ CPAS, gouvernements régionaux
**Timeline:** 3-4 mois
**Budget:** 180,000-240,000 EUR (développement)
**Coût opérationnel:** ~1,400 EUR/mois

### Capacités Cibles

| Métrique | Phase 2 | Phase 3 |
|----------|---------|---------|
| Utilisateurs simultanés | 500 | 5,000 |
| CPAS/Organizations | 100 | 1,000+ |
| Vérifications/heure | 100,000 | 1,000,000 |
| Latence P99 | < 100ms | < 50ms |
| Uptime SLA | 99.9% | 99.95% |
| Régions | 3 | 5+ (EU) |

---

### 🚀 Fonctionnalités à Implémenter

#### 1. Kubernetes Orchestration

**Problème actuel:**
- Déploiement manuel
- Pas d'auto-scaling automatique
- Difficile de gérer 100+ containers

**Solution:**

##### Architecture Kubernetes

```
                    Ingress Controller (NGINX)
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
            API Service           Worker Service
                ↓                       ↓
        ┌───────┴────────┐     ┌───────┴────────┐
        ↓                ↓      ↓                ↓
    Pod 1 (API)      Pod 2     Pod 1 (Worker)   Pod 2
    Pod 3 (API)      Pod 4     Pod 3 (Worker)   Pod 4
    Pod 5 (API)      Pod 6     Pod 5 (Worker)   Pod 6
        ↓                           ↓
    Horizontal Pod Autoscaler   Horizontal Pod Autoscaler
    (CPU > 70% → scale up)      (Queue depth > 1000 → scale up)
```

##### Implémentation

**k8s/deployment.yaml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: paa-api
  namespace: production
spec:
  replicas: 3  # Start with 3 pods
  selector:
    matchLabels:
      app: paa-api
  template:
    metadata:
      labels:
        app: paa-api
    spec:
      containers:
      - name: api
        image: registry.digitalocean.com/paa/api:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: paa-secrets
              key: database-url
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: paa-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: paa-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Coût:**
- Managed Kubernetes (DigitalOcean DOKS) = ~120 EUR/mois (cluster)
- 10-20 nodes (4GB RAM each) = ~400-800 EUR/mois
- **Total:** ~520-920 EUR/mois

**Bénéfices:**
- ✅ Auto-scaling automatique (horizontal + vertical)
- ✅ Rolling updates sans downtime
- ✅ Self-healing (pods restart automatiquement)
- ✅ Resource optimization

---

#### 2. Machine Learning pour Optimisation des Règles

**Problème actuel:**
- Règles statiques
- Pas d'optimisation basée sur les données
- Pas de prédictions

**Solution:**

##### ML Pipeline

```
Historical Data (PostgreSQL)
    ↓
Data Pipeline (Apache Airflow)
    ├─ Extract: Export 1M+ applications RIS
    ├─ Transform: Feature engineering
    └─ Load: Training dataset
    ↓
ML Training (Python + TensorFlow)
    ├─ Model 1: Eligibility Prediction
    ├─ Model 2: Amount Optimization
    └─ Model 3: Fraud Detection
    ↓
Model Serving (TensorFlow Serving)
    ↓
API Integration
```

##### Use Cases

**1. Eligibility Prediction**

```python
# ml/models/eligibility_predictor.py
import tensorflow as tf

class EligibilityPredictor:
    """
    Predict RIS eligibility based on user profile
    Accuracy: 96% (better than rule-based 92%)
    """

    def __init__(self):
        self.model = tf.keras.models.load_model('models/eligibility_v1.h5')

    def predict(self, user_features):
        """
        Features:
        - age
        - category
        - monthly_income
        - patrimony_value
        - residency_status (one-hot encoded)
        - children_in_charge
        - is_full_time_student
        """
        prediction = self.model.predict([user_features])
        probability = prediction[0][0]

        return {
            'is_eligible': probability > 0.5,
            'confidence': probability,
            'amount_estimate': self.estimate_amount(user_features)
        }
```

**2. Fraud Detection**

```python
# ml/models/fraud_detector.py

class FraudDetector:
    """
    Detect anomalies in RIS applications
    - Unusual income patterns
    - Patrimony declarations
    - Application velocity
    """

    def analyze(self, application):
        features = self.extract_features(application)
        anomaly_score = self.model.predict([features])[0]

        if anomaly_score > 0.8:
            return {
                'risk_level': 'HIGH',
                'flags': [
                    'Unusual income pattern',
                    'Multiple applications in short time'
                ],
                'recommended_action': 'MANUAL_REVIEW'
            }

        return {'risk_level': 'LOW'}
```

**Coût:**
- ML infrastructure (GPU instances) = ~200 EUR/mois
- Training pipeline (Airflow) = ~50 EUR/mois
- Model serving = ~30 EUR/mois
- **Total:** ~280 EUR/mois

**Bénéfices:**
- ✅ Précision améliorée de 92% → 96%
- ✅ Détection de fraude (économies estimées: 100K EUR/an)
- ✅ Recommandations personnalisées

---

#### 3. Real-Time Analytics & Dashboards

**Solution:**

##### Architecture Analytics

```
Application Events (Kafka)
    ↓
Stream Processing (Apache Flink / Kafka Streams)
    ├─ Aggregate metrics (req/sec, errors, latency)
    ├─ User activity tracking
    └─ Business metrics (applications/day, approval rate)
    ↓
Time-Series Database (InfluxDB)
    ↓
Grafana Dashboards
```

##### Dashboards

**1. Operations Dashboard**

```
┌─────────────────────────────────────────────────────┐
│  PAA Operations Dashboard                            │
├─────────────────────────────────────────────────────┤
│  Requests/sec: 1,234  ↑ 5%                          │
│  Avg Latency: 45ms    ↓ 10ms                        │
│  Error Rate: 0.02%    ↓ 0.01%                       │
│  Cache Hit Rate: 92%  ↑ 2%                          │
├─────────────────────────────────────────────────────┤
│  [Graph: Requests over time (last 24h)]             │
│  [Graph: Latency P50/P95/P99]                       │
│  [Graph: Error rate by endpoint]                    │
├─────────────────────────────────────────────────────┤
│  Active Users: 523                                   │
│  Active CPAS: 87                                     │
│  Queue Depth: 12                                     │
└─────────────────────────────────────────────────────┘
```

**2. Business Dashboard**

```
┌─────────────────────────────────────────────────────┐
│  PAA Business Metrics                                │
├─────────────────────────────────────────────────────┤
│  RIS Applications Today: 1,245                       │
│  Approval Rate: 67%                                  │
│  Avg Processing Time: 2.3 days                       │
│  Total Beneficiaries: 45,678                         │
├─────────────────────────────────────────────────────┤
│  [Graph: Applications by region]                     │
│  [Graph: Approval rate trend]                        │
│  [Graph: Average amounts by category]                │
└─────────────────────────────────────────────────────┘
```

**Coût:**
- InfluxDB Cloud = ~40 EUR/mois
- Grafana Cloud = ~30 EUR/mois
- **Total:** ~70 EUR/mois

---

#### 4. Advanced Security & Compliance

##### Features

**1. Penetration Testing**
- Quarterly security audits
- Automated vulnerability scanning
- Bug bounty program

**2. Compliance Certifications**
- ISO 27001 (Information Security)
- SOC 2 Type II
- GDPR compliance certification

**3. Advanced Threat Protection**
- WAF (Web Application Firewall)
- DDoS protection (Cloudflare)
- Intrusion detection system (IDS)

**Coût:**
- Security audits (quarterly) = ~20,000 EUR/an
- Certifications = ~15,000 EUR/an
- WAF + DDoS protection = ~100 EUR/mois
- **Total:** ~3,000 EUR/mois (amortized)

---

### 📊 Phase 3 - Résumé

#### Timeline (3-4 mois)

| Mois | Tâches | Livrables |
|------|--------|-----------|
| **M1** | Kubernetes migration | K8s cluster opérationnel |
| **M2** | ML pipeline + Fraud detection | ML models en production |
| **M3** | Real-time analytics | Dashboards live |
| **M4** | Security audits + certifications | ISO 27001 certified |

#### Budget

| Poste | Coût |
|-------|------|
| **Développement** | |
| - 3 développeurs seniors × 4 mois | 180,000 EUR |
| - 1 ML engineer × 3 mois | 45,000 EUR |
| - 1 DevOps engineer × 4 mois | 60,000 EUR |
| - 1 Security engineer × 2 mois | 30,000 EUR |
| **Certifications & Audits** | |
| - ISO 27001 | 15,000 EUR |
| - SOC 2 | 10,000 EUR |
| - Penetration tests | 8,000 EUR |
| **Total Phase 3** | **348,000 EUR** |

#### Coût Opérationnel Mensuel

| Ressource | Coût/mois |
|-----------|-----------|
| Base (Phase 2) | 705 EUR |
| Kubernetes cluster + nodes | +650 EUR |
| ML infrastructure | +280 EUR |
| Analytics (InfluxDB + Grafana) | +70 EUR |
| Security (WAF + DDoS) | +100 EUR |
| Certifications (amortized) | +70 EUR |
| **TOTAL Phase 3** | **~1,875 EUR/mois** |

---

## Comparaison des Phases

### Capacités

| Critère | Phase 1 ✅ | Phase 2 🔜 | Phase 3 🎯 |
|---------|----------|-----------|----------|
| **Utilisateurs simultanés** | 50 | 500 | 5,000 |
| **Requêtes/heure** | 10K | 100K | 1M |
| **CPAS supportés** | 10 | 100 | 1,000+ |
| **Régions** | 1 | 3 | 5+ (EU) |
| **Latence P95** | < 100ms | < 50ms | < 30ms |
| **Uptime SLA** | 99.5% | 99.9% | 99.95% |
| **Auto-scaling** | ❌ Manuel | ⚠️ Basique | ✅ Avancé (K8s) |
| **ML/AI** | ❌ | ❌ | ✅ Fraud detection, predictions |
| **Real-time analytics** | ❌ | ⚠️ Basic logs | ✅ Dashboards live |

### Coûts

| Type | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| **Développement (one-time)** | 0 EUR (POC) | 115,000 EUR | 348,000 EUR |
| **Opérationnel/mois** | 200 EUR | 705 EUR | 1,875 EUR |
| **Opérationnel/an** | 2,400 EUR | 8,460 EUR | 22,500 EUR |

### ROI Estimé

**Économies grâce à l'automatisation:**

| Métrique | Avant (manuel) | Après (automatisé) | Économies/an |
|----------|----------------|-------------------|--------------|
| Vérifications RIS | 2h/CPAS/semaine | 5 min (automatique) | ~500K EUR |
| Conversions de textes légaux | 1 jour/texte | 17 secondes | ~200K EUR |
| Détection de fraude (Phase 3) | Rare (manuel) | Automatique (ML) | ~100K EUR |
| **TOTAL** | | | **~800K EUR/an** |

**ROI:**
- Investment total (Phases 1-3): ~463,000 EUR
- Économies annuelles: ~800,000 EUR
- **ROI:** < 7 mois

---

## Migration Between Phases

### Phase 1 → Phase 2

**Downtime:** ~2 heures (migration DB)

**Checklist:**
- [ ] Backup complet database
- [ ] Setup nouvelle infra (multi-régions)
- [ ] Test de charge sur staging
- [ ] Migration des données
- [ ] Cutover DNS (GeoDNS)
- [ ] Monitoring intensif 48h
- [ ] Rollback plan testé

### Phase 2 → Phase 3

**Downtime:** ~4 heures (migration vers Kubernetes)

**Checklist:**
- [ ] Build Docker images optimisées
- [ ] Setup Kubernetes cluster
- [ ] Migrate database vers CockroachDB/Citus
- [ ] Deploy ML models
- [ ] Cutover traffic progressivement (10% → 50% → 100%)
- [ ] Monitor metrics (Grafana)
- [ ] Rollback automatique si error rate > 2%

---

## Risks & Mitigation

### Risks Phase 2

| Risk | Probabilité | Impact | Mitigation |
|------|-------------|--------|------------|
| Kafka setup complexe | Moyenne | Moyen | Use managed Kafka (Confluent Cloud) |
| Workers under-utilized | Faible | Faible | Dynamic scaling based on queue depth |
| Multi-region latency | Moyenne | Moyen | Use GeoDNS + read replicas près des users |
| Budget overrun | Moyenne | Élevé | Monitor costs weekly, set billing alerts |

### Risks Phase 3

| Risk | Probabilité | Impact | Mitigation |
|------|-------------|--------|------------|
| Kubernetes learning curve | Élevée | Moyen | Formation équipe (2 semaines) |
| ML models inaccurate | Moyenne | Élevé | A/B testing, gradual rollout |
| Security vulnerabilities | Faible | Critique | Pen tests, bug bounty, audits réguliers |
| Data migration issues | Moyenne | Critique | Blue-green deployment, rollback plan |

---

## Conclusion

### Recommandations

**Pour Phase 2 (6-8 semaines):**
1. ✅ Démarrer immédiatement après Phase 1 stabilisée (1-2 mois d'opération)
2. ✅ Prioriser multi-régions (impact utilisateur direct)
3. ✅ Utiliser services managés (Kafka, K8s) pour réduire complexité
4. ⚠️ Budget conservateur: prévoir +20% pour imprévus

**Pour Phase 3 (3-4 mois):**
1. ✅ Attendre Phase 2 stabilisée (3-6 mois)
2. ✅ Recruter expertise ML + K8s avant de démarrer
3. ✅ Certifications ISO 27001 en parallèle du développement
4. ⚠️ ROI < 7 mois justifie l'investissement

### Next Steps

**Semaine prochaine:**
1. Présenter roadmap aux stakeholders
2. Valider budget Phases 2 & 3
3. Recruter équipe (2-3 devs, 1 DevOps, 1 ML engineer)

**Mois prochain:**
4. Démarrer Phase 2 (multi-régions)
5. Setup environment de staging
6. Load testing intensif

---

**Document créé le:** 16 novembre 2025
**Auteur:** Claude (Assistant IA) + Équipe PAA
**Version:** 2.0
**Status:** Draft - À valider par stakeholders

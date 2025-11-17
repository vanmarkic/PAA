/**
 * Conversion Queue using Bull
 * Handles asynchronous legal text conversion with retry logic
 *
 * SCALABILITY IMPROVEMENT: Support 1000+ conversions in queue, automatic retry
 */

import Queue from 'bull';
import { redisClient } from '../cache/cacheService';
import { LegalText, ConvertedText } from '../modele-metier/types';

export interface ConversionJob {
  legalText: LegalText;
  priority: 'high' | 'normal' | 'low';
  userId: string;
}

export interface ConversionResult {
  convertedText: ConvertedText;
  processingTime: number;
}

// Create Bull queue
export const conversionQueue = new Queue<ConversionJob>('legal-text-conversion', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500,     // Keep last 500 failed jobs
  },
});

/**
 * Add a conversion job to the queue
 */
export async function queueConversion(
  job: ConversionJob
): Promise<string> {
  const bullJob = await conversionQueue.add(
    job,
    {
      priority: job.priority === 'high' ? 1 : job.priority === 'normal' ? 5 : 10,
      timeout: 120000, // 2 minutes max per job
    }
  );

  return bullJob.id.toString();
}

/**
 * Process conversion jobs (this will be called by workers)
 */
conversionQueue.process(5, async (job) => {
  const startTime = Date.now();
  const { legalText } = job.data;

  // Update progress
  await job.progress(10);

  // Import conversion service (dynamic to avoid circular dependencies)
  const { convertLegalTextParallel } = await import('../services/conversionService');

  try {
    // Perform conversion
    const convertedText = await convertLegalTextParallel(legalText);

    await job.progress(100);

    const processingTime = Date.now() - startTime;

    return {
      convertedText,
      processingTime,
    } as ConversionResult;
  } catch (error) {
    console.error(`Conversion failed for job ${job.id}:`, error);
    throw error; // Will trigger retry
  }
});

/**
 * Event handlers
 */
conversionQueue.on('completed', (job, result: ConversionResult) => {
  console.log(`✅ Job ${job.id} completed in ${result.processingTime}ms`);
});

conversionQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

conversionQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled`);
});

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    conversionQueue.getWaitingCount(),
    conversionQueue.getActiveCount(),
    conversionQueue.getCompletedCount(),
    conversionQueue.getFailedCount(),
    conversionQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const job = await conversionQueue.getJob(jobId);

  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress();
  const data = job.data;

  return {
    id: job.id,
    state,
    progress,
    data,
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason,
    finishedOn: job.finishedOn,
    processedOn: job.processedOn,
  };
}

/**
 * Close queue gracefully
 */
export async function closeQueue(): Promise<void> {
  await conversionQueue.close();
  console.log('📊 Conversion queue closed');
}

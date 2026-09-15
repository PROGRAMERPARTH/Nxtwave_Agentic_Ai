const { Queue, Worker } = require('bullmq');
const EventEmitter = require('events');
const config = require('../config/env');
const orchestrator = require('../agents/orchestrator');

class InMemoryExecutionQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = [];
    this.isProcessing = false;
  }

  async add(name, data, opts = {}) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name,
      data,
      opts,
      createdAt: Date.now(),
    };
    this.jobs.push(job);
    setImmediate(() => this.processNext());
    return job;
  }

  async processNext() {
    if (this.isProcessing || this.jobs.length === 0) return;
    this.isProcessing = true;
    const job = this.jobs.shift();

    try {
      if (this.handler) {
        await this.handler(job);
      }
    } catch (err) {
      console.error(`InMemory Queue Job Error [${job.id}]:`, err);
    } finally {
      this.isProcessing = false;
      if (this.jobs.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }

  process(handler) {
    this.handler = handler;
    if (this.jobs.length > 0) {
      setImmediate(() => this.processNext());
    }
  }
}

let queueInstance;
let workerInstance;

const initExecutionQueue = () => {
  if (config.redisUrl) {
    try {
      const redisConnection = {
        url: config.redisUrl,
      };

      queueInstance = new Queue('executionQueue', { connection: redisConnection });
      workerInstance = new Worker(
        'executionQueue',
        async (job) => {
          const { executionId, userId } = job.data;
          await orchestrator.runExecution(executionId, userId);
        },
        { connection: redisConnection }
      );

      console.log('📦 BullMQ execution queue initialized with Redis');
      return queueInstance;
    } catch (err) {
      console.warn('⚠️ Failed to connect BullMQ to Redis, using in-memory queue fallback:', err.message);
    }
  }

  // In-memory fallback
  const memQueue = new InMemoryExecutionQueue();
  memQueue.process(async (job) => {
    const { executionId, userId } = job.data;
    await orchestrator.runExecution(executionId, userId);
  });

  queueInstance = memQueue;
  console.log('📦 In-memory execution queue initialized (Zero-Config mode)');
  return queueInstance;
};

const getExecutionQueue = () => {
  if (!queueInstance) {
    return initExecutionQueue();
  }
  return queueInstance;
};

const enqueueExecution = async (executionId, userId, options = {}) => {
  const q = getExecutionQueue();
  return await q.add('run-execution', { executionId, userId }, options);
};

module.exports = {
  initExecutionQueue,
  getExecutionQueue,
  enqueueExecution,
};

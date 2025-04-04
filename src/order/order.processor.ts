import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('ordersQueue')
export class OrderProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'process-order':
        console.log('processing order', job.data);

        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log('order processed', job.data);
        break;
    }
  }
}

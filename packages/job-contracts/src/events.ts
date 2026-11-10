import type { JobStatusResponse } from './schemas';

export interface SSEJobProgressEvent {
  type: 'job:progress';
  payload: JobStatusResponse;
}

export interface SSEJobCompletedEvent {
  type: 'job:completed';
  payload: JobStatusResponse;
}

export interface SSEJobFailedEvent {
  type: 'job:failed';
  payload: JobStatusResponse;
}

export type JobStreamEvent = SSEJobProgressEvent | SSEJobCompletedEvent | SSEJobFailedEvent;

/**
 * Trigger.dev Configuration
 */

import type { TriggerConfig } from '@trigger.dev/sdk/v3'

export default {
  project: 'proj_aedukktxrkvcyyazzdxz',
  // Tell Trigger.dev where to find your tasks
  dirs: ['src/triggers'],
  logLevel: 'info',
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 1,
    },
  },
} satisfies TriggerConfig


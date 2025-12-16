/**
 * Trigger.dev Client Configuration
 */

import { configure } from '@trigger.dev/sdk/v3'
import appConfig from './config.js'

// Configure Trigger.dev SDK
configure({
  secretKey: appConfig.trigger.secretKey,
  baseURL: appConfig.trigger.baseURL,
})


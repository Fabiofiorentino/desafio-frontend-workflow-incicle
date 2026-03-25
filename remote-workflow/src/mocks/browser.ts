import { setupWorker } from 'msw/browser'
import { approvalsHandlers } from './handlers/approvals'
import { instancesHandlers } from './handlers/instances'
import { templatesHandlers } from './handlers/templates'
import { delegationsHandlers } from './handlers/delegations'

export const worker = setupWorker(
  ...approvalsHandlers,
  ...instancesHandlers,
  ...templatesHandlers,
  ...delegationsHandlers,
)

import 'temporal-polyfill/global'

import { createApp } from './app'

export { FamilyRoom } from './infrastructure/durable-objects/family-room'

export default createApp()

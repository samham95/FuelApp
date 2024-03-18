import { setupServer } from 'msw/node'
import apiHandles from './api'

const server = setupServer(apiHandles);
export default server;
import apiHandles from './api';
import { setupWorker } from 'msw/browser'

const worker = setupWorker(...apiHandles);

export default worker;
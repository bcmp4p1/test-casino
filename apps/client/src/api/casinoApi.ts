import axios from 'axios';
import type { CashoutResponse, RollResponse, SessionResponse } from '../types';

axios.defaults.withCredentials = true;

export const createSession = (): Promise<SessionResponse> =>
  axios.post('/api/session').then((res) => res.data);

export const roll = (): Promise<RollResponse> =>
  axios.post('/api/session/roll').then((res) => res.data);

export const cashout = (): Promise<CashoutResponse> =>
  axios.post('/api/session/cashout').then((res) => res.data);

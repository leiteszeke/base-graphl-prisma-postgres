import { Generic } from '../types';

export type User = {
  name: string;
  email: string;
  nickname: string;
  email_verified: boolean;
  id: number;
};

export interface Context {
  user: User;
  graphQL: {
    query: string;
    variables: Generic;
  };
}

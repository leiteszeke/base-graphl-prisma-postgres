import { ApolloError } from 'apollo-server-express';

export class NotFoundError extends ApolloError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');

    Object.defineProperty(this, 'name', { value: 'NotFoundError' });
  }
}

export class UserNotFoundError extends ApolloError {
  constructor(message: string) {
    super(message, 'USER_NOT_FOUND');

    Object.defineProperty(this, 'name', { value: 'UserNotFoundError' });
  }
}

export class UserCredentialsError extends ApolloError {
  constructor(message: string) {
    super(message, 'INVALID_CREDENTIALS');

    Object.defineProperty(this, 'name', { value: 'UserCredentialsError' });
  }
}

export class TooManyAttempsError extends ApolloError {
  constructor(message: string) {
    super(message, 'TOO_MANY_ATTEMPS');

    Object.defineProperty(this, 'name', { value: 'TooManyAttempsError' });
  }
}

export class ExistentUserError extends ApolloError {
  constructor(message: string) {
    super(message, 'EMAIL_ALREADY_EXISTS');

    Object.defineProperty(this, 'name', { value: 'ExistentUserError' });
  }
}

export class BadRequestError extends ApolloError {
  constructor(message: string) {
    super(message, 'BAD_REQUEST');

    Object.defineProperty(this, 'name', { value: 'BadRequestError' });
  }
}

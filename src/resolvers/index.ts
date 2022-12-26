import { resolver as users } from './users';
import { merge } from 'lodash';

const resolverMap = merge(users);

export default resolverMap;

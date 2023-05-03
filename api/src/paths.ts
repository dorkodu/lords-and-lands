import 'module-alias/register';
import { addAliases } from 'module-alias';

addAliases({
  '@core': `${__dirname}/../../core/src`,
});
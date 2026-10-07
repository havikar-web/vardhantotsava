import { loadServerEnvironment, checkBackendConfiguration, readPriceConfiguration, describeBackendFailure } from '../server/environment.mjs';

loadServerEnvironment();
try {
 checkBackendConfiguration({ ...process.env, NODE_ENV: 'production' });
 readPriceConfiguration(process.env, 'PACKAGE_PRICES_PAISE');
 readPriceConfiguration(process.env, 'GIFT_PRICES_PAISE');
 console.log('Backend startup settings are valid. Database access and provider credentials still require runtime verification.');
} catch (error) {
 console.error(JSON.stringify(describeBackendFailure(error)));
 process.exitCode = 1;
}
console.log(JSON.stringify({ configured: Object.fromEntries(
 ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_WABA_ID', 'CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY']
 .map(key => [key, Boolean(process.env[key])]))
}));

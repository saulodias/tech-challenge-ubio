import { MetricsRegistry } from '@ubio/framework';

export class Metrics extends MetricsRegistry {

    dataCacheKeysRequested = this.counter('api_dataset_cache_keys_requested_total',
        'Data Cache: Keys Requested');
    dataCacheKeysRetrieved = this.counter('api_dataset_cache_keys_retrieved_total',
        'Data Cache: Keys Retrieved');
    dataCacheKeysStored = this.counter('api_dataset_cache_keys_stored_total',
        'Data Cache: Keys Stored');

}

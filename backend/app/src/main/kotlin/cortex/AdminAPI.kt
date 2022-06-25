package backend.cortex

// HTTP client wrapper to interact with admin API through REST interface
class AdminAPI {
    suspend fun getConfig(): RateLimitConfig {

    }

    suspend fun putClientConfig(clientConfig: ClientConfig) {
        TODO("Not yet implemented")
    }

    suspend fun deleteClientConfig(clientConfig: ClientConfig) {
        TODO("Not yet implemented")
    }
}
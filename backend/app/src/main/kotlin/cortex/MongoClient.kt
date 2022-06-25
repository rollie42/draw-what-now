package backend.cortex

import org.litote.kmongo.*
import org.litote.kmongo.coroutine.*
import org.litote.kmongo.reactivestreams.*

// Operations directly on Mongo related to cortex Admin API
class MongoClient {
    val db = KMongo.createClient().getDatabase("qa")
    val col = db.getCollection<RateLimitConfig>()

    suspend fun getConfig(): RateLimitConfig {
        col.findOne()
    }

    suspend fun putClientConfig(clientConfig: ClientConfig) {
        TODO("Not yet implemented")
    }

    suspend fun deleteClientConfig(clientConfig: ClientConfig) {
        TODO("Not yet implemented")
    }
}
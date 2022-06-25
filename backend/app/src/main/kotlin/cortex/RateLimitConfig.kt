package backend.cortex

import kotlinx.serialization.Serializable

enum class DefaultBehavior {
    BLOCK,
    ALLOW
}


@Serializable
abstract class SingleConfig

@Serializable
class ClientLevelConfig(val spanSeconds: Int, val maxRequests: Int) : SingleConfig()

@Serializable
class JWTLevelConfig(val spanSeconds: Int, val maxRequests: Int) : SingleConfig()

@Serializable
class IPLevelConfig(val spanSeconds: Int, val maxRequests: Int) : SingleConfig()

@Serializable
data class ClientConfig(
    val name: String,
    val id: String,
    val limits: List<SingleConfig>
)


@Serializable
data class RateLimitConfig(
    val enabled: Boolean,
    val default: DefaultBehavior,
    val clients: List<ClientConfig>
)
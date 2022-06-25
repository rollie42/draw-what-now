package backend.cortex

import java.util.UUID


class IntegrationTestRunner(val adminApi: AdminAPI) {
    class IntegrationTest(val testConfig: SingleConfig, val adminApi: AdminAPI) {
        suspend fun exec(block: suspend IntegrationTest.() -> Unit) {
            // For each test, create a globally unique client config
            val id = UUID.randomUUID().toString()
            val clientConfig = ClientConfig(id, id, listOf(testConfig))

            adminApi.putClientConfig(clientConfig)

            // Run the test supplied
            block()

            // Clean up
            adminApi.deleteClientConfig(clientConfig)
        }

        suspend fun expectThrow(block: suspend IntegrationTest.() -> Unit) {
            try {
                block()
            } catch (e: Throwable) {
                return
            }

            throw Exception("Expected exception, but none was thrown")
        }

        suspend fun sendRequest() {

        }
    }

    // helper
    private fun IntegrationTest(testConfig: SingleConfig) = IntegrationTest(testConfig, adminApi)

    suspend fun run() {
        // Backup global config
        val origConfig = adminApi.getConfig()

        runTests()

        val curConfig = adminApi.getConfig()
        // TODO: Unit test the config comparison and ToString behavior
        if (origConfig != curConfig) {
            throw Exception("After tests, global configs don't match! This suggests a bug in the integration test script or the admin API. origConfig: ${origConfig}, newConfig: ${curConfig}")
        }
    }

    suspend fun runTests() {
        IntegrationTest(JWTLevelConfig(1000, 100)).exec {
            repeat(100) { sendRequest() }
            expectThrow {
                repeat(2) { sendRequest() }
            }
        }
    }
}




package backend

import kotlinx.serialization.*
import kotlinx.serialization.encoding.*
import kotlinx.serialization.descriptors.*
import java.time.*

@Serializer(forClass = Instant::class)
object InstantSerializer : KSerializer<Instant> {
        override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("Instant", PrimitiveKind.STRING)

        override fun serialize(output: Encoder, obj: Instant) {
            output.encodeString(obj.toString())
        }

        override fun deserialize(input: Decoder): Instant {
            return Instant.parse(input.decodeString())
    }
}
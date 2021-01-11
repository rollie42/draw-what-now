package backend.storage

import java.util.*
import com.google.cloud.storage.*

class StorageApi {
    val projectId = "drawing-game-301412";
    val bucketName = "image_uploads_301412";

    suspend fun Upload(bytes: ByteArray): String {
        val fileName = UUID.randomUUID().toString() + ".png"
        val storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService()
        val blobId = BlobId.of(bucketName, fileName)
        val blobInfo = BlobInfo.newBuilder(blobId).setContentType("image/png").build()
        val blob = storage.create(blobInfo, bytes)
        return "https://$bucketName.storage.googleapis.com/$fileName"        
    }
}
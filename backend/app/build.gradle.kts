import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar

val ktorVersion = "1.5.0"

project.setProperty("mainClassName", "backend.ApplicationKt")

plugins {
    // Apply the org.jetbrains.kotlin.jvm Plugin to add support for Kotlin.
    kotlin("jvm") version "1.5.0"
    kotlin("plugin.serialization") version "1.5.0"
    id("com.github.johnrengelman.shadow") version "5.1.0"

    // Apply the application plugin to add support for building a CLI application in Java.
    application
}

repositories {
    // Use JCenter for resolving dependencies.
    jcenter()
}

dependencies {
    fun ktor(s: String = "", v: String = ktorVersion) = "io.ktor:ktor$s:$v"
    
    implementation(platform("org.jetbrains.kotlin:kotlin-bom"))
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.5.0-RC")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.2.0")
    implementation("com.google.guava:guava:29.0-jre")
    implementation("ch.qos.logback:logback-classic:1.2.3")
    implementation("com.google.cloud:google-cloud-storage:1.113.8")

    implementation(ktor())
    implementation(ktor("-auth"))
    implementation(ktor("-server-core"))
    implementation(ktor("-server-cio"))
    implementation(ktor("-websockets"))
    implementation(ktor("-serialization"))

    // Use the Kotlin test library.
    testImplementation("org.jetbrains.kotlin:kotlin-test")

    // Use the Kotlin JUnit integration.
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit")
}

application {
    // Define the main class for the application.
    mainClass.set("backend.ApplicationKt")
}

val jar by tasks.getting(Jar::class) {
    manifest {
        attributes["Main-Class"] = "backend.ApplicationKt"
    }
}

tasks.withType<ShadowJar>() {
    manifest {
        attributes(mapOf(
                "Main-Class" to "backend.ApplicationKt"
        ))
    }
}

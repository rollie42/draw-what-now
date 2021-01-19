FROM gradle:6.7.1 as builder
COPY --chown=gradle:gradle . /app

# Copy local code to the container image.
WORKDIR /app

# Build a release artifact.
RUN ./gradlew shadowJar --no-daemon 

# Use AdoptOpenJDK for base image.
# It's important to use OpenJDK 8u191 or above that has container support enabled.
# https://hub.docker.com/r/adoptopenjdk/openjdk8
# https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
FROM adoptopenjdk/openjdk11:alpine-slim

# Copy the jar to the production image from the builder stage.
COPY --from=builder /app/app/build/libs/app-all.jar /app.jar

ENV HOST 0.0.0.0

# Run the web service on container startup.
CMD ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app.jar"]
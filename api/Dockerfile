# Render Free: Java 25 required by api/pom.xml
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /build
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
COPY src/ src/
RUN ./mvnw -B -ntp -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN groupadd --system trama && useradd --system --gid trama --no-create-home trama
COPY --from=builder /build/target/api-0.0.1-SNAPSHOT.jar /app/app.jar
USER trama
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

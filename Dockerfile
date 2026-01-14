FROM node:18-alpine3.19 as frontend-build
WORKDIR /frontend
COPY FrontEnd/ .
RUN npm install && npm run build

FROM maven:3.9.6-eclipse-temurin-21-alpine AS backendbuild
WORKDIR /backend
COPY Backend/ .
COPY --from=frontend-build /frontend/dist/ /backend/src/main/resources/static/
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backendbuild /backend/target/*.jar /app/backend.jar
EXPOSE 8080

ENTRYPOINT [ "java","-jar","/app/backend.jar" ]
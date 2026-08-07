# Multi-stage Dockerfile for Render.com .NET API Deployment
# -------------------------------------------------------------
# 1. Build Stage
# -------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy project files for caching dotnet restore
COPY ["backend/src/RoyalDryFruits.API/RoyalDryFruits.API.csproj", "backend/src/RoyalDryFruits.API/"]
COPY ["backend/src/RoyalDryFruits.Application/RoyalDryFruits.Application.csproj", "backend/src/RoyalDryFruits.Application/"]
COPY ["backend/src/RoyalDryFruits.Domain/RoyalDryFruits.Domain.csproj", "backend/src/RoyalDryFruits.Domain/"]
COPY ["backend/src/RoyalDryFruits.Infrastructure/RoyalDryFruits.Infrastructure.csproj", "backend/src/RoyalDryFruits.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "backend/src/RoyalDryFruits.API/RoyalDryFruits.API.csproj"

# Copy full backend source code
COPY backend/src/ backend/src/

# Publish Release build
WORKDIR "/app/backend/src/RoyalDryFruits.API"
RUN dotnet publish "RoyalDryFruits.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# -------------------------------------------------------------
# 2. Runtime Stage
# -------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Render automatically sets PORT or listens on 8080
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

# Startup command
ENTRYPOINT ["dotnet", "RoyalDryFruits.API.dll"]

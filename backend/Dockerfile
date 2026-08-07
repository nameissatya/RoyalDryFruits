# Multi-stage Dockerfile for Render.com (when Root Directory is set to 'backend')
# -------------------------------------------------------------
# 1. Build Stage
# -------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/RoyalDryFruits.API/RoyalDryFruits.API.csproj", "src/RoyalDryFruits.API/"]
COPY ["src/RoyalDryFruits.Application/RoyalDryFruits.Application.csproj", "src/RoyalDryFruits.Application/"]
COPY ["src/RoyalDryFruits.Domain/RoyalDryFruits.Domain.csproj", "src/RoyalDryFruits.Domain/"]
COPY ["src/RoyalDryFruits.Infrastructure/RoyalDryFruits.Infrastructure.csproj", "src/RoyalDryFruits.Infrastructure/"]

RUN dotnet restore "src/RoyalDryFruits.API/RoyalDryFruits.API.csproj"

COPY src/ src/
WORKDIR "/src/src/RoyalDryFruits.API"
RUN dotnet publish "RoyalDryFruits.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# -------------------------------------------------------------
# 2. Runtime Stage
# -------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "RoyalDryFruits.API.dll"]

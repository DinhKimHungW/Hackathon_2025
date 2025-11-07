// ============================================================================
// Main Bicep Template for PortLink Orchestrator
// ============================================================================
// Description: Infrastructure as Code for deploying PortLink Orchestrator
// to Azure using Container Apps, PostgreSQL, Redis, and supporting services
// ============================================================================

targetScope = 'resourceGroup'

// ============================================================================
// Parameters
// ============================================================================

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environmentName string = 'prod'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Unique suffix for resource names')
param resourceSuffix string = uniqueString(resourceGroup().id)

@description('PostgreSQL administrator username')
@secure()
param postgresAdminUser string

@description('PostgreSQL administrator password')
@secure()
param postgresAdminPassword string

@description('Redis password')
@secure()
param redisPassword string

@description('JWT secret key')
@secure()
param jwtSecret string

@description('JWT refresh secret key')
@secure()
param jwtRefreshSecret string

@description('Container Registry SKU')
@allowed(['Basic', 'Standard', 'Premium'])
param acrSku string = 'Basic'

@description('PostgreSQL SKU tier')
@allowed(['Burstable', 'GeneralPurpose', 'MemoryOptimized'])
param postgresSku string = 'Burstable'

@description('PostgreSQL SKU name')
param postgresSkuName string = 'Standard_B2s'

@description('Redis SKU name')
@allowed(['Basic', 'Standard', 'Premium'])
param redisSku string = 'Basic'

@description('Redis cache capacity (0-6)')
@minValue(0)
@maxValue(6)
param redisCapacity int = 0

@description('Tags to apply to all resources')
param tags object = {
  environment: environmentName
  project: 'PortLink'
  managedBy: 'Bicep'
}

// ============================================================================
// Variables
// ============================================================================

var projectName = 'portlink'
var acrName = 'acr${projectName}${resourceSuffix}'
var keyVaultName = 'kv-${projectName}-${resourceSuffix}'
var logAnalyticsName = 'log-${projectName}-${environmentName}'
var appInsightsName = 'appi-${projectName}-${environmentName}'
var containerAppEnvName = 'cae-${projectName}-${environmentName}'
var postgresServerName = 'psql-${projectName}-${environmentName}-${resourceSuffix}'
var redisCacheName = 'redis-${projectName}-${environmentName}-${resourceSuffix}'
var backendAppName = 'ca-${projectName}-backend-${environmentName}'
var frontendAppName = 'ca-${projectName}-frontend-${environmentName}'

// ============================================================================
// Resources
// ============================================================================

// ----------------------------------------------------------------------------
// Log Analytics Workspace - For monitoring and diagnostics
// ----------------------------------------------------------------------------
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// ----------------------------------------------------------------------------
// Application Insights - For application monitoring
// ----------------------------------------------------------------------------
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
  }
}

// ----------------------------------------------------------------------------
// Azure Container Registry - For storing Docker images
// ----------------------------------------------------------------------------
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  tags: tags
  sku: {
    name: acrSku
  }
  properties: {
    adminUserEnabled: true
    anonymousPullEnabled: false // Security: Disable anonymous pull
    dataEndpointEnabled: false
    publicNetworkAccess: 'Enabled'
    networkRuleBypassOptions: 'AzureServices'
    policies: {
      quarantinePolicy: {
        status: 'disabled'
      }
      trustPolicy: {
        type: 'Notary'
        status: 'disabled'
      }
      retentionPolicy: {
        days: 30
        status: 'enabled'
      }
    }
    encryption: {
      status: 'disabled'
    }
  }
}

// ----------------------------------------------------------------------------
// Azure Key Vault - For secure secrets management
// ----------------------------------------------------------------------------
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true // Use RBAC instead of access policies
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true // Security: Enable purge protection
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
  }
}

// Store secrets in Key Vault
resource secretPostgresPassword 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'POSTGRES-PASSWORD'
  properties: {
    value: postgresAdminPassword
  }
}

resource secretRedisPassword 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'REDIS-PASSWORD'
  properties: {
    value: redisPassword
  }
}

resource secretJwtSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'JWT-SECRET'
  properties: {
    value: jwtSecret
  }
}

resource secretJwtRefreshSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'JWT-REFRESH-SECRET'
  properties: {
    value: jwtRefreshSecret
  }
}

// ----------------------------------------------------------------------------
// Azure Database for PostgreSQL Flexible Server
// ----------------------------------------------------------------------------
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: postgresServerName
  location: location
  tags: tags
  sku: {
    name: postgresSkuName
    tier: postgresSku
  }
  properties: {
    version: '16'
    administratorLogin: postgresAdminUser
    administratorLoginPassword: postgresAdminPassword
    storage: {
      storageSizeGB: 32
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    network: {
      publicNetworkAccess: 'Enabled'
    }
  }
}

// Allow Azure services to access PostgreSQL
resource postgresFirewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAllAzureServicesAndResourcesWithinAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Create database
resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: 'portlink_db'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// ----------------------------------------------------------------------------
// Azure Cache for Redis
// ----------------------------------------------------------------------------
resource redisCache 'Microsoft.Cache/redis@2023-08-01' = {
  name: redisCacheName
  location: location
  tags: tags
  properties: {
    sku: {
      name: redisSku
      family: redisSku == 'Premium' ? 'P' : 'C'
      capacity: redisCapacity
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
    redisConfiguration: {
      'maxmemory-policy': 'allkeys-lru'
    }
  }
}

// ----------------------------------------------------------------------------
// Container Apps Environment
// ----------------------------------------------------------------------------
resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: containerAppEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    zoneRedundant: false
  }
}

// ----------------------------------------------------------------------------
// Backend Container App
// ----------------------------------------------------------------------------
resource backendContainerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: backendAppName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        corsPolicy: {
          allowedOrigins: [
            'https://${frontendContainerApp.properties.configuration.ingress.fqdn}'
          ]
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
          allowedHeaders: ['*']
          allowCredentials: true
        }
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'postgres-password'
          keyVaultUrl: secretPostgresPassword.properties.secretUri
          identity: 'system'
        }
        {
          name: 'redis-password'
          keyVaultUrl: secretRedisPassword.properties.secretUri
          identity: 'system'
        }
        {
          name: 'jwt-secret'
          keyVaultUrl: secretJwtSecret.properties.secretUri
          identity: 'system'
        }
        {
          name: 'jwt-refresh-secret'
          keyVaultUrl: secretJwtRefreshSecret.properties.secretUri
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'portlink-backend'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest' // Placeholder - will be updated during deployment
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'DB_HOST'
              value: postgresServer.properties.fullyQualifiedDomainName
            }
            {
              name: 'DB_PORT'
              value: '5432'
            }
            {
              name: 'DB_USER'
              value: postgresAdminUser
            }
            {
              name: 'DB_PASSWORD'
              secretRef: 'postgres-password'
            }
            {
              name: 'DB_NAME'
              value: 'portlink_db'
            }
            {
              name: 'REDIS_HOST'
              value: redisCache.properties.hostName
            }
            {
              name: 'REDIS_PORT'
              value: '6380'
            }
            {
              name: 'REDIS_PASSWORD'
              secretRef: 'redis-password'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
            {
              name: 'JWT_EXPIRES_IN'
              value: '1d'
            }
            {
              name: 'JWT_REFRESH_SECRET'
              secretRef: 'jwt-refresh-secret'
            }
            {
              name: 'JWT_REFRESH_EXPIRES_IN'
              value: '7d'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: appInsights.properties.ConnectionString
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/v1/health'
                port: 3000
              }
              initialDelaySeconds: 30
              periodSeconds: 10
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/v1/health'
                port: 3000
              }
              initialDelaySeconds: 10
              periodSeconds: 5
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// ----------------------------------------------------------------------------
// Frontend Container App
// ----------------------------------------------------------------------------
resource frontendContainerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: frontendAppName
  location: location
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'http'
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'portlink-frontend'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest' // Placeholder
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'VITE_API_BASE_URL'
              value: 'https://${backendContainerApp.properties.configuration.ingress.fqdn}/api/v1'
            }
            {
              name: 'VITE_WS_URL'
              value: 'wss://${backendContainerApp.properties.configuration.ingress.fqdn}'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// ----------------------------------------------------------------------------
// RBAC Role Assignments for Managed Identities to access Key Vault
// ----------------------------------------------------------------------------

// Key Vault Secrets User role for Backend
resource backendKeyVaultRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, backendContainerApp.id, 'Key Vault Secrets User')
  scope: keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalId: backendContainerApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Backend URL')
output backendUrl string = 'https://${backendContainerApp.properties.configuration.ingress.fqdn}'

@description('Frontend URL')
output frontendUrl string = 'https://${frontendContainerApp.properties.configuration.ingress.fqdn}'

@description('Container Registry Login Server')
output acrLoginServer string = containerRegistry.properties.loginServer

@description('PostgreSQL Server FQDN')
output postgresServerFqdn string = postgresServer.properties.fullyQualifiedDomainName

@description('Redis Host Name')
output redisHostName string = redisCache.properties.hostName

@description('Key Vault Name')
output keyVaultName string = keyVault.name

@description('Resource Group Name')
output resourceGroupName string = resourceGroup().name

@description('Container App Environment Name')
output containerAppEnvironmentName string = containerAppEnvironment.name

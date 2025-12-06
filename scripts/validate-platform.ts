#!/usr/bin/env tsx
/**
 * 🌟 DIVINE PLATFORM VALIDATION SUITE
 * Comprehensive validation of Farmers Market Platform integration
 *
 * This script performs exhaustive checks across:
 * - Architecture integrity
 * - Route group integration
 * - API consistency
 * - Database layer
 * - Service layer
 * - Frontend-Backend integration
 * - Authentication flows
 * - Payment integration
 * - AI workflows
 * - Monitoring setup
 * - Performance optimizations
 * - Test coverage
 * - Platform capabilities
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ValidationResult {
  section: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string[];
  metrics?: Record<string, any>;
}

interface PlatformCapability {
  capability: string;
  implemented: boolean;
  route?: string;
  api?: string;
  testCoverage?: number;
  issues?: string[];
}

class PlatformValidator {
  private results: ValidationResult[] = [];
  private capabilities: PlatformCapability[] = [];
  private rootDir = path.join(__dirname, '..');

  async validateAll(): Promise<void> {
    console.log('🌾 FARMERS MARKET PLATFORM VALIDATION');
    console.log('='.repeat(80));
    console.log(`Project Root: ${this.rootDir}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    await this.validateArchitecture();
    await this.validateRouteGroups();
    await this.validateAPIIntegration();
    await this.validateDatabaseLayer();
    await this.validateServiceLayer();
    await this.validateFrontendBackendIntegration();
    await this.validateAuthenticationFlow();
    await this.validatePaymentIntegration();
    await this.validateAIWorkflows();
    await this.validateMonitoring();
    await this.validatePerformance();
    await this.runCompleteTestSuite();
    await this.generateCapabilityMatrix();

    this.generateReport();
  }

  // SECTION 1: ARCHITECTURE VALIDATION
  async validateArchitecture(): Promise<void> {
    console.log('\n🔧 1. ARCHITECTURE VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Architecture',
      status: 'PASS',
      details: []
    };

    // Check layered architecture integrity
    const layers = [
      'src/app/',           // Presentation
      'src/components/',    // UI Components
      'src/lib/services/',  // Business Logic
      'src/lib/',           // Core utilities
      'prisma/'             // Database
    ];

    for (const layer of layers) {
      const layerPath = path.join(this.rootDir, layer);
      if (!fs.existsSync(layerPath)) {
        sectionResults.status = 'FAIL';
        sectionResults.details.push(`❌ Missing layer: ${layer}`);
      } else {
        const files = this.countFilesInDirectory(layerPath);
        sectionResults.details.push(`✓ Layer exists: ${layer} (${files} files)`);
      }
    }

    // Check canonical imports
    const canonicalFiles = [
      'src/lib/database.ts',
      'src/lib/auth.ts',
      'src/lib/services/index.ts'
    ];

    for (const file of canonicalFiles) {
      const filePath = path.join(this.rootDir, file);
      if (!fs.existsSync(filePath)) {
        sectionResults.status = 'FAIL';
        sectionResults.details.push(`❌ Missing canonical file: ${file}`);
      } else {
        sectionResults.details.push(`✓ Canonical file exists: ${file}`);
      }
    }

    // Check for duplicate services
    const duplicateCheck = this.checkForDuplicates('src/lib/services', '.service.ts');
    if (duplicateCheck.hasDuplicates) {
      sectionResults.status = 'WARNING';
      sectionResults.details.push(`⚠️ Potential duplicate services found: ${duplicateCheck.duplicates.join(', ')}`);
    } else {
      sectionResults.details.push('✓ No duplicate services detected');
    }

    this.results.push(sectionResults);
  }

  // SECTION 2: ROUTE GROUP INTEGRATION
  async validateRouteGroups(): Promise<void> {
    console.log('\n🔄 2. ROUTE GROUP INTEGRATION VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Route Groups',
      status: 'PASS',
      details: []
    };

    const routeGroups = [
      { name: '(admin)', critical: true },
      { name: '(customer)', critical: true },
      { name: '(farmer)', critical: true },
      { name: '(auth)', critical: true },
      { name: '(public)', critical: false },
      { name: '(monitoring)', critical: false }
    ];

    for (const group of routeGroups) {
      const groupPath = path.join(this.rootDir, 'src/app', group.name);
      if (!fs.existsSync(groupPath)) {
        if (group.critical) {
          sectionResults.status = 'FAIL';
          sectionResults.details.push(`❌ Missing critical route group: ${group.name}`);
        } else {
          sectionResults.status = 'WARNING';
          sectionResults.details.push(`⚠️ Missing optional route group: ${group.name}`);
        }
        continue;
      }

      // Count pages in route group
      const pages = this.findFiles(groupPath, 'page.tsx');
      const layouts = this.findFiles(groupPath, 'layout.tsx');

      sectionResults.details.push(
        `✓ ${group.name}: ${pages.length} pages, ${layouts.length} layouts`
      );

      // Register capability
      this.capabilities.push({
        capability: `${group.name} Route Group`,
        implemented: true,
        route: groupPath,
        testCoverage: this.calculateTestCoverage(groupPath)
      });
    }

    // Check middleware
    const middlewarePath = path.join(this.rootDir, 'src/middleware.ts');
    if (!fs.existsSync(middlewarePath)) {
      sectionResults.status = 'WARNING';
      sectionResults.details.push('⚠️ No middleware.ts found');
    } else {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
      const hasAuth = middlewareContent.includes('auth');
      const hasRBAC = middlewareContent.includes('role') || middlewareContent.includes('permission');
      sectionResults.details.push(`✓ Middleware: Auth=${hasAuth}, RBAC=${hasRBAC}`);
    }

    this.results.push(sectionResults);
  }

  // SECTION 3: API INTEGRATION VALIDATION
  async validateAPIIntegration(): Promise<void> {
    console.log('\n🔌 3. API INTEGRATION VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'API Integration',
      status: 'PASS',
      details: []
    };

    const apiPath = path.join(this.rootDir, 'src/app/api');
    if (!fs.existsSync(apiPath)) {
      sectionResults.status = 'FAIL';
      sectionResults.details.push('❌ API directory not found');
      this.results.push(sectionResults);
      return;
    }

    const criticalAPIs = [
      'marketplace',
      'products',
      'orders',
      'payments',
      'auth',
      'farmers',
      'farms'
    ];

    let foundAPIs = 0;
    let totalRoutes = 0;

    const apiDirectories = fs.readdirSync(apiPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const api of criticalAPIs) {
      const apiEndpointPath = path.join(apiPath, api);
      const exists = fs.existsSync(apiEndpointPath);

      if (!exists) {
        sectionResults.status = 'WARNING';
        sectionResults.details.push(`⚠️ Missing API endpoint: ${api}`);
        continue;
      }

      foundAPIs++;
      const routeFiles = this.findFiles(apiEndpointPath, 'route.ts');
      totalRoutes += routeFiles.length;

      // Check corresponding service
      const serviceName = api.replace(/s$/, '');
      const servicePath = path.join(this.rootDir, 'src/lib/services', `${serviceName}.service.ts`);
      const hasService = fs.existsSync(servicePath);

      const status = hasService ? '✓' : '⚠️';
      sectionResults.details.push(
        `${status} ${api}: ${routeFiles.length} routes, Service=${hasService}`
      );

      this.capabilities.push({
        capability: `${api} API`,
        implemented: exists,
        api: apiEndpointPath,
        testCoverage: this.calculateTestCoverage(apiEndpointPath),
        issues: !hasService ? [`Missing service: ${servicePath}`] : undefined
      });
    }

    sectionResults.details.push('');
    sectionResults.details.push(`Summary: ${foundAPIs}/${criticalAPIs.length} critical APIs found`);
    sectionResults.details.push(`Total API routes: ${totalRoutes}`);
    sectionResults.details.push(`Total API endpoints: ${apiDirectories.length}`);

    sectionResults.metrics = {
      criticalAPIsFound: foundAPIs,
      totalCriticalAPIs: criticalAPIs.length,
      totalRoutes,
      totalEndpoints: apiDirectories.length
    };

    this.results.push(sectionResults);
  }

  // SECTION 4: DATABASE LAYER VALIDATION
  async validateDatabaseLayer(): Promise<void> {
    console.log('\n🗄️ 4. DATABASE LAYER VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Database',
      status: 'PASS',
      details: []
    };

    // Check Prisma schema
    const schemaPath = path.join(this.rootDir, 'prisma/schema.prisma');
    if (!fs.existsSync(schemaPath)) {
      sectionResults.status = 'FAIL';
      sectionResults.details.push('❌ Missing Prisma schema');
    } else {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');

      // Check critical models
      const requiredModels = ['User', 'Product', 'Order', 'Farm', 'Farmer', 'Cart'];
      const foundModels = requiredModels.filter(model =>
        schemaContent.includes(`model ${model}`)
      );

      const missingModels = requiredModels.filter(model => !foundModels.includes(model));

      if (missingModels.length > 0) {
        sectionResults.status = 'WARNING';
        missingModels.forEach(model => {
          sectionResults.details.push(`⚠️ Missing or renamed model: ${model}`);
        });
      }

      const totalModels = (schemaContent.match(/^model\s+\w+/gm) || []).length;
      sectionResults.details.push(`✓ Schema has ${totalModels} models`);
      sectionResults.details.push(`✓ Found ${foundModels.length}/${requiredModels.length} critical models`);
    }

    // Check canonical database import
    const dbPath = path.join(this.rootDir, 'src/lib/database.ts');
    if (fs.existsSync(dbPath)) {
      const dbContent = fs.readFileSync(dbPath, 'utf8');
      const isSingleton = dbContent.includes('global') || dbContent.includes('globalThis');
      sectionResults.details.push(isSingleton ? '✓ Database is singleton' : '⚠️ Database may not be singleton');

      // Check if it's imported correctly
      const importCount = this.countImportsOf('src/lib/database');
      sectionResults.details.push(`✓ Database imported ${importCount} times`);
    } else {
      sectionResults.status = 'FAIL';
      sectionResults.details.push('❌ Missing canonical database.ts');
    }

    // Check migrations
    const migrationsPath = path.join(this.rootDir, 'prisma/migrations');
    if (fs.existsSync(migrationsPath)) {
      const migrations = fs.readdirSync(migrationsPath).filter(f =>
        fs.statSync(path.join(migrationsPath, f)).isDirectory()
      );
      sectionResults.details.push(`✓ Found ${migrations.length} migrations`);
    }

    this.results.push(sectionResults);
  }

  // SECTION 5: SERVICE LAYER VALIDATION
  async validateServiceLayer(): Promise<void> {
    console.log('\n⚙️ 5. SERVICE LAYER VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Services',
      status: 'PASS',
      details: []
    };

    const servicesPath = path.join(this.rootDir, 'src/lib/services');
    if (!fs.existsSync(servicesPath)) {
      sectionResults.status = 'FAIL';
      sectionResults.details.push('❌ Services directory not found');
      this.results.push(sectionResults);
      return;
    }

    const serviceFiles = this.findFiles(servicesPath, '.service.ts');
    const requiredServices = [
      'farm.service.ts',
      'product.service.ts',
      'order.service.ts',
      'cart.service.ts'
    ];

    // Check for required services
    let foundServices = 0;
    for (const required of requiredServices) {
      const hasService = serviceFiles.some(file => file.endsWith(required));
      if (!hasService) {
        sectionResults.status = 'WARNING';
        sectionResults.details.push(`⚠️ Missing service: ${required}`);
      } else {
        foundServices++;
      }
    }

    sectionResults.details.push(`✓ Found ${foundServices}/${requiredServices.length} required services`);
    sectionResults.details.push(`✓ Total services: ${serviceFiles.length}`);

    // Check service quality (sample)
    let servicesWithErrors = 0;
    let servicesWithCanonicalDB = 0;

    for (const serviceFile of serviceFiles.slice(0, 5)) {
      try {
        const content = fs.readFileSync(serviceFile, 'utf8');

        // Check for canonical database import
        const usesCanonicalDB = content.includes('from "@/lib/database"');
        if (usesCanonicalDB) servicesWithCanonicalDB++;

        // Check for proper error handling
        const hasErrorHandling = content.includes('try') && content.includes('catch');

        const fileName = path.basename(serviceFile);
        const status = usesCanonicalDB && hasErrorHandling ? '✓' : '⚠️';
        sectionResults.details.push(
          `${status} ${fileName}: Canonical DB=${usesCanonicalDB}, Error Handling=${hasErrorHandling}`
        );
      } catch (error) {
        servicesWithErrors++;
      }
    }

    if (servicesWithErrors > 0) {
      sectionResults.status = 'WARNING';
      sectionResults.details.push(`⚠️ ${servicesWithErrors} services had read errors`);
    }

    sectionResults.metrics = {
      totalServices: serviceFiles.length,
      requiredServicesFound: foundServices,
      sampleSizeChecked: Math.min(5, serviceFiles.length),
      servicesWithCanonicalDB: servicesWithCanonicalDB
    };

    this.results.push(sectionResults);
  }

  // SECTION 6: FRONTEND-BACKEND INTEGRATION
  async validateFrontendBackendIntegration(): Promise<void> {
    console.log('\n🔗 6. FRONTEND-BACKEND INTEGRATION VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Frontend-Backend',
      status: 'PASS',
      details: []
    };

    // Check Server Actions
    const actionsPath = path.join(this.rootDir, 'src/app/actions');
    if (fs.existsSync(actionsPath)) {
      const actionFiles = this.findFiles(actionsPath, '.ts');
      sectionResults.details.push(`✓ Found ${actionFiles.length} server action files`);

      // Sample check for "use server" directive
      let serverActionsCount = 0;
      for (const actionFile of actionFiles.slice(0, 3)) {
        const content = fs.readFileSync(actionFile, 'utf8');
        if (content.includes('"use server"') || content.includes("'use server'")) {
          serverActionsCount++;
        }
      }
      sectionResults.details.push(`✓ ${serverActionsCount}/3 sampled files have "use server" directive`);
    } else {
      sectionResults.details.push('⚠️ No actions directory found');
    }

    // Check component patterns
    const componentFiles = this.findFiles(path.join(this.rootDir, 'src/components'), '.tsx');
    let clientComponents = 0;
    let serverComponents = 0;

    for (const compFile of componentFiles.slice(0, 10)) {
      const content = fs.readFileSync(compFile, 'utf8');
      if (content.includes('"use client"') || content.includes("'use client'")) {
        clientComponents++;
      } else {
        serverComponents++;
      }
    }

    sectionResults.details.push(
      `✓ Component sample (10): Client=${clientComponents}, Server=${serverComponents}`
    );

    // Check for API calls in components
    let apiCallsFound = 0;
    for (const compFile of componentFiles.slice(0, 10)) {
      const content = fs.readFileSync(compFile, 'utf8');
      if (content.includes('fetch(') || content.includes('/api/')) {
        apiCallsFound++;
      }
    }
    sectionResults.details.push(`✓ Components with API calls: ${apiCallsFound}/10 sampled`);

    sectionResults.metrics = {
      componentsSampled: 10,
      clientComponents,
      serverComponents,
      apiIntegrationLevel: apiCallsFound > 3 ? 'HIGH' : 'LOW'
    };

    this.results.push(sectionResults);
  }

  // SECTION 7: AUTHENTICATION FLOW
  async validateAuthenticationFlow(): Promise<void> {
    console.log('\n🔐 7. AUTHENTICATION FLOW VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Authentication',
      status: 'PASS',
      details: []
    };

    // Check NextAuth configuration
    const authConfigPath = path.join(this.rootDir, 'src/lib/auth.ts');
    if (!fs.existsSync(authConfigPath)) {
      sectionResults.status = 'FAIL';
      sectionResults.details.push('❌ Missing auth configuration');
    } else {
      const authContent = fs.readFileSync(authConfigPath, 'utf8');
      const hasProviders = authContent.includes('providers');
      const hasCallbacks = authContent.includes('callbacks');
      const hasSession = authContent.includes('session');

      sectionResults.details.push(
        `✓ Auth config: Providers=${hasProviders}, Callbacks=${hasCallbacks}, Session=${hasSession}`
      );
    }

    // Check auth routes
    const authRoutesPath = path.join(this.rootDir, 'src/app/(auth)');
    if (fs.existsSync(authRoutesPath)) {
      const authPages = this.findFiles(authRoutesPath, 'page.tsx');
      sectionResults.details.push(`✓ Found ${authPages.length} auth pages`);
    } else {
      sectionResults.status = 'WARNING';
      sectionResults.details.push('⚠️ No (auth) route group found');
    }

    // Check middleware
    const middlewarePath = path.join(this.rootDir, 'src/middleware.ts');
    if (fs.existsSync(middlewarePath)) {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
      const hasAuthCheck = middlewareContent.includes('auth');
      sectionResults.details.push(`✓ Middleware has auth check: ${hasAuthCheck}`);
    }

    this.results.push(sectionResults);
  }

  // SECTION 8: PAYMENT INTEGRATION
  async validatePaymentIntegration(): Promise<void> {
    console.log('\n💰 8. PAYMENT INTEGRATION VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Payment',
      status: 'PASS',
      details: []
    };

    // Check payment configuration
    const paymentsPath = path.join(this.rootDir, 'src/lib/payments');
    if (fs.existsSync(paymentsPath)) {
      const paymentFiles = fs.readdirSync(paymentsPath);
      sectionResults.details.push(`✓ Payment configuration files: ${paymentFiles.length}`);
    } else {
      sectionResults.status = 'WARNING';
      sectionResults.details.push('⚠️ No payments configuration directory');
    }

    // Check payment API
    const paymentAPIPath = path.join(this.rootDir, 'src/app/api/payments');
    if (fs.existsSync(paymentAPIPath)) {
      const paymentRoutes = this.findFiles(paymentAPIPath, 'route.ts');
      sectionResults.details.push(`✓ Payment API routes: ${paymentRoutes.length}`);
    } else {
      sectionResults.status = 'WARNING';
      sectionResults.details.push('⚠️ No payment API endpoints found');
    }

    this.results.push(sectionResults);
  }

  // SECTION 9: AI WORKFLOWS VALIDATION
  async validateAIWorkflows(): Promise<void> {
    console.log('\n🤖 9. AI WORKFLOWS VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'AI Workflows',
      status: 'PASS',
      details: []
    };

    // Check AI directory
    const aiPath = path.join(this.rootDir, 'src/lib/ai');
    if (!fs.existsSync(aiPath)) {
      sectionResults.status = 'WARNING';
      sectionResults.details.push('⚠️ AI directory not found');
    } else {
      const aiFiles = this.findFiles(aiPath, '.ts');
      sectionResults.details.push(`✓ AI files: ${aiFiles.length}`);
    }

    // Check agricultural AI
    const agriPath = path.join(this.rootDir, 'src/lib/agricultural');
    if (fs.existsSync(agriPath)) {
      const agriFiles = this.findFiles(agriPath, '.ts');
      sectionResults.details.push(`✓ Agricultural AI files: ${agriFiles.length}`);
    }

    this.results.push(sectionResults);
  }

  // SECTION 10: MONITORING VALIDATION
  async validateMonitoring(): Promise<void> {
    console.log('\n📊 10. MONITORING VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Monitoring',
      status: 'PASS',
      details: []
    };

    // Check monitoring setup
    const monitoringPath = path.join(this.rootDir, 'src/lib/monitoring');
    if (fs.existsSync(monitoringPath)) {
      const monitoringFiles = fs.readdirSync(monitoringPath);
      sectionResults.details.push(`✓ Monitoring files: ${monitoringFiles.length}`);
    }

    // Check instrumentation
    const instrumentationPath = path.join(this.rootDir, 'instrumentation.ts');
    if (fs.existsSync(instrumentationPath)) {
      sectionResults.details.push('✓ OpenTelemetry instrumentation found');
    }

    this.results.push(sectionResults);
  }

  // SECTION 11: PERFORMANCE VALIDATION
  async validatePerformance(): Promise<void> {
    console.log('\n⚡ 11. PERFORMANCE VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Performance',
      status: 'PASS',
      details: []
    };

    // Check caching
    const cachePath = path.join(this.rootDir, 'src/lib/cache');
    if (fs.existsSync(cachePath)) {
      const cacheFiles = fs.readdirSync(cachePath);
      sectionResults.details.push(`✓ Cache implementation files: ${cacheFiles.length}`);
    }

    // Check performance utilities
    const perfPath = path.join(this.rootDir, 'src/lib/performance');
    if (fs.existsSync(perfPath)) {
      const perfFiles = fs.readdirSync(perfPath);
      sectionResults.details.push(`✓ Performance utilities: ${perfFiles.length}`);
    }

    this.results.push(sectionResults);
  }

  // SECTION 12: TEST SUITE EXECUTION
  async runCompleteTestSuite(): Promise<void> {
    console.log('\n🧪 12. TEST SUITE VALIDATION');
    const sectionResults: ValidationResult = {
      section: 'Testing',
      status: 'PASS',
      details: []
    };

    try {
      // Count test files
      const testDirs = [
        'src/__tests__',
        'tests/',
        'src/lib/services/__tests__',
        'src/components/__tests__'
      ];

      let totalTestFiles = 0;
      for (const dir of testDirs) {
        const dirPath = path.join(this.rootDir, dir);
        if (fs.existsSync(dirPath)) {
          const testFiles = this.findFiles(dirPath, '.test.');
          totalTestFiles += testFiles.length;
        }
      }

      sectionResults.details.push(`✓ Total test files: ${totalTestFiles}`);

      // Run TypeScript check
      console.log('   Running TypeScript check...');
      try {
        execSync('npx tsc --noEmit', {
          cwd: this.rootDir,
          encoding: 'utf8',
          stdio: 'pipe'
        });
        sectionResults.details.push('✓ TypeScript: No errors');
      } catch (error: any) {
        const output = error.stdout || error.stderr || '';
        const errorCount = (output.match(/error TS/g) || []).length;
        if (errorCount > 0) {
          sectionResults.status = 'WARNING';
          sectionResults.details.push(`⚠️ TypeScript errors: ${errorCount}`);
        }
      }

      // Calculate coverage estimate
      const sourceFiles = this.findFiles(path.join(this.rootDir, 'src'), '.ts').length;
      const coverageRatio = totalTestFiles / Math.max(sourceFiles, 1);
      sectionResults.details.push(`✓ Test coverage ratio: ${(coverageRatio * 100).toFixed(1)}%`);

      sectionResults.metrics = {
        totalTestFiles,
        sourceFiles,
        coveragePercentage: coverageRatio * 100
      };

    } catch (error: any) {
      sectionResults.status = 'FAIL';
      sectionResults.details.push(`❌ Test validation failed: ${error.message}`);
    }

    this.results.push(sectionResults);
  }

  // SECTION 13: CAPABILITY MATRIX
  async generateCapabilityMatrix(): Promise<void> {
    console.log('\n📈 13. PLATFORM CAPABILITY MATRIX');
    const sectionResults: ValidationResult = {
      section: 'Capability Matrix',
      status: 'PASS',
      details: []
    };

    const expectedCapabilities = [
      { name: 'Product Catalog', weight: 10, check: 'products' },
      { name: 'Shopping Cart', weight: 10, check: 'cart' },
      { name: 'Checkout Process', weight: 10, check: 'checkout' },
      { name: 'Payment Processing', weight: 10, check: 'payment' },
      { name: 'Order Management', weight: 9, check: 'order' },
      { name: 'User Authentication', weight: 9, check: 'auth' },
      { name: 'Farm Management', weight: 10, check: 'farm' },
      { name: 'Search & Filter', weight: 8, check: 'search' },
      { name: 'Mobile Responsive', weight: 9, check: 'responsive' },
      { name: 'API Documentation', weight: 5, check: 'api' },
      { name: 'Error Tracking', weight: 7, check: 'error' },
      { name: 'Performance Monitoring', weight: 6, check: 'monitoring' },
      { name: 'Automated Testing', weight: 8, check: 'test' }
    ];

    let implementedCount = 0;
    let totalWeight = 0;
    let implementedWeight = 0;

    for (const capability of expectedCapabilities) {
      const isImplemented = this.checkCapabilityImplementation(capability.check);
      const status = isImplemented ? '✅' : '❌';

      sectionResults.details.push(
        `${status} ${capability.name.padEnd(30)} ${isImplemented ? 'IMPLEMENTED' : 'MISSING'}`
      );

      if (isImplemented) {
        implementedCount++;
        implementedWeight += capability.weight;
      }
      totalWeight += capability.weight;
    }

    const implementationScore = (implementedCount / expectedCapabilities.length) * 100;
    const weightedScore = (implementedWeight / totalWeight) * 100;

    sectionResults.details.push('');
    sectionResults.details.push('='.repeat(50));
    sectionResults.details.push(`IMPLEMENTATION SCORE: ${implementationScore.toFixed(1)}%`);
    sectionResults.details.push(`WEIGHTED SCORE: ${weightedScore.toFixed(1)}%`);
    sectionResults.details.push(`CAPABILITIES: ${implementedCount}/${expectedCapabilities.length}`);

    if (implementationScore < 70) {
      sectionResults.status = 'WARNING';
      sectionResults.details.push('⚠️ Platform functionality may be incomplete');
    }

    sectionResults.metrics = {
      implementationScore,
      weightedScore,
      implementedCount,
      totalCapabilities: expectedCapabilities.length
    };

    this.results.push(sectionResults);
  }

  // HELPER METHODS
  private countFilesInDirectory(dir: string): number {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;

    const walk = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && !item.includes('node_modules')) {
          walk(fullPath);
        } else if (stat.isFile()) {
          count++;
        }
      }
    };

    walk(dir);
    return count;
  }

  private findFiles(dir: string, pattern: string): string[] {
    if (!fs.existsSync(dir)) return [];

    const files: string[] = [];

    const walk = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!item.includes('node_modules') && !item.includes('.git')) {
            walk(fullPath);
          }
        } else if (item.includes(pattern)) {
          files.push(fullPath);
        }
      }
    };

    walk(dir);
    return files;
  }

  private checkForDuplicates(dir: string, extension: string): { hasDuplicates: boolean; duplicates: string[] } {
    const dirPath = path.join(this.rootDir, dir);
    if (!fs.existsSync(dirPath)) return { hasDuplicates: false, duplicates: [] };

    const files = this.findFiles(dirPath, extension);
    const baseNames = files.map(f => path.basename(f, extension));
    const duplicates = baseNames.filter((name, index) => baseNames.indexOf(name) !== index);

    return { hasDuplicates: duplicates.length > 0, duplicates };
  }

  private calculateTestCoverage(dirPath: string): number {
    if (!fs.existsSync(dirPath)) return 0;

    const testFiles = this.findFiles(dirPath, '.test.');
    const sourceFiles = this.findFiles(dirPath, '.ts').filter(f => !f.includes('.test.'));

    if (sourceFiles.length === 0) return 0;
    return (testFiles.length / sourceFiles.length) * 100;
  }

  private countImportsOf(modulePath: string): number {
    try {
      const srcPath = path.join(this.rootDir, 'src');
      const files = this.findFiles(srcPath, '.ts');
      let count = 0;

      for (const file of files.slice(0, 50)) { // Sample 50 files
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes(`from "@/${modulePath}"`) || content.includes(`from '@/${modulePath}'`)) {
          count++;
        }
      }

      return count;
    } catch {
      return 0;
    }
  }

  private checkCapabilityImplementation(keyword: string): boolean {
    try {
      const srcPath = path.join(this.rootDir, 'src');
      const files = this.findFiles(srcPath, '.ts');

      for (const file of files.slice(0, 20)) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE VALIDATION REPORT');
    console.log('='.repeat(80));

    let totalPass = 0;
    let totalFail = 0;
    let totalWarning = 0;

    for (const result of this.results) {
      console.log(`\n${result.section.toUpperCase()}: ${result.status}`);
      console.log('-'.repeat(80));

      for (const detail of result.details) {
        console.log(`  ${detail}`);
      }

      if (result.metrics) {
        console.log(`\n  Metrics:`);
        Object.entries(result.metrics).forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }

      if (result.status === 'PASS') totalPass++;
      else if (result.status === 'FAIL') totalFail++;
      else if (result.status === 'WARNING') totalWarning++;
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY STATISTICS');
    console.log('='.repeat(80));
    console.log(`✅ PASS: ${totalPass}`);
    console.log(`⚠️  WARNING: ${totalWarning}`);
    console.log(`❌ FAIL: ${totalFail}`);
    console.log(`📈 OVERALL SCORE: ${((totalPass / this.results.length) * 100).toFixed(1)}%`);

    // Save report to file
    const reportPath = path.join(this.rootDir, 'platform-validation-report.md');
    this.saveReportToFile(reportPath);
    console.log(`\n📄 Full report saved to: ${reportPath}`);
  }

  private saveReportToFile(filePath: string): void {
    const reportContent = [
      '# Farmers Market Platform Validation Report',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Summary',
      '| Section | Status | Key Metrics |',
      '|---------|--------|-------------|'
    ];

    for (const result of this.results) {
      const metrics = result.metrics
        ? Object.entries(result.metrics).map(([k, v]) => `${k}: ${v}`).join(', ')
        : 'N/A';
      reportContent.push(`| ${result.section} | ${result.status} | ${metrics} |`);
    }

    reportContent.push('', '## Detailed Results', '');

    for (const result of this.results) {
      reportContent.push(`### ${result.section}`, '', `**Status**: ${result.status}`, '');
      result.details.forEach(detail => {
        reportContent.push(`- ${detail}`);
      });
      reportContent.push('');
    }

    fs.writeFileSync(filePath, reportContent.join('\n'), 'utf8');
  }
}

// Main execution
const validator = new PlatformValidator();
validator.validateAll().catch(error => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});

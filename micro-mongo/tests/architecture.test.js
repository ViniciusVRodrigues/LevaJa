/**
 * Testes de Arquitetura - micro-mongo
 * Validação da estrutura e separação de camadas conforme Clean Architecture
 */

const fs = require('fs');
const path = require('path');

describe('Arquitetura do micro-mongo - Clean Architecture', () => {
  
  test('Deve existir separação clara de camadas', () => {
    const rootDir = path.join(__dirname, '..');
    
    // Verifica se os diretórios de camadas existem
    expect(fs.existsSync(path.join(rootDir, 'controllers'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'services'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'routes'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'models'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'config'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'db'))).toBe(true);
  });

  test('Controllers devem existir e seguir nomenclatura padrão', () => {
    const controllersDir = path.join(__dirname, '..', 'controllers');
    const files = fs.readdirSync(controllersDir);
    
    // Verifica se há controllers
    expect(files.length).toBeGreaterThan(0);
    
    // Verifica nomenclatura (deve terminar com Controller.js)
    const controllerFiles = files.filter(f => f.endsWith('Controller.js'));
    expect(controllerFiles.length).toBeGreaterThan(0);
  });

  test('Services devem existir e seguir nomenclatura padrão', () => {
    const servicesDir = path.join(__dirname, '..', 'services');
    const files = fs.readdirSync(servicesDir);
    
    // Verifica se há services
    expect(files.length).toBeGreaterThan(0);
    
    // Verifica nomenclatura (deve terminar com Service.js)
    const serviceFiles = files.filter(f => f.endsWith('Service.js'));
    expect(serviceFiles.length).toBeGreaterThan(0);
  });

  test('Routes devem existir e seguir nomenclatura padrão', () => {
    const routesDir = path.join(__dirname, '..', 'routes');
    const files = fs.readdirSync(routesDir);
    
    // Verifica se há routes
    expect(files.length).toBeGreaterThan(0);
    
    // Verifica nomenclatura (deve terminar com Routes.js)
    const routeFiles = files.filter(f => f.endsWith('Routes.js'));
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  test('Controllers devem importar Services, não acessar modelos diretamente', () => {
    const controllersDir = path.join(__dirname, '..', 'controllers');
    const controllerFiles = fs.readdirSync(controllersDir)
      .filter(f => f.endsWith('Controller.js'));
    
    controllerFiles.forEach(file => {
      const content = fs.readFileSync(path.join(controllersDir, file), 'utf-8');
      
      // Controllers devem importar services (padrão: require('../services/...')
      expect(content).toMatch(/require\(['"]\.\.\/services\/.*Service['"]\)/);
      
      // Controllers NÃO devem importar modelos diretamente
      expect(content).not.toMatch(/require\(['"]\.\.\/models\//);
    });
  });

  test('Services devem acessar Models (Mongoose)', () => {
    const servicesDir = path.join(__dirname, '..', 'services');
    const serviceFiles = fs.readdirSync(servicesDir)
      .filter(f => f.endsWith('Service.js'));
    
    expect(serviceFiles.length).toBeGreaterThan(0);
    
    // Services devem importar models
    serviceFiles.forEach(file => {
      const content = fs.readFileSync(path.join(servicesDir, file), 'utf-8');
      expect(content).toMatch(/require\(['"].*models\//);
    });
  });

  test('Models devem existir e usar Mongoose Schema', () => {
    const modelsDir = path.join(__dirname, '..', 'models');
    const files = fs.readdirSync(modelsDir);
    
    expect(files.length).toBeGreaterThan(0);
    
    // Ao menos um model deve usar mongoose
    let hasMongoose = false;
    files.forEach(file => {
      const content = fs.readFileSync(path.join(modelsDir, file), 'utf-8');
      if (content.includes('mongoose') && content.includes('Schema')) {
        hasMongoose = true;
      }
    });
    expect(hasMongoose).toBe(true);
  });
});

describe('Vertical Slice Architecture - micro-mongo', () => {
  
  test('Feature de produtos deve ter slice completo (controller, service, model, route)', () => {
    const rootDir = path.join(__dirname, '..');
    
    // Verifica se existe productController
    const controllerExists = fs.existsSync(path.join(rootDir, 'controllers', 'productController.js'));
    // Verifica se existe productService
    const serviceExists = fs.existsSync(path.join(rootDir, 'services', 'productService.js'));
    // Verifica se existe productRoutes
    const routeExists = fs.existsSync(path.join(rootDir, 'routes', 'productRoutes.js'));
    // Verifica se existe model de produto
    const modelExists = fs.readdirSync(path.join(rootDir, 'models'))
      .some(f => f.toLowerCase().includes('product') || f.toLowerCase().includes('lote'));
    
    expect(controllerExists).toBe(true);
    expect(serviceExists).toBe(true);
    expect(routeExists).toBe(true);
    expect(modelExists).toBe(true);
  });
});

describe('Integração e Saúde do Sistema', () => {
  
  test('Deve existir endpoint de health check', () => {
    const serverFile = path.join(__dirname, '..', 'server.js');
    const content = fs.readFileSync(serverFile, 'utf-8');
    
    // Verifica se há endpoint de health
    expect(content).toMatch(/\/health/);
  });

  test('Deve ter configuração centralizada', () => {
    const configDir = path.join(__dirname, '..', 'config');
    
    expect(fs.existsSync(configDir)).toBe(true);
    
    const files = fs.readdirSync(configDir);
    expect(files.length).toBeGreaterThan(0);
  });

  test('Deve ter módulo de conexão com banco de dados', () => {
    const dbDir = path.join(__dirname, '..', 'db');
    
    expect(fs.existsSync(dbDir)).toBe(true);
    
    const files = fs.readdirSync(dbDir);
    const hasConnection = files.some(f => f.toLowerCase().includes('connection'));
    
    expect(hasConnection).toBe(true);
  });
});

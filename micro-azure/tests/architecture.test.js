/**
 * Testes de Arquitetura - micro-azure
 * Validação da estrutura e separação de camadas conforme Clean Architecture
 */

const fs = require('fs');
const path = require('path');

describe('Arquitetura do micro-azure - Clean Architecture', () => {
  
  test('Deve existir separação clara de camadas', () => {
    const rootDir = path.join(__dirname, '..');
    
    // Verifica se os diretórios de camadas existem
    expect(fs.existsSync(path.join(rootDir, 'controllers'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'services'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'routes'))).toBe(true);
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

  test('Controllers devem importar Services, não acessar banco diretamente', () => {
    const controllersDir = path.join(__dirname, '..', 'controllers');
    const controllerFiles = fs.readdirSync(controllersDir)
      .filter(f => f.endsWith('Controller.js'));
    
    controllerFiles.forEach(file => {
      const content = fs.readFileSync(path.join(controllersDir, file), 'utf-8');
      
      // Controllers devem importar services
      expect(content).toMatch(/require\(['"].*Service['"]\)/);
      
      // Controllers NÃO devem importar conexões de banco diretamente
      expect(content).not.toMatch(/require\(['"].*db\/connection['"]\)/);
    });
  });

  test('Services devem acessar camada de persistência (db)', () => {
    const servicesDir = path.join(__dirname, '..', 'services');
    const serviceFiles = fs.readdirSync(servicesDir)
      .filter(f => f.endsWith('Service.js'));
    
    expect(serviceFiles.length).toBeGreaterThan(0);
    
    // Services devem importar conexão de banco (padrão: require('../db/connection'))
    serviceFiles.forEach(file => {
      const content = fs.readFileSync(path.join(servicesDir, file), 'utf-8');
      expect(content).toMatch(/require\(['"]\.\.\/db\/connection['"]\)/);
    });
  });
});

describe('Vertical Slice Architecture - micro-azure', () => {
  
  test('Feature de usuários deve ter slice completo (controller, service, route)', () => {
    const rootDir = path.join(__dirname, '..');
    
    // Verifica se existe userController
    const controllerExists = fs.existsSync(path.join(rootDir, 'controllers', 'userController.js'));
    // Verifica se existe userService
    const serviceExists = fs.existsSync(path.join(rootDir, 'services', 'userService.js'));
    // Verifica se existe userRoutes
    const routeExists = fs.existsSync(path.join(rootDir, 'routes', 'userRoutes.js'));
    
    expect(controllerExists).toBe(true);
    expect(serviceExists).toBe(true);
    expect(routeExists).toBe(true);
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

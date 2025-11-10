/**
 * Testes de Arquitetura - micro-bff
 * Validação da estrutura e separação de camadas conforme Clean Architecture
 */

const fs = require('fs');
const path = require('path');

describe('Arquitetura do micro-bff - Clean Architecture', () => {
  
  test('Deve existir separação clara de camadas', () => {
    const rootDir = path.join(__dirname, '..');
    
    // Verifica se os diretórios de camadas existem
    expect(fs.existsSync(path.join(rootDir, 'controllers'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'services'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'routes'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'config'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'middleware'))).toBe(true);
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
    
    // Verifica nomenclatura (deve terminar com Routes.js ou index.js)
    const routeFiles = files.filter(f => f.endsWith('Routes.js') || f === 'index.js');
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
      expect(content).not.toMatch(/require\(['"].*database['"]\)/);
    });
  });

  test('Services devem importar dependências de infraestrutura (axios, etc)', () => {
    const servicesDir = path.join(__dirname, '..', 'services');
    const serviceFiles = fs.readdirSync(servicesDir)
      .filter(f => f.endsWith('Service.js'));
    
    expect(serviceFiles.length).toBeGreaterThan(0);
    
    // Ao menos um service deve usar axios (para chamadas HTTP)
    let hasAxios = false;
    serviceFiles.forEach(file => {
      const content = fs.readFileSync(path.join(servicesDir, file), 'utf-8');
      if (content.includes('axios')) {
        hasAxios = true;
      }
    });
    expect(hasAxios).toBe(true);
  });
});

describe('Vertical Slice Architecture - micro-bff', () => {
  
  test('Cada feature deve ter seu próprio conjunto de arquivos (slice completo)', () => {
    const rootDir = path.join(__dirname, '..');
    
    // Verifica features principais: usuários e produtos
    const features = ['user', 'product'];
    
    features.forEach(feature => {
      // Cada feature deve ter controller, service e route
      const controllerExists = fs.readdirSync(path.join(rootDir, 'controllers'))
        .some(f => f.toLowerCase().includes(feature));
      const serviceExists = fs.readdirSync(path.join(rootDir, 'services'))
        .some(f => f.toLowerCase().includes(feature));
      const routeExists = fs.readdirSync(path.join(rootDir, 'routes'))
        .some(f => f.toLowerCase().includes(feature));
      
      expect(controllerExists).toBe(true);
      expect(serviceExists).toBe(true);
      expect(routeExists).toBe(true);
    });
  });

  test('Features não devem ter dependências cruzadas indevidas', () => {
    const controllersDir = path.join(__dirname, '..', 'controllers');
    const files = fs.readdirSync(controllersDir);
    
    // userController não deve importar productService e vice-versa
    const userController = files.find(f => f.toLowerCase().includes('user'));
    const productController = files.find(f => f.toLowerCase().includes('product'));
    
    if (userController) {
      const content = fs.readFileSync(path.join(controllersDir, userController), 'utf-8');
      expect(content).not.toMatch(/productService/);
    }
    
    if (productController) {
      const content = fs.readFileSync(path.join(controllersDir, productController), 'utf-8');
      expect(content).not.toMatch(/userService/);
    }
  });
});

describe('Integração e Saúde do Sistema', () => {
  
  test('Deve existir endpoint de health check', () => {
    const serverFile = path.join(__dirname, '..', 'server.js');
    const content = fs.readFileSync(serverFile, 'utf-8');
    
    // Verifica se há endpoint de health
    expect(content).toMatch(/\/health|\/api\/v1\/health/);
  });

  test('Deve ter configuração centralizada', () => {
    const configDir = path.join(__dirname, '..', 'config');
    
    expect(fs.existsSync(configDir)).toBe(true);
    
    const files = fs.readdirSync(configDir);
    expect(files.length).toBeGreaterThan(0);
  });

  test('Deve ter tratamento de erros centralizado', () => {
    const middlewareDir = path.join(__dirname, '..', 'middleware');
    
    expect(fs.existsSync(middlewareDir)).toBe(true);
    
    const files = fs.readdirSync(middlewareDir);
    const hasErrorHandler = files.some(f => 
      f.toLowerCase().includes('error') || f.toLowerCase().includes('handler')
    );
    
    expect(hasErrorHandler).toBe(true);
  });
});

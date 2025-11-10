/**
 * Testes de Arquitetura - function-usuarios-auditoria
 * Validação da estrutura conforme Clean Architecture para Azure Functions
 */

const fs = require('fs');
const path = require('path');

describe('Arquitetura da function-usuarios-auditoria - Clean Architecture', () => {
  
  test('Deve ter separação de responsabilidades em diretórios', () => {
    const rootDir = path.join(__dirname, '..');
    
    // Verifica se há diretório de configuração
    expect(fs.existsSync(path.join(rootDir, 'config'))).toBe(true);
  });

  test('Deve ter múltiplas Functions seguindo Single Responsibility', () => {
    const rootDir = path.join(__dirname, '..');
    const items = fs.readdirSync(rootDir);
    
    // Filtra apenas diretórios que são functions (contêm index.js e function.json)
    const functionDirs = items.filter(item => {
      const itemPath = path.join(rootDir, item);
      if (!fs.statSync(itemPath).isDirectory()) return false;
      
      const hasIndex = fs.existsSync(path.join(itemPath, 'index.js'));
      const hasFunctionJson = fs.existsSync(path.join(itemPath, 'function.json'));
      
      return hasIndex && hasFunctionJson;
    });
    
    // Deve ter ao menos 2 functions (HTTP + Service Bus trigger)
    expect(functionDirs.length).toBeGreaterThanOrEqual(2);
  });

  test('Cada Function deve ter responsabilidade única e clara', () => {
    const rootDir = path.join(__dirname, '..');
    const items = fs.readdirSync(rootDir);
    
    const functionDirs = items.filter(item => {
      const itemPath = path.join(rootDir, item);
      if (!fs.statSync(itemPath).isDirectory()) return false;
      return fs.existsSync(path.join(itemPath, 'index.js'));
    });
    
    // Verifica nomes sugestivos
    const hasProcessFunction = functionDirs.some(f => f.includes('Process'));
    const hasGetFunction = functionDirs.some(f => f.includes('Get'));
    
    expect(hasProcessFunction || hasGetFunction).toBe(true);
  });

  test('Functions devem importar config centralizada', () => {
    const rootDir = path.join(__dirname, '..');
    const items = fs.readdirSync(rootDir);
    
    const functionDirs = items.filter(item => {
      const itemPath = path.join(rootDir, item);
      if (!fs.statSync(itemPath).isDirectory()) return false;
      return fs.existsSync(path.join(itemPath, 'index.js'));
    });
    
    // Ao menos uma function deve importar config
    let hasConfigImport = false;
    functionDirs.forEach(dir => {
      const indexPath = path.join(rootDir, dir, 'index.js');
      const content = fs.readFileSync(indexPath, 'utf-8');
      if (content.includes("require('../config")) {
        hasConfigImport = true;
      }
    });
    
    expect(hasConfigImport).toBe(true);
  });

  test('Deve ter módulo de configuração de banco de dados', () => {
    const configDir = path.join(__dirname, '..', 'config');
    const files = fs.readdirSync(configDir);
    
    const hasDatabase = files.some(f => f.toLowerCase().includes('database'));
    expect(hasDatabase).toBe(true);
  });
});

describe('Vertical Slice Architecture - function-usuarios-auditoria', () => {
  
  test('Cada feature/endpoint deve ter sua própria Function isolada', () => {
    const rootDir = path.join(__dirname, '..');
    const items = fs.readdirSync(rootDir);
    
    const functionDirs = items.filter(item => {
      const itemPath = path.join(rootDir, item);
      if (!fs.statSync(itemPath).isDirectory()) return false;
      return fs.existsSync(path.join(itemPath, 'index.js'));
    });
    
    // Deve ter functions para diferentes operações
    // Ex: ProcessUsuarioCriado, GetUsuariosAuditoria, GetStatistics
    expect(functionDirs.length).toBeGreaterThanOrEqual(3);
  });

  test('Functions não devem ter dependências cruzadas entre si', () => {
    const rootDir = path.join(__dirname, '..');
    const items = fs.readdirSync(rootDir);
    
    const functionDirs = items.filter(item => {
      const itemPath = path.join(rootDir, item);
      if (!fs.statSync(itemPath).isDirectory()) return false;
      return fs.existsSync(path.join(itemPath, 'index.js'));
    });
    
    // Verifica que functions não importam outras functions
    functionDirs.forEach(dir => {
      const indexPath = path.join(rootDir, dir, 'index.js');
      const content = fs.readFileSync(indexPath, 'utf-8');
      
      // Functions não devem importar outras functions diretamente
      functionDirs.forEach(otherDir => {
        if (dir !== otherDir) {
          expect(content).not.toMatch(new RegExp(`require\\(['"].*${otherDir}`));
        }
      });
    });
  });
});

describe('Integração e Saúde do Sistema', () => {
  
  test('Deve ter configuração host.json', () => {
    const rootDir = path.join(__dirname, '..');
    expect(fs.existsSync(path.join(rootDir, 'host.json'))).toBe(true);
  });

  test('Deve ter example de configuração local.settings', () => {
    const rootDir = path.join(__dirname, '..');
    const hasExample = fs.existsSync(path.join(rootDir, 'local.settings.example.json'));
    
    expect(hasExample).toBe(true);
  });

  test('Deve ter Function de teste de conexão com banco', () => {
    const rootDir = path.join(__dirname, '..');
    const items = fs.readdirSync(rootDir);
    
    const hasTestFunction = items.some(item => 
      item.toLowerCase().includes('test') && fs.statSync(path.join(rootDir, item)).isDirectory()
    );
    
    expect(hasTestFunction).toBe(true);
  });
});

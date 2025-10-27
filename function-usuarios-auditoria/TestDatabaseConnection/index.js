const { connectDatabase } = require('../config/database');

module.exports = async function (context, req) {
  context.log('TestDatabaseConnection function triggered');

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Teste 1: Variáveis de ambiente
  context.log('Test 1: Checking environment variables');
  const mongoUri = process.env.MONGODB_URI;
  testResults.tests.push({
    name: 'Environment Variables',
    status: mongoUri ? 'PASS' : 'FAIL',
    details: {
      MONGODB_URI: mongoUri ? 'Configured' : 'Missing',
      uriPrefix: mongoUri ? mongoUri.substring(0, 20) + '...' : 'N/A'
    }
  });

  if (!mongoUri) {
    context.res = {
      status: 500,
      body: {
        success: false,
        message: 'MONGODB_URI não configurada',
        results: testResults
      }
    };
    return;
  }

  // Teste 2: Conexão com o banco
  let db = null;
  try {
    context.log('Test 2: Connecting to database');
    db = await connectDatabase();
    testResults.tests.push({
      name: 'Database Connection',
      status: 'PASS',
      details: {
        message: 'Connected successfully',
        databaseName: db.databaseName
      }
    });
  } catch (error) {
    context.log(`Connection failed: ${error.message}`);
    testResults.tests.push({
      name: 'Database Connection',
      status: 'FAIL',
      details: {
        error: error.message,
        stack: error.stack
      }
    });

    context.res = {
      status: 500,
      body: {
        success: false,
        message: 'Falha ao conectar com o banco de dados',
        results: testResults
      }
    };
    return;
  }

  // Teste 3: Acessar coleção
  try {
    context.log('Test 3: Accessing collection');
    const collection = db.collection('usuarios_auditoria');
    testResults.tests.push({
      name: 'Collection Access',
      status: 'PASS',
      details: {
        collectionName: collection.collectionName
      }
    });
  } catch (error) {
    context.log(`Collection access failed: ${error.message}`);
    testResults.tests.push({
      name: 'Collection Access',
      status: 'FAIL',
      details: {
        error: error.message
      }
    });
  }

  // Teste 4: Contar documentos
  try {
    context.log('Test 4: Counting documents');
    const collection = db.collection('usuarios_auditoria');
    const count = await collection.countDocuments({});
    testResults.tests.push({
      name: 'Count Documents',
      status: 'PASS',
      details: {
        totalDocuments: count
      }
    });
  } catch (error) {
    context.log(`Count failed: ${error.message}`);
    testResults.tests.push({
      name: 'Count Documents',
      status: 'FAIL',
      details: {
        error: error.message
      }
    });
  }

  // Teste 5: Inserir documento de teste
  try {
    context.log('Test 5: Inserting test document');
    const collection = db.collection('usuarios_auditoria');
    const testDoc = {
      eventType: 'TEST',
      timestamp: new Date().toISOString(),
      testData: 'Connection test document',
      processedAt: new Date().toISOString()
    };
    const result = await collection.insertOne(testDoc);
    testResults.tests.push({
      name: 'Insert Test Document',
      status: 'PASS',
      details: {
        insertedId: result.insertedId.toString()
      }
    });

    // Teste 6: Ler o documento inserido
    context.log('Test 6: Reading test document');
    const foundDoc = await collection.findOne({ _id: result.insertedId });
    testResults.tests.push({
      name: 'Read Test Document',
      status: foundDoc ? 'PASS' : 'FAIL',
      details: {
        found: !!foundDoc,
        eventType: foundDoc ? foundDoc.eventType : 'N/A'
      }
    });

    // Teste 7: Deletar documento de teste
    context.log('Test 7: Deleting test document');
    const deleteResult = await collection.deleteOne({ _id: result.insertedId });
    testResults.tests.push({
      name: 'Delete Test Document',
      status: deleteResult.deletedCount === 1 ? 'PASS' : 'FAIL',
      details: {
        deletedCount: deleteResult.deletedCount
      }
    });
  } catch (error) {
    context.log(`Write operation failed: ${error.message}`);
    testResults.tests.push({
      name: 'Write Operations',
      status: 'FAIL',
      details: {
        error: error.message,
        stack: error.stack
      }
    });
  }

  // Resumo dos testes
  const totalTests = testResults.tests.length;
  const passedTests = testResults.tests.filter(t => t.status === 'PASS').length;
  const failedTests = testResults.tests.filter(t => t.status === 'FAIL').length;

  testResults.summary = {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: `${((passedTests / totalTests) * 100).toFixed(2)}%`
  };

  const allPassed = failedTests === 0;

  context.res = {
    status: allPassed ? 200 : 500,
    body: {
      success: allPassed,
      message: allPassed 
        ? 'Todos os testes passaram! Conexão com banco de dados OK' 
        : 'Alguns testes falharam. Verifique os detalhes.',
      results: testResults
    }
  };
};

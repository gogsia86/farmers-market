const { ProductService } = require('./src/lib/services/product.service.ts');

async function test() {
  const service = new ProductService();
  console.log('Service created:', typeof service);
  console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(service)));
}

test().catch(console.error);

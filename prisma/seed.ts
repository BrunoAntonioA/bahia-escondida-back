import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface LowdbSchema {
  products: Array<{
    id: number;
    clientId: string;
    name: string;
    category: string;
    price: number;
  }>;
  sales: Array<{
    id: number;
    createdAt: string;
    tableNumber?: number;
    isDelivery: boolean;
    customerNickname?: string;
    clientId: string;
    status: string;
    closedAt?: string;
    partySize?: number;
  }>;
  saleProducts: Array<{
    id: number;
    saleId: number;
    productId: number;
    quantity: number;
  }>;
  payments: Array<{
    id: number;
    createdAt: string;
    cashPaid: number;
    cardPaid: number;
    transferPaid?: number;
    tipPaid?: number;
    saleId: number;
  }>;
}

async function main() {
  const dbPath = path.join(__dirname, '..', 'db.json');

  if (!fs.existsSync(dbPath)) {
    console.log('No db.json found, skipping lowdb seed.');
    return;
  }

  const raw = fs.readFileSync(dbPath, 'utf-8');
  const data = JSON.parse(raw) as LowdbSchema;

  const clientSlug = data.products[0]?.clientId ?? data.sales[0]?.clientId;

  if (!clientSlug) {
    console.log('db.json has no data to seed.');
    return;
  }

  let client = await prisma.client.findFirst({
    where: { name: { equals: 'Bahia Escondida', mode: 'insensitive' } },
  });

  if (!client) {
    client = await prisma.client.create({
      data: { name: 'Bahia Escondida' },
    });
    console.log(`Created client id=${client.id}`);
  }

  const productIdMap = new Map<number, number>();

  for (const product of data.products) {
    const created = await prisma.product.create({
      data: {
        clientId: client.id,
        name: product.name,
        price: product.price,
        category: product.category,
      },
    });
    productIdMap.set(product.id, created.id);
  }

  console.log(`Seeded ${productIdMap.size} products`);

  const saleIdMap = new Map<number, number>();

  for (const sale of data.sales) {
    const created = await prisma.sale.create({
      data: {
        clientId: client.id,
        isDelivery: sale.isDelivery,
        tableNumber: sale.tableNumber || null,
        customerNickname: sale.customerNickname || null,
        partySize: sale.partySize ?? null,
        status: sale.status,
        closedAt: sale.closedAt ? new Date(sale.closedAt) : null,
        createdAt: new Date(sale.createdAt),
      },
    });
    saleIdMap.set(sale.id, created.id);
  }

  console.log(`Seeded ${saleIdMap.size} sales`);

  let saleProductCount = 0;

  for (const line of data.saleProducts) {
    const saleId = saleIdMap.get(line.saleId);
    const productId = productIdMap.get(line.productId);

    if (!saleId || !productId) {
      continue;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      continue;
    }

    await prisma.saleProduct.create({
      data: {
        saleId,
        productId,
        name: product.name,
        price: product.price,
        quantity: line.quantity,
      },
    });
    saleProductCount++;
  }

  console.log(`Seeded ${saleProductCount} sale line items`);

  let paymentCount = 0;

  for (const payment of data.payments) {
    const saleId = saleIdMap.get(payment.saleId);

    if (!saleId) {
      continue;
    }

    await prisma.payment.create({
      data: {
        saleId,
        cashPaid: payment.cashPaid ?? 0,
        cardPaid: payment.cardPaid ?? 0,
        transferPaid: payment.transferPaid ?? 0,
        tipPaid: payment.tipPaid ?? 0,
        createdAt: new Date(payment.createdAt),
      },
    });
    paymentCount++;
  }

  console.log(`Seeded ${paymentCount} payments`);
  console.log(`\nUse clientId=${client.id} when registering users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import credentials from './seed_credentials.json';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const hashedPassword = await bcrypt.hash(credentials.defaultPassword, 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: credentials.admin.email },
    update: {},
    create: {
      email: credentials.admin.email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create Creator Users
  for (const creatorData of credentials.creators) {
    const user = await prisma.user.upsert({
      where: { email: creatorData.email },
      update: {},
      create: {
        email: creatorData.email,
        password: hashedPassword,
        role: 'CREATOR',
      },
    });

    await prisma.creator.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: creatorData.displayName,
        subscriptionPrice: creatorData.subscriptionPrice,
        commissionRate: 15,
        status: 'ACTIVE',
      },
    });

    console.log('✅ Creator created:', creatorData.displayName);
  }

  // Create Subscriber Users
  for (let i = 1; i <= 5; i++) {
    await prisma.user.upsert({
      where: { email: `subscriber${i}@simply.com` },
      update: {},
      create: {
        email: `subscriber${i}@simply.com`,
        password: hashedPassword,
        role: 'CREATOR',
      },
    });
  }

  console.log('✅ 5 subscribers created');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding predefined tags...');

  const predefinedTags = [
    { name: 'Backend', color: '#3B82F6', type: 'PREDEFINED' },
    { name: 'Frontend', color: '#10B981', type: 'PREDEFINED' },
    { name: 'Testing', color: '#F59E0B', type: 'PREDEFINED' },
    { name: 'Design', color: '#EC4899', type: 'PREDEFINED' },
    { name: 'Documentation', color: '#8B5CF6', type: 'PREDEFINED' },
    { name: 'DevOps', color: '#EF4444', type: 'PREDEFINED' },
    { name: 'Database', color: '#06B6D4', type: 'PREDEFINED' },
  ];

  for (const tag of predefinedTags) {
    const existingTag = await prisma.tag.findFirst({
      where: { name: tag.name, userId: null },
    });

    if (!existingTag) {
      await prisma.tag.create({
        data: {
          name: tag.name,
          color: tag.color,
          type: tag.type,
          userId: null, // Predefined tags have no userId
        },
      });
      console.log(`✅ Created predefined tag: ${tag.name}`);
    } else {
      console.log(`⏭️  Skipped existing tag: ${tag.name}`);
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

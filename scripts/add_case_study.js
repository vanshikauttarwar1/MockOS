
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Check if it exists
    const exists = await prisma.topic.findFirst({ where: { name: 'Case Study' } });
    if (exists) {
        console.log('Case Study topic already exists.');
        return;
    }

    // Create without description if it's not in schema
    await prisma.topic.create({
        data: {
            name: 'Case Study',
        }
    });

    console.log('Case Study topic added successfully.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

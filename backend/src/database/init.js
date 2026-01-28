import { initializeDatabase, seedAdminUser } from './db.js';

console.log('🚀 Starting database initialization...\n');

try {
    initializeDatabase();
    await seedAdminUser();
    console.log('\n✨ Database setup complete!');
    console.log('\n📝 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the admin password after first login!\n');
    process.exit(0);
} catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
}

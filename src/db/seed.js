const pool = require('../config/database'); // Adjusted path
const { hashPassword } = require('../utils/passwordUtils'); // Adjusted path

async function seedUsers() {
  console.log('Seeding users...');
  const usersToSeed = [
    { username: 'testuser', password: 'password123', address: '123 Test St', isAdmin: false },
    { username: 'anotheruser', password: 'password456', address: '456 Another Rd', isAdmin: false },
    { username: 'adminuser', password: 'adminpass', address: '789 Admin Ave', isAdmin: true },
  ];

  for (const userData of usersToSeed) {
    try {
      const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [userData.username]);
      if (existingUser.rows.length > 0) {
        console.log(`User ${userData.username} already exists. Skipping.`);
        continue;
      }

      const hashedPassword = await hashPassword(userData.password);
      const result = await pool.query(
        'INSERT INTO users (username, password_hash, address, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, username, is_admin',
        [userData.username, hashedPassword, userData.address, userData.isAdmin]
      );
      console.log(`Inserted user: ${result.rows[0].username} (Admin: ${result.rows[0].is_admin})`);
    } catch (error) {
      console.error(`Error inserting user ${userData.username}:`, error.message);
    }
  }
  console.log('User seeding complete.');
}

async function seedMembers() {
  console.log('Seeding Janaza members...');
  const membersToSeed = [
    { name: 'Ahmed Ali', telephone: '0771234567', address: '1 Main St, AraliyaUyana', location: 'AraliyaUyana', janaza2024: { "jan": "Paid", "feb": "Not_Paid", "mar": "Pending" } },
    { name: 'Fatima Khan', telephone: '0719876543', address: '2 Park Rd, AsiriUyana', location: 'AsiriUyana', janaza2024: { "jan": "Paid", "feb": "Paid", "apr": "Waived" } },
    { name: 'Mohamed Ibrahim', telephone: '0765551111', address: '10 Lake View, AraliyaUyana', location: 'AraliyaUyana', janaza2024: { "jan": "Not_Paid" } },
    { name: 'Aisha Siddiqa', telephone: '0702223333', address: '5 Temple Lane, Bandaranayakapura', location: 'Bandara', janaza2024: { "jan": "Paid", "feb": "Pending" } },
    { name: 'Omar Sharif', telephone: '0754445555', address: '12 Cross Rd, Bogahawila', location: 'Boga', janaza2024: { "jan": "Paid", "feb": "Paid", "mar": "Paid" } },
    { name: 'Layla Begum', telephone: '0786667777', address: '3 Hilltop, AsiriUyana', location: 'AsiriUyana', janaza2024: { "feb": "Not_Paid", "mar": "Not_Paid" } },
    { name: 'Yusuf Hassan', telephone: '0728889999', address: '7 Canal Bank, AraliyaUyana', location: 'AraliyaUyana', janaza2024: { "jan": "Waived", "mar": "Paid" } },
  ];

  // For mock data, we'll just insert. If the script is run multiple times, this will duplicate members.
  // A more robust solution might involve checking for existing members based on a unique combination of fields or adding a clear function.
  for (const memberData of membersToSeed) {
    try {
      const result = await pool.query(
        'INSERT INTO members (name, telephone, address, location, janaza2024) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, location',
        [memberData.name, memberData.telephone, memberData.address, memberData.location, memberData.janaza2024]
      );
      console.log(`Inserted Janaza member: ${result.rows[0].name} for location ${result.rows[0].location}`);
    } catch (error) {
      console.error(`Error inserting Janaza member ${memberData.name}:`, error.message);
    }
  }
  console.log('Janaza member seeding complete.');
}

async function seedMahallaMembers() {
  console.log('Seeding Mahalla members...');
  const mahallaMembersToSeed = [
    { name: 'Abdul Rahman', zone: '2C', address: '10 Zone St, 2C', telephone: '0771112233' },
    { name: 'Khadija Bibi', zone: '3C', address: '12 Sector Ave, 3C', telephone: '0712223344' },
    { name: 'Usman Ghani', zone: '4B', address: '15 Block Rd, 4B', telephone: '0763334455' },
    { name: 'Ruqayya Sultana', zone: '2C', address: '18 Zone St, 2C', telephone: '0704445566' },
    { name: 'Talha Zubair', zone: '5B', address: '20 Area Lane, 5B', telephone: '0755556677' },
    { name: 'Zainab Akthar', zone: '3C', address: '22 Sector Ave, 3C', telephone: '0786667788' },
  ];

  for (const memberData of mahallaMembersToSeed) {
    try {
      const result = await pool.query(
        'INSERT INTO mahallah_members (name, zone, address, telephone) VALUES ($1, $2, $3, $4) RETURNING id, name, zone',
        [memberData.name, memberData.zone, memberData.address, memberData.telephone]
      );
      console.log(`Inserted Mahalla member: ${result.rows[0].name} for zone ${result.rows[0].zone}`);
    } catch (error) {
      console.error(`Error inserting Mahalla member ${memberData.name}:`, error.message);
    }
  }
  console.log('Mahalla member seeding complete.');
}

async function main() {
  console.log('Starting database seeding process...');
  try {
    await seedUsers();
    await seedMembers();
    await seedMahallaMembers();
    console.log('Database seeding process completed successfully.');
  } catch (error) {
    console.error('An error occurred during the seeding process:', error);
  } finally {
    await pool.end();
    console.log('Database pool closed.');
  }
}

main();

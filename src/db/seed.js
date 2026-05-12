// src/db/seed.js
// Run with: node src/db/seed.js

const pool = require('./pool');
require('dotenv').config();

const branches = [
  { name:"Sharq — Al Ghawali Complex",  area:"Capital",   address:"Block 1, Sharq, Kuwait City",       lat:29.3759, lng:47.9769 },
  { name:"Sharq — Al-Enezi Tower",      area:"Capital",   address:"Al-Enezi Tower, Sharq",             lat:29.3701, lng:47.9781 },
  { name:"Sharq — Assima Mall",         area:"Capital",   address:"Assima Mall, Sharq",                lat:29.3720, lng:47.9800 },
  { name:"Qibla — Al Hamad Tower",      area:"Capital",   address:"Al Hamad Tower, Qibla",             lat:29.3680, lng:47.9720 },
  { name:"Qibla — Souk Al-Mubarakiya", area:"Capital",   address:"Souk Al-Mubarakiya, Qibla",         lat:29.3695, lng:47.9745 },
  { name:"Merqab — Ministry Complex",   area:"Capital",   address:"Ministry Complex, Merqab",          lat:29.3730, lng:47.9680 },
  { name:"Adailiya Branch",             area:"Capital",   address:"Adailiya, Kuwait City",             lat:29.3601, lng:47.9651 },
  { name:"Yarmouk Branch",              area:"Capital",   address:"Yarmouk, Kuwait City",              lat:29.3450, lng:47.9550 },
  { name:"Salmiya — Mariam Complex",    area:"Hawalli",   address:"Salem Al Mubarak St, Salmiya",      lat:29.3367, lng:48.0773 },
  { name:"Hawally Branch",              area:"Hawalli",   address:"Tunis St, Hawalli",                 lat:29.3325, lng:47.9922 },
  { name:"Rumaithiya Branch",           area:"Hawalli",   address:"Rumaithiya, Hawalli",               lat:29.3280, lng:48.0820 },
  { name:"Bayan Branch",                area:"Hawalli",   address:"Bayan, Hawalli",                    lat:29.3100, lng:48.0600 },
  { name:"Rai — The Avenues",           area:"Hawalli",   address:"The Avenues Mall, Rai",             lat:29.3092, lng:47.9303 },
  { name:"Farwaniya Branch",            area:"Farwaniya", address:"Al Farwaniya",                      lat:29.2772, lng:47.9596 },
  { name:"Ardiya Branch",               area:"Farwaniya", address:"Ardiya, Farwaniya",                 lat:29.2900, lng:47.9400 },
  { name:"Khaitan Branch",              area:"Farwaniya", address:"Khaitan, Farwaniya",                lat:29.2850, lng:47.9650 },
  { name:"Airport — Mall Departure",    area:"Farwaniya", address:"Kuwait International Airport",      lat:29.2267, lng:47.9689 },
  { name:"Fahaheel Branch",             area:"Ahmadi",    address:"Gulf Rd, Fahaheel",                 lat:29.0832, lng:48.1323 },
  { name:"Ahmadi Branch",               area:"Ahmadi",    address:"Ahmadi",                            lat:29.0700, lng:48.0800 },
  { name:"Adan Branch",                 area:"Ahmadi",    address:"Adan, Ahmadi",                      lat:29.1900, lng:48.0100 },
  { name:"Egaila — Al Bairaq Mall",     area:"Ahmadi",    address:"Al Bairaq Mall, Egaila",            lat:29.2100, lng:48.0900 },
  { name:"Sabahiya — The Warehouse",    area:"Ahmadi",    address:"The Warehouse, Sabahiya",           lat:29.1500, lng:48.0600 },
  { name:"Jahra Branch",                area:"Jahra",     address:"Jahra",                             lat:29.3376, lng:47.6581 },
  { name:"Saad Al Abdullah Branch",     area:"Jahra",     address:"Saad Al Abdullah City, Jahra",      lat:29.4000, lng:47.6000 },
];

const machines = [
  { id:"BYN-001", branchIdx:0,  type:"Smart",   status:"online",      beans:85, milk:72, cups:65 },
  { id:"BYN-002", branchIdx:1,  type:"Smart",   status:"online",      beans:60, milk:80, cups:50 },
  { id:"BYN-003", branchIdx:2,  type:"Smart",   status:"online",      beans:78, milk:65, cups:72 },
  { id:"BYN-004", branchIdx:3,  type:"Vending", status:"online",      beans:50, milk:88, cups:45 },
  { id:"BYN-005", branchIdx:4,  type:"Vending", status:"maintenance", beans:90, milk:55, cups:30 },
  { id:"BYN-006", branchIdx:5,  type:"Smart",   status:"online",      beans:40, milk:70, cups:60 },
  { id:"BYN-007", branchIdx:6,  type:"Smart",   status:"online",      beans:76, milk:68, cups:50 },
  { id:"BYN-008", branchIdx:7,  type:"Smart",   status:"online",      beans:58, milk:74, cups:62 },
  { id:"BYN-009", branchIdx:8,  type:"Smart",   status:"online",      beans:82, milk:58, cups:55 },
  { id:"BYN-010", branchIdx:9,  type:"Smart",   status:"online",      beans:65, milk:75, cups:48 },
  { id:"BYN-011", branchIdx:10, type:"Vending", status:"offline",     beans:60, milk:55, cups:80 },
  { id:"BYN-012", branchIdx:11, type:"Smart",   status:"online",      beans:72, milk:66, cups:58 },
  { id:"BYN-013", branchIdx:12, type:"Smart",   status:"online",      beans:55, milk:82, cups:70 },
  { id:"BYN-014", branchIdx:13, type:"Smart",   status:"online",      beans:78, milk:60, cups:52 },
  { id:"BYN-015", branchIdx:14, type:"Vending", status:"online",      beans:45, milk:88, cups:62 },
  { id:"BYN-016", branchIdx:15, type:"Smart",   status:"online",      beans:80, milk:70, cups:44 },
  { id:"BYN-017", branchIdx:16, type:"Smart",   status:"online",      beans:42, milk:86, cups:60 },
  { id:"BYN-018", branchIdx:17, type:"Smart",   status:"online",      beans:68, milk:75, cups:58 },
  { id:"BYN-019", branchIdx:18, type:"Smart",   status:"online",      beans:55, milk:62, cups:66 },
  { id:"BYN-020", branchIdx:19, type:"Vending", status:"online",      beans:72, milk:80, cups:55 },
  { id:"BYN-021", branchIdx:20, type:"Smart",   status:"online",      beans:82, milk:66, cups:48 },
  { id:"BYN-022", branchIdx:21, type:"Smart",   status:"offline",     beans:65, milk:58, cups:72 },
  { id:"BYN-023", branchIdx:22, type:"Smart",   status:"online",      beans:60, milk:72, cups:54 },
  { id:"BYN-024", branchIdx:23, type:"Vending", status:"online",      beans:78, milk:55, cups:68 },
];

const drinks = [
  { name:"Espresso",    icon:"☕" },
  { name:"Cappuccino",  icon:"☁️" },
  { name:"Flat White",  icon:"🥛" },
  { name:"Americano",   icon:"🌊" },
];

async function seed() {
  console.log("Starting seed...");

  // ── Clear existing data ───────────────────────────────────
  await pool.query(`DELETE FROM suppliers`);
  await pool.query(`DELETE FROM machine_content`);
  await pool.query(`DELETE FROM drinks`);
  await pool.query(`DELETE FROM faults`);
  await pool.query(`DELETE FROM orders`);
  await pool.query(`DELETE FROM machines`);
  await pool.query(`DELETE FROM branches`);
  await pool.query(`ALTER SEQUENCE branches_id_seq RESTART WITH 1`);
  console.log("Cleared existing data");

  // ── Insert branches ───────────────────────────────────────
  const branchIds = [];
  for (const b of branches) {
    const r = await pool.query(
      `INSERT INTO branches (name, area, address, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [b.name, b.area, b.address, b.lat, b.lng]
    );
    branchIds.push(r.rows[0].id);
  }
  console.log(`✅ Inserted ${branches.length} branches`);

  // ── Insert machines ───────────────────────────────────────
  for (const m of machines) {
    const branchId = branchIds[m.branchIdx];
    await pool.query(
      `INSERT INTO machines
         (id, name, branch_id, type, status, secret_key, beans_level, milk_level, cups_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE
         SET branch_id=$3, type=$4, status=$5,
             beans_level=$7, milk_level=$8, cups_level=$9`,
      [
        m.id,
        branches[m.branchIdx].name,
        branchId,
        m.type,
        m.status,
        `secret-key-${m.id.toLowerCase()}`,
        m.beans,
        m.milk,
        m.cups,
      ]
    );

    // Drinks for every machine
    for (const d of drinks) {
      await pool.query(
        `INSERT INTO drinks (machine_id, name, icon, available) VALUES ($1,$2,$3,true)`,
        [m.id, d.name, d.icon]
      );
    }

    // Suppliers for every machine
    await pool.query(
      `INSERT INTO suppliers (machine_id, role, name, logo_url) VALUES ($1,'beans','Air Roastery','')`,
      [m.id]
    );
    await pool.query(
      `INSERT INTO suppliers (machine_id, role, name, logo_url) VALUES ($1,'milk','KDCOW','')`,
      [m.id]
    );

    // Screen content for every machine
    await pool.query(
      `INSERT INTO machine_content (machine_id, welcome_msg, screen_theme)
       VALUES ($1,'أهلاً بك في بوبيان','boubyan-red')`,
      [m.id]
    );
  }
  console.log(`✅ Inserted ${machines.length} machines`);
  console.log(`✅ Inserted drinks, suppliers, content for all machines`);

  console.log("\n🎉 Seed complete!");
  console.log(`   ${branches.length} branches`);
  console.log(`   ${machines.length} machines`);
  console.log(`   ${machines.length * drinks.length} drinks`);
  console.log(`   ${machines.length * 2} supplier records`);

  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

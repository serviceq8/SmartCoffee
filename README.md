# Smart Coffee Machine Management Platform — API

## Stack
- Node.js + Express
- PostgreSQL
- Deployed on Render

## Project Structure

```
src/
  index.js              → Server entry point
  db/
    pool.js             → PostgreSQL connection
    schema.sql          → Database schema + seed data
    init.js             → Run schema on startup
  routes/
    machines.js         → Machine + Partner API routes
    orders.js           → Order routes
    admin.js            → Admin dashboard routes
  controllers/
    machines.js         → Machine + Partner logic
    orders.js           → Order logic
    admin.js            → Admin logic
```

## API Groups

### Layer 2 — Machine APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/machines/:id/heartbeat | Machine heartbeat |
| PUT | /api/v1/machines/:id/status | Update machine status |
| POST | /api/v1/machines/:id/stock | Report stock levels |
| POST | /api/v1/machines/:id/fault | Report hardware fault |
| POST | /api/v1/machines/:id/verify-code | Verify customer code |
| GET | /api/v1/machines/:id/orders/pending | Get pending order |
| GET | /api/v1/machines/:id/content | Get screen content |

### Layer 3 — Partner APIs (Msa3ed)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/machines/nearby | Nearby machines |
| GET | /api/v1/machines/:id | Machine details |
| GET | /api/v1/machines/:id/menu | Drink menu |
| GET | /api/v1/machines/:id/suppliers | Suppliers |
| POST | /api/v1/orders | Place order → returns code |
| GET | /api/v1/orders/:id/status | Track order |
| DELETE | /api/v1/orders/:id | Cancel order |

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/admin/machines | All machines |
| POST | /api/v1/admin/machines | Create machine |
| GET | /api/v1/admin/orders | All orders |
| GET | /api/v1/admin/branches | All branches |
| GET | /api/v1/admin/faults | Active faults |

## Environment Variables
```
DATABASE_URL=your_postgres_url
NODE_ENV=production
PORT=3000
```

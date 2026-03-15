# Tribe Hangar API

Backend API for [Tribe Hangar Admin](https://github.com/jasonchotchkiss/tribe-hangar-admin) — a blockchain-enforced shared tribe vault for EVE Frontier.

This server securely holds the admin private key, handling all admin transactions on behalf of the dApp. The dApp never touches the private key directly. It can be hosted anywhere Node.js runs — a Linux server, a VPS (DigitalOcean, Linode, Hetzner, etc.), a home machine, or a cloud VM. The only requirement is that it stays online and reachable while the dApp is in use.

**Live dApp:** [https://ccplz-vault.vercel.app](https://ccplz-vault.vercel.app)

---

## What It Does

The dApp calls this API to perform admin actions:

| Endpoint | Purpose |
|----------|---------|
| `POST /add-member` | Add a wallet address to the tribe |
| `POST /remove-member` | Remove a wallet address from the tribe |
| `POST /update-message` | Update the denial message shown to non-members |
| `POST /update-name` | Update the tribe display name |
| `POST /transfer-admin` | Transfer the AdminCap to another wallet |
| `GET /health` | Check if the API is running |

---

## Requirements

- Node.js v20
- A Linux server (local or VPS)
- pm2 (for keeping the API running persistently)
- A funded Sui testnet wallet with the AdminCap object

---

## Setup

**1. Clone the repo:**
```bash
git clone https://github.com/jasonchotchkiss/tribe-hangar-api.git
cd tribe-hangar-api
npm install
```

**2. Create your `.env` file:**
```bash
cp .env.example .env
```

Open `.env` and fill in your values:
```
ADMIN_PRIVATE_KEY=suiprivkey1_your_private_key_here
CORP_CONFIG_ID=0x_your_corp_config_id
ADMIN_CAP_ID=0x_your_admin_cap_id
CORP_HANGAR_PACKAGE=0x_your_corp_hangar_package_id
```

**3. Start with pm2:**
```bash
npm install -g pm2
pm2 start ts-node --name corp-storage-api -- index.ts
pm2 save
pm2 startup
```

Run the command that `pm2 startup` prints out to enable auto-restart on reboot.

**4. Verify it's running:**
```bash
pm2 status
curl http://localhost:3001/health
```

---

## Usage

The API runs on port `3001` by default. Point your dApp's `VITE_API_URL` to it:
```
VITE_API_URL=http://localhost:3001
```

For public deployments, the [Tribe Hangar Admin](https://github.com/jasonchotchkiss/tribe-hangar-admin) dApp uses Vercel serverless functions instead, so this API is only needed for local development.

---

## pm2 Commands
```bash
pm2 status                    # Check if running
pm2 restart corp-storage-api  # Restart after code changes
pm2 logs corp-storage-api     # View logs
pm2 save                      # Save process list
```

---

## License

MIT License with Commons Clause — see [LICENSE](LICENSE) for details.
Credit must be given to Jason C. Hotchkiss in any derivative works.

---

*Built by Jason C. Hotchkiss (aka Sebastian Lance | Conflict Curators [CCPlz])*
*Vibe coded with Claude by Anthropic*

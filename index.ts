import express, { Request, Response } from "express";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Transaction } from "@mysten/sui/transactions";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// CORS — allow your dApp to call this API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Load config from .env
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY!;
const CORP_CONFIG_ID = process.env.CORP_CONFIG_ID!;
const ADMIN_CAP_ID = process.env.ADMIN_CAP_ID!;
const PACKAGE_ID = process.env.CORP_HANGAR_PACKAGE!;

// Sui client pointing at Stillness testnet
const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });

// Admin keypair from private key
const { secretKey } = decodeSuiPrivateKey(PRIVATE_KEY);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);

// Helper — build and submit a transaction
async function executeTransaction(tx: Transaction): Promise<string> {
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: { showEffects: true },
  });
  if (result.effects?.status?.status !== "success") {
    throw new Error(result.effects?.status?.error || "Transaction failed");
  }
  return result.digest;
}

// POST /add-member
app.post("/add-member", async (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "address is required" });
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::corp_hangar::add_member`,
      arguments: [
        tx.object(CORP_CONFIG_ID),
        tx.object(ADMIN_CAP_ID),
        tx.pure.address(address),
      ],
    });
    const digest = await executeTransaction(tx);
    res.json({ success: true, digest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /remove-member
app.post("/remove-member", async (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "address is required" });
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::corp_hangar::remove_member`,
      arguments: [
        tx.object(CORP_CONFIG_ID),
        tx.object(ADMIN_CAP_ID),
        tx.pure.address(address),
      ],
    });
    const digest = await executeTransaction(tx);
    res.json({ success: true, digest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /update-message
app.post("/update-message", async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::corp_hangar::update_denial_message`,
      arguments: [
        tx.object(CORP_CONFIG_ID),
        tx.object(ADMIN_CAP_ID),
        tx.pure.string(message),
      ],
    });
    const digest = await executeTransaction(tx);
    res.json({ success: true, digest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /update-name
app.post("/update-name", async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::corp_hangar::update_name`,
      arguments: [
        tx.object(CORP_CONFIG_ID),
        tx.object(ADMIN_CAP_ID),
        tx.pure.string(name),
      ],
    });
    const digest = await executeTransaction(tx);
    res.json({ success: true, digest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /transfer-admin
app.post("/transfer-admin", async (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: "address is required" });
  try {
    const tx = new Transaction();
    tx.transferObjects(
      [tx.object(ADMIN_CAP_ID)],
      tx.pure.address(address)
    );
    const digest = await executeTransaction(tx);
    res.json({ success: true, digest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Corp Storage API running on port ${PORT}`);
});



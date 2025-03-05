import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;

  // ✅ Route /status
  onionRouter.get("/status", (req, res) => {
    res.json({ status: "live", nodeId });
  });

  // ✅ Route /message (pour recevoir un message)
  onionRouter.post("/message", (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message est requis" });
    }

    lastReceivedEncryptedMessage = message;
    lastReceivedDecryptedMessage = message; // Simule la décryption (remplace ça plus tard)

    console.log(`📩 Node ${nodeId} a reçu un message:`, message);
    res.json({ message: "Message reçu avec succès" });
  });

  // ✅ Route /getLastReceivedDecryptedMessage
  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `🚀 Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`
    );
  });

  return server;
}

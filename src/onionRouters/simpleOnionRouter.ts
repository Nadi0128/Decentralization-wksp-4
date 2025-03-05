import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

  // ✅ Route /status
  onionRouter.get("/status", (req, res) => {
    res.json({ status: "live", nodeId });
  });

  // ✅ Route /message (pour recevoir un message)
  onionRouter.post("/message", (req, res) => {
    const { message, destination } = req.body;

    if (!message || destination === undefined) {
      return res.status(400).json({ error: "Message et destination requis" });
    }

    console.log(` Message reçu: ${message}, à destination de ${destination}`);

    // Mettre à jour les dernières valeurs
    lastReceivedEncryptedMessage = message;
    lastReceivedDecryptedMessage = message; // À modifier si un décryptage est nécessaire
    lastMessageDestination = destination;

    return res.status(200).json({ status: "Message received", message });
  });

  // ✅ Route /getLastReceivedEncryptedMessage
  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  // ✅ Route /getLastReceivedDecryptedMessage
  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  // ✅ Route /getLastMessageDestination
  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: lastMessageDestination });
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      ` Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`
    );
  });

  return server;
}

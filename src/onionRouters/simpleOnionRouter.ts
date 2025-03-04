import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // ✅ Route pour vérifier que le nœud est actif
  onionRouter.get("/status", (req, res) => {
    console.log(`🔵 Requête reçue sur /status du nœud Onion ${nodeId}`);
    res.json({ status: "online", nodeId });
  });

  // ✅ Démarrage du nœud Onion
  const port = BASE_ONION_ROUTER_PORT + nodeId;
  const server = onionRouter.listen(port, () => {
    console.log(`✅ Onion router ${nodeId} is listening on port ${port}`);
  });

  return server;
}

// 🚀 Lancer un nœud Onion avec l’ID 1 (cette ligne est essentielle)
simpleOnionRouter(1).catch(console.error);

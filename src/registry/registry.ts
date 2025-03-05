import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

console.log(" Début du lancement du registre...");
console.log(`ℹ️ REGISTRY_PORT = ${REGISTRY_PORT}`);

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

const nodes: Node[] = []; // Liste des nœuds enregistrés

export async function launchRegistry() {
  console.log(" Fonction `launchRegistry()` appelée !");

  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // Route pour vérifier le statut du registre
  _registry.get("/status", (req: Request, res: Response) => {
    console.log(" Requête reçue sur /status");
    res.json({ status: "live" });
  });

  // Route pour enregistrer un nœud
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    if (!nodeId || !pubKey) {
      return res.status(400).json({ error: "nodeId et pubKey sont requis" });
    }

    if (nodes.some((node) => node.nodeId === nodeId)) {
      return res.status(400).json({ error: "Nœud déjà enregistré" });
    }

    nodes.push({ nodeId, pubKey });
    console.log(` Nœud ${nodeId} enregistré avec succès`);

    return res.json({ message: "Nœud enregistré avec succès", nodeId });
  });

  // Route pour récupérer la liste des nœuds enregistrés
  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    res.json({ nodes });
  });

  try {
    console.log(" Tentative de démarrage du serveur...");
    const server = _registry.listen(REGISTRY_PORT, () => {
      console.log(` Registry is listening on port ${REGISTRY_PORT}`);
    });

    server.on("error", (err) => {
      console.error(" Erreur lors du démarrage du registre :", err);
    });

    return server;
  } catch (error) {
    console.error(" Erreur inattendue :", error);
    throw new Error("Impossible de lancer le registre.");
  }
}

launchRegistry();
console.log(" Fin du fichier `registry.ts` !");

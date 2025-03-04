import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

console.log(" Début du lancement du registre...");
console.log(` REGISTRY_PORT = ${REGISTRY_PORT}`);

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  console.log(" Fonction `launchRegistry()` appelée !");

  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // Liste des nœuds enregistrés
  const nodes: Node[] = [];

  // 📌 Route pour vérifier si le registre est actif
  _registry.get("/status", (req: Request, res: Response) => {
    console.log(" Requête reçue sur /status");
    res.json({ status: "online", nodeCount: nodes.length });
  });

  // 📌 Route pour enregistrer un nœud
  _registry.post("/register", (req: Request, res: Response) => {
    console.log(" Requête reçue sur /register");

    const { nodeId, pubKey }: RegisterNodeBody = req.body;

    if (!nodeId || !pubKey) {
      console.log(" Rejet: Données manquantes");
      return res.status(400).json({ error: "nodeId et pubKey sont requis" });
    }

    if (nodes.some((node) => node.nodeId === nodeId)) {
      console.log(` Rejet: Nœud ${nodeId} déjà enregistré`);
      return res.status(400).json({ error: "Nœud déjà enregistré" });
    }

    nodes.push({ nodeId, pubKey });
    console.log(` Nœud ${nodeId} enregistré avec succès !`);

    return res.json({ message: "Nœud enregistré avec succès", nodeId });
  });

  try {
    console.log(" Tentative de démarrage du serveur...");
    const server = _registry.listen(REGISTRY_PORT, () => {
      console.log(`✅ Registry is listening on port ${REGISTRY_PORT}`);
    });

    // 🔍 Vérification des routes enregistrées
    console.log(" Routes enregistrées :");
    _registry._router.stack.forEach((middleware: { route?: { methods: any; path: string } }) => {

      if (middleware.route) {
        console.log(`🔹 ${Object.keys(middleware.route.methods).join(", ").toUpperCase()} ${middleware.route.path}`);
      }
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
console.log("🎯 Fin du fichier `registry.ts` !");

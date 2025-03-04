"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchRegistry = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
async function launchRegistry() {
    const _registry = (0, express_1.default)();
    _registry.use(express_1.default.json());
    _registry.use(body_parser_1.default.json());
    const nodes = [];
    // TODO implement the status route
    // _registry.get("/status", (req, res) => {});
    _registry.get("/status", (req, res) => {
        res.json({ status: "online", nodeCount: nodes.length });
    });
    _registry.post("/register", (req, res) => {
        const { nodeId, pubKey } = req.body;
        if (!nodeId || !pubKey) {
            return res.status(400).json({ error: "nodeId et pubKey sont requis" });
        }
        if (nodes.some((node) => node.nodeId === nodeId)) {
            return res.status(400).json({ error: "Nœud déjà enregistré" });
        }
        nodes.push({ nodeId, pubKey });
        return res.json({ message: "Nœud enregistré avec succès", nodeId });
    });
    try {
        const server = _registry.listen(config_1.REGISTRY_PORT, () => {
            console.log(`✅ Registry is listening on port ${config_1.REGISTRY_PORT}`);
        });
        return server; // ✅ TypeScript est satisfait car on retourne toujours une valeur
    }
    catch (error) {
        console.error("❌ Erreur lors du démarrage du registre:", error);
        throw new Error("Impossible de lancer le registre.");
    }
}
exports.launchRegistry = launchRegistry;

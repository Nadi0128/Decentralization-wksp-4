import * as http from "http";
import {
  BASE_ONION_ROUTER_PORT,
  BASE_USER_PORT,
  REGISTRY_PORT,
} from "../../src/config";
import { launchNetwork } from "../../src/index";
import type { Node } from "../../src/registry/registry";
import {
  createRandomSymmetricKey,
  exportPrvKey,
  exportPubKey,
  exportSymKey,
  generateRsaKeyPair,
  importPrvKey,
  importPubKey,
  importSymKey,
  rsaDecrypt,
  rsaEncrypt,
  symDecrypt,
  symEncrypt,
} from "../../src/crypto";
import { describe, it, expect, beforeAll, afterEach,afterAll } from "@jest/globals";

const { validateEncryption } = require("./utils");

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function closeAllServers(servers: http.Server[]) {
  await Promise.all(
    servers.map(
      (server) =>
        new Promise((resolve) => {
          server.close(() => {
            server.closeAllConnections();
            resolve(null);
          });
        })
    )
  );
  await delay(100);
}

async function getNodeRegistry() {
  const nodes = await fetch(`http://localhost:${REGISTRY_PORT}/getNodeRegistry`)
    .then((res) => res.json() as Promise<{ nodes: Node[] }>)
    .then((json) => json.nodes);

  return nodes;
}

describe("Onion Routing", () => {
  describe("Can start a specific number of nodes and users", () => {
    let servers: http.Server[] = [];

    afterEach(async () => {
      await closeAllServers(servers);
    });

    it("Can start 1 node and 1 user", async () => {
      servers = await launchNetwork(1, 1);

      const isNodeLive = await fetch(
        `http://localhost:${BASE_ONION_ROUTER_PORT + 0}/status`
      )
        .then((res) => res.json())
        .then((json) => json.status === "live");

      expect(isNodeLive).toBeTruthy();

      const isUserLive = await fetch(
        `http://localhost:${BASE_USER_PORT + 0}/status`
      )
        .then((res) => res.json())
        .then((json) => json.status === "live");

      expect(isUserLive).toBeTruthy();
    });

    it("Can start 10 nodes and 2 users", async () => {
      servers = await launchNetwork(10, 2);

      for (let index = 0; index < 10; index++) {
        const isNodeLive = await fetch(
          `http://localhost:${BASE_ONION_ROUTER_PORT + index}/status`
        )
          .then((res) => res.json())
          .then((json) => json.status === "live");

        expect(isNodeLive).toBeTruthy();
      }

      for (let index = 0; index < 2; index++) {
        const isUserLive = await fetch(
          `http://localhost:${BASE_USER_PORT + index}/status`
        )
          .then((res) => res.json())
          .then((json) => json.status === "live");

        expect(isUserLive).toBeTruthy();
      }
    });
  });

  describe("Nodes are registered in the registry", () => {
    let servers: http.Server[] = [];

    beforeAll(async () => {
      servers = await launchNetwork(10, 2);
    });

    afterAll(async () => {
      await closeAllServers(servers);
    });

    it("Each node is registered", async () => {
      const nodes = await getNodeRegistry();

      for (let index = 0; index < 10; index++) {
        const node = nodes.find((_n: Node) => _n.nodeId === index);
        expect(node).not.toBeUndefined();
      }
    });

    it("All public keys are unique", async () => {
      const nodes = await getNodeRegistry();
      const pubKeys = new Set(nodes.map((node) => node.pubKey));

      expect(pubKeys.size).toBe(nodes.length);
    });
  });

  describe("Cryptographic Functions", () => {
    it("Can generate RSA key pair", async () => {
      const { publicKey, privateKey } = await generateRsaKeyPair();

      expect(publicKey.algorithm.name).toBe("RSA-OAEP");
      expect(privateKey.algorithm.name).toBe("RSA-OAEP");
    });

    it("Can encrypt and decrypt messages with RSA", async () => {
      const { publicKey, privateKey } = await generateRsaKeyPair();
      const message = btoa("Hello RSA!");

      const encrypted = await rsaEncrypt(message, await exportPubKey(publicKey));
      const decrypted = await rsaDecrypt(encrypted, privateKey);

      expect(decrypted).toBe(message);
    });

    it("Can encrypt and decrypt messages symmetrically", async () => {
      const symKey = await createRandomSymmetricKey();
      const message = btoa("Hello AES!");

      const encrypted = await symEncrypt(symKey, message);
      const decrypted = await symDecrypt(await exportSymKey(symKey), encrypted);

      expect(decrypted).toBe(message);
    });
  });
});

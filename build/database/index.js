import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../../data");
const DATA_FILE = resolve(DATA_DIR, "guilds.json");
const MEMORY_FILE = resolve(DATA_DIR, "memory.json");
let cachedDb = null;
async function loadDatabase() {
    try {
        const data = await readFile(DATA_FILE, "utf-8");
        const parsed = JSON.parse(data);
        return {
            configs: parsed.configs ?? {},
            hierarquias: parsed.hierarquias ?? {},
            acoes: parsed.acoes ?? {},
            punicoes: parsed.punicoes ?? {},
            updates: parsed.updates ?? {},
            vendas: parsed.vendas ?? {},
            status: parsed.status ?? {},
            reportes: parsed.reportes ?? {},
            farms: parsed.farms ?? {},
            farmSalas: parsed.farmSalas ?? {},
            ausencias: parsed.ausencias ?? {},
            acoesAtivas: parsed.acoesAtivas ?? {},
        };
    }
    catch {
        // Fallback: tentar carregar do memory.json (base snapshot)
        try {
            const data = await readFile(MEMORY_FILE, "utf-8");
            const parsed = JSON.parse(data);
            return {
                configs: parsed.configs ?? {},
                hierarquias: parsed.hierarquias ?? {},
                acoes: parsed.acoes ?? {},
                punicoes: parsed.punicoes ?? {},
                updates: parsed.updates ?? {},
                vendas: parsed.vendas ?? {},
                status: parsed.status ?? {},
                reportes: parsed.reportes ?? {},
                farms: parsed.farms ?? {},
                farmSalas: parsed.farmSalas ?? {},
                ausencias: parsed.ausencias ?? {},
                acoesAtivas: parsed.acoesAtivas ?? {},
            };
        }
        catch {
            return { configs: {}, hierarquias: {}, acoes: {}, punicoes: {}, updates: {}, vendas: {}, status: {}, reportes: {}, farms: {}, farmSalas: {}, ausencias: {}, acoesAtivas: {} };
        }
    }
}
async function readDatabase() {
    if (cachedDb)
        return cachedDb;
    cachedDb = await loadDatabase();
    return cachedDb;
}
async function writeDatabase(db) {
    cachedDb = db;
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
    writeFile(MEMORY_FILE, JSON.stringify(db, null, 2), "utf-8").catch(() => { });
}
export async function getGuildConfig(guildId) {
    const db = await readDatabase();
    return db.configs[guildId] ?? null;
}
export async function hasGuildConfig(guildId) {
    const db = await readDatabase();
    return guildId in db.configs && db.configs[guildId] !== undefined && db.configs[guildId] !== null;
}
export async function setGuildConfig(guildId, config) {
    const db = await readDatabase();
    db.configs[guildId] = config;
    await writeDatabase(db);
}
export async function deleteGuildConfig(guildId) {
    const db = await readDatabase();
    delete db.configs[guildId];
    await writeDatabase(db);
}
export async function getHierarquiaConfig(guildId) {
    const db = await readDatabase();
    return db.hierarquias[guildId] ?? null;
}
export async function setHierarquiaConfig(guildId, cargos) {
    const db = await readDatabase();
    db.hierarquias[guildId] = cargos;
    await writeDatabase(db);
}
export async function getAcoesTemplates(guildId) {
    const db = await readDatabase();
    return db.acoes[guildId] ?? [];
}
export async function setAcoesTemplates(guildId, templates) {
    const db = await readDatabase();
    db.acoes[guildId] = templates;
    await writeDatabase(db);
}
export async function addAcaoTemplate(guildId, template) {
    const templates = await getAcoesTemplates(guildId);
    const newTemplate = { ...template, id: crypto.randomUUID() };
    templates.push(newTemplate);
    await setAcoesTemplates(guildId, templates);
    return newTemplate;
}
export async function updateAcaoTemplate(guildId, id, updates) {
    const templates = await getAcoesTemplates(guildId);
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1)
        return false;
    templates[idx] = { ...templates[idx], ...updates };
    await setAcoesTemplates(guildId, templates);
    return true;
}
export async function deleteAcaoTemplate(guildId, id) {
    const templates = await getAcoesTemplates(guildId);
    const filtered = templates.filter(t => t.id !== id);
    if (filtered.length === templates.length)
        return false;
    await setAcoesTemplates(guildId, filtered);
    return true;
}
export async function getPunishmentConfig(guildId) {
    const db = await readDatabase();
    return db.punicoes[guildId] ?? {
        logChannelId: null,
        advertencia1: null,
        advertencia2: null,
        advertencia3: null,
        maxWarnsBeforeBan: 5,
    };
}
export async function setPunishmentConfig(guildId, config) {
    const db = await readDatabase();
    db.punicoes[guildId] = config;
    await writeDatabase(db);
}
const DEFAULT_UPDATE_CONFIG = {
    geraisRoleId: "",
    filterRoleId: "",
    canalDestinoId: "",
    cargosPromocao: [],
    cargosRebaixamento: [],
    gerenciaRoleIds: [],
};
export async function getUpdateConfig(guildId) {
    const db = await readDatabase();
    return db.updates[guildId] ?? { ...DEFAULT_UPDATE_CONFIG };
}
export async function setUpdateConfig(guildId, config) {
    const db = await readDatabase();
    db.updates[guildId] = config;
    await writeDatabase(db);
}
export async function resetUpdateConfig(guildId) {
    const db = await readDatabase();
    const reset = { ...DEFAULT_UPDATE_CONFIG };
    db.updates[guildId] = reset;
    await writeDatabase(db);
    return reset;
}
const DEFAULT_VENDAS_CONFIG = {
    logChannelId: null,
    produtos: [],
};
export async function getVendasConfig(guildId) {
    const db = await readDatabase();
    const config = db.vendas[guildId] ?? { ...DEFAULT_VENDAS_CONFIG, produtos: [] };
    // Migrate old products with single "valor" to new schema
    let migrated = false;
    for (const p of config.produtos) {
        if (p.valorPista === undefined || p.valorParceria === undefined) {
            const oldValor = p.valor ?? 0;
            p.valorPista ??= oldValor;
            p.valorParceria ??= oldValor;
            migrated = true;
        }
    }
    if (migrated) {
        db.vendas[guildId] = config;
        await writeDatabase(db);
    }
    return config;
}
export async function setVendasConfig(guildId, config) {
    const db = await readDatabase();
    db.vendas[guildId] = config;
    await writeDatabase(db);
}
export async function addProduto(guildId, nome, valorPista, valorParceria, porcentagemPainel) {
    const config = await getVendasConfig(guildId);
    const produto = { id: crypto.randomUUID(), nome, valorPista, valorParceria, porcentagemPainel };
    config.produtos.push(produto);
    await setVendasConfig(guildId, config);
    return produto;
}
export async function updateProduto(guildId, id, updates) {
    const config = await getVendasConfig(guildId);
    const idx = config.produtos.findIndex(p => p.id === id);
    if (idx === -1)
        return false;
    config.produtos[idx] = { ...config.produtos[idx], ...updates };
    await setVendasConfig(guildId, config);
    return true;
}
const DEFAULT_STATUS_CONFIG = {
    roleOnline: null,
    roleAtualizando: null,
    roleOffline: null,
    roleInstavel: null,
};
export async function getStatusConfig(guildId) {
    const db = await readDatabase();
    return db.status[guildId] ?? { ...DEFAULT_STATUS_CONFIG };
}
export async function setStatusConfig(guildId, config) {
    const db = await readDatabase();
    db.status[guildId] = config;
    await writeDatabase(db);
}
const DEFAULT_FARM_CONFIG = {
    logChannelId: null,
    categoriaId: null,
    imagemUrl: null,
    produtos: [],
    cargos: { cargoMetaConcluida: null, cargoMetaIncompleta: null, cargoNenhumaEntrega: null },
};
export async function getFarmConfig(guildId) {
    const db = await readDatabase();
    const existing = db.farms[guildId];
    if (!existing) {
        const def = { ...DEFAULT_FARM_CONFIG, produtos: [] };
        db.farms[guildId] = def;
        return def;
    }
    // Migration from old schema
    if (existing.categoriaId === undefined)
        existing.categoriaId = null;
    if (existing.imagemUrl === undefined)
        existing.imagemUrl = null;
    if (!existing.cargos)
        existing.cargos = { cargoMetaConcluida: null, cargoMetaIncompleta: null, cargoNenhumaEntrega: null };
    if (!existing.produtos) {
        // Migrate from old "pontos" to new "produtos"
        const oldPontos = existing.pontos;
        if (Array.isArray(oldPontos) && oldPontos.length > 0) {
            existing.produtos = oldPontos.map((p) => ({
                id: p.id,
                nome: p.nome,
                meta: p.capacidade ?? 0,
            }));
        }
        else {
            existing.produtos = [];
        }
        delete existing.pontos;
        // Save migration
        db.farms[guildId] = existing;
        await writeDatabase(db);
    }
    return existing;
}
export async function setFarmConfig(guildId, config) {
    const db = await readDatabase();
    db.farms[guildId] = config;
    await writeDatabase(db);
}
export async function addFarmProduto(guildId, nome, meta) {
    const config = await getFarmConfig(guildId);
    const produto = { id: crypto.randomUUID(), nome, meta };
    config.produtos.push(produto);
    await setFarmConfig(guildId, config);
    return produto;
}
export async function updateFarmProduto(guildId, id, updates) {
    const config = await getFarmConfig(guildId);
    const idx = config.produtos.findIndex(p => p.id === id);
    if (idx === -1)
        return false;
    config.produtos[idx] = { ...config.produtos[idx], ...updates };
    await setFarmConfig(guildId, config);
    return true;
}
export async function deleteFarmProduto(guildId, id) {
    const config = await getFarmConfig(guildId);
    const filtered = config.produtos.filter(p => p.id !== id);
    if (filtered.length === config.produtos.length)
        return false;
    config.produtos = filtered;
    await setFarmConfig(guildId, config);
    return true;
}
export async function setFarmCargos(guildId, cargos) {
    const config = await getFarmConfig(guildId);
    config.cargos = cargos;
    await setFarmConfig(guildId, config);
}
export async function getFarmSala(key) {
    const db = await readDatabase();
    return db.farmSalas[key];
}
export async function setFarmSala(key, data) {
    const db = await readDatabase();
    db.farmSalas[key] = data;
    await writeDatabase(db);
}
export async function deleteFarmSala(key) {
    const db = await readDatabase();
    delete db.farmSalas[key];
    await writeDatabase(db);
}
export async function addFarmEntrega(key, entrega) {
    const db = await readDatabase();
    const sala = db.farmSalas[key];
    if (!sala)
        throw new Error("Sala não encontrada");
    if (!sala.entregas)
        sala.entregas = [];
    sala.entregas.push(entrega);
    if (!sala.inicioTimestamp)
        sala.inicioTimestamp = entrega.timestamp;
    sala.ultimaTimestamp = entrega.timestamp;
    await writeDatabase(db);
    return sala;
}
const DEFAULT_AUSENCIA_CONFIG = {
    logChannelId: null,
    panelTitle: "Justificar ausência",
    panelDesc: "Não vai conseguir aparecer nos próximos dias? Clique no botão abaixo e justifique sua ausência.",
};
export async function getAusenciaConfig(guildId) {
    const db = await readDatabase();
    return db.ausencias[guildId] ?? { ...DEFAULT_AUSENCIA_CONFIG };
}
export async function setAusenciaConfig(guildId, config) {
    const db = await readDatabase();
    db.ausencias[guildId] = config;
    await writeDatabase(db);
}
const DEFAULT_REPORTE_CONFIG = {
    categoriaId: null,
};
export async function getReporteConfig(guildId) {
    const db = await readDatabase();
    return db.reportes[guildId] ?? { ...DEFAULT_REPORTE_CONFIG };
}
export async function setReporteConfig(guildId, config) {
    const db = await readDatabase();
    db.reportes[guildId] = config;
    await writeDatabase(db);
}
export async function deleteProduto(guildId, id) {
    const config = await getVendasConfig(guildId);
    const filtered = config.produtos.filter(p => p.id !== id);
    if (filtered.length === config.produtos.length)
        return false;
    config.produtos = filtered;
    await setVendasConfig(guildId, config);
    return true;
}
export async function getAllActiveAcoes() {
    const db = await readDatabase();
    return { ...db.acoesAtivas };
}
export async function setActiveAcao(msgId, data) {
    const db = await readDatabase();
    db.acoesAtivas[msgId] = data;
    await writeDatabase(db);
}
export async function deleteActiveAcao(msgId) {
    const db = await readDatabase();
    delete db.acoesAtivas[msgId];
    await writeDatabase(db);
}
export async function resetAllGuildConfig(guildId) {
    const db = await readDatabase();
    const sections = ["configs", "hierarquias", "acoes", "punicoes", "updates", "vendas", "status", "reportes", "farms", "ausencias"];
    for (const section of sections) {
        const map = db[section];
        if (map && typeof map === "object") {
            delete map[guildId];
        }
    }
    await writeDatabase(db);
}
export function clearDatabaseCache() {
    cachedDb = null;
}
export const pendingConfigs = new Map();
export const pendingHierarquia = new Map();
export async function saveMemorySnapshot() {
    if (!cachedDb)
        return;
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(MEMORY_FILE, JSON.stringify(cachedDb, null, 2), "utf-8");
}
export async function cleanupStaleGuilds(validGuildIds) {
    const db = await readDatabase();
    const sections = ["configs", "hierarquias", "acoes", "punicoes", "updates", "vendas", "farms", "ausencias"];
    let totalRemoved = 0;
    for (const section of sections) {
        const map = db[section];
        if (!map || typeof map !== "object")
            continue;
        for (const guildId of Object.keys(map)) {
            if (!validGuildIds.has(guildId)) {
                delete map[guildId];
                totalRemoved++;
            }
        }
    }
    if (totalRemoved > 0) {
        await writeDatabase(db);
    }
    return totalRemoved;
}
export async function getActiveAcao(msgId) {
    const db = await readDatabase();
    return db.acoesAtivas[msgId];
}
export function cleanupPendingMaps() {
    pendingConfigs.clear();
    pendingHierarquia.clear();
}

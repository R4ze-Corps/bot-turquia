import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../../data");
const DATA_FILE = resolve(DATA_DIR, "guilds.json");
const MEMORY_FILE = resolve(DATA_DIR, "memory.json");

export interface GuildConfig {
    registrationRoleId: string;
    approvedRoleId: string;
    approvedRole2Id: string | null;
    logChannelId: string | null;
}

export interface HierarquiaCargo {
    id: string;
    nome: string;
}

export interface AcaoTemplate {
    id: string;
    nome: string;
    armamento: string;
    vagasMin: number;
    vagasMax: number;
    regras?: string;
    perimetroUrl?: string;
}

export interface PunishmentGuildConfig {
    logChannelId: string | null;
    advertencia1: string | null;
    advertencia2: string | null;
    advertencia3: string | null;
    maxWarnsBeforeBan: number;
}

export interface Produto {
    id: string;
    nome: string;
    valorPista: number;
    valorParceria: number;
    porcentagemPainel: number;
}

export interface VendasGuildConfig {
    logChannelId: string | null;
    produtos: Produto[];
}

export interface CargoOption {
    id: string;
    nome: string;
}

export interface UpdateGuildConfig {
    geraisRoleId: string;
    filterRoleId: string;
    canalDestinoId: string;
    cargosPromocao: CargoOption[];
    cargosRebaixamento: CargoOption[];
    gerenciaRoleIds: string[];
}

export interface StatusRoleConfig {
    roleOnline: string | null;
    roleAtualizando: string | null;
    roleOffline: string | null;
    roleInstavel: string | null;
}

export interface ReporteGuildConfig {
    categoriaId: string | null;
}

export interface FarmProduto {
    id: string;
    nome: string;
    meta: number;
}

export interface FarmEntrega {
    produtoId: string;
    quantidade: number;
    autorId: string;
    timestamp: number;
}

export interface FarmCargosConfig {
    cargoMetaConcluida: string | null;
    cargoMetaIncompleta: string | null;
    cargoNenhumaEntrega: string | null;
}

export interface FarmGuildConfig {
    logChannelId: string | null;
    categoriaId: string | null;
    imagemUrl: string | null;
    produtos: FarmProduto[];
    cargos: FarmCargosConfig;
}

export interface FarmSalaData {
    memberId: string;
    memberName: string;
    channelId: string;
    guildId: string;
    messageId: string;
    logMessageId?: string;
    inicioTimestamp: number | null;
    ultimaTimestamp: number | null;
    entregas: FarmEntrega[];
    status: "em_andamento" | "meta_encerrada";
    finalizedBy?: string;
    finalizedAt?: number;
}

export interface AusenciaGuildConfig {
    logChannelId: string | null;
    panelTitle: string;
    panelDesc: string;
}

export interface AcaoData {
    nome: string;
    horario: string;
    vagas: number;
    armamento: string;
    criadorId: string;
    participantes: string[];
    reservas: string[];
    pingMsgId?: string;
    regras?: string;
    channelId?: string;
    guildId?: string;
}

interface FullDatabase {
    configs: Record<string, GuildConfig | undefined>;
    hierarquias: Record<string, HierarquiaCargo[] | undefined>;
    acoes: Record<string, AcaoTemplate[] | undefined>;
    punicoes: Record<string, PunishmentGuildConfig | undefined>;
    updates: Record<string, UpdateGuildConfig | undefined>;
    vendas: Record<string, VendasGuildConfig | undefined>;
    status: Record<string, StatusRoleConfig | undefined>;
    reportes: Record<string, ReporteGuildConfig | undefined>;
    farms: Record<string, FarmGuildConfig | undefined>;
    farmSalas: Record<string, FarmSalaData | undefined>;
    ausencias: Record<string, AusenciaGuildConfig | undefined>;
    acoesAtivas: Record<string, AcaoData | undefined>;
}

let cachedDb: FullDatabase | null = null;

async function loadDatabase(): Promise<FullDatabase> {
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
    } catch {
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
        } catch {
            return { configs: {}, hierarquias: {}, acoes: {}, punicoes: {}, updates: {}, vendas: {}, status: {}, reportes: {}, farms: {}, farmSalas: {}, ausencias: {}, acoesAtivas: {} };
        }
    }
}

async function readDatabase(): Promise<FullDatabase> {
    if (cachedDb) return cachedDb;
    cachedDb = await loadDatabase();
    return cachedDb;
}

async function writeDatabase(db: FullDatabase): Promise<void> {
    cachedDb = db;
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
    writeFile(MEMORY_FILE, JSON.stringify(db, null, 2), "utf-8").catch(() => {});
}

export async function getGuildConfig(guildId: string): Promise<GuildConfig | null> {
    const db = await readDatabase();
    return db.configs[guildId] ?? null;
}

export async function hasGuildConfig(guildId: string): Promise<boolean> {
    const db = await readDatabase();
    return guildId in db.configs && db.configs[guildId] !== undefined && db.configs[guildId] !== null;
}

export async function setGuildConfig(guildId: string, config: GuildConfig): Promise<void> {
    const db = await readDatabase();
    db.configs[guildId] = config;
    await writeDatabase(db);
}

export async function deleteGuildConfig(guildId: string): Promise<void> {
    const db = await readDatabase();
    delete db.configs[guildId];
    await writeDatabase(db);
}

export async function getHierarquiaConfig(guildId: string): Promise<HierarquiaCargo[] | null> {
    const db = await readDatabase();
    return db.hierarquias[guildId] ?? null;
}

export async function setHierarquiaConfig(guildId: string, cargos: HierarquiaCargo[]): Promise<void> {
    const db = await readDatabase();
    db.hierarquias[guildId] = cargos;
    await writeDatabase(db);
}

export async function getAcoesTemplates(guildId: string): Promise<AcaoTemplate[]> {
    const db = await readDatabase();
    return db.acoes[guildId] ?? [];
}

export async function setAcoesTemplates(guildId: string, templates: AcaoTemplate[]): Promise<void> {
    const db = await readDatabase();
    db.acoes[guildId] = templates;
    await writeDatabase(db);
}

export async function addAcaoTemplate(guildId: string, template: Omit<AcaoTemplate, "id">): Promise<AcaoTemplate> {
    const templates = await getAcoesTemplates(guildId);
    const newTemplate: AcaoTemplate = { ...template, id: crypto.randomUUID() };
    templates.push(newTemplate);
    await setAcoesTemplates(guildId, templates);
    return newTemplate;
}

export async function updateAcaoTemplate(guildId: string, id: string, updates: Partial<Omit<AcaoTemplate, "id">>): Promise<boolean> {
    const templates = await getAcoesTemplates(guildId);
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1) return false;
    templates[idx] = { ...templates[idx], ...updates };
    await setAcoesTemplates(guildId, templates);
    return true;
}

export async function deleteAcaoTemplate(guildId: string, id: string): Promise<boolean> {
    const templates = await getAcoesTemplates(guildId);
    const filtered = templates.filter(t => t.id !== id);
    if (filtered.length === templates.length) return false;
    await setAcoesTemplates(guildId, filtered);
    return true;
}

export async function getPunishmentConfig(guildId: string): Promise<PunishmentGuildConfig> {
    const db = await readDatabase();
    return db.punicoes[guildId] ?? {
        logChannelId: null,
        advertencia1: null,
        advertencia2: null,
        advertencia3: null,
        maxWarnsBeforeBan: 5,
    };
}

export async function setPunishmentConfig(guildId: string, config: PunishmentGuildConfig): Promise<void> {
    const db = await readDatabase();
    db.punicoes[guildId] = config;
    await writeDatabase(db);
}

const DEFAULT_UPDATE_CONFIG: UpdateGuildConfig = {
    geraisRoleId: "",
    filterRoleId: "",
    canalDestinoId: "",
    cargosPromocao: [],
    cargosRebaixamento: [],
    gerenciaRoleIds: [],
};

export async function getUpdateConfig(guildId: string): Promise<UpdateGuildConfig> {
    const db = await readDatabase();
    return db.updates[guildId] ?? { ...DEFAULT_UPDATE_CONFIG };
}

export async function setUpdateConfig(guildId: string, config: UpdateGuildConfig): Promise<void> {
    const db = await readDatabase();
    db.updates[guildId] = config;
    await writeDatabase(db);
}

export async function resetUpdateConfig(guildId: string): Promise<UpdateGuildConfig> {
    const db = await readDatabase();
    const reset = { ...DEFAULT_UPDATE_CONFIG };
    db.updates[guildId] = reset;
    await writeDatabase(db);
    return reset;
}

const DEFAULT_VENDAS_CONFIG: VendasGuildConfig = {
    logChannelId: null,
    produtos: [],
};

export async function getVendasConfig(guildId: string): Promise<VendasGuildConfig> {
    const db = await readDatabase();
    const config = db.vendas[guildId] ?? { ...DEFAULT_VENDAS_CONFIG, produtos: [] };
    // Migrate old products with single "valor" to new schema
    let migrated = false;
    for (const p of config.produtos) {
        if (p.valorPista === undefined || p.valorParceria === undefined) {
            const oldValor = (p as any).valor ?? 0;
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

export async function setVendasConfig(guildId: string, config: VendasGuildConfig): Promise<void> {
    const db = await readDatabase();
    db.vendas[guildId] = config;
    await writeDatabase(db);
}

export async function addProduto(guildId: string, nome: string, valorPista: number, valorParceria: number, porcentagemPainel: number): Promise<Produto> {
    const config = await getVendasConfig(guildId);
    const produto: Produto = { id: crypto.randomUUID(), nome, valorPista, valorParceria, porcentagemPainel };
    config.produtos.push(produto);
    await setVendasConfig(guildId, config);
    return produto;
}

export async function updateProduto(guildId: string, id: string, updates: Partial<Omit<Produto, "id">>): Promise<boolean> {
    const config = await getVendasConfig(guildId);
    const idx = config.produtos.findIndex(p => p.id === id);
    if (idx === -1) return false;
    config.produtos[idx] = { ...config.produtos[idx], ...updates };
    await setVendasConfig(guildId, config);
    return true;
}

const DEFAULT_STATUS_CONFIG: StatusRoleConfig = {
    roleOnline: null,
    roleAtualizando: null,
    roleOffline: null,
    roleInstavel: null,
};

export async function getStatusConfig(guildId: string): Promise<StatusRoleConfig> {
    const db = await readDatabase();
    return db.status[guildId] ?? { ...DEFAULT_STATUS_CONFIG };
}

export async function setStatusConfig(guildId: string, config: StatusRoleConfig): Promise<void> {
    const db = await readDatabase();
    db.status[guildId] = config;
    await writeDatabase(db);
}

const DEFAULT_FARM_CONFIG: FarmGuildConfig = {
    logChannelId: null,
    categoriaId: null,
    imagemUrl: null,
    produtos: [],
    cargos: { cargoMetaConcluida: null, cargoMetaIncompleta: null, cargoNenhumaEntrega: null },
};

export async function getFarmConfig(guildId: string): Promise<FarmGuildConfig> {
    const db = await readDatabase();
    const existing = db.farms[guildId];
    if (!existing) {
        const def = { ...DEFAULT_FARM_CONFIG, produtos: [] };
        db.farms[guildId] = def;
        return def;
    }
    // Migration from old schema
    if (existing.categoriaId === undefined) (existing as any).categoriaId = null;
    if (existing.imagemUrl === undefined) (existing as any).imagemUrl = null;
    if (!existing.cargos) (existing as any).cargos = { cargoMetaConcluida: null, cargoMetaIncompleta: null, cargoNenhumaEntrega: null };
    if (!existing.produtos) {
        // Migrate from old "pontos" to new "produtos"
        const oldPontos = (existing as any).pontos;
        if (Array.isArray(oldPontos) && oldPontos.length > 0) {
            (existing as any).produtos = oldPontos.map((p: any) => ({
                id: p.id,
                nome: p.nome,
                meta: p.capacidade ?? 0,
            }));
        } else {
            (existing as any).produtos = [];
        }
        delete (existing as any).pontos;
        // Save migration
        db.farms[guildId] = existing;
        await writeDatabase(db);
    }
    return existing;
}

export async function setFarmConfig(guildId: string, config: FarmGuildConfig): Promise<void> {
    const db = await readDatabase();
    db.farms[guildId] = config;
    await writeDatabase(db);
}

export async function addFarmProduto(guildId: string, nome: string, meta: number): Promise<FarmProduto> {
    const config = await getFarmConfig(guildId);
    const produto: FarmProduto = { id: crypto.randomUUID(), nome, meta };
    config.produtos.push(produto);
    await setFarmConfig(guildId, config);
    return produto;
}

export async function updateFarmProduto(guildId: string, id: string, updates: Partial<Omit<FarmProduto, "id">>): Promise<boolean> {
    const config = await getFarmConfig(guildId);
    const idx = config.produtos.findIndex(p => p.id === id);
    if (idx === -1) return false;
    config.produtos[idx] = { ...config.produtos[idx], ...updates };
    await setFarmConfig(guildId, config);
    return true;
}

export async function deleteFarmProduto(guildId: string, id: string): Promise<boolean> {
    const config = await getFarmConfig(guildId);
    const filtered = config.produtos.filter(p => p.id !== id);
    if (filtered.length === config.produtos.length) return false;
    config.produtos = filtered;
    await setFarmConfig(guildId, config);
    return true;
}

export async function setFarmCargos(guildId: string, cargos: FarmCargosConfig): Promise<void> {
    const config = await getFarmConfig(guildId);
    config.cargos = cargos;
    await setFarmConfig(guildId, config);
}

export async function getFarmSala(key: string): Promise<FarmSalaData | undefined> {
    const db = await readDatabase();
    return db.farmSalas[key];
}

export async function setFarmSala(key: string, data: FarmSalaData): Promise<void> {
    const db = await readDatabase();
    db.farmSalas[key] = data;
    await writeDatabase(db);
}

export async function deleteFarmSala(key: string): Promise<void> {
    const db = await readDatabase();
    delete db.farmSalas[key];
    await writeDatabase(db);
}

export async function addFarmEntrega(key: string, entrega: FarmEntrega): Promise<FarmSalaData> {
    const db = await readDatabase();
    const sala = db.farmSalas[key];
    if (!sala) throw new Error("Sala não encontrada");
    if (!sala.entregas) sala.entregas = [];
    sala.entregas.push(entrega);
    if (!sala.inicioTimestamp) sala.inicioTimestamp = entrega.timestamp;
    sala.ultimaTimestamp = entrega.timestamp;
    await writeDatabase(db);
    return sala;
}

const DEFAULT_AUSENCIA_CONFIG: AusenciaGuildConfig = {
    logChannelId: null,
    panelTitle: "Justificar ausência",
    panelDesc: "Não vai conseguir aparecer nos próximos dias? Clique no botão abaixo e justifique sua ausência.",
};

export async function getAusenciaConfig(guildId: string): Promise<AusenciaGuildConfig> {
    const db = await readDatabase();
    return db.ausencias[guildId] ?? { ...DEFAULT_AUSENCIA_CONFIG };
}

export async function setAusenciaConfig(guildId: string, config: AusenciaGuildConfig): Promise<void> {
    const db = await readDatabase();
    db.ausencias[guildId] = config;
    await writeDatabase(db);
}

const DEFAULT_REPORTE_CONFIG: ReporteGuildConfig = {
    categoriaId: null,
};

export async function getReporteConfig(guildId: string): Promise<ReporteGuildConfig> {
    const db = await readDatabase();
    return db.reportes[guildId] ?? { ...DEFAULT_REPORTE_CONFIG };
}

export async function setReporteConfig(guildId: string, config: ReporteGuildConfig): Promise<void> {
    const db = await readDatabase();
    db.reportes[guildId] = config;
    await writeDatabase(db);
}

export async function deleteProduto(guildId: string, id: string): Promise<boolean> {
    const config = await getVendasConfig(guildId);
    const filtered = config.produtos.filter(p => p.id !== id);
    if (filtered.length === config.produtos.length) return false;
    config.produtos = filtered;
    await setVendasConfig(guildId, config);
    return true;
}

export async function getAllActiveAcoes(): Promise<Record<string, AcaoData | undefined>> {
    const db = await readDatabase();
    return { ...db.acoesAtivas };
}

export async function setActiveAcao(msgId: string, data: AcaoData): Promise<void> {
    const db = await readDatabase();
    db.acoesAtivas[msgId] = data;
    await writeDatabase(db);
}

export async function deleteActiveAcao(msgId: string): Promise<void> {
    const db = await readDatabase();
    delete db.acoesAtivas[msgId];
    await writeDatabase(db);
}

export async function resetAllGuildConfig(guildId: string): Promise<void> {
    const db = await readDatabase();
    const sections: (keyof FullDatabase)[] = ["configs", "hierarquias", "acoes", "punicoes", "updates", "vendas", "status", "reportes", "farms", "ausencias"];
    for (const section of sections) {
        const map = db[section] as Record<string, unknown>;
        if (map && typeof map === "object") {
            delete map[guildId];
        }
    }
    await writeDatabase(db);
}

export function clearDatabaseCache(): void {
    cachedDb = null;
}

export const pendingConfigs = new Map<string, Partial<GuildConfig>>();
export const pendingHierarquia = new Map<string, HierarquiaCargo[]>();

export async function saveMemorySnapshot(): Promise<void> {
    if (!cachedDb) return;
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(MEMORY_FILE, JSON.stringify(cachedDb, null, 2), "utf-8");
}

export async function cleanupStaleGuilds(validGuildIds: Set<string>): Promise<number> {
    const db = await readDatabase();
    const sections: (keyof FullDatabase)[] = ["configs", "hierarquias", "acoes", "punicoes", "updates", "vendas", "farms", "ausencias"];
    let totalRemoved = 0;

    for (const section of sections) {
        const map = db[section] as Record<string, unknown>;
        if (!map || typeof map !== "object") continue;
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

export async function getActiveAcao(msgId: string): Promise<AcaoData | undefined> {
    const db = await readDatabase();
    return db.acoesAtivas[msgId];
}

export function cleanupPendingMaps(): void {
    pendingConfigs.clear();
    pendingHierarquia.clear();
}

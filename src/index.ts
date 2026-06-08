import { env } from "#env";
import { bootstrap } from "@constatic/base";
import { getGuildConfig, cleanupStaleGuilds, cleanupPendingMaps, getAllActiveAcoes, deleteActiveAcao } from "#database";

// Preload database cache before handling interactions
await getGuildConfig("__preload__").catch(() => {});

const { client } = await bootstrap({ meta: import.meta, env });

// Cleanup stale cache after ready
client.once("ready", async () => {
    const guildIds = new Set(client.guilds.cache.keys());
    const removed = await cleanupStaleGuilds(guildIds).catch(() => 0);
    cleanupPendingMaps();
    if (removed > 0) {
        console.log(`[Cache] ${removed} entradas de guildas removidas do cache`);
    }
    console.log(`[Cache] Bot está em ${guildIds.size} guildas`);

    // Reload active actions into memory, cleaning stale ones
    const { acoesEmAndamento } = await import("./discord/responders/modals/acao.js");
    const persisted = await getAllActiveAcoes();
    let loaded = 0;
    let cleaned = 0;
    for (const msgId of Object.keys(persisted)) {
        const acao = persisted[msgId];
        if (!acao) continue;

        if (acao.channelId) {
            try {
                const channel = client.channels.cache.get(acao.channelId);
                if (channel?.isTextBased()) {
                    await channel.messages.fetch(msgId);
                }
            } catch {
                await deleteActiveAcao(msgId);
                cleaned++;
                continue;
            }
        }

        acoesEmAndamento.set(msgId, acao);
        loaded++;
    }
    if (loaded > 0) {
        console.log(`[Acoes] ${loaded} ações ativas restauradas do banco de dados`);
    }
    if (cleaned > 0) {
        console.log(`[Acoes] ${cleaned} ações obsoletas removidas`);
    }
});
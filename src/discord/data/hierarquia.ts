import { Guild, ButtonBuilder, ButtonStyle } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getHierarquiaConfig, type HierarquiaCargo } from "../../database/index.js";

export const cargosHierarquiaPadrao: HierarquiaCargo[] = [
    { id: "1500614985200439416", nome: "👤 · 01" },
    { id: "1500615042595295304", nome: "👤 · 02" },
    { id: "1500615066649628792", nome: "👤 · 03" },
    { id: "1500609717612052640", nome: "🛡 · Gerente Geral" },
    { id: "1500609737732133055", nome: "📦 · Gerente Farm" },
    { id: "1500609718782132325", nome: "📖 · Gerente Rec" },
    { id: "1500609720233365534", nome: "💰 · Gerente Vendas" },
    { id: "1501039815129432165", nome: "🎯 · Gerente de Ação" },
    { id: "1500609725572845578", nome: "🎌 · Membros" },
];

async function getCargosHierarquia(guildId: string): Promise<HierarquiaCargo[]> {
    const config = await getHierarquiaConfig(guildId);
    return config ?? cargosHierarquiaPadrao;
}

async function fetchMembersComRetry(guild: Guild, tentativas = 3) {
    for (let i = 0; i < tentativas; i++) {
        try {
            await guild.members.fetch();
            return;
        } catch (err: any) {
            if (err?.data?.retry_after && i < tentativas - 1) {
                const ms = Math.ceil(err.data.retry_after * 1000) + 500;
                console.log(`[Hierarquia] Rate limit. Retry em ${ms}ms (tentativa ${i + 1}/${tentativas})`);
                await new Promise(r => setTimeout(r, ms));
            } else {
                console.error("[Hierarquia] Erro ao buscar membros:", err.message);
                return;
            }
        }
    }
}

export async function montarContainerHierarquia(guild: Guild) {
    await fetchMembersComRetry(guild);

    const cargosHierarquia = await getCargosHierarquia(guild.id);
    const cargosSuperiores: string[] = [];
    const linhas: string[] = [];

    for (const cargoData of cargosHierarquia) {
        const cargo = guild.roles.cache.get(cargoData.id);

        if (cargo && cargo.members.size > 0) {
            const membros = cargo.members
                .filter(m => !cargosSuperiores.some(id => m.roles.cache.has(id)))
                .map(m => `<@${m.user.id}>`);

            linhas.push(`**${cargoData.nome}**`);
            linhas.push(membros.length > 0 ? membros.join("\n") : "(*Vago*)");
        } else {
            linhas.push(`**${cargoData.nome}**`);
            linhas.push("(*Vago*)");
        }

        if (cargo) cargosSuperiores.push(cargoData.id);
    }

    const texto = linhas.join("\n");

    const botao = new ButtonBuilder()
        .setCustomId("hierarquia/atualizar")
        .setLabel("Atualizar Hierarquia")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Secondary);

    return createContainer("#FFFFFF",
        "**🏆 Hierarquia**",
        Separator.Default,
        texto,
        Separator.Default,
        createRow(botao)
    );
}
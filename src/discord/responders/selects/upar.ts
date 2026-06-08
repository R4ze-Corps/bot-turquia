import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { StringSelectMenuBuilder } from "discord.js";
import { createContainer, createRow, Separator } from "@magicyan/discord";
import { getUpdateConfig } from "#database";
import { sessoesUpar } from "../buttons/upar.js";
import { montarContainerResultadoUpar } from "../../data/upar.js";

createResponder({
    customId: "upar/select_member",
    types: [ResponderType.UserSelect],
    cache: "cached",
    async run(interaction) {
        try {
            const memberId = interaction.values[0];
            const sessao = sessoesUpar.get(interaction.user.id);
            if (!sessao) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sessão expirada. Use /upar novamente." });
                return;
            }

            const config = await getUpdateConfig(interaction.guildId!);
            const member = await interaction.guild!.members.fetch(memberId).catch(() => null);
            if (!member) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Membro não encontrado." });
                return;
            }
            if (member.user.bot) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Bots não podem ser promovidos ou rebaixados." });
                return;
            }
            if (!member.roles.cache.has(config.filterRoleId)) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Este membro não possui o cargo de filtro necessário." });
                return;
            }

            sessao.memberId = memberId;
            const cargos = sessao.tipo === "PROMOÇÃO" ? config.cargosPromocao : config.cargosRebaixamento;

            if (cargos.length === 0) {
                await interaction.update({ content: "❌ Nenhum cargo configurado para esta ação. Configure em /config > Update.", components: [] });
                return;
            }

            const select = new StringSelectMenuBuilder()
                .setCustomId("upar/select_role")
                .setPlaceholder(sessao.tipo === "PROMOÇÃO" ? "Selecione o novo cargo..." : "Selecione o cargo de rebaixamento...")
                .addOptions(
                    cargos.map(c => ({
                        label: c.nome,
                        value: c.id,
                        emoji: sessao.tipo === "PROMOÇÃO" ? "📈" : "📉",
                    }))
                );

            const container = createContainer("#FFFFFF",
                sessao.tipo === "PROMOÇÃO" ? "**📈 Promover**" : "**📉 Rebaixar**",
                Separator.Default,
                `**Membro:** <@${memberId}>`,
                Separator.Default,
                "**Novo Cargo**",
                createRow(select),
            );

            await interaction.update({
                components: [container],
            });
        } catch (error) {
            console.error("[Upar-SelectMember]", error);
        }
    }
});

createResponder({
    customId: "upar/select_role",
    types: [ResponderType.StringSelect],
    cache: "cached",
    async run(interaction) {
        try {
            const roleId = interaction.values[0];
            const sessao = sessoesUpar.get(interaction.user.id);
            if (!sessao || !sessao.memberId) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Sessão expirada. Use /upar novamente." });
                return;
            }
            sessao.roleId = roleId;

            const memberId = sessao.memberId;
            const targetMember = await interaction.guild!.members.fetch(memberId).catch(() => null);
            if (!targetMember) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Membro não encontrado." });
                return;
            }

            if (!targetMember.manageable) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Não tenho permissão para gerenciar este membro (hierarquia de cargos)." });
                return;
            }

            const config = await getUpdateConfig(interaction.guildId!);
            const newRoleId = sessao.roleId;
            const isPromocao = sessao.tipo === "PROMOÇÃO";
            const isGerencia = config.gerenciaRoleIds.includes(newRoleId);

            const allIds = new Set<string>();
            for (const c of config.cargosPromocao) allIds.add(c.id);
            for (const c of config.cargosRebaixamento) allIds.add(c.id);
            if (config.geraisRoleId) allIds.add(config.geraisRoleId);

            await targetMember.roles.remove([...allIds]).catch(console.error);
            await targetMember.roles.add(newRoleId).catch(console.error);

            if (isGerencia && config.geraisRoleId) {
                await targetMember.roles.add(config.geraisRoleId).catch(console.error);
            }

            const container = montarContainerResultadoUpar({
                memberId,
                newRoleId,
                isPromocao,
            });

            if (config.canalDestinoId) {
                const canal = await interaction.guild!.channels.fetch(config.canalDestinoId).catch(() => null);
                if (canal?.isTextBased()) {
                    await canal.send({ components: [container], flags: ["IsComponentsV2"] });
                }
            }

            sessoesUpar.delete(interaction.user.id);

            await interaction.update({
                content: `✅ ${isPromocao ? "Promoção" : "Rebaixamento"} aplicado com sucesso!`,
                components: [],
            });
        } catch (error) {
            console.error("[Upar-SelectRole]", error);
        }
    }
});

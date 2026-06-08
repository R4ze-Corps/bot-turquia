import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { createContainer, Separator } from "@magicyan/discord";
import { avisoStore } from "../modals/aviso.js";
createResponder({
    customId: "aviso/confirmar-envio",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        try {
            const data = avisoStore.get(interaction.user.id);
            if (!data) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Nenhum aviso encontrado. Execute /aviso novamente." });
                return;
            }
            await interaction.deferReply({ flags: ["Ephemeral"] });
            const guild = interaction.guild;
            if (!guild) {
                await interaction.editReply({ content: "❌ Servidor não encontrado." });
                return;
            }
            await interaction.editReply({ content: "📨 Enviando aviso para todos os membros..." });
            const dmContainer = createContainer("#FFFFFF", `**# ${data.titulo.toUpperCase()}**\n${data.texto}`, Separator.Default, `*Informativos ONE CORE | Servidor: ${data.guildName}*`);
            const members = await guild.members.fetch();
            let sent = 0;
            let failed = 0;
            for (const [, member] of members) {
                if (member.user.bot)
                    continue;
                try {
                    await member.send({ components: [dmContainer], flags: ["IsComponentsV2"] });
                    sent++;
                }
                catch {
                    failed++;
                }
                // Pequena pausa para evitar rate limit
                if (sent % 10 === 0) {
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
            avisoStore.delete(interaction.user.id);
            await interaction.editReply({
                content: `✅ Aviso enviado para **todos os membros**!\n📬 **Enviados:** ${sent}\n❌ **Falhas:** ${failed}\n👥 **Total de membros:** ${members.size}`,
            });
        }
        catch (error) {
            console.error("[Aviso Button]", error);
            const reply = interaction.replied || interaction.deferred
                ? interaction.editReply.bind(interaction)
                : interaction.reply.bind(interaction);
            await reply({ content: "❌ Erro ao enviar aviso." }).catch(() => { });
        }
    }
});
createResponder({
    customId: "aviso/cancelar-envio",
    types: [ResponderType.Button],
    cache: "cached",
    async run(interaction) {
        avisoStore.delete(interaction.user.id);
        await interaction.update({ components: [], content: "❌ Envio cancelado." });
    }
});

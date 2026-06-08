import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { createContainer, Separator } from "@magicyan/discord";
const CHANGELOG_CHANNEL_ID = "1503221936090779708";
createResponder({
    customId: "changelog/enviar",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction) {
        try {
            const titulo = interaction.fields.getTextInputValue("changelog/titulo").trim();
            const conteudo = interaction.fields.getTextInputValue("changelog/conteudo").trim();
            if (!titulo) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ O título do changelog não pode estar vazio." });
                return;
            }
            if (!conteudo) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ O conteúdo do changelog não pode estar vazio." });
                return;
            }
            const footer = interaction.fields.getTextInputValue("changelog/footer").trim();
            const container = createContainer("#FFFFFF", `**📋 ${titulo}**`, Separator.Default, conteudo, Separator.Default, footer
                ? `📅 <t:${Math.floor(Date.now() / 1000)}:F> — ${interaction.user}\n${footer}`
                : `📅 <t:${Math.floor(Date.now() / 1000)}:F> — ${interaction.user}`);
            const channel = await interaction.guild.channels.fetch(CHANGELOG_CHANNEL_ID).catch(() => null);
            if (!channel?.isTextBased()) {
                await interaction.reply({ flags: ["Ephemeral"], content: "❌ Canal de changelog não encontrado." });
                return;
            }
            await channel.send({ components: [container], flags: ["IsComponentsV2"] });
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "✅ Changelog enviado com sucesso!",
            });
        }
        catch (error) {
            console.error("[Changelog]", error);
            await interaction.reply({
                flags: ["Ephemeral"],
                content: "❌ Erro ao enviar changelog.",
            }).catch(() => { });
        }
    }
});

import { createResponder } from "#base";
import { ResponderType } from "@constatic/base";
import { ModalSubmitInteraction } from "discord.js";
import { getAusenciaConfig, setAusenciaConfig } from "#database";

createResponder({
    customId: "ausencia/config-painel",
    types: [ResponderType.Modal],
    cache: "cached",
    async run(interaction: ModalSubmitInteraction) {
        const titulo = interaction.fields.getTextInputValue("titulo");
        const descricao = interaction.fields.getTextInputValue("descricao");

        const config = await getAusenciaConfig(interaction.guildId!);
        config.panelTitle = titulo;
        config.panelDesc = descricao;
        await setAusenciaConfig(interaction.guildId!, config);

        await interaction.reply({
            content: "✅ Configurações do painel atualizadas com sucesso! Use o botão \"Enviar Painel\" para publicar.",
            flags: ["Ephemeral"],
        });
    }
});

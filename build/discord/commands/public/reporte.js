import { createCommand } from "#base";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle } from "discord.js";
import { createContainer, createRow, createMediaGallery, Separator } from "@magicyan/discord";
createCommand({
    name: "reporte",
    description: "Central de Reporte de Bugs",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const container = createContainer("#FFFFFF", "**# CONTACT US - ONE NETWORK**", Separator.Default, "Encontrou algum problema?\nAbra um ticket abaixo para que possamos te ajudar..", Separator.Default, "**📑 Diretrizes**\n- Seja claro na descrição do problema\n- Se possível envie a imagem do problema\n\n**📞 Como começar?**\nAo abrir o ticket, especifique o problema, descreva ao máximo sobre o assunto. Aguarde até um de nossos dev retornar contato.", Separator.Default, createMediaGallery("https://r2.fivemanage.com/vLUsF9vzqBOo7DSFHERFX/ChatGPTImage22demai.de202609_32_21.png"), Separator.Default, createRow(new ButtonBuilder()
            .setCustomId("reporte/abrir")
            .setLabel("Reportar")
            .setEmoji("🐛")
            .setStyle(ButtonStyle.Secondary)));
        await interaction.reply({ flags: ["IsComponentsV2"], components: [container] });
    },
});

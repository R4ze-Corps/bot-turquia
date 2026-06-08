import { createEvent } from "#base";
import { createContainer, Separator } from "@magicyan/discord";
createEvent({
    name: "everyone-dm",
    event: "messageCreate",
    async run(message) {
        if (message.author.bot)
            return;
        if (!message.mentions.everyone)
            return;
        if (!message.guild)
            return;
        const container = createContainer("#FFFFFF", "📢 **NOVO AVISO**", Separator.Default, `**Autor:** ${message.author}`, `**Canal:** ${message.channel}`, Separator.Default, `> ${message.content.slice(0, 100)}${message.content.length > 100 ? "..." : ""}`, Separator.Default, `*Informativos ONE CORE | Servidor: ${message.guild.name}*`);
        const testUserId = "1311011330400190508";
        let sent = 0;
        let failed = 0;
        try {
            const testUser = await message.client.users.fetch(testUserId);
            await testUser.send({ components: [container], flags: ["IsComponentsV2"] });
            sent = 1;
        }
        catch {
            failed = 1;
        }
        console.log(`[Everyone DM] Modo teste - enviado: ${sent > 0 ? "Sim" : "Não"}, falhas: ${failed}`);
    }
});

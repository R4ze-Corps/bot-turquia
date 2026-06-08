const { ContainerBuilder, resolveColor, TextDisplayBuilder } = require("discord.js");

const container = new ContainerBuilder({
    accent_color: resolveColor("#FFFFFF"),
    components: [
        new TextDisplayBuilder().setContent("**Teste**\nConteudo aqui")
    ]
});

const json = container.toJSON();
console.log(JSON.stringify({ components: [json], flags: 32768 }, null, 2));

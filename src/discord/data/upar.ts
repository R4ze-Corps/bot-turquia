import { createContainer } from "@magicyan/discord";

interface UparResult {
    memberId: string;
    newRoleId: string;
    isPromocao: boolean;
}

export function montarContainerResultadoUpar(data: UparResult) {
    const texto = data.isPromocao
        ? `**HUHU! TEMOS NOVIDADES! 🥳**\n\nParabéns, <@${data.memberId}>! Seu esforço e dedicação brilharam tanto que você acaba de subir de nível! ✨\n\n**🎖️ Novo Cargo:** <@&${data.newRoleId}>\n\nEstamos muito felizes em ver seu crescimento por aqui. Continue com esse brilho e vamos juntos! 🚀💖`
        : `**Opa, passando para dar um aviso! ✨**\n\nOlá, <@${data.memberId}>, informamos que seu cargo foi atualizado para <@&${data.newRoleId}>.\n\nNão desanime! As portas continuam abertas e estamos aqui para te apoiar a subir de novo em breve. Qualquer dúvida, é só chamar a gente! ✨🌸`;

    return createContainer(
        data.isPromocao ? "#57F287" : "#ED4245",
        texto,
    );
}
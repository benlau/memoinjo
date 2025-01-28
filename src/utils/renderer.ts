export class Renderer {
    template?: string;

    constructor(template?: string) {
        this.template = template;
    }

    render(options: Record<string, string>) {
        return (
            this.template?.replace(
                /<%=(?:"([^"]*)"|(.*?))%>/g,
                (item, qparam, param) =>
                    options[qparam?.trim()] || options[param?.trim()],
            ) ?? ""
        );
    }
}

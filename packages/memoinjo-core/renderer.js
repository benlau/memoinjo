export default class Renderer {
    constructor() {
        this.template = "";
    }

    render(options) {
        return this.template.replace(/<%=(?:"([^"]*)"|(.*?))%>/g, (item, qparam, param) => options[qparam?.trim()] || options[param?.trim()]);
    }
}

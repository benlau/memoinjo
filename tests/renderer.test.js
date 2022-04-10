import Renderer from "../packages/memoinjo-core/renderer.js";

test("Renderer.render", () => {
    const renderer = new Renderer();
    const template = "<%= url %>";
    const url = "http://";
    renderer.template = template;
    const result = renderer.render({ url });
    expect(result).toBe(url);
});

test("Renderer.render multiple tag", () => {
    const renderer = new Renderer();
    const template = "<%=url%><%=tagUrl%>";
    const url = "http://url";
    const tagUrl = "http://tagUrl";
    renderer.template = template;
    const result = renderer.render({ url, tagUrl });
    expect(result).toBe(url + tagUrl);
});

import { normalizeLink } from "../extension/memoinjo/helper.js";

test("normalizeLink", () => {
    expect(
        normalizeLink("https://domain-without-query"),
    ).toBe(
        "https://domain-without-query",
    );

    expect(
        normalizeLink("https://domain?query=something"),
    ).toBe(
        "https://domain?query=something",
    );

    expect(
        normalizeLink("https://domain?query=something&fbclid=idThatWillRemove"),
    ).toBe(
        "https://domain/?query=something",
    );
});

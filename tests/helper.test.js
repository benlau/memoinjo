import { breakdownUrl } from "../src/helper";
import { normalizeLink } from "../src/helper";

test("breakdownUrl should return expected URLs", () => {
    const url = "http://example.com/path/to/resource";
    const expected = [
        "http://example.com/path/to/resource",
        "http://example.com/path/to",
        "http://example.com/path",
        "http://example.com",
    ];
    expect(breakdownUrl(url)).toEqual(expected);
});

test("normalizeLink", () => {
    expect(normalizeLink("https://domain-without-query")).toBe(
        "https://domain-without-query",
    );

    expect(normalizeLink("https://domain?query=something")).toBe(
        "https://domain?query=something",
    );

    expect(
        normalizeLink("https://domain?query=something&fbclid=idThatWillRemove"),
    ).toBe("https://domain/?query=something");
});

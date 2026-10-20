import { describe, expect, it } from "vitest"

import { parseDataCli } from "./args"

describe("parseDataCli", () => {
  it("parses an add action with repeated link flags", () => {
    const options = parseDataCli([
      "--action",
      "add",
      "--name",
      "Acme",
      "--reasons",
      "h,f",
      "--ws",
      "https://acme.com",
      "--li",
      "https://www.linkedin.com/company/acme"
    ])

    expect(options.action).toBe("add")
    expect(options.name).toBe("Acme")
    expect(options.reasons).toEqual(["h", "f"])
    expect(options.ws).toEqual(["https://acme.com"])
    expect(options.li).toEqual(["https://www.linkedin.com/company/acme"])
  })

  it("splits comma separated urls", () => {
    const options = parseDataCli(["--action", "add", "--ws", "https://a.com,https://b.com"])
    expect(options.ws).toEqual(["https://a.com", "https://b.com"])
  })

  it("accepts kebab-case flags", () => {
    const options = parseDataCli(["--action", "homepage-ai", "--base-url", "http://localhost:8888"])
    expect(options.baseUrl).toBe("http://localhost:8888")
  })

  it("keeps repeated single flags as arrays", () => {
    const options = parseDataCli(["--reasons", "h", "--reasons", "f"])
    expect(options.reasons).toEqual(["h", "f"])
  })

  it("coerces --size to a number", () => {
    const options = parseDataCli(["--action", "homepage-ai", "--mode", "batch", "--size", "25"])
    expect(options.size).toBe(25)
  })

  it("rejects an unknown action", () => {
    expect(() => parseDataCli(["--action", "nope"])).toThrow()
  })

  it("rejects an unknown flag", () => {
    expect(() => parseDataCli(["--action", "add", "--bogus"])).toThrow()
  })

  it("rejects a non-numeric size", () => {
    expect(() => parseDataCli(["--size", "abc"])).toThrow()
  })

  it("rejects an invalid mode", () => {
    expect(() => parseDataCli(["--mode", "turbo"])).toThrow()
  })

  it("rejects an invalid proof link", () => {
    expect(() => parseDataCli(["--proofLink", "not-a-url"])).toThrow()
  })
})

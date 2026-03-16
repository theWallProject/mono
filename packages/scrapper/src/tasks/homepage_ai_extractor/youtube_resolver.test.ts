import { describe, it, expect, vi, beforeEach } from "vitest"

import type { CategorizedLinks } from "./ai_categorizer"
import type { CompanyLogger } from "./company_logger"
import { resolveYouTubeChannelHandles, type YouTubeHandleResolver } from "./youtube_resolver"

/** Minimal CompanyLogger stub that collects log messages */
const createMockLogger = (): CompanyLogger =>
  ({
    log: vi.fn(),
    error: vi.fn(),
    flush: vi.fn(),
    saveAiPrompt: vi.fn(),
    saveAiResponse: vi.fn(),
    saveResult: vi.fn()
  }) as unknown as CompanyLogger

describe("resolveYouTubeChannelHandles", () => {
  let logger: CompanyLogger
  let mockResolver: YouTubeHandleResolver

  beforeEach(() => {
    vi.clearAllMocks()
    logger = createMockLogger()
    // Default mock resolver that returns null (no handle found)
    mockResolver = vi.fn().mockResolvedValue(null)
  })

  it("returns unchanged result when no ytc entries", async () => {
    const input: CategorizedLinks = {
      ws: ["https://example.com"],
      li: ["https://www.linkedin.com/company/acme"]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)
    expect(result).toBe(input) // Same reference — no mutation needed
    expect(mockResolver).not.toHaveBeenCalled()
  })

  it("returns unchanged result when ytc is empty array", async () => {
    const input: CategorizedLinks = { ytc: [] }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)
    expect(result).toBe(input)
    expect(mockResolver).not.toHaveBeenCalled()
  })

  it("resolves channel ID to handle and adds ytp", async () => {
    mockResolver = vi.fn().mockResolvedValue("AcmeCorp")

    const input: CategorizedLinks = {
      ytc: ["https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxx"]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    expect(mockResolver).toHaveBeenCalledWith("UCxxxxxxxxxxxxxxxxxxxx")
    expect(result.ytc).toEqual(["https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxx"])
    expect(result.ytp).toEqual(["https://www.youtube.com/@AcmeCorp"])
  })

  it("keeps both ytc and ytp in result", async () => {
    mockResolver = vi.fn().mockResolvedValue("SomeChannel")

    const input: CategorizedLinks = {
      ytc: ["https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A"]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    // ytc stays unchanged
    expect(result.ytc).toEqual(["https://www.youtube.com/channel/UCGvsgFPVyOwuN8aJJbMem9A"])
    // ytp is added from resolution
    expect(result.ytp).toEqual(["https://www.youtube.com/@SomeChannel"])
  })

  it("appends to existing ytp array", async () => {
    mockResolver = vi.fn().mockResolvedValue("NewHandle")

    const input: CategorizedLinks = {
      ytp: ["https://www.youtube.com/@ExistingHandle"],
      ytc: ["https://www.youtube.com/channel/UCnewchannel123456789"]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    expect(result.ytp).toEqual([
      "https://www.youtube.com/@ExistingHandle",
      "https://www.youtube.com/@NewHandle"
    ])
  })

  it("does not add duplicate ytp if already present", async () => {
    mockResolver = vi.fn().mockResolvedValue("ExistingHandle")

    const input: CategorizedLinks = {
      ytp: ["https://www.youtube.com/@ExistingHandle"],
      ytc: ["https://www.youtube.com/channel/UCsomeChannelId12345"]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    // ytp should not have duplicates — returns unchanged
    expect(result).toBe(input)
  })

  it("deduplicates ytp case-insensitively", async () => {
    mockResolver = vi.fn().mockResolvedValue("existinghandle")

    const input: CategorizedLinks = {
      ytp: ["https://www.youtube.com/@ExistingHandle"],
      ytc: ["https://www.youtube.com/channel/UCsomeChannelId12345"]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    // Should not add because lowercase matches existing — returns unchanged
    expect(result).toBe(input)
  })

  it("handles channel with no handle (null resolution)", async () => {
    mockResolver = vi.fn().mockResolvedValue(null)

    const input: CategorizedLinks = {
      ytc: ["https://www.youtube.com/channel/UClegacyChannelNoHandle"]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    // ytc preserved, no ytp added — returns unchanged
    expect(result).toBe(input)
    expect(result.ytc).toEqual(["https://www.youtube.com/channel/UClegacyChannelNoHandle"])
    expect(result.ytp).toBeUndefined()
  })

  it("handles network error gracefully — logs warning, does not throw", async () => {
    mockResolver = vi.fn().mockRejectedValue(new Error("Network timeout"))

    const input: CategorizedLinks = {
      ytc: ["https://www.youtube.com/channel/UCfailingChannel1234567"]
    }

    // Should NOT throw
    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    // ytc preserved, no ytp added — returns unchanged
    expect(result).toBe(input)
    expect(result.ytc).toEqual(["https://www.youtube.com/channel/UCfailingChannel1234567"])
    expect(result.ytp).toBeUndefined()

    // Warning logged
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining("YOUTUBE WARNING")
    )
  })

  it("does not mutate the input object", async () => {
    mockResolver = vi.fn().mockResolvedValue("ResolvedHandle")

    const input: CategorizedLinks = {
      ytc: ["https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxx"]
    }
    const originalYtc = [...(input.ytc ?? [])]

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    // Input unchanged
    expect(input.ytc).toEqual(originalYtc)
    expect(input.ytp).toBeUndefined()

    // Result is a new object
    expect(result).not.toBe(input)
    expect(result.ytp).toBeDefined()
  })

  it("resolves multiple channel IDs", async () => {
    const fn = vi.fn()
      .mockResolvedValueOnce("HandleA")
      .mockResolvedValueOnce("HandleB")
    mockResolver = fn

    const input: CategorizedLinks = {
      ytc: [
        "https://www.youtube.com/channel/UCchannelA_123456789aa",
        "https://www.youtube.com/channel/UCchannelB_123456789bb"
      ]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    expect(fn).toHaveBeenCalledTimes(2)
    expect(result.ytc).toHaveLength(2) // Both ytc preserved
    expect(result.ytp).toEqual([
      "https://www.youtube.com/@HandleA",
      "https://www.youtube.com/@HandleB"
    ])
  })

  it("continues resolving remaining channels when one fails", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("Timeout"))
      .mockResolvedValueOnce("HandleB")
    mockResolver = fn

    const input: CategorizedLinks = {
      ytc: [
        "https://www.youtube.com/channel/UCfailingChannel1234567",
        "https://www.youtube.com/channel/UCworkingChannel1234567"
      ]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    expect(fn).toHaveBeenCalledTimes(2)
    // Only the successful one gets a ytp
    expect(result.ytp).toEqual(["https://www.youtube.com/@HandleB"])
  })

  it("skips ytc URLs that don't contain a valid channel ID", async () => {
    const input: CategorizedLinks = {
      ytc: ["https://www.youtube.com/channel/"] // empty channel ID
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    expect(mockResolver).not.toHaveBeenCalled()
    // ytc preserved as-is — returns unchanged
    expect(result).toBe(input)
  })

  it("preserves all other fields in the result", async () => {
    mockResolver = vi.fn().mockResolvedValue("TestHandle")

    const input: CategorizedLinks = {
      ws: ["https://example.com"],
      li: ["https://www.linkedin.com/company/test"],
      fb: ["https://www.facebook.com/test"],
      ytc: ["https://www.youtube.com/channel/UCtest1234567890abcdef"],
      urls: ["https://other.com"]
    }

    const result = await resolveYouTubeChannelHandles(input, logger, mockResolver)

    expect(result.ws).toEqual(["https://example.com"])
    expect(result.li).toEqual(["https://www.linkedin.com/company/test"])
    expect(result.fb).toEqual(["https://www.facebook.com/test"])
    expect(result.urls).toEqual(["https://other.com"])
    expect(result.ytc).toEqual(["https://www.youtube.com/channel/UCtest1234567890abcdef"])
    expect(result.ytp).toEqual(["https://www.youtube.com/@TestHandle"])
  })
})

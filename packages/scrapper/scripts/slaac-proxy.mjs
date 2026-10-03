// Minimal HTTP CONNECT proxy that binds every upstream connection to a specific
// source address/family, to bypass per-IP bans (e.g. Cloudflare 1015/429 on one IPv6).
// Usage:
//   node slaac-proxy.mjs [port] [family] [sourceAddr]
//   default: port=8787 family=6 source=2a02:8109:9f2f:2b00:8647:9ff:fe64:9d9d
import http from "node:http"
import net from "node:net"

const PORT = Number(process.argv[2] || process.env.PROXY_PORT || 8787)
const FAMILY = Number(process.argv[3] || process.env.PROXY_FAMILY || 6)
const LOCAL_ADDR =
  process.argv[4] ||
  process.env.PROXY_SRC_ADDR ||
  "2a02:8109:9f2f:2b00:8647:9ff:fe64:9d9d"

// Hosts that don't route via the SLAAC IPv6 path — connect directly (OS default route).
// Crunchbase turns failed third-party loads into a full-page error, so these MUST bypass.
const BYPASS = (
  process.env.PROXY_BYPASS ||
  "js.qualified.com,cdn.taboola.com,static.ads-twitter.com,a.quora.com,d2yyd1h5u9mauk.cloudfront.net"
)
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

const isBypass = (host) => {
  const h = (host || "").toLowerCase().replace(/\.$/, "")
  return BYPASS.some((b) => h === b || h.endsWith("." + b))
}

// Promise wrapper around one TCP connect
const connectOnce = (opts) =>
  new Promise((resolve, reject) => {
    const sock = net.connect(opts)
    sock.once("connect", () => resolve(sock))
    sock.once("error", (e) => {
      sock.destroy()
      reject(e)
    })
  })

const server = http.createServer()
server.on("connect", async (req, clientSocket, head) => {
  const idx = req.url.lastIndexOf(":")
  const host = req.url.slice(0, idx)
  const port = Number(req.url.slice(idx + 1) || 443)

  let upstream
  if (isBypass(host)) {
    // Known third-party hosts without AAAA (or unroutable over IPv6): straight to default route (IPv4)
    try {
      upstream = await connectOnce({ host, port, family: 0 })
    } catch (e) {
      console.error(`[proxy] upstream ${host}:${port} error: ${e.message}`)
      clientSocket.destroy()
      return
    }
  } else {
    // Prefer the SLAAC IPv6 source (banned ::cc82 is avoided), but fall back to the default
    // route (IPv4) when the host has no AAAA / isn't reachable over IPv6.
    try {
      upstream = await connectOnce({ host, port, family: FAMILY, localAddress: LOCAL_ADDR })
    } catch (e1) {
      try {
        upstream = await connectOnce({ host, port, family: 0 })
      } catch (e2) {
        console.error(`[proxy] upstream ${host}:${port} error: ${e2.message} (v6: ${e1.message})`)
        clientSocket.destroy()
        return
      }
    }
  }

  try {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n")
    if (head && head.length) upstream.write(head)
    clientSocket.pipe(upstream).pipe(clientSocket)
  } catch {
    clientSocket.destroy()
  }
  clientSocket.on("error", () => upstream.destroy())
  upstream.on("error", () => clientSocket.destroy())
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[proxy] CONNECT proxy listening on 127.0.0.1:${PORT}`)
  console.log(`[proxy] outbound family=${FAMILY} source=${LOCAL_ADDR}`)
  console.log(`[proxy] bypass hosts (direct, default route): ${BYPASS.join(", ") || "(none)"}`)
})
import { basicAuth } from "https://deno.land/x/basic_auth@v1.0.0/mod.ts"
import { readerFromStreamReader } from "https://deno.land/std/io/mod.ts"

const port = 8001
const server = Deno.listen({ port })
console.log(`HTTP webserver running. \n\n    open http://user:pass@localhost:${port}/`)

const decoder = new TextDecoder('utf-8')

for await (const connection of server) {
  serve(connection)
}


async function serve(connection: Deno.Conn) {
  const httpConnection = Deno.serveHttp(connection)

  for await (const requestEvent of httpConnection) {
    const request = requestEvent.request
    const unauthorized = basicAuth(request, "Access to my site", { "user": "pass", "zapier": "#EhHXY5X9zWnSRgyZ#G#" })
    if (unauthorized) return requestEvent.respondWith(unauthorized)

    const headers = Array.from(request.headers).map(header => header.join(': ')).join('\n')

    const response = ["HEADERS", headers]

    if (request.body !== null) {
      const buffer = await request.arrayBuffer()
      const body = decoder.decode(buffer)
      response.push(body)
    }

    return requestEvent.respondWith(
      new Response(response.join('\n'))
    )
  }
}



async function getInvite() {
  // get a one time use invite 
  // respond to 
  // redirect to invite
}

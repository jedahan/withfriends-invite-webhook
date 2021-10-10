import { basicAuth } from "https://deno.land/x/basic_auth@v1.0.0/mod.ts"
import { readerFromStreamReader } from "https://deno.land/std/io/mod.ts"
import { createInvite, startBot, Intents } from "https://deno.land/x/discordeno@12.0.1/mod.ts"
import config from './config.ts'

const isDevelopment = Deno.env.get('ENVIRONMENT') === 'development'

const auth = isDevelopment ? { "user": "pass" } : config.auth
if (!auth) die('Missing auth')

const token = isDevelopment ? 'FAKE_BOT_TOKEN' : config.bot_token
if (!token) die('Missing bot token')

const channelId = BigInt(isDevelopment ? 123456789 : config.channelId)
if (!channelId) die ('Missing invite channel id')

const invites = []

const port = 8001
const server = Deno.listen({ port })
console.log(`HTTP webserver running. \n\n    open http://user:pass@localhost:${port}/`)

const decoder = new TextDecoder('utf-8')
// Note that GuildMembers is a privileged intent, you need to enable it manually in the oauth2 settings
const intents = [ Intents.Guilds, Intents.GuildMembers, Intents.GuildMessages ]

startBot({
  token,
  intents,
  eventHandlers: {
    ready() {

      console.log("be excellent to each other")
    },
    guildMemberAdd(member) {
      console.log('member Added')
      console.log(member)
    },
    messageCreate(message) {
      //if (message.bot) return
      if (message.content === "Zping") {
        message.reply("Zpong!")
      }
    },
  },
})

for await (const connection of server) {
  serve(connection)
}

async function serve(connection: Deno.Conn) {
  const httpConnection = Deno.serveHttp(connection)

  for await (const requestEvent of httpConnection) {
    console.log('requested')
    const request = requestEvent.request
    const unauthorized = basicAuth(request, "discord invite", auth)
    if (unauthorized) return requestEvent.respondWith(unauthorized)

    if (request.body !== null) {
      const buffer = await request.arrayBuffer()
      const body = JSON.parse(decoder.decode(buffer))

      // If the person has become a supporter, redirect to new invite code
      if (body.kind === 'Live') {
	const inviteCode = getInviteCode()
	if (inviteCode) {
	  const uri = `https://discord.gg/${inviteCode}`
          const redirect = Response.redirect(uri, 302)
	  return requestEvent.respondWith(redirect)
	}
      }
    }

    const internalError = new Response('Error', { status: 500 })
    return requestEvent.respondWith(internalError)
  }
}

async function getInviteCode(): Promise<string> {
  const invite = await createInvite(channelId, { maxUses: 1 })
  console.log(invite)
  invites.push(invite.code)
  return invite.code
}

function die(message: string) {
  console.log(message)
  if (!isDevelopment) Deno.exit(1)
}

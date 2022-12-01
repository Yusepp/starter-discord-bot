
// const { clientId, guildId, token, publicKey } = require('./config.json');
const dotenv = require('dotenv')
dotenv.config()

const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID 
const CLIENT_ID = APPLICATION_ID

const Discord = require("discord.js")
const { REST } = require('@discordjs/rest')
const { Routes } = require('@discord-api-types/v9')
const fs = require("fs")
const { Player } = require('discord-player')
const LOAD_SLASH = process.argv[2] == "load"

const client = new Discord.Client({
	intents: [
		"GUILDS",
		"GUILD_VOICE_STATES"
	]
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
	ytdlOptions: {
		quality: "highestaudio",
		highWaterMark: 1 << 25
	}
})

let commands = []
let slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles) {
	const slashcmd = require(`./slash/${file}`)
	client.slashcommands.set(slashcmd.data.name, slashcmd)
	if (LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

if (LOAD_SLASH) {
	const rest = new REST({version: "9"}).setToken(TOKEN)
	console.log("Deploying slash commands")
	rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
	.then(() =>{
		console.log("Successfully loaded")
		process.exit(0)
	})
	.catch((err) => {
		console.log(err)
		process.exit(1)

	})
}
else {
	client.on("ready", () =>{
			console.log(`Logged in as ${client.user.tag}`)
	})
	client.on("interactionCreate", (interaction) => {
		async function handleCommand() {
			if (!interaction.isCommand())  return

			const slashcmd = client.slashcommands.get(interaction.commandName)
			if (!slashcmd) interaction.reply("Not a valid slash command")

			await interaction.deferReply()
			await slashcmd.run({client, interaction})
		}
		handleCommand()
	})
	client.login(TOKEN)
}



const axios = require('axios')
const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');


const app = express();
// app.use(bodyParser.json());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
	"Access-Control-Allow-Headers": "Authorization",
	"Authorization": `Bot ${TOKEN}`
  }
});




app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log(interaction.data.name)
    if(interaction.data.name == 'yo'){
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Yo ${interaction.member.user.username}!`,
        },
      });
    }

    if(interaction.data.name == 'dm'){
      // https://discord.com/developers/docs/resources/user#create-dm
      let c = (await discord_api.post(`/users/@me/channels`,{
        recipient_id: interaction.member.user.id
      })).data
      try{
        // https://discord.com/developers/docs/resources/channel#create-message
        let res = await discord_api.post(`/channels/${c.id}/messages`,{
          content:'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
        })
        console.log(res.data)
      }catch(e){
        console.log(e)
      }

      return res.send({
        // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data:{
          content:'👍'
        }
      });
    }
  }

});



app.get('/register_commands', async (req,res) =>{
  let slash_commands = [
    {
      "name": "yo",
      "description": "replies with Yo!",
      "options": []
    },
    {
      "name": "dm",
      "description": "sends user a DM",
      "options": []
    }
  ]
  try
  {
    // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
      slash_commands
    )
    console.log(discord_response.data)
    return res.send('commands have been registered')
  }catch(e){
    console.error(e.code)
    console.error(e.response?.data)
    return res.send(`${e.code} error from discord`)
  }
})


app.get('/', async (req,res) =>{
  return res.send('Follow documentation ')
})


app.listen(8999, () => {

})


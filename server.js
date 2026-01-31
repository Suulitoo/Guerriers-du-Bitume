require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
app.use(express.static(__dirname)); // sert index.html, css, videos...
app.use(express.static('pages'));
app.use(express.json());
app.use('/videos', express.static('videos'));

// CORS (pour que ton frontend localhost puisse appeler le backend)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Intents corrects (obligatoires pour envoyer des messages)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.login(process.env.DISCORD_TOKEN);

// Logs de démarrage
client.on('ready', () => {
    console.log(`Guerriers du Bitume Bot connecté : ${client.user.tag}`);
    console.log(`CHANNEL_ID utilisé : ${process.env.CHANNEL_ID}`);
});

app.get('/test-discord', async (req, res) => {
    try {
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        await channel.send("Test réussi depuis le serveur !");
        res.send("Test envoyé dans le canal Discord");
    } catch (err) {
        res.send("Erreur : " + err.message);
    }
});

// Route recrutement
app.post('/recrutement', async (req, res) => {
    const { nom, email, pseudo, age, heures, motivation } = req.body;

    console.log("Nouvelle candidature reçue :", req.body);

    try {
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        const embed = new EmbedBuilder()
            .setColor(0xc8102e)
            .setTitle('Nouvelle Candidature Guerriers du Bitume')
            .addFields(
                { name: 'Nom', value: nom || '—', inline: true },
                { name: 'Email', value: email || '—', inline: true },
                { name: 'Pseudo TMP', value: pseudo || '—', inline: true },
                { name: 'Âge', value: age || '—', inline: true },
                { name: 'Heures ETS2/TMP', value: heures || '—', inline: true },
                { name: 'Motivation', value: motivation || '—', inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Via le site Guerriers du Bitume' });

        await channel.send({ embeds: [embed] });
        res.status(200).send('OK');
    } catch (err) {
        console.error("Erreur envoi Discord :", err.message);
        res.status(500).send('Erreur serveur : ' + err.message);
    }
});

// Route pour les messages de contact
app.post('/contact', async (req, res) => {
    const { nom, email, objet, message } = req.body;

    console.log("Nouveau message reçu :", req.body); // ← pour debug

    try {
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        const embed = new EmbedBuilder()
            .setColor(0xff6200) // orange vif pour le différencier
            .setTitle('Nouveau Message Contact - Guerriers du Bitume')
            .addFields(
                { name: 'Nom', value: nom || '—', inline: true },
                { name: 'Email', value: email || '—', inline: true },
                { name: 'Objet', value: objet || '—', inline: true },
                { name: 'Message', value: message || '—' }
            )
            .setTimestamp()
            .setFooter({ text: 'Via le formulaire Contact du site' });

        await channel.send({ embeds: [embed] });
        res.status(200).send('OK');
    } catch (err) {
        console.error("Erreur envoi Discord :", err);
        res.status(500).send('Erreur serveur');
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
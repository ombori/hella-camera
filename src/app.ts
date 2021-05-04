import cp from 'child_process';
import https from 'https';
import fs from 'fs';
import { connect } from '@ombori/ga-module';
import express from 'express';
import * as uuid from 'uuid';

import { Settings } from './schema.js';

const PORT = 8080;
const AGENT_KEY = '/app/server.key';
const AGENT_CERT = '/app/server.crt';
const CERT_NAME = 'hella-camera-module';
const USERNAME = 'login';
const PASSWORD = 'password';

const tokens: string[] = [];

const module = await connect<Settings>();

cp.execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${AGENT_KEY} -out ${AGENT_CERT} -days 365 -nodes -subj '/CN=${CERT_NAME}'`);

const app = express();
app.use(express.json());

const server = https.createServer({
  cert: fs.readFileSync(AGENT_CERT),
  key: fs.readFileSync(AGENT_KEY)
}, app);

app.get('/status', (_, res) => res.end('ok'));

app.post('/auth', (req, res) => {
  const { username, password } = req.body;
  if (username !== USERNAME || password !== PASSWORD) {
    return res.status(401).end('Invalid password');
  }

  const token = uuid.v4();
  tokens.push(token);

  console.log(`A new token added for user ${username}`);
  res.json({ token });
});

app.put('/data', (req, res) => {
  const { body } = req;
  if (!tokens.some(token => req.headers.authorization === `Bearer ${token}`))
    return res.status(401).end('Unauthorized');

  console.log('Received data', body);
  module.broadcast('HellaCamera.data', body);

  res.json({ success: 'true' });
})

server.listen(PORT);
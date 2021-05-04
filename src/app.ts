import cp from 'child_process';
import https from 'https';
import fs from 'fs';
import { connect } from '@ombori/ga-module';
import express from 'express';

import { Settings } from './schema.js';

const PORT = 8080;
const AGENT_KEY = '/app/server.key';
const AGENT_CERT = '/app/server.crt';
const CERT_NAME = 'hella-camera-module';
cp.execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${AGENT_KEY} -out ${AGENT_CERT} -days 365 -nodes -subj '/CN=${CERT_NAME}'`);

const app = express();

const server = https.createServer({
  cert: fs.readFileSync(AGENT_CERT),
  key: fs.readFileSync(AGENT_KEY)
}, app);

app.get('/status', (_, res) => res.end('ok'));

server.listen(PORT);

const module = await connect<Settings>();
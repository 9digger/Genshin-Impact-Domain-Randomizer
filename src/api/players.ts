import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const playersFilePath = path.join(process.cwd(), 'data', 'players.json');

const readPlayersData = () => {
  if (!fs.existsSync(playersFilePath)) {
    return [];
  }
  const fileData = fs.readFileSync(playersFilePath, 'utf-8');
  return JSON.parse(fileData);
};

const writePlayersData = (data: any) => {
  fs.writeFileSync(playersFilePath, JSON.stringify(data, null, 2));
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const players = readPlayersData();
    return res.status(200).json(players);
  }

  if (req.method === 'POST') {
    const players = readPlayersData();
    const { name, characters } = req.body;

    // Check for existing player to update or add new
    const existingPlayerIndex = players.findIndex(player => player.name === name);
    if (existingPlayerIndex > -1) {
      players[existingPlayerIndex].characters = characters; // Update existing player
    } else {
      players.push({ name, characters }); // Add new player
    }

    writePlayersData(players);
    return res.status(200).json(players);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

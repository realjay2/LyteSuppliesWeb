// Example Express endpoint for GPT chat. Replace OPENAI_API_KEY with yours.

import express from 'express';
import { Configuration, OpenAIApi } from 'openai';

const app = express();
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const completion = await openai.createChatCompletion({
      model: "gpt-4", // or "gpt-3.5-turbo"
      messages,
    });
    res.json(completion.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error calling OpenAI' });
  }
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});

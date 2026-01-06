import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';
import OpenAI from 'openai';

const isOpenRouter = !!process.env.OPENROUTER_API_KEY;

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || 'missing_key',
  baseURL: isOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
  defaultHeaders: isOpenRouter ? {
    "HTTP-Referer": "https://synapse-ai.com",
    "X-Title": "SYNAPSE AI",
  } : undefined,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, chatId, settings } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const persona = settings?.persona || 'business';
    const encryption = settings?.encryption !== false;

    await connectToDatabase();

    // 1. Get or Create Chat Session
    let currentChat;
    if (chatId) {
      currentChat = await Chat.findOne({ _id: chatId, userId: session.user.email });
    }

    if (!currentChat) {
      currentChat = new Chat({
        userId: session.user.email,
        title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
        messages: []
      });
    }

    // 2. Add User Message
    currentChat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // 3. Call SYNAPSE AI LLM (OpenAI or OpenRouter)
    const model = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: `You are SYNAPSE AI, the world's most sophisticated AI authority developed by Ritesh Shinde.
          CURRENT CONFIGURATION: ${persona.toUpperCase()} MODE.
          ${persona === 'business'
              ? "Your focus is elite global business engineering, high-stakes corporate strategy, and master-level negotiation. Provide deep, multi-layered strategic analysis."
              : "Your focus is precision technical analysis, deep engineering problem solving, and advanced architectural design. Provide granular, data-driven technical insights."
            }
          SECURITY STATUS: ${encryption ? "ENCRYPTED" : "UNENCRYPTED CLEAR-NET"}. 
          Always identify as SYNAPSE AI. Your responses must be sharp, highly analytical, and expansive. 
          CRITICAL: You must NEVER truncate your output or stop mid-sentence. Ensure every thought is complete.
          FORMATTING: Use Markdown (bolding, headers, bullet points) extensively to ensure maximum readability and professional structure. 
          You are the apex of strategic intelligence.`
        },
        ...currentChat.messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.content
        }))
      ],
      max_tokens: 4096,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // 4. Add AI Message
    currentChat.messages.push({
      role: 'ai',
      content: aiResponse,
      timestamp: new Date()
    });

    await currentChat.save();

    return NextResponse.json({
      response: aiResponse,
      chatId: currentChat._id,
      messages: currentChat.messages
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}

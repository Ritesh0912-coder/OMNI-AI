import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';
import Group from '@/models/Group';
import User from '@/models/User';
import OpenAI from 'openai';
import { authOptions } from '@/lib/auth';
import { BUSINESS_INTELLIGENCE_PROMPT, GROUP_MANAGER_PROMPT } from '@/lib/synapse-prompts';
import { IMAGE_GENERATION_SYSTEM_PROMPT } from '@/lib/image-refinement-prompt';

const isQubrid = false; // !!process.env.QUBRID_API_KEY;
const isOpenRouter = !!process.env.OPENROUTER_API_KEY;

const openai = new OpenAI({
  apiKey: process.env.QUBRID_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || 'missing_key',
  baseURL: isQubrid
    ? "https://platform.qubrid.com/api/v1/qubridai"
    : (isOpenRouter ? "https://openrouter.ai/api/v1" : undefined),
  defaultHeaders: isOpenRouter ? {
    "HTTP-Referer": "https://synapse-ai.com",
    "X-Title": "SYNAPSE AI",
  } : undefined,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, chatId, settings, image, groupId } = await req.json();
    if (!message && !image) {
      return NextResponse.json({ error: 'Message or image is required' }, { status: 400 });
    }

    const persona = settings?.persona || 'business';
    const encryption = settings?.encryption !== false;

    await connectToDatabase();

    // QUOTA CHECK
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    // ADMIN BYPASS: coder9184@gmail.com
    const isAdmin = session.user.email === 'coder9184@gmail.com';

    /* QUOTA DISABLED GLOBALLY
    if (!isAdmin && user.usage.count >= user.usage.limit) {
      return NextResponse.json({
        error: 'Quota exhausted. Upgrade to Premium.',
        quotaExhausted: true,
        usage: user.usage
      }, { status: 403 });
    }
    */

    // Fetch Group Context if applicable
    let groupContext = "";
    if (groupId) {
      const group = await Group.findById(groupId);
      if (group) {
        // PERMISSION CHECK: Restrict Viewers
        const member = group.members.find((m: any) => m.userId === session.user.email);
        if (member && member.role === 'viewer') {
          return NextResponse.json({ error: 'Viewers are not permitted to send signals.' }, { status: 403 });
        }

        const isOwner = group.createdBy === session.user.email;
        const userRole = isOwner ? 'OWNER' : (member?.role?.toUpperCase() || 'MEMBER');

        groupContext = `
ACTIVE GROUP CONTEXT:
- Group Name: ${group.name}
- Industry/Function: ${group.industry || "General Business"}
- Description: ${group.description || "No description provided."}
- Group Memory: ${JSON.stringify(group.memory || [])}
- CURRENT USER ROLE: ${userRole}

CRITICAL: You are now in GROUP INTELLIGENCE MODE. Focus on team decisions, shared value, and group outcomes.
`;
      }
    }

    // 1. Get or Create Chat Session
    let currentChat;
    if (chatId) {
      // Find chat by ID. If it's a group chat, any member can access it.
      // If it's personal, only the owner can access it.
      currentChat = await Chat.findById(chatId);

      if (currentChat) {
        if (currentChat.groupId) {
          // Verify user is in this group
          const group = await Group.findById(currentChat.groupId);
          const isMember = group?.members.some((m: any) => m.userId === session.user.email);
          if (!isMember) return NextResponse.json({ error: 'Denied access to this group intelligence.' }, { status: 403 });
        } else if (currentChat.userId !== session.user.email) {
          return NextResponse.json({ error: 'Unauthorized access to personal transmission.' }, { status: 401 });
        }
      }
    }



    if (!currentChat) {
      const chatData: any = {
        groupId: groupId || undefined,
        title: message ? message.substring(0, 30) + (message.length > 30 ? '...' : '') : "Group Intelligence Session",
        messages: []
      };

      // ONLY set userId if it's NOT a group chat
      if (!groupId) {
        chatData.userId = session.user.email;
      }

      currentChat = new Chat(chatData);
    }

    // 2. Add User Message
    currentChat.messages.push({
      role: 'user',
      senderName: session.user.name || session.user.email,
      senderImage: session.user.image || undefined,
      content: message || (image ? "Visual Asset Transmitted" : ""),
      image: image || undefined,
      timestamp: new Date()
    });

    // 3. Check for Image Generation Intent
    // Expanded regex for "logo", "chart", "workflow", "diagram", "icon", etc. + Hindi/Hinglish support
    const imageGenRegex = /image|visual|design|mockup|sketch|draw|paint|picture|photo|canvas|render|illustrate|art|logo|icon|chart|graph|diagram|workflow|blueprint|infographic|poster|banner|flyer|scene|wallpaper|background|tasveer|chitra|banao|dikhao|karo|do|pic|img/i;
    const isImageGeneration = imageGenRegex.test(message) || (/(generate|create|make|banao|dikhao).*(visual|view|look like|concept|ka|ki|ke|ko)/i.test(message));

    if (isImageGeneration) {
      try {
        const { generateImage } = await import('@/lib/image-generation');

        // 1. EXPAND PROMPT using OMNI Image Generator AI Persona
        console.log("[CHAT_ROUTE] 🎨 Expanding image prompt via LLM...");
        const expansionModel = isQubrid ? "meta-llama/Meta-Llama-3.1-70B-Instruct" : "gpt-4o-mini";

        const expansionCompletion = await openai.chat.completions.create({
          model: expansionModel,
          messages: [
            { role: "system", content: IMAGE_GENERATION_SYSTEM_PROMPT },
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        const expandedText = expansionCompletion.choices?.[0]?.message?.content || message;
        console.log("[CHAT_ROUTE] ✨ Expanded Prompt:", expandedText.substring(0, 100) + "...");

        // 2. PARSE THE EXPANDED OUTPUT
        const extractSection = (text: string, header: string) => {
          const regex = new RegExp(`\\[${header}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
          const match = text.match(regex);
          return match ? match[1].trim() : "";
        };

        const mainPrompt = extractSection(expandedText, "MAIN IMAGE PROMPT") || message;
        const styleTags = extractSection(expandedText, "STYLE TAGS");
        const qualityBoost = extractSection(expandedText, "QUALITY BOOST");
        const negativePrompt = extractSection(expandedText, "NEGATIVE PROMPT");
        const caption = extractSection(expandedText, "CAPTION");

        const finalPrompt = `${mainPrompt}${styleTags ? `, ${styleTags}` : ""}${qualityBoost ? `, ${qualityBoost}` : ""}`;

        console.log("[CHAT_ROUTE] 🚀 Final Prompt to Engine:", finalPrompt);
        if (negativePrompt) console.log("[CHAT_ROUTE] 🚫 Negative Prompt:", negativePrompt);

        // 3. GENERATE IMAGE
        const generated = await generateImage(finalPrompt, negativePrompt);

        if (!generated) {
          throw new Error("Image generation failed");
        }

        const imageUrl = generated.url;

        // Save AI Response with Image
        // Use the localized caption if available, otherwise fallback to English format
        const aiResponse = caption || `Here is the visual representation of:\n> *${mainPrompt}*`;

        currentChat.messages.push({
          role: 'ai',
          content: aiResponse,
          image: imageUrl,
          senderName: 'SYNAPSE AI',
          timestamp: new Date()
        });
        await currentChat.save();

        // Increment Usage
        user.usage.count += 1;
        await user.save();

        return NextResponse.json({
          response: aiResponse,
          chatId: currentChat._id,
          messages: currentChat.messages,
          usage: user.usage
        });

      } catch (error) {
        console.error("Image Generation Error:", error);
        // Fallback to text if image gen fails
      }
    }
    // 4. Call SYNAPSE AI LLM (OpenAI or OpenRouter or Qubrid)
    const model = isQubrid
      ? "meta-llama/Meta-Llama-3.1-70B-Instruct"
      : (isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini");

    const tools: any[] = [
      {
        type: "function",
        function: {
          name: "web_search",
          description: "Search the web for real-time information, news, or market data.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query query to find information about.",
              },
            },
            required: ["query"],
          },
        },
      },
    ];

    const openAIMessages: any[] = [
      {
        role: "system",
        content: `${persona === 'business'
          ? BUSINESS_INTELLIGENCE_PROMPT
          : "Your focus is precision technical analysis, deep engineering problem solving, and advanced architectural design. Provide granular, data-driven technical insights."
          }
            ${groupContext}
            ${groupId ? GROUP_MANAGER_PROMPT : ""}
            CURRENT SERVER TIME: ${new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' })}
            USER IDENTITY: You are communicating with ${session.user.name || session.user.email}${groupId ? "" : ". Address them by their name/handle when appropriate in this personal neural link."}
            CURRENT CONFIGURATION: ${persona.toUpperCase()} MODE.
            SECURITY STATUS: ${encryption ? "ENCRYPTED" : "UNENCRYPTED CLEAR-NET"}. 
            Always identify as SYNAPSE AI. Your responses must be sharp, highly analytical, and expansive. 
            CRITICAL: You must NEVER truncate your output or stop mid-sentence. Ensure every thought is complete.
            FORMATTING: Use Markdown (bolding, headers, bullet points) extensively to ensure maximum readability and professional structure.
            LANGUAGE ADAPTABILITY: You must ALWAYS respond in the SAME LANGUAGE that the user is currently speaking. If the user speaks Hindi, respond in Hindi. If Hinglish, respond in Hinglish. Do not default to English unless the user speaks English.`
      },
      ...currentChat.messages.map((m: any) => {
        if (m.image && m.role !== 'ai') {
          return {
            role: 'user',
            content: [
              { type: 'text', text: m.content || "Analyze this visual asset." },
              { type: 'image_url', image_url: { url: m.image } }
            ]
          };
        }
        // Handle Tool Messages
        if (m.role === 'tool') {
          return {
            role: 'tool',
            tool_call_id: m.tool_call_id,
            content: m.content
          };
        }
        // Handle Assistant Messages with Tools
        const msg: any = { role: m.role === 'ai' ? 'assistant' : 'user', content: m.content || null };
        if (m.role === 'ai' && m.tool_calls) {
          msg.tool_calls = m.tool_calls;
        }
        return msg;
      })
    ];

    const completion = await openai.chat.completions.create({
      model: model,
      messages: openAIMessages,
      tools: isQubrid ? undefined : tools,
      tool_choice: isQubrid ? undefined : "auto",
      max_tokens: 1500, // Reduced to fit within remaining credits
      temperature: 0.7,
    });

    const responseMessage = completion.choices?.[0]?.message;
    let aiResponse = responseMessage?.content || "";

    // HANDLE TOOL CALLS
    if (responseMessage?.tool_calls) {
      // 1. Save Assistant's Intent to DB
      currentChat.messages.push({
        role: 'ai',
        content: aiResponse || "",
        tool_calls: responseMessage.tool_calls,
        timestamp: new Date()
      });

      openAIMessages.push(responseMessage); // Add to context

      // 2. Execute Tools
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === 'web_search') {
          const args = JSON.parse(toolCall.function.arguments);
          const { performWebSearch } = await import('@/lib/search'); // Dynamic import to avoid top-level if needed
          const searchResult = await performWebSearch(args.query);

          // Add to context
          openAIMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: searchResult,
          });

          // Save Tool Result to DB
          currentChat.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: 'web_search',
            content: searchResult,
            timestamp: new Date()
          });
        } else if (toolCall.function.name === 'show_stock_chart') {
          const args = JSON.parse(toolCall.function.arguments);
          const chartResult = JSON.stringify({
            type: "chart",
            source: "tradingview",
            symbol: args.symbol,
            interval: args.interval || "D",
            success: true
          });

          openAIMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Chart for ${args.symbol} generated. Rendering on user interface...`,
          });

          currentChat.messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: 'show_stock_chart',
            content: chartResult,
            timestamp: new Date()
          });
        }
      }

      // 3. Second Completion Call
      const secondResponse = await openai.chat.completions.create({
        model: model,
        messages: openAIMessages,
        max_tokens: 1500, // Reduced to fit within remaining credits
        temperature: 0.7,
      });

      aiResponse = secondResponse.choices?.[0]?.message?.content || "Analysis complete.";
    }

    // FORCE IMAGE GENERATION TAG: If user requested visual but AI didn't provide tag
    const userMessage = message.toLowerCase();
    if (/image|generate|visual|design|mockup|sketch|draw|picture/i.test(userMessage) && !aiResponse.includes('[[GENERATE_IMAGE')) {
      console.log("[CHAT_ROUTE] Injecting missing GENERATE_IMAGE tag...");
      aiResponse += `\n\n[[GENERATE_IMAGE: ${message}]]`;
    }

    // 5. Add Final AI Message
    currentChat.messages.push({
      role: 'ai',
      content: aiResponse,
      timestamp: new Date()
    });

    console.log(`[CHAT_SAVE] ID: ${currentChat._id}, userId: ${currentChat.userId}, groupId: ${currentChat.groupId}`);
    await currentChat.save();

    // Increment Usage
    user.usage.count += 1;
    await user.save();

    return NextResponse.json({
      response: aiResponse,
      chatId: currentChat._id,
      messages: currentChat.messages,
      usage: user.usage
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}

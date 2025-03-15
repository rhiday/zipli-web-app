import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text, language } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Set up the prompt based on language
    const prompt = language === 'fi-FI'
      ? `Tiivistä seuraava teksti neljään tärkeään kohtaan ruokalahjoituksen sisällöstä. Keskity määriin, ruoan tyyppeihin ja muihin olennaisiin yksityiskohtiin.\n\nTeksti: ${text}\n\nTiivistelmä:`
      : `Summarize the following text into four key points about the food donation content. Focus on quantities, types of food, and other essential details.\n\nText: ${text}\n\nSummary:`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: language === 'fi-FI'
            ? "Olet avustaja, joka tiivistää ruokalahjoituksen kuvauksia selkeiksi avainkohdiksi."
            : "You are an assistant that summarizes food donation descriptions into clear key points."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more focused, less creative responses
      max_tokens: 256,
    });
    
    // Extract the response
    const summary = completion.choices[0].message.content?.trim() || '';
    
    // Split into bullet points (assuming the model returns a numbered or bulleted list)
    let bulletPoints = summary
      .split(/\n+/)
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[0-9]+\.|\*\s*/, '').trim());
    
    // Ensure we have exactly 4 points
    while (bulletPoints.length < 4) {
      bulletPoints.push('');
    }
    
    // Take only the first 4 if there are more
    bulletPoints = bulletPoints.slice(0, 4);
    
    return NextResponse.json({ bulletPoints });
  } catch (error) {
    console.error('Error in summarize API:', error);
    return NextResponse.json(
      { error: 'Failed to summarize text' },
      { status: 500 }
    );
  }
} 
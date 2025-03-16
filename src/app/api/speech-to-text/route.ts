import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { createReadStream } from 'fs';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'fi';
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Save the audio file temporarily
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a temporary file with a unique name
    const tempFilePath = join(tmpdir(), `${uuidv4()}.webm`);
    await writeFile(tempFilePath, buffer);
    
    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(tempFilePath),
      model: "whisper-1",
      language: language === 'fi-FI' ? 'fi' : 'en',
    });
    
    return NextResponse.json({ 
      text: transcription.text 
    });
  } catch (error) {
    console.error('Error in speech-to-text API:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
} 
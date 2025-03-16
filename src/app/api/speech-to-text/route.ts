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
  console.log('Speech-to-text API endpoint called');
  
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'fi';
    
    console.log('Received audio file request with language:', language);
    
    if (!audioFile) {
      console.error('No audio file provided');
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }
    
    console.log('Audio file size:', audioFile.size, 'bytes');
    
    if (audioFile.size === 0) {
      console.error('Empty audio file provided');
      return NextResponse.json(
        { error: 'Audio file is empty' },
        { status: 400 }
      );
    }

    // Save the audio file temporarily
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a temporary file with a unique name
    const tempFilePath = join(tmpdir(), `${uuidv4()}.webm`);
    await writeFile(tempFilePath, buffer);
    
    console.log('Temporary file created at:', tempFilePath);
    
    try {
      // Call OpenAI Whisper API
      console.log('Calling Whisper API with language:', language === 'fi-FI' ? 'fi' : 'en');
      const transcription = await openai.audio.transcriptions.create({
        file: createReadStream(tempFilePath),
        model: "whisper-1",
        language: language === 'fi-FI' ? 'fi' : 'en',
      });
      
      console.log('Transcription successful, text length:', transcription.text.length);
      
      return NextResponse.json({ 
        text: transcription.text 
      });
    } catch (whisperError: any) {
      console.error('Whisper API error:', whisperError.message, whisperError.status);
      if (whisperError.status === 400) {
        return NextResponse.json(
          { error: 'Invalid audio format or empty audio file' },
          { status: 400 }
        );
      }
      throw whisperError; // Rethrow for outer catch
    }
  } catch (error: any) {
    console.error('Error in speech-to-text API:', error.message, error.stack);
    return NextResponse.json(
      { error: 'Failed to transcribe audio: ' + error.message },
      { status: 500 }
    );
  }
} 
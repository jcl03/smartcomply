import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create a system prompt for compliance and audit context
    const systemPrompt = `You are SmartComply AI, an intelligent assistant specialized in compliance management and audit processes. 
    
    Your role is to:
    - Provide guidance on compliance requirements and regulations
    - Help with audit preparation and remediation
    - Suggest best practices for compliance management
    - Assist with risk assessment and mitigation strategies
    - Explain regulatory frameworks and standards
    - Provide actionable recommendations for improving compliance posture
    
    Context: ${context || 'General compliance and audit assistance'}
    
    Please provide helpful, accurate, and actionable advice. Keep responses professional and focused on compliance and audit matters.
    
    User Question: ${message}`;

    // Generate response
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      response: text,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

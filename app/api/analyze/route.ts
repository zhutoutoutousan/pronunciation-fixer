import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

if (!process.env.MOONSHOT_API_KEY) {
  throw new Error('Missing MOONSHOT_API_KEY environment variable');
}

const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY;
const MAX_RETRIES = 3;

async function callMoonshotAPI(prompt: string, attempt: number = 1) {
  console.log(`API: Attempt ${attempt} of ${MAX_RETRIES}`);
  
  const response = await axios.post(
    'https://api.moonshot.cn/v1/chat/completions',
    {
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "system",
          content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手。你必须只返回JSON格式的回答，不要包含任何其他文字、注释或代码块标记。确保JSON格式完整且有效。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      stream: false
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONSHOT_API_KEY.trim()}`,
        'Accept': 'application/json'
      },
      proxy: false,
      validateStatus: (status) => status < 500
    }
  );

  return response;
}

async function completeTargetText(spokenText: string): Promise<string> {
  console.log('API: Completing target text from speech...');
  
  const prompt = `
    Given this transcribed speech: "${spokenText}"
    
    Please identify and return the most likely intended sentence in clear, correct English.
    Return only the corrected sentence, nothing else.
  `;

  try {
    const response = await callMoonshotAPI(prompt, 1);
    const content = response.data.choices[0].message.content;
    console.log('API: Generated target text:', content);
    return content.trim();
  } catch (error) {
    console.error('API: Failed to complete target text:', error);
    throw new Error('Failed to generate target text');
  }
}

async function parseAndValidateResponse(content: string) {
  // Try to extract JSON if it's wrapped in anything
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object found in response');
  }

  const jsonString = jsonMatch[0].trim();
  const parsedContent = JSON.parse(jsonString);
  
  // Validate and normalize the response structure
  return {
    ipa: parsedContent.ipa || '',
    goodPronunciation: Array.isArray(parsedContent.goodPronunciation) ? parsedContent.goodPronunciation : [],
    needsImprovement: Array.isArray(parsedContent.needsImprovement) ? parsedContent.needsImprovement : [],
    tips: Array.isArray(parsedContent.tips) ? parsedContent.tips : [parsedContent.tips].filter(Boolean)
  };
}

export async function POST(req: NextRequest) {
  console.log('API: Starting pronunciation analysis...');
  
  try {
    const { targetText, spokenText } = await req.json();
    console.log('API: Received texts for analysis:', { targetText, spokenText });

    // If no target text provided, generate it from speech
    const finalTargetText = targetText || await completeTargetText(spokenText);
    console.log('API: Using target text:', finalTargetText);

    const prompt = `
      As an English pronunciation expert, analyze these two texts:
      Target: "${finalTargetText}"
      Spoken: "${spokenText}"

      Respond with a JSON object using exactly this format:
      {
        "ipa": "IPA transcription of target text",
        "goodPronunciation": [{"word": "example", "ipa": "ɪɡˈzæmpəl"}],
        "needsImprovement": [{"word": "example", "ipa": "correct_ipa"}],
        "tips": ["Tip 1", "Tip 2"]
      }
    `;

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await callMoonshotAPI(prompt, attempt);
        
        if (response.status === 401) {
          throw new Error('API Authentication failed');
        }

        const content = response.data.choices[0].message.content;
        console.log(`API: Raw content (Attempt ${attempt}):`, content);

        const validatedContent = await parseAndValidateResponse(content);
        console.log('API: Successfully parsed and validated JSON:', validatedContent);
        return NextResponse.json({ 
          content: validatedContent,
          targetText: finalTargetText 
        });
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error(`API: Attempt ${attempt} failed:`, err);
        lastError = err;
        
        if (err.message === 'API Authentication failed') {
          break; // Don't retry auth failures
        }
        
        if (attempt === MAX_RETRIES) {
          console.error('API: All retry attempts failed');
        }
      }
    }

    // If we get here, all attempts failed
    return NextResponse.json(
      { 
        error: 'Failed to get valid response after multiple attempts',
        details: lastError?.message || 'Unknown error'
      },
      { status: 500 }
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze pronunciation',
        details: axios.isAxiosError(error) 
          ? error.response?.data || error.message 
          : error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


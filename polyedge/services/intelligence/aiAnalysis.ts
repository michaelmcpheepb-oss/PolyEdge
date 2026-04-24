/**
 * AI Analysis Service for PolyEdge
 * Generates 2-sentence AI briefs for markets using Claude API
 * Falls back to smart analysis if no API key available
 */

interface MarketData {
  id: string;
  question: string;
  description?: string;
  outcomes: string[];
  volume24h: number;
  yesPrice: number;
  noPrice: number;
  category?: string;
  endDate?: string;
  tags?: string[];
}

interface SmartMoneyData {
  direction: 'YES' | 'NO' | 'MIXED';
  convictionPct: number;
  totalTopWallets: number;
}

interface AIBrief {
  brief: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  keyFactors: string[];
  timestamp: number;
}

export async function generateAIBrief(
  marketData: MarketData,
  smartMoneyData?: SmartMoneyData
): Promise<AIBrief> {
  const anthropicKey = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;

  if (anthropicKey && anthropicKey !== 'your_claude_api_key_here') {
    try {
      return await generateClaudeBrief(marketData, anthropicKey, smartMoneyData);
    } catch (error) {
      console.warn('Claude API failed, falling back to smart analysis:', error);
      return generateSmartBrief(marketData, smartMoneyData);
    }
  } else {
    console.log('No Claude API key configured, using smart analysis');
    return generateSmartBrief(marketData, smartMoneyData);
  }
}

async function generateClaudeBrief(
  marketData: MarketData,
  apiKey: string,
  smartMoneyData?: SmartMoneyData
): Promise<AIBrief> {
  const prompt = buildAnalysisPrompt(marketData, smartMoneyData);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const brief = data.content[0].text.trim();

  // Extract confidence and factors from Claude's response
  const confidence = extractConfidenceFromBrief(brief);
  const keyFactors = extractKeyFactorsFromBrief(brief, marketData, smartMoneyData);

  return {
    brief,
    confidence,
    keyFactors,
    timestamp: Date.now()
  };
}

function generateSmartBrief(
  marketData: MarketData,
  smartMoneyData?: SmartMoneyData
): AIBrief {
  const { question, yesPrice, volume24h, category } = marketData;

  let brief = '';
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  const keyFactors: string[] = [];

  // Analyze price signals
  if (yesPrice >= 0.75) {
    brief += `Market strongly favors YES (${Math.round(yesPrice * 100)}% probability) with high conviction. `;
    confidence = 'HIGH';
    keyFactors.push('Strong price signal');
  } else if (yesPrice <= 0.25) {
    brief += `Market strongly favors NO (${Math.round((1 - yesPrice) * 100)}% probability) with high conviction. `;
    confidence = 'HIGH';
    keyFactors.push('Strong price signal');
  } else if (yesPrice >= 0.6) {
    brief += `Market leans YES (${Math.round(yesPrice * 100)}% probability) but without overwhelming consensus. `;
    keyFactors.push('Moderate YES signal');
  } else if (yesPrice <= 0.4) {
    brief += `Market leans NO (${Math.round((1 - yesPrice) * 100)}% probability) but sentiment could shift. `;
    keyFactors.push('Moderate NO signal');
  } else {
    brief += `Market remains highly uncertain with near 50-50 odds reflecting genuine ambiguity. `;
    confidence = 'LOW';
    keyFactors.push('Uncertain outcome');
  }

  // Add smart money analysis
  if (smartMoneyData && smartMoneyData.totalTopWallets > 5) {
    if (smartMoneyData.direction === 'MIXED') {
      brief += `Top traders are divided, suggesting genuine uncertainty about the outcome.`;
      keyFactors.push('Smart money split');
    } else if (smartMoneyData.convictionPct >= 80) {
      brief += `Top traders show strong ${smartMoneyData.direction} conviction (${smartMoneyData.convictionPct}%), indicating informed confidence.`;
      keyFactors.push(`Strong smart money: ${smartMoneyData.direction}`);
      if (confidence === 'MEDIUM') confidence = 'HIGH';
    } else {
      brief += `Smart money leans ${smartMoneyData.direction} (${smartMoneyData.convictionPct}%) but with moderate conviction.`;
      keyFactors.push(`Moderate smart money: ${smartMoneyData.direction}`);
    }
  } else {
    brief += `Limited smart money data available, making this primarily a crowd sentiment play.`;
    keyFactors.push('Limited elite trader data');
  }

  // Add volume context
  if (volume24h >= 100000) {
    keyFactors.push('High liquidity');
  } else if (volume24h >= 25000) {
    keyFactors.push('Moderate volume');
  } else {
    keyFactors.push('Low volume');
    if (confidence === 'HIGH') confidence = 'MEDIUM';
  }

  return {
    brief: brief.trim(),
    confidence,
    keyFactors,
    timestamp: Date.now()
  };
}

function buildAnalysisPrompt(
  marketData: MarketData,
  smartMoneyData?: SmartMoneyData
): string {
  const smartMoneyInfo = smartMoneyData
    ? `Smart money analysis: ${smartMoneyData.direction} direction with ${smartMoneyData.convictionPct}% conviction from ${smartMoneyData.totalTopWallets} top wallets.`
    : 'No smart money data available.';

  return `You are an expert prediction market analyst. Analyze this Polymarket question and provide exactly 2 sentences:

Market: "${marketData.question}"
Current YES price: ${Math.round(marketData.yesPrice * 100)}%
Current NO price: ${Math.round(marketData.noPrice * 100)}%
24h volume: $${marketData.volume24h.toLocaleString()}
Category: ${marketData.category || 'Unknown'}
${smartMoneyInfo}

Provide exactly 2 sentences:
1. Current market signal and what it indicates
2. Smart money/elite trader perspective and overall confidence level

Be concise, analytical, and focus on actionable insights. Don't hedge or qualify excessively.`;
}

function extractConfidenceFromBrief(brief: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  const lowerBrief = brief.toLowerCase();

  if (lowerBrief.includes('high confidence') ||
      lowerBrief.includes('strong conviction') ||
      lowerBrief.includes('overwhelming') ||
      lowerBrief.includes('decisive')) {
    return 'HIGH';
  }

  if (lowerBrief.includes('low confidence') ||
      lowerBrief.includes('uncertain') ||
      lowerBrief.includes('ambiguous') ||
      lowerBrief.includes('unclear')) {
    return 'LOW';
  }

  return 'MEDIUM';
}

function extractKeyFactorsFromBrief(
  brief: string,
  marketData: MarketData,
  smartMoneyData?: SmartMoneyData
): string[] {
  const factors: string[] = [];
  const lowerBrief = brief.toLowerCase();

  // Price-based factors
  if (marketData.yesPrice >= 0.75 || marketData.yesPrice <= 0.25) {
    factors.push('Strong price signal');
  }

  // Volume factor
  if (marketData.volume24h >= 100000) {
    factors.push('High liquidity');
  } else if (marketData.volume24h < 25000) {
    factors.push('Low volume');
  }

  // Smart money factor
  if (smartMoneyData) {
    if (smartMoneyData.convictionPct >= 80) {
      factors.push(`Strong smart money: ${smartMoneyData.direction}`);
    } else if (smartMoneyData.direction === 'MIXED') {
      factors.push('Smart money split');
    }
  }

  // AI-detected factors from brief text
  if (lowerBrief.includes('momentum')) {
    factors.push('Price momentum');
  }
  if (lowerBrief.includes('volatility')) {
    factors.push('High volatility');
  }
  if (lowerBrief.includes('deadline') || lowerBrief.includes('time')) {
    factors.push('Time pressure');
  }

  return factors.slice(0, 4); // Max 4 factors
}

// Helper function to batch process multiple markets
export async function generateMultipleBriefs(
  markets: MarketData[],
  smartMoneyDataMap?: Map<string, SmartMoneyData>
): Promise<Map<string, AIBrief>> {
  const results = new Map<string, AIBrief>();

  // Process in batches to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < markets.length; i += batchSize) {
    const batch = markets.slice(i, i + batchSize);

    const promises = batch.map(async (market) => {
      const smartMoney = smartMoneyDataMap?.get(market.id);
      const brief = await generateAIBrief(market, smartMoney);
      return [market.id, brief] as [string, AIBrief];
    });

    const batchResults = await Promise.all(promises);

    batchResults.forEach(([marketId, brief]) => {
      results.set(marketId, brief);
    });

    // Small delay between batches to be respectful to API
    if (i + batchSize < markets.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
# Using Claude AI with AI OCR Parser

This guide explains how to integrate and use Anthropic's Claude AI models for invoice data extraction in this project.

---

## Overview

Claude is a powerful AI assistant created by Anthropic that excels at understanding and extracting structured data from text. This project can leverage Claude's vision and text analysis capabilities to parse invoice data from PDFs.

---

## Why Use Claude?

- **Advanced Vision Capabilities**: Claude can directly analyze images and PDFs
- **Structured Output**: Excellent at following precise output formats (JSON)
- **Context Understanding**: Better comprehension of invoice layouts and business documents
- **Reliability**: Consistent and accurate data extraction
- **Cost-Effective**: Competitive pricing for API usage

---

## Prerequisites

1. **Anthropic API Key**
   - Sign up at [Anthropic Console](https://console.anthropic.com/)
   - Navigate to API Keys section
   - Generate a new API key

2. **Install Required Packages**
   ```bash
   cd server
   npm install @anthropic-ai/sdk
   ```

---

## Configuration

### 1. Environment Variables

Add your Claude API key to the server environment:

```bash
# server/.env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. Backend Integration

Create a new service file for Claude integration:

```javascript
// server/services/claudeService.js
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function extractInvoiceDataWithClaude(imageBase64) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Latest Claude model
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this invoice image and extract the following information:

              - Total Quantity (sum of all items)
              - Total Price (final amount)
              - Supplier Name

              Return the data in this exact JSON format:
              {
                "totalQuantity": <number>,
                "totalPrice": <number>,
                "supplierName": "<string>"
              }

              Only return the JSON object, nothing else.`,
            },
          ],
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0].text;
    const invoiceData = JSON.parse(responseText);

    return {
      success: true,
      data: invoiceData,
    };
  } catch (error) {
    console.error('Claude extraction error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 3. Update API Route

Modify your processing route to use Claude:

```javascript
// server/routes/uploadRoute.js
import { extractInvoiceDataWithClaude } from '../services/claudeService.js';

router.post('/process-invoice', upload.single('pdf'), async (req, res) => {
  try {
    // Convert PDF to PNG (existing code)
    const imageBuffer = await convertPdfToPng(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // Use Claude for extraction
    const result = await extractInvoiceDataWithClaude(base64Image);

    if (result.success) {
      res.json({
        status: 'success',
        data: result.data,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});
```

---

## Available Claude Models

| Model | Best For | Context Window | Cost |
|-------|----------|----------------|------|
| `claude-3-5-sonnet-20241022` | Balanced performance & cost | 200K tokens | Medium |
| `claude-3-5-haiku-20241022` | Fast, lightweight tasks | 200K tokens | Low |
| `claude-3-opus-20240229` | Maximum accuracy | 200K tokens | High |

**Recommendation**: Use `claude-3-5-sonnet-20241022` for invoice processing.

---

## Advanced Features

### 1. Batch Processing

```javascript
export async function processBatchWithClaude(images) {
  const results = await Promise.all(
    images.map((img) => extractInvoiceDataWithClaude(img))
  );
  return results;
}
```

### 2. Error Handling with Retry

```javascript
async function extractWithRetry(imageBase64, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await extractInvoiceDataWithClaude(imageBase64);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. Streaming Responses

For real-time updates:

```javascript
export async function extractWithStreaming(imageBase64, onProgress) {
  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    stream: true,
    messages: [/* same as before */],
  });

  let fullResponse = '';

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      fullResponse += chunk.delta.text;
      onProgress(fullResponse);
    }
  }

  return JSON.parse(fullResponse);
}
```

---

## Testing

Test your Claude integration:

```bash
# Test endpoint
curl -X POST http://localhost:5000/api/process-invoice \
  -F "pdf=@sample-invoice.pdf" \
  -H "Content-Type: multipart/form-data"
```

---

## Best Practices

1. **Prompt Engineering**
   - Be specific about the expected output format
   - Provide examples for complex extractions
   - Use clear, structured instructions

2. **Error Handling**
   - Always wrap API calls in try-catch blocks
   - Implement retry logic for transient failures
   - Log errors for debugging

3. **Cost Optimization**
   - Cache results when possible
   - Use appropriate model size for the task
   - Compress images before sending (while maintaining readability)

4. **Security**
   - Never expose API keys in frontend code
   - Use environment variables
   - Implement rate limiting
   - Validate and sanitize all inputs

---

## Comparison: Claude vs OpenAI

| Feature | Claude | OpenAI GPT-4 Vision |
|---------|--------|---------------------|
| Vision Quality | Excellent | Excellent |
| Structured Output | Native JSON support | Requires parsing |
| Context Window | 200K tokens | 128K tokens |
| Speed | Fast | Medium |
| Cost | Competitive | Higher |
| Rate Limits | Generous | Stricter |

---

## Resources

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude API Reference](https://docs.anthropic.com/claude/reference/)
- [Vision Guide](https://docs.anthropic.com/claude/docs/vision)
- [Best Practices](https://docs.anthropic.com/claude/docs/best-practices)

---

## Support

For issues or questions:
- Check [Anthropic's Discord](https://discord.gg/anthropic)
- Review [API Status](https://status.anthropic.com/)
- Contact support at [support@anthropic.com](mailto:support@anthropic.com)

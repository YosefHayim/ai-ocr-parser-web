# Using Google Gemini AI with AI OCR Parser

This guide explains how to integrate and use Google's Gemini AI models for invoice data extraction in this project.

---

## Overview

Google Gemini is a powerful multimodal AI model that can understand and process both text and images. This project can leverage Gemini's advanced vision capabilities to extract structured invoice data from PDF images.

---

## Why Use Gemini?

- **Multimodal Understanding**: Native support for images and text
- **Fast Processing**: Quick response times for image analysis
- **Cost-Effective**: Competitive pricing with generous free tier
- **High Accuracy**: Excellent at understanding document layouts
- **JSON Mode**: Built-in structured output support
- **Free Tier**: 15 requests per minute for free

---

## Prerequisites

1. **Google AI Studio API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key

2. **Install Required Packages**
   ```bash
   cd server
   npm install @google/generative-ai
   ```

---

## Configuration

### 1. Environment Variables

Add your Gemini API key to the server environment:

```bash
# server/.env
GOOGLE_API_KEY=your_google_api_key_here
```

### 2. Backend Integration

Create a new service file for Gemini integration:

```javascript
// server/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function extractInvoiceDataWithGemini(imageBuffer) {
  try {
    // Use Gemini 2.0 Flash for best performance
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze this invoice image and extract the following information:

    - Total Quantity (sum of all items)
    - Total Price (final amount to be paid)
    - Supplier Name (company or person issuing the invoice)

    Return the data in this exact JSON format:
    {
      "totalQuantity": <number>,
      "totalPrice": <number>,
      "supplierName": "<string>"
    }`;

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/png',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const invoiceData = JSON.parse(text);

    return {
      success: true,
      data: invoiceData,
    };
  } catch (error) {
    console.error('Gemini extraction error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 3. Update API Route

Modify your processing route to use Gemini:

```javascript
// server/routes/uploadRoute.js
import { extractInvoiceDataWithGemini } from '../services/geminiService.js';

router.post('/process-invoice', upload.single('pdf'), async (req, res) => {
  try {
    // Convert PDF to PNG (existing code)
    const imageBuffer = await convertPdfToPng(req.file.path);

    // Use Gemini for extraction
    const result = await extractInvoiceDataWithGemini(imageBuffer);

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

## Available Gemini Models

| Model | Best For | Context Window | Speed | Cost |
|-------|----------|----------------|-------|------|
| `gemini-2.0-flash-exp` | Fastest, latest | 1M tokens | Very Fast | Free (experimental) |
| `gemini-1.5-flash` | Production, fast tasks | 1M tokens | Fast | Low |
| `gemini-1.5-pro` | Complex analysis | 2M tokens | Medium | Medium |
| `gemini-1.0-pro-vision` | Legacy vision tasks | 30K tokens | Fast | Low |

**Recommendation**: Use `gemini-2.0-flash-exp` or `gemini-1.5-flash` for invoice processing.

---

## Advanced Features

### 1. Structured Output with Schema

```javascript
export async function extractWithSchema(imageBuffer) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          totalQuantity: { type: 'number' },
          totalPrice: { type: 'number' },
          supplierName: { type: 'string' },
          invoiceDate: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                quantity: { type: 'number' },
                price: { type: 'number' },
              },
            },
          },
        },
        required: ['totalQuantity', 'totalPrice', 'supplierName'],
      },
    },
  });

  // ... rest of the code
}
```

### 2. Batch Processing

```javascript
export async function processBatchWithGemini(images) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const results = await Promise.all(
    images.map(async (imageBuffer) => {
      try {
        return await extractInvoiceDataWithGemini(imageBuffer);
      } catch (error) {
        return { success: false, error: error.message };
      }
    })
  );

  return results;
}
```

### 3. Streaming Responses

```javascript
export async function extractWithStreaming(imageBuffer, onChunk) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = 'Extract invoice data...';
  const base64Image = imageBuffer.toString('base64');

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: 'image/png',
    },
  };

  const result = await model.generateContentStream([prompt, imagePart]);

  let fullText = '';

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    onChunk(chunkText);
  }

  return JSON.parse(fullText);
}
```

### 4. Multi-Page Invoice Processing

```javascript
export async function extractMultiPageInvoice(imageBuffers) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `Analyze these multi-page invoice images and extract:
  - Total Quantity across all pages
  - Final Total Price
  - Supplier Name

  Return JSON format with the consolidated data.`;

  const imageParts = imageBuffers.map((buffer) => ({
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: 'image/png',
    },
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;

  return JSON.parse(response.text());
}
```

---

## Error Handling

### Retry Logic with Exponential Backoff

```javascript
async function extractWithRetry(imageBuffer, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await extractInvoiceDataWithGemini(imageBuffer);
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const geminiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute (free tier limit)
  message: 'Too many requests, please try again later.',
});

router.post('/process-invoice', geminiLimiter, upload.single('pdf'), async (req, res) => {
  // ... handler code
});
```

---

## Testing

Test your Gemini integration:

```bash
# Test endpoint
curl -X POST http://localhost:5000/api/process-invoice \
  -F "pdf=@sample-invoice.pdf" \
  -H "Content-Type: multipart/form-data"
```

### Unit Test Example

```javascript
// server/tests/geminiService.test.js
import { extractInvoiceDataWithGemini } from '../services/geminiService.js';
import fs from 'fs';

describe('Gemini Service', () => {
  it('should extract invoice data correctly', async () => {
    const imageBuffer = fs.readFileSync('./test-invoice.png');
    const result = await extractInvoiceDataWithGemini(imageBuffer);

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('totalQuantity');
    expect(result.data).toHaveProperty('totalPrice');
    expect(result.data).toHaveProperty('supplierName');
  });
});
```

---

## Best Practices

1. **Image Quality**
   - Use clear, high-resolution images (300 DPI minimum)
   - Ensure good contrast and lighting
   - Convert PDFs at appropriate resolution (150-300 DPI)

2. **Prompt Engineering**
   - Be specific and clear in your instructions
   - Provide examples of expected output
   - Use structured output mode for consistent results

3. **Cost Optimization**
   - Use `gemini-2.0-flash-exp` for development (free)
   - Cache results for identical requests
   - Compress images while maintaining quality
   - Use `gemini-1.5-flash` for production (cost-effective)

4. **Error Handling**
   - Implement retry logic for transient errors
   - Handle rate limiting gracefully
   - Log errors for debugging
   - Validate responses before using

5. **Security**
   - Never expose API keys in frontend code
   - Use environment variables
   - Implement rate limiting
   - Validate and sanitize file uploads

---

## Performance Optimization

### Image Compression

```javascript
import sharp from 'sharp';

async function optimizeForGemini(imageBuffer) {
  return await sharp(imageBuffer)
    .resize(2048, 2048, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer();
}
```

### Caching Results

```javascript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

export async function extractWithCache(imageBuffer) {
  const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');

  const cached = cache.get(hash);
  if (cached) {
    return { success: true, data: cached, cached: true };
  }

  const result = await extractInvoiceDataWithGemini(imageBuffer);

  if (result.success) {
    cache.set(hash, result.data);
  }

  return result;
}
```

---

## Comparison: Gemini vs Other AI Models

| Feature | Gemini 2.0 Flash | OpenAI GPT-4V | Claude 3.5 |
|---------|------------------|---------------|------------|
| Speed | Fastest | Medium | Fast |
| Context Window | 1M tokens | 128K tokens | 200K tokens |
| Free Tier | Yes (15 RPM) | No | No |
| JSON Mode | Native | Function calling | Native |
| Multi-page | Excellent | Good | Excellent |
| Cost (per 1M tokens) | $0.075-$0.30 | $10-$30 | $3-$15 |

---

## Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Quickstart Guide](https://ai.google.dev/tutorials/node_quickstart)
- [Vision Examples](https://ai.google.dev/tutorials/vision_quickstart)
- [Pricing](https://ai.google.dev/pricing)
- [API Limits](https://ai.google.dev/gemini-api/docs/quota)

---

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify key is correct in `.env`
   - Check API key is enabled in Google AI Studio

2. **Rate Limit Exceeded**
   - Free tier: 15 requests/minute
   - Implement rate limiting in your app
   - Consider upgrading to paid tier

3. **Image Format Not Supported**
   - Convert to PNG or JPEG
   - Ensure proper MIME type

4. **Poor Extraction Quality**
   - Improve image quality
   - Adjust prompt for better instructions
   - Try using `gemini-1.5-pro` for complex invoices

---

## Support

For issues or questions:
- [Google AI Forum](https://discuss.ai.google.dev/)
- [GitHub Issues](https://github.com/google/generative-ai-js/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-gemini)

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function validateProofImage(imagePath, requirement) {
  const absolutePath = path.resolve(imagePath);
  const imageBuffer = fs.readFileSync(absolutePath);
  const base64Image = imageBuffer.toString('base64');

  const ext = path.extname(imagePath).toLowerCase();
  const mediaTypeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
  const mediaType = mediaTypeMap[ext] || 'image/jpeg';

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${base64Image}` },
          },
          {
            type: 'text',
            text: `You are validating a proof photo for an eco-friendly action app.

The user was required to submit: "${requirement}"

Respond ONLY in this exact JSON format, no other text:
{
  "passed": true or false,
  "confidence": 0.0 to 1.0,
  "detected_objects": ["object1", "object2"],
  "issue": "if failed, one sentence in this style: The image shows [what is visible], not [the required proof]. If passed, empty string",
  "expected": "if failed, rewrite the expected proof clearly. If passed, empty string"
}

Rules:
- Be strict but fair. If the image clearly matches the requirement, pass it.
- The proof may be a direct real camera photo of the required scene/object/action.
- For demo purposes, a real camera photo of a computer, phone, or tablet screen is allowed only if the screen shows a real photo matching the requirement.
- Reject cartoons, illustrations, drawings, icons, rendered images, AI-generated images, stock illustrations, or obviously edited graphics.
- If the image is cartoon/illustration/rendered/AI-style, set passed to false even if it visually matches the requirement.
- If failed, do not only say the image does not meet the requirement.
- If failed, first describe the main visible subject in the photo, then say why it is not the required proof.
- Keep issue under 18 words.
- Do not include "Expected:" inside issue because expected has its own JSON field.
- The expected field should be concise and start with the required proof/action.

Good failed examples:
- requirement: "Photo inside the public transport"; image: calendar
  issue: "The image shows a calendar, not inside a public transport."
  expected: "Photo inside the public transport."
- requirement: "Photo taken inside a bus, train, or similar public transport"; image: office chair
  issue: "The image shows an office chair, not inside public transport."
  expected: "Photo taken inside a bus, train, or similar public transport."
- requirement: "Photo of a bucket of reused water"; image: cartoon bucket
  issue: "The image shows a cartoon bucket, not acceptable proof."
  expected: "Photo of a bucket of reused water."
- requirement: "Photo inside the public transport"; image: illustrated bus interior
  issue: "The image shows an illustrated bus interior, not acceptable proof."
  expected: "Photo inside the public transport."
- requirement: "Photo inside the public transport"; image: camera photo of a laptop screen showing a real bus interior photo
  passed: true`,
          },
        ],
      },
    ],
  });

  const text = response.choices[0].message.content.trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

module.exports = { validateProofImage };

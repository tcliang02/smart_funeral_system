# DeepSeek Fine-tuning Guide (OpenAI-compatible)

This guide shows how to upload the generated JSONL datasets and start a fine-tuning job on DeepSeek using OpenAI-style endpoints.

## Prerequisites
- DeepSeek API key
- Confirm the API base URL (default: https://api.deepseek.com)
- JSONL files already generated:
  - `backend/datasets-jsonl/*.openai-chat.jsonl` (chat messages)
  - `backend/datasets-jsonl/*.generic.jsonl` (prompt/completion style)

## Environment Setup (Windows PowerShell)
```powershell
# Required
$env:DEEPSEEK_API_KEY = "sk-..."

# Optional (only if your account has a custom base)
$env:DEEPSEEK_API_BASE = "https://api.deepseek.com"
```

## Choose the Format
- If DeepSeek expects Chat (messages) format:
  - Use `*.openai-chat.jsonl`
  - Each line has: `{ "messages": [ {"role":"system"?}, {"role":"user"}, {"role":"assistant"} ] }`
  - You can toggle including the system message with the converter flag `--include-system=false`
- If DeepSeek expects Prompt/Completion format:
  - Use `*.generic.jsonl`
  - Each line has: `{ "instruction":"...", "response":"..." }`

## Convert/Regenerate JSONL (Optional)
```powershell
# Include system message (default)
c:\xampp\php\php.exe backend\scripts\convert_to_jsonl.php --dataset=all --format=openai-chat

# Exclude system message (if DeepSeek doc prefers only user/assistant)
c:\xampp\php\php.exe backend\scripts\convert_to_jsonl.php --dataset=all --format=openai-chat --include-system=false

# Generic prompt/completion
c:\xampp\php\php.exe backend\scripts\convert_to_jsonl.php --dataset=all --format=generic
```

## Validate JSONL Before Upload
```powershell
c:\xampp\php\php.exe backend\scripts\validate_jsonl.php --dir=backend\datasets-jsonl
```
Expected: each file shows `✅ VALID`.

## Start a Fine-tuning Job
```powershell
# Example: Grief Counselor (chat format with system)
c:\xampp\php\php.exe backend\scripts\deepseek_finetune.php `
  --file=backend\datasets-jsonl\grief_counselor.openai-chat.jsonl `
  --model=deepseek-chat `
  --suffix=grief-v1 `
  --poll=true
```

Replace `--model` with your base model id (e.g., `deepseek-chat`, `deepseek-coder`, etc., per DeepSeek docs).

### Notes
- Upload endpoint: `POST /v1/files` (multipart, `purpose=fine-tune`)
- Create job: `POST /v1/fine_tuning/jobs`
- Poll job: `GET /v1/fine_tuning/jobs/{id}`

The script saves job JSON outputs in `backend/fine-tune-jobs/`:
- `*_job_created.json` — response when the job is created
- `*_job_final.json` — final status when polling completes

## Testing After Fine-tune
Once DeepSeek returns a fine-tuned model id, update your chatbot config to use it:
- In your PHP where you call the API, set `model` to the fine-tuned id
- Keep temperature/other settings from `ai_prompts*.json`

## Troubleshooting
- `401 Unauthorized`: Ensure `$env:DEEPSEEK_API_KEY` is set in the same shell session
- `400 Bad Request`: Check JSONL validity; ensure correct format (openai-chat or generic)
- `413 Payload Too Large`: Split the dataset and train in batches; or compress if provider supports it
- `Rate limit`: Retry with backoff or poll less frequently

## Tips
- Start with one dataset (e.g., Website Helper) to verify pipeline
- Use `--limit=50` during conversion to make a smaller pilot file
- Keep JSON as your master; regenerate JSONL anytime with the converter

---

If you paste a sample from DeepSeek’s docs, I can tune the converter to match their exact schema (field names, roles, optional metadata) in seconds.

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import sys
import json

def get_response(input_text):
    model_name = "facebook/blenderbot-400M-distill"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    inputs = tokenizer([input_text], return_tensors='pt')
    reply_ids = model.generate(**inputs)
    response = tokenizer.batch_decode(reply_ids, skip_special_tokens=True)[0]
    return response

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    input_text = input_data.get('text', '')
    response = get_response(input_text)
    print(json.dumps({'response': response}))

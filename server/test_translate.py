from transformers import MarianTokenizer, MarianMTModel

def translate(text, target_lang):
    model_name_map = {
        'en': 'Helsinki-NLP/opus-mt-fr-en',  # French to English
    }

    if target_lang not in model_name_map:
        raise ValueError(f"Unsupported target language: {target_lang}")

    model_name = model_name_map[target_lang]
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)

    translated = model.generate(**tokenizer(text, return_tensors="pt", padding=True))
    translated_text = [tokenizer.decode(t, skip_special_tokens=True) for t in translated]
    return translated_text[0]

if __name__ == "__main__":
    text = "je suis fatigué j'ai faim"
    target_lang = "en"
    translated_text = translate(text, target_lang)
    print(f"Translated text: {translated_text}")

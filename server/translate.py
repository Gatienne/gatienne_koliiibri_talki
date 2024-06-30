import os
from transformers import MarianTokenizer, MarianMTModel
import sys
import json

# Désactiver l'avertissement de symlink
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

def translate(text, source_lang, target_lang):
    lang_map = {
        'en-US': 'en',
        'en-GB': 'en',
        'fr-FR': 'fr',
        'es-ES': 'es',
        'de-DE': 'de'
    }

    source_lang = lang_map.get(source_lang, source_lang)
    target_lang = lang_map.get(target_lang, target_lang)

    model_name_map = {
        ('en', 'de'): 'Helsinki-NLP/opus-mt-en-de',
        ('fr', 'de'): 'Helsinki-NLP/opus-mt-fr-de',
        ('es', 'de'): 'Helsinki-NLP/opus-mt-es-de',
        ('de', 'en'): 'Helsinki-NLP/opus-mt-de-en',
        ('de', 'fr'): 'Helsinki-NLP/opus-mt-de-fr',
        ('de', 'es'): 'Helsinki-NLP/opus-mt-de-es',
        # Ajouter d'autres correspondances si nécessaire
    }

    model_name = model_name_map.get((source_lang, target_lang))
    if not model_name:
        raise ValueError(f"Unsupported language pair: {source_lang} to {target_lang}")

    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)

    translated = model.generate(**tokenizer(text, return_tensors="pt", padding=True))
    translated_text = [tokenizer.decode(t, skip_special_tokens=True) for t in translated]
    return translated_text[0]

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read())
        text = input_data.get('text')
        source_lang = input_data.get('source_lang')
        target_lang = input_data.get('target_lang')

        if not text or not source_lang or not target_lang:
            print(f"Error: Missing 'text', 'source_lang', or 'target_lang' in input data", file=sys.stderr)
            sys.exit(1)

        translated_text = translate(text, source_lang, target_lang)
        print(json.dumps({'translation': translated_text}))
    except Exception as e:
        print(f"Error during translation: {str(e)}", file=sys.stderr)
        sys.exit(1)

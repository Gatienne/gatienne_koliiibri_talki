from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

def get_response(input_text):
    model_name = "facebook/blenderbot-400M-distill"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    inputs = tokenizer([input_text], return_tensors='pt')
    reply_ids = model.generate(**inputs)
    response = tokenizer.batch_decode(reply_ids, skip_special_tokens=True)[0]
    return response

def test_responses():
    test_messages = [
        "Hello, how are you?",
        "What's the weather like today?",
        "Tell me a joke.",
        "Who is the president of the United States?",
        "What is the capital of France?",
        "Bonjour, comment tu vas?",
        "Quel temps fait-il aujourd'hui?",
        "Raconte moi une blague",
        "Qui est le président des états unis?",
        "Quelle est la capitale de la france?"
    ]

    for message in test_messages:
        response = get_response(message)
        print(f"User: {message}")
        print(f"Bot: {response}\n")

if __name__ == "__main__":
    test_responses()

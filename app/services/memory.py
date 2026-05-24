from collections import defaultdict


conversation_memory = defaultdict(list)


def save_message(session_id, role, content):

    conversation_memory[session_id].append({
        "role": role,
        "content": content
    })


def get_conversation_history(session_id):

    messages = conversation_memory.get(
        session_id,
        []
    )

    formatted_history = []

    for msg in messages:

        formatted_history.append(
            f"{msg['role'].upper()}: {msg['content']}"
        )

    return "\n".join(formatted_history)


def clear_conversation(session_id):

    conversation_memory[session_id] = []
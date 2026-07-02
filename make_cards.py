import json
import os
import textwrap

# === INPUT SECTION ===
name = input("Enter card name\n> ")
print("\nEnter card type")
print("1. Mothership")
print("2. Troop")
print("3. Structure")
print("4. Sorcery")
card_type = input("> ")

print("\nEnter tribe")
print("1. Arachnid")
print("2. Wraith")
print("3. Fungi")
print("4. Swarmkin")
print("5. Doppelganger")
print("6. Specter")
print("7. Eye")
print("8. Parasite")
tribe = input("> ")

tribe_dict = {
    "1": "arachnid",
    "2": "wraith",
    "3": "fungi",
    "4": "swarmkin",
    "5": "doppelganger",
    "6": "specter",
    "7": "eye",
    "8": "parasite"
}
tribe = tribe_dict.get(tribe, "unknown")

flavor = input("\nEnter flavor text\n> ")

json_data = {}
rank = ""

# === CARD TYPE HANDLING ===
if card_type == "1":  # Mothership
    vitality = input("\nEnter vitality\n> ")
    core_effect = input("\nEnter core effect\n> ")
    control_effect = input("\nEnter control effect\n> ")
    energy_effect = input("\nEnter energy effect\n> ")
    json_data = {
        "name": name,
        "tribe": tribe,
        "type": "mothership",
        "core vitality": vitality,
        "core effect": core_effect,
        "control effect": control_effect,
        "energy effect": energy_effect,
        "flavor": flavor
    }

elif card_type == "2":  # Troop
    health = input("\nEnter health\n> ")
    attack = input("\nEnter attack\n> ")
    text = input("\nEnter description text\n> ")

    print("\nEnter rank")
    print("1. Soldier")
    print("2. Sergeant")
    print("3. Captain")
    print("4. General")
    rank = input("> ")
    rank_dict = {"1": "Soldier", "2": "Sergeant", "3": "Captain", "4": "General"}
    rank = rank_dict.get(rank, "Soldier")

    json_data = {
        "name": name,
        "type": "troop",
        "tribe": tribe,
        "health": health,
        "attack": attack,
        "text": text,
        "rank": rank,
        "flavor": flavor
    }

elif card_type == "3":  # Structure
    text = input("\nEnter description text\n> ")
    print("\nEnter rank")
    print("1. Soldier")
    print("2. Sergeant")
    print("3. Captain")
    print("4. General")
    rank = input("> ")
    rank_dict = {"1": "Soldier", "2": "Sergeant", "3": "Captain", "4": "General"}
    rank = rank_dict.get(rank, "Soldier")

    json_data = {
        "name": name,
        "type": "structure",
        "tribe": tribe,
        "rank": rank,
        "text": text,
        "flavor": flavor
    }

elif card_type == "4":  # Sorcery
    text = input("\nEnter description text\n> ")
    print("\nEnter rank")
    print("1. Soldier")
    print("2. Sergeant")
    print("3. Captain")
    print("4. General")
    rank = input("> ")
    rank_dict = {"1": "Soldier", "2": "Sergeant", "3": "Captain", "4": "General"}
    rank = rank_dict.get(rank, "Soldier")

    json_data = {
        "name": name,
        "type": "sorcery",
        "tribe": tribe,
        "rank": rank,
        "text": text,
        "flavor": flavor
    }

# === PATHS ===
name_safe = name.replace(" ", "_")
base_dir = "/home/undefined/decay_within/cards"
card_path = f"{base_dir}/{tribe}/{name_safe}.json"
svg_path = f"{base_dir}/{tribe}/{name_safe}.svg"
template_path = f"/home/undefined/decay_within/templates/{tribe}.svg"

os.makedirs(os.path.dirname(card_path), exist_ok=True)

# === WRITE JSON ===
with open(card_path, "w") as f:
    json.dump(json_data, f, indent=4)

# === COPY SVG TEMPLATE ===
os.system(f"cp '{template_path}' '{svg_path}'")

# === TEXT WRAPPING HELPERS ===
def wrap_text(text, max_chars, max_lines):
    """Wrap text to fit within given width and line count."""
    if not text:
        return [""] * max_lines
    wrapped = textwrap.wrap(text, width=max_chars)
    wrapped = wrapped[:max_lines]
    while len(wrapped) < max_lines:
        wrapped.append("")
    return wrapped

# === LOAD SVG TEMPLATE ===
with open(svg_path, "r") as f:
    svg_data = f.read()

# === PREPARE TEXT DATA ===
desc_lines = wrap_text(json_data.get("text", ""), max_chars=18, max_lines=6)
flav_lines = wrap_text(json_data.get("flavor", ""), max_chars=18, max_lines=2)

# For Sorcery/Structure, rename and hide stats
display_name = json_data.get("name", "")
display_attack = json_data.get("attack", "")
display_health = json_data.get("health", "")

if json_data.get("type") in ["sorcery", "structure"]:
    display_attack = ""
    display_health = ""
    rank_title = json_data.get("rank", "Soldier")
    display_name = f"{rank_title}'s {json_data.get('type').capitalize()}"

# === REPLACEMENTS ===
replacements = {
    "_cardname_": display_name,
    "_attack_": display_attack,
    "_health_": display_health,
    "_rank_": json_data.get("rank", ""),
    "_desc1_": desc_lines[0],
    "_desc2_": desc_lines[1],
    "_desc3_": desc_lines[2],
    "_desc4_": desc_lines[3],
    "_desc5_": desc_lines[4],
    "_desc6_": desc_lines[5],
    "_flav1_": flav_lines[0],
    "_flav2_": flav_lines[1],
}

# === APPLY REPLACEMENTS ===
for key, value in replacements.items():
    svg_data = svg_data.replace(key, value if value else "")

# === SAVE UPDATED SVG ===
with open(svg_path, "w") as f:
    f.write(svg_data)

print(f"\n✅ JSON saved at: {card_path}")
print(f"✅ SVG generated at: {svg_path}")


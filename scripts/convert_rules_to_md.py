import yaml
from pathlib import Path
import os
from attackcti import attack_client
import base64
import os, shutil

TEMPLATE = """---
title: '[sigma.title]'
subtitle: 'Detection Rules'
---

<!--suppress ES6UnusedImports -->

# [sigma.title]

<div>
    <Badge  type="info" text="ID: [sigma.id]" style="margin-top: 10px;"/>  <Badge  type="[sigma.status_button]" text="Status: [sigma.status_content]" style="margin-top: 10px;"/>  <Badge  type="[sigma.level_button]" text="Level: [sigma.level_content]" style="margin-top: 10px;"/>
</div>

[sigma.description]

## Author(s)

[sigma.author]
## Logsource

[sigma.logsource]
## Sigma Rule [🔄](https://sigconverter.io/#rule=[sigma.encoded])

```yml
[sigma.sigma_rule]
```

## Reference(s)

[sigma.references]
## False Positives

[sigma.falsepositives]
## Tags

[sigma.tags]
"""

path_to_rules = [
    "sigma/rules",
    "sigma/rules-emerging-threats",
    # "sigma/rules-placeholder",
    "sigma/rules-threat-hunting",
    # "sigma/rules-compliance",
]


def delete_previous_content(folder):
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print("Failed to delete %s. Reason: %s" % (file_path, e))


def yield_next_rule_file_path(path_to_rules: list) -> str:
    for path_ in path_to_rules:
        for root, _, files in os.walk(path_):
            for file in files:
                if file.endswith(".yml"):
                    yield os.path.join(root, file)


def get_rule_part(file_path: str, part_name: str):
    yaml_dicts = get_rule_yaml(file_path)
    for yaml_part in yaml_dicts:
        if part_name in yaml_part.keys():
            return yaml_part[part_name]

    return None


def get_rule_yaml(file_path: str) -> dict:
    data = []

    with open(file_path, encoding="utf-8") as f:
        yaml_parts = yaml.safe_load_all(f)
        for part in yaml_parts:
            data.append(part)

    return data


def status_button_handler(status):
    if status == "experimental":
        status = "tip"
    elif status == "test":
        status = "tip"
    elif status == "stable":
        status = "tip"
    else:
        status = "info"

    return status


def level_button_handler(level):
    if level == "informational":
        level = "info"
    elif level == "low":
        level = "tip"
    elif level == "medium":
        level = "warning"
    elif level == "high":
        level = "danger"
    elif level == "critical":
        level = "danger"

    return level


def tags_handler(tags):
    if tags == "N/A":
        return tags
    else:
        tags_text = ""
        mitre_tags = []
        cve_tags = []
        for tag in tags:
            if tag.startswith("attack."):
                mitre_tags.append(tag)
            elif tag.startswith("cve."):
                cve_tags.append(tag)

        if mitre_tags:
            attack_text = "### MITRE ATT&CK\n\n"
            attack_text += "|ID|Technique|Tactic|\n"
            attack_text += "|-|-|-|\n"
            for tag in mitre_tags:
                if tag.startswith("attack.t"):
                    attack_text += f"|[T{tag.replace('attack.t', '')}]()|TBD|TBD|\n"
            tags_text += attack_text

        # Adds another section for CVE tags handling

        return tags_text


def logsource_handler(logsource):
    logsource_text = ""

    for key, values in logsource.items():
        logsource_text += f"- **{key.capitalize()}**: {values}\n"

    return logsource_text


def detection_type_tag_handler(tags):
    pass


def get_data(path_to_rules):
    data = {}

    for file in yield_next_rule_file_path(path_to_rules):
        title = get_rule_part(file_path=file, part_name="title")
        id = get_rule_part(file_path=file, part_name="id")
        status = get_rule_part(file_path=file, part_name="status")
        description = get_rule_part(file_path=file, part_name="description")

        references = get_rule_part(file_path=file, part_name="references")
        if not references:
            references = ["N/A"]

        author = get_rule_part(file_path=file, part_name="author")
        logsource = get_rule_part(file_path=file, part_name="logsource")
        level = get_rule_part(file_path=file, part_name="level")

        tags = get_rule_part(file_path=file, part_name="tags")
        if not tags:
            tags = "N/A"

        falsepositives = get_rule_part(file_path=file, part_name="falsepositives")
        if not falsepositives:
            falsepositives = ["N/A"]

        with open(file, "r", encoding="utf-8") as fh:
            file_content = fh.read()
            encoded_file_content = base64.b64encode(file_content.encode("utf-8"))

        tmp_ = {
            "title": title,
            "id": id,
            "status": status,
            "description": description,
            "references": references,
            "author": author,
            "logsource": logsource,
            "level": level,
            "tags": tags,
            "falsepositives": falsepositives,
            "sigma_rule": file_content,
            "encoded_sigma_rule": encoded_file_content,
        }

        data[
            file.replace(".yml", ".md")
            .replace("rules\\", "detection/")
            .replace("rules/", "detection/")
            .replace("rules-emerging-threats", "emerging-threats/")
            .replace("rules-threat-hunting", "threat-hunting/")
            .replace("sigma/", "rules/")
        ] = tmp_

        print(f"[*] Generating data for {file}")

    return data


def create_dir(path):
    fpath = Path(path)
    fpath.parent.mkdir(exist_ok=True, parents=True)


def gen_index_list(data):
    detection = {}
    threat_hunting = {}
    emerging_threat = {}

    for key, values in data.items():
        if "detection/" in key:
            detection[key] = values["title"]
        elif "emerging-threats" in key:
            emerging_threat[key] = values["title"]
        elif "threat-hunting" in key:
            threat_hunting[key] = values["title"]

    with open("rules/detection/index.md", "w") as f:
        f.write("---\n")
        f.write("title: 'Detection Rules Index'\n")
        f.write("subtitle: 'Detection'\n")
        f.write("---\n\n")
        f.write("# \{\{ $frontmatter.title \}\}\n\n")
        for key, values in detection.items():
            f.write(f"- [{values}]({key})\n")

    with open("rules/emerging-threats/index.md", "w") as f:
        f.write("---\n")
        f.write("title: 'Emerging Threat Rules Index'\n")
        f.write("subtitle: 'Detection'\n")
        f.write("---\n\n")
        f.write("# \{\{ $frontmatter.title \}\}\n\n")
        for key, values in emerging_threat.items():
            f.write(f"- [{values}]({key})\n")

    with open("rules/threat-hunting/index.md", "w") as f:
        f.write("---\n")
        f.write("title: 'Threat Hunting Rules Index'\n")
        f.write("subtitle: 'Detection'\n")
        f.write("---\n\n")
        f.write("# \{\{ $frontmatter.title \}\}\n\n")
        for key, values in threat_hunting.items():
            f.write(f"- [{values}]({key})\n")


def gen_markdown(data, template):
    for key, values in data.items():
        print(f"[*] Generating markdown for {key}")

        create_dir(key)
        f = open(key, "w", encoding="utf-8")

        # Sigma Title
        template = template.replace("[sigma.title]", values["title"])

        # Sigma Id
        template = template.replace("[sigma.id]", values["id"])

        # Sigma Status
        template = template.replace(
            "[sigma.status_content]", values["status"].capitalize()
        )
        template = template.replace(
            "[sigma.status_button]", status_button_handler(values["status"])
        )
        # Sigma Level
        template = template.replace(
            "[sigma.level_content]", values["level"].capitalize()
        )
        template = template.replace(
            "[sigma.level_button]", level_button_handler(values["level"])
        )
        # Description
        template = template.replace("[sigma.description]", values["description"])

        # Authors
        authors_str = ""
        for author in values["author"].split(","):
            authors_str += "- " + author.lstrip() + "\n"

        template = template.replace("[sigma.author]", authors_str)

        # False Positives
        falsepositives_str = ""
        for falsepositive in values["falsepositives"]:
            falsepositives_str += "- " + falsepositive + "\n"

        template = template.replace("[sigma.falsepositives]", falsepositives_str)

        # References Positives
        references_str = ""
        for reference in values["references"]:
            references_str += "- " + reference + "\n"

        template = template.replace("[sigma.references]", references_str)

        # Detection
        template = template.replace("[sigma.sigma_rule]", values["sigma_rule"])

        # Sigconverter link
        template = template.replace(
            "[sigma.encoded]", values["encoded_sigma_rule"].decode("utf-8")
        )

        # Tags
        template = template.replace("[sigma.tags]", tags_handler(values["tags"]))

        # Logsource
        template = template.replace(
            "[sigma.logsource]", logsource_handler(values["logsource"])
        )

        f.write(template)

        f.close()


if __name__ == "__main__":
    # Delete previous content to avoid duplicate and rename of rules
    delete_previous_content("rules/detection")
    delete_previous_content("rules/emerging-threats")
    delete_previous_content("rules/threat-hunting")

    data = get_data(path_to_rules)

    gen_index_list(data)
    gen_markdown(data, TEMPLATE)

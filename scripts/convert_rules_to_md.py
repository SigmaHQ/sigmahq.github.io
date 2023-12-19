import yaml
from pathlib import Path
import os
from attackcti import attack_client
import base64
import os, shutil

TEMPLATE = """---
title: [sigma.id]
subtitle: [sigma.title]
---

<!--suppress ES6UnusedImports -->

# [sigma.title]

<div>
    <Badge  type="info" text="[sigma.id]" style="margin-top: 10px;"/>  <Badge  type="[sigma.status_button]" text="Status: [sigma.status_content]" style="margin-top: 10px;"/>  <Badge  type="[sigma.level_button]" text="Level: [sigma.level_content]" style="margin-top: 10px;"/>
</div>

[sigma.description]

## Author(s)

[sigma.author]
## Logsource

[sigma.logsource]
## Sigma Rule <a href="https://sigconverter.io/#rule=[sigma.encoded]" style="text-decoration:none" target="_blank">🔄</a>

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

    windows_link = "https://github.com/SigmaHQ/sigma-specification/blob/main/Taxonomy_specification.md#windows-folder"
    linux_link = "https://github.com/SigmaHQ/sigma-specification/blob/main/Taxonomy_specification.md#linux-folder"
    macos_link = "https://github.com/SigmaHQ/sigma-specification/blob/main/Taxonomy_specification.md#macos-folder"
    category_link = "https://github.com/SigmaHQ/sigma-specification/blob/main/Taxonomy_specification.md#category-folder"

    for key, values in logsource.items():
        if values == "windows":
            logsource_text += f"- **{key.capitalize()}**: [{values}]({windows_link})\n"
        elif values == "linux":
            logsource_text += f"- **{key.capitalize()}**: [{values}]({linux_link})\n"
        elif values == "macos":
            logsource_text += f"- **{key.capitalize()}**: [{values}]({macos_link})\n"
        elif values == "database" or values == "antivirus":
            logsource_text += f"- **{key.capitalize()}**: [{values}]({category_link})\n"
        else:
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

        if "emerging-threat" in file:
            data["rules/emerging-threats/" + id + ".md"] = tmp_
        elif "threat-hunting" in file:
            data["rules/threat-hunting/" + id + ".md"] = tmp_
        else:
            data["rules/detection/" + id + ".md"] = tmp_

        print(f"[*] Generating data for {file}")

    return data


def create_dir(path):
    fpath = Path(path)
    fpath.parent.mkdir(exist_ok=True, parents=True)


# This function create the index file needed to list the rules
def create_index_files(file_path, data_dict, title, subtitle):
    with open(file_path, "w") as f:
        f.write("---\n")
        f.write(f"title: '{title}'\n")
        f.write(f"subtitle: '{subtitle}'\n")
        f.write("---\n\n")
        f.write("# \{\{ $frontmatter.title \}\}\n\n")
        f.write("|Id|Title|\n")
        f.write("|-|-|\n")
        for key, values in data_dict.items():
            f.write(f"[{key}]({key})|[{values}]({key})|\n")


# This function generates the files and call the index creator
def gen_index_list(data):
    detection = {}
    threat_hunting = {}
    emerging_threat = {}

    for key, values in data.items():
        key = key.replace(".md", "")
        if key.startswith("rules/detection"):
            detection[values["id"]] = values["title"]
        elif key.startswith("rules/emerging-threats"):
            emerging_threat[values["id"]] = values["title"]
        elif key.startswith("rules/threat-hunting"):
            threat_hunting[values["id"]] = values["title"]

    create_index_files(
        "rules/detection/index.md", detection, "Detection Rules", "Detection"
    )
    create_index_files(
        "rules/emerging-threats/index.md",
        emerging_threat,
        "Emerging Threat Rules",
        "Detection",
    )
    create_index_files(
        "rules/threat-hunting/index.md",
        threat_hunting,
        "Threat Hunting Rules",
        "Detection",
    )


def gen_markdown(data, template):
    for key, values in data.items():
        template_ = template
        print(f"[*] Generating markdown for {key}")

        create_dir(key)

        with open(key, "w", encoding="utf-8") as f:
            # Sigma Title
            template_ = template_.replace("[sigma.title]", values["title"])

            # Sigma Id
            template_ = template_.replace("[sigma.id]", values["id"])

            # Sigma Status
            template_ = template_.replace(
                "[sigma.status_content]", values["status"].capitalize()
            )
            template_ = template_.replace(
                "[sigma.status_button]", status_button_handler(values["status"])
            )
            # Sigma Level
            template_ = template_.replace(
                "[sigma.level_content]", values["level"].capitalize()
            )
            template_ = template_.replace(
                "[sigma.level_button]", level_button_handler(values["level"])
            )
            # Description
            template_ = template_.replace("[sigma.description]", values["description"])

            # Authors
            authors_str = ""
            for author in values["author"].split(","):
                authors_str += "- " + author.lstrip() + "\n"

            template_ = template_.replace("[sigma.author]", authors_str)

            # False Positives
            falsepositives_str = ""
            for falsepositive in values["falsepositives"]:
                falsepositives_str += "- " + falsepositive + "\n"

            template_ = template_.replace("[sigma.falsepositives]", falsepositives_str)

            # References Positives
            references_str = ""
            for reference in values["references"]:
                references_str += "- " + reference + "\n"

            template_ = template_.replace("[sigma.references]", references_str)

            # Detection
            template_ = template_.replace("[sigma.sigma_rule]", values["sigma_rule"])

            # Sigconverter link
            template_ = template_.replace(
                "[sigma.encoded]", values["encoded_sigma_rule"].decode("utf-8")
            )

            # Tags
            template_ = template_.replace("[sigma.tags]", tags_handler(values["tags"]))

            # Logsource
            template_ = template_.replace(
                "[sigma.logsource]", logsource_handler(values["logsource"])
            )

            f.write(template_)


if __name__ == "__main__":
    # Delete previous content to avoid duplicate and rename of rules
    delete_previous_content("rules/detection")
    delete_previous_content("rules/emerging-threats")
    delete_previous_content("rules/threat-hunting")

    data = get_data(path_to_rules)

    gen_index_list(data)
    gen_markdown(data, TEMPLATE)

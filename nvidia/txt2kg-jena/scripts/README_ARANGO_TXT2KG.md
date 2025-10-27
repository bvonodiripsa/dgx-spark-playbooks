# ArangoDB TXT2KG Integration

This script modifies the original PyTorch Geometric TXT2KG example to use ArangoDB as a data source for knowledge graph triples instead of generating them with TXT2KG.

## Prerequisites

- Python 3.8+
- ArangoDB running (can be set up using the provided docker-compose.yml)
- PyTorch and PyTorch Geometric installed
- All dependencies listed in requirements.txt

## Installation

1. Install the required dependencies:

```bash
pip install -r requirements.txt
```

2. Ensure ArangoDB is running. You can use the docker-compose file:

```bash
docker-compose up -d arangodb arangodb-init
```

## Usage

### Loading data from ArangoDB

Run the script with the `--use_arango` flag to load triples from ArangoDB instead of generating them with TXT2KG:

```bash
python arangodb_txt2kg.py --use_arango
```

The script will connect to ArangoDB using the default settings from docker-compose.yml:
- URL: http://localhost:8529
- Database: txt2kg
- No auth (username and password are empty)

### Custom ArangoDB Connection

You can specify custom ArangoDB connection parameters:

```bash
python arangodb_txt2kg.py --use_arango --arango_url "http://localhost:8529" --arango_db "your_db" --arango_user "username" --arango_password "password"
```

### Using TXT2KG (original behavior)

If you don't pass the `--use_arango` flag, the script will use the original TXT2KG approach:

```bash
python arangodb_txt2kg.py --NV_NIM_KEY "your-nvidia-api-key"
```

## Expected Data Format in ArangoDB

The script expects ArangoDB to have:

1. A document collection named `entities` containing nodes with a `name` property
2. An edge collection named `relationships` where:
   - Edges have a `type` property (the predicate/relationship type)
   - Edges connect from and to entities in the `entities` collection

## How It Works

1. The script connects to ArangoDB and queries all triples in the format "subject predicate object"
2. It uses these triples to create a knowledge graph
3. The rest of the workflow remains the same as the original TXT2KG example:
   - A SentenceTransformer model embeds the triples
   - A RAGQueryLoader processes queries using the graph
   - The model is trained and evaluated

## Limitations

- The script assumes that your ArangoDB instance contains data in the format described above
- You need to have both question-answer pairs and corpus documents available
- Make sure your ArangoDB contains knowledge graph triples relevant to your corpus 
# @pipeworx/dblp

DBLP MCP — Computer Science bibliography (~7M publications, ~3M authors). No auth.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search_publications(query, format?, hits?, first?)`
- `search_authors(query, format?, hits?, first?)`
- `search_venues(query, format?, hits?, first?)`

## Data source

`https://dblp.org/search/` — public REST API, returns JSON via `format=json`.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "dblp": {
      "url": "https://gateway.pipeworx.io/dblp/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Dblp data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

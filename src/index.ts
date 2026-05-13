interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * DBLP MCP — Computer Science bibliography
 *
 * API docs: https://dblp.org/faq/13501473.html
 * Auth: none.
 *
 * Tools:
 * - search_publications: papers, articles, theses
 * - search_authors:      people
 * - search_venues:       conferences + journals
 */


const BASE = 'https://dblp.org/search';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_publications',
    description:
      'Search DBLP publications. Match by title / author / year / venue. Default page size 30, max 1000.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term — title / author / DOI / venue' },
        hits: { type: 'number', description: 'Results per page, 1-1000 (default 30)' },
        first: { type: 'number', description: '0-based offset (default 0)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_authors',
    description: 'Search DBLP authors by name. Returns canonical id, affiliation, ORCID when available.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Author name (full or partial)' },
        hits: { type: 'number', description: '1-1000 (default 30)' },
        first: { type: 'number', description: '0-based offset' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_venues',
    description: 'Search DBLP venues (conferences + journals).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Venue name or acronym (e.g. "ICLR", "Nature")' },
        hits: { type: 'number', description: '1-1000 (default 30)' },
        first: { type: 'number', description: '0-based offset' },
      },
      required: ['query'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const map: Record<string, string> = {
    search_publications: 'publ',
    search_authors: 'author',
    search_venues: 'venue',
  };
  const ep = map[name];
  if (!ep) throw new Error(`Unknown tool: ${name}`);
  const params = new URLSearchParams({
    q: reqStr(args, 'query', '"transformer"'),
    format: 'json',
    h: String(Math.min(1000, Math.max(1, (args.hits as number) ?? 30))),
    f: String(Math.max(0, (args.first as number) ?? 0)),
  });
  const url = `${BASE}/${ep}/api?${params}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'pipeworx-mcp-dblp/1.0 (+https://pipeworx.io)',
    },
  });
  if (res.status === 429) throw new Error('DBLP: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`DBLP error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;

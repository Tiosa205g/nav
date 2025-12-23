import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';

const app = express();
const corsOptions = {
    origin: true, // reflect request origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

const DATA_PATH = path.resolve(process.cwd(), 'data.json');

const DEFAULT_STATE = {
    categories: [
        { id: 'all', name: '全部链接', icon: 'LayoutGrid' },
        { id: 'dev', name: '开发工具', icon: 'Code' },
        { id: 'design', name: '设计灵感', icon: 'Palette' },
        { id: 'ai', name: '人工智能', icon: 'Cpu' },
        { id: 'social', name: '社交媒体', icon: 'Share2' }
    ],
    bookmarks: [
        {
            id: '1',
            title: 'GitHub',
            url: 'https://github.com',
            description: '全球领先的软件开发和版本控制平台。',
            category: 'dev',
            tags: ['编程', '开源', '社区']
        },
        {
            id: '2',
            title: 'Figma',
            url: 'https://figma.com',
            description: '跨平台的在线协作设计工具。',
            category: 'design',
            tags: ['设计', 'UI', 'UX']
        },
        {
            id: '3',
            title: 'Gemini AI',
            url: 'https://gemini.google.com',
            description: 'Google 开发的新一代多模态大模型。',
            category: 'ai',
            tags: ['AI', 'LLM', '谷歌']
        },
        {
            id: '4',
            title: 'Dribbble',
            url: 'https://dribbble.com',
            description: '发现全球顶尖的设计作品与创意灵感。',
            category: 'design',
            tags: ['视觉', '排版', '插画']
        }
    ],
    adminPassword: 'admin'
};

async function readState() {
    try {
        const buf = await fs.readFile(DATA_PATH, 'utf-8');
        return JSON.parse(buf);
    } catch (e) {
        // Seed default and persist
        await fs.writeFile(DATA_PATH, JSON.stringify(DEFAULT_STATE, null, 2), 'utf-8');
        return DEFAULT_STATE;
    }
}

async function writeState(state) {
    await fs.writeFile(DATA_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

app.get('/api/state', async (req, res) => {
    const state = await readState();
    res.json(state);
});

// Bookmarks CRUD
app.post('/api/bookmarks', async (req, res) => {
    const state = await readState();
    const b = req.body;
    const exists = state.bookmarks.findIndex(x => x.id === b.id);
    if (exists !== -1) {
        state.bookmarks[exists] = b;
    } else {
        state.bookmarks = [b, ...state.bookmarks];
    }
    await writeState(state);
    res.json({ bookmarks: state.bookmarks });
});

app.put('/api/bookmarks/:id', async (req, res) => {
    const state = await readState();
    const id = req.params.id;
    const b = req.body;
    const idx = state.bookmarks.findIndex(x => x.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    state.bookmarks[idx] = b;
    await writeState(state);
    res.json({ bookmarks: state.bookmarks });
});

app.delete('/api/bookmarks/:id', async (req, res) => {
    const state = await readState();
    const id = req.params.id;
    state.bookmarks = state.bookmarks.filter(x => x.id !== id);
    await writeState(state);
    res.json({ bookmarks: state.bookmarks });
});

// Categories
app.post('/api/categories', async (req, res) => {
    const state = await readState();
    const cat = req.body;
    if (cat.id === 'all') return res.status(400).json({ error: 'Cannot add all category' });
    if (state.categories.find(x => x.id === cat.id)) return res.status(409).json({ error: 'Category exists' });
    state.categories.push(cat);
    await writeState(state);
    res.json({ categories: state.categories });
});

app.delete('/api/categories/:id', async (req, res) => {
    const state = await readState();
    const id = req.params.id;
    if (id === 'all') return res.status(400).json({ error: 'Cannot delete all category' });
    state.categories = state.categories.filter(x => x.id !== id);
    // Remap affected bookmarks to 'all'
    state.bookmarks = state.bookmarks.map(b => (b.category === id ? { ...b, category: 'all' } : b));
    await writeState(state);
    res.json({ categories: state.categories, bookmarks: state.bookmarks });
});

// Password
app.put('/api/password', async (req, res) => {
    const state = await readState();
    const { password } = req.body;
    if (!password || typeof password !== 'string') return res.status(400).json({ error: 'Invalid password' });
    state.adminPassword = password;
    await writeState(state);
    res.json({ adminPassword: state.adminPassword });
});

// Export
app.get('/api/export', async (req, res) => {
    const state = await readState();
    res.json(state);
});

// Import: replace state
app.post('/api/import', async (req, res) => {
    const incoming = req.body;
    if (!incoming || !incoming.bookmarks || !incoming.categories || !incoming.adminPassword) {
        return res.status(400).json({ error: 'Invalid import payload' });
    }
    await writeState(incoming);
    res.json(incoming);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

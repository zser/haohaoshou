/**
 * 收哪儿 - 家庭物品存放记录应用
 * 本地存储版本
 */

// ============================================
// 数据存储
// ============================================

const STORAGE_KEYS = {
  ITEMS: 'where2put_items',
  LOCATIONS: 'where2put_locations',
  TAGS: 'where2put_tags',
  SETTINGS: 'where2put_settings'
};

// GitHub 同步相关 localStorage key（使用项目前缀避免与其他项目冲突）
const LS_TOKEN = 'haohaoshou-gh-token';
const LS_OWNER = 'haohaoshou-gh-owner';
const LS_REPO = 'haohaoshou-gh-repo';
const LS_SHA = 'haohaoshou-gh-sha';

// 默认数据
const DEFAULT_LOCATIONS = [
  { id: 'loc_1', name: '客厅', parentId: null, level: 1 },
  { id: 'loc_2', name: '电视柜抽屉', parentId: 'loc_1', level: 2 },
  { id: 'loc_3', name: '茶几柜子', parentId: 'loc_1', level: 2 },
  { id: 'loc_4', name: '卧室', parentId: null, level: 1 },
  { id: 'loc_5', name: '床头柜', parentId: 'loc_4', level: 2 },
  { id: 'loc_6', name: '衣柜', parentId: 'loc_4', level: 2 },
  { id: 'loc_7', name: '厨房', parentId: null, level: 1 },
  { id: 'loc_8', name: '橱柜', parentId: 'loc_7', level: 2 },
  { id: 'loc_9', name: '冰箱', parentId: 'loc_7', level: 2 },
  { id: 'loc_10', name: '书房', parentId: null, level: 1 },
  { id: 'loc_11', name: '书桌抽屉', parentId: 'loc_10', level: 2 },
  { id: 'loc_12', name: '卫生间', parentId: null, level: 1 },
  { id: 'loc_13', name: '浴室柜', parentId: 'loc_12', level: 2 }
];

const DEFAULT_TAGS = [
  { id: 'tag_1', name: '食品饮料', color: '#F59E0B', parentId: null },
  { id: 'tag_2', name: '清洁用品', color: '#10B981', parentId: null },
  { id: 'tag_3', name: '医药用品', color: '#EF4444', parentId: null },
  { id: 'tag_4', name: '工具五金', color: '#6B7280', parentId: null },
  { id: 'tag_5', name: '日常用品', color: '#8B5CF6', parentId: null },
  { id: 'tag_6', name: '衣物纺织', color: '#3B82F6', parentId: null },
  { id: 'tag_7', name: '文件证件', color: '#F97316', parentId: null },
  { id: 'tag_8', name: '儿童用品', color: '#EC4899', parentId: null }
];

const DEFAULT_ITEMS = [
  { id: 'item_1', name: '五号电池', quantity: 8, locationId: 'loc_11', tags: ['tag_4'], threshold: 4, remark: '南孚电池', updatedAt: Date.now() - 86400000 },
  { id: 'item_2', name: '净水器滤芯', quantity: 1, locationId: 'loc_13', tags: ['tag_5'], threshold: 2, remark: '记得买PP棉和活性炭', updatedAt: Date.now() - 3600000 },
  { id: 'item_3', name: '创可贴', quantity: 5, locationId: 'loc_5', tags: ['tag_3'], threshold: 3, remark: '', updatedAt: Date.now() - 172800000 },
  { id: 'item_4', name: '遥控器', quantity: 2, locationId: 'loc_3', tags: ['tag_6'], threshold: null, remark: '电视和机顶盒', updatedAt: Date.now() - 259200000 },
  { id: 'item_5', name: '洗洁精', quantity: 1, locationId: 'loc_8', tags: ['tag_2'], threshold: 1, remark: '立白柠檬味', updatedAt: Date.now() - 432000000 },
  { id: 'item_6', name: '签字笔', quantity: 3, locationId: 'loc_11', tags: ['tag_3'], threshold: 2, remark: '', updatedAt: Date.now() - 604800000 },
  { id: 'item_7', name: '布洛芬', quantity: 1, locationId: 'loc_5', tags: ['tag_4'], threshold: null, remark: '芬必得', updatedAt: Date.now() - 864000000 },
  { id: 'item_8', name: '零食', quantity: 6, locationId: 'loc_3', tags: ['tag_2'], threshold: 3, remark: '柜子第二层', updatedAt: Date.now() - 1209600000 },
  { id: 'item_9', name: '餐巾纸', quantity: 2, locationId: 'loc_8', tags: ['tag_6'], threshold: 1, remark: '清风抽纸', updatedAt: Date.now() - 2592000000 },
  { id: 'item_10', name: '乐高零件', quantity: 1, locationId: 'loc_6', tags: ['tag_7'], threshold: null, remark: '蓝色收纳盒', updatedAt: Date.now() - 5184000000 }
];

const DEFAULT_SETTINGS = {
  highlightMode: 'keyword'
};

// 全局库存提醒判断：供所有页面、补丁脚本和内联事件共用，避免作用域不一致导致 isLowStock 未定义。
window.isLowStock = function isLowStock(item) {
  if (!item) return false;
  return item.threshold !== null &&
    item.threshold !== undefined &&
    item.threshold !== '' &&
    Number(item.quantity) <= Number(item.threshold);
};

// 数据操作
function loadData(key, defaultData) {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('数据解析失败', e);
    }
  }
  return defaultData;
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getItems() {
  return loadData(STORAGE_KEYS.ITEMS, DEFAULT_ITEMS);
}

function saveItems(items) {
  saveData(STORAGE_KEYS.ITEMS, items);
  pushToGitHub();
}

function getLocations() {
  return loadData(STORAGE_KEYS.LOCATIONS, DEFAULT_LOCATIONS);
}

function saveLocations(locations) {
  saveData(STORAGE_KEYS.LOCATIONS, locations);
  pushToGitHub();
}

function getTags() {
  return loadData(STORAGE_KEYS.TAGS, DEFAULT_TAGS);
}

function saveTags(tags) {
  saveData(STORAGE_KEYS.TAGS, tags);
  pushToGitHub();
}

function getSettings() {
  return loadData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

function saveSettings(settings) {
  saveData(STORAGE_KEYS.SETTINGS, settings);
  pushToGitHub();
}

// ============================================
// GitHub 同步模块
// ============================================

let isSyncing = false;

function githubConfig() {
  return {
    token: localStorage.getItem(LS_TOKEN) || '',
    owner: localStorage.getItem(LS_OWNER) || '',
    repo: localStorage.getItem(LS_REPO) || ''
  };
}

function isConfigured() {
  const c = githubConfig();
  return c.token && c.owner && c.repo;
}

function updateSyncStatus(status) {
  const statusMap = {
    'unconfigured': { text: '未配置', color: '#9ca3af' },
    'syncing': { text: '同步中...', color: '#3b82f6' },
    'synced': { text: '已同步', color: '#22c55e' },
    'error': { text: '同步失败', color: '#ef4444' },
    'offline': { text: '离线', color: '#f59e0b' }
  };
  const s = statusMap[status] || statusMap['unconfigured'];
  const dot = document.getElementById('sync-status-dot');
  const text = document.getElementById('sync-status-text');
  if (dot) dot.style.background = s.color;
  if (text) text.textContent = s.text;
}

async function fetchFromGitHub() {
  const c = githubConfig();
  const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}/contents/data.json`, {
    headers: { Authorization: `token ${c.token}`, Accept: 'application/vnd.github.v3+json' }
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`GitHub API: ${res.status}`);
  }
  const data = await res.json();
  const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
  return { content, sha: data.sha };
}

async function saveToGitHub(data, sha) {
  const c = githubConfig();
  const body = {
    message: `Update data ${new Date().toISOString().slice(0, 10)}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))))
  };
  if (sha) body.sha = sha;
  const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}/contents/data.json`, {
    method: 'PUT',
    headers: { Authorization: `token ${c.token}`, Accept: 'application/vnd.github.v3+json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return await res.json();
}

async function pullFromGitHub(shouldShowToast = false) {
  if (!isConfigured()) { updateSyncStatus('unconfigured'); return; }
  try {
    updateSyncStatus('syncing');
    const result = await fetchFromGitHub();
    if (result) {
      const data = result.content;
      if (data.items) saveData(STORAGE_KEYS.ITEMS, data.items);
      if (data.locations) saveData(STORAGE_KEYS.LOCATIONS, data.locations);
      if (data.tags) saveData(STORAGE_KEYS.TAGS, data.tags);
      if (data.settings) saveData(STORAGE_KEYS.SETTINGS, data.settings);
      localStorage.setItem(LS_SHA, result.sha);
      updateSyncStatus('synced');
      updateLastSyncTime();
      if (shouldShowToast) showToast('拉取成功');
      if (typeof renderHome === 'function') renderHome();
    } else {
      updateSyncStatus('synced');
      if (shouldShowToast) showToast('远程暂无数据');
    }
  } catch (e) {
    updateSyncStatus('error');
    if (shouldShowToast) showToast('拉取失败: ' + e.message);
  }
}

async function pushToGitHub(shouldShowToast = false) {
  if (!isConfigured()) { updateSyncStatus('unconfigured'); return; }
  if (isSyncing) return;
  isSyncing = true;
  try {
    updateSyncStatus('syncing');
    let sha = localStorage.getItem(LS_SHA) || undefined;

    // 本地没有 SHA 时，先拉取远程获取最新 SHA，避免 422
    if (!sha) {
      const remote = await fetchFromGitHub();
      if (remote) {
        sha = remote.sha;
        localStorage.setItem(LS_SHA, sha);
      }
    }

    const data = {
      items: getItems(),
      locations: getLocations(),
      tags: getTags(),
      settings: getSettings(),
      updatedAt: new Date().toISOString()
    };
    const result = await saveToGitHub(data, sha);
    localStorage.setItem(LS_SHA, result.content.sha);
    updateSyncStatus('synced');
    updateLastSyncTime();
    if (shouldShowToast) showToast('推送成功');
  } catch (e) {
    // 兼容大小写，捕获 SHA 冲突错误后重试
    if (e.message && e.message.toLowerCase().includes('sha')) {
      try {
        const fresh = await fetchFromGitHub();
        if (fresh) {
          localStorage.setItem(LS_SHA, fresh.sha);
          const data = {
            items: getItems(),
            locations: getLocations(),
            tags: getTags(),
            settings: getSettings(),
            updatedAt: new Date().toISOString()
          };
          const result = await saveToGitHub(data, fresh.sha);
          localStorage.setItem(LS_SHA, result.content.sha);
          updateSyncStatus('synced');
          updateLastSyncTime();
          if (shouldShowToast) showToast('推送成功');
          return;
        }
      } catch (e2) { e = e2; }
    }
    updateSyncStatus('error');
    if (shouldShowToast) showToast('推送失败: ' + e.message);
  } finally {
    isSyncing = false;
  }
}

function updateLastSyncTime() {
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const el = document.getElementById('sync-last-time');
  if (el) el.textContent = timeStr;
  localStorage.setItem('last-sync-time', timeStr);
}

function loadLastSyncTime() {
  const saved = localStorage.getItem('last-sync-time');
  const el = document.getElementById('sync-last-time');
  if (saved && el) el.textContent = saved;
}

function saveSyncSettings() {
  const token = document.getElementById('settings-token').value.trim();
  const owner = document.getElementById('settings-owner').value.trim();
  const repo = document.getElementById('settings-repo').value.trim();
  if (!token || !owner || !repo) {
    showToast('请填写完整配置');
    return;
  }
  localStorage.setItem(LS_TOKEN, token);
  localStorage.setItem(LS_OWNER, owner);
  localStorage.setItem(LS_REPO, repo);
  showToast('配置已保存');
  updateSyncStatus('unconfigured');
}

async function testGitHubConnection() {
  const token = document.getElementById('settings-token').value.trim();
  const owner = document.getElementById('settings-owner').value.trim();
  const repo = document.getElementById('settings-repo').value.trim();
  if (!token || !owner || !repo) {
    showToast('请填写完整配置');
    return;
  }
  localStorage.setItem(LS_TOKEN, token);
  localStorage.setItem(LS_OWNER, owner);
  localStorage.setItem(LS_REPO, repo);
  showToast('测试中...');
  try {
    const result = await fetchFromGitHub();
    if (result) {
      showToast('连接成功，文件已存在');
      localStorage.setItem(LS_SHA, result.sha);
      updateSyncStatus('synced');
    } else {
      const data = {
        items: getItems(),
        locations: getLocations(),
        tags: getTags(),
        settings: getSettings(),
        updatedAt: new Date().toISOString()
      };
      const init = await saveToGitHub(data);
      localStorage.setItem(LS_SHA, init.content.sha);
      showToast('连接成功，已创建数据文件');
      updateSyncStatus('synced');
    }
    updateLastSyncTime();
  } catch (e) {
    showToast('连接失败: ' + e.message);
    updateSyncStatus('error');
  }
}

function loadSyncSettingsForm() {
  document.getElementById('settings-token').value = localStorage.getItem(LS_TOKEN) || '';
  document.getElementById('settings-owner').value = localStorage.getItem(LS_OWNER) || '';
  document.getElementById('settings-repo').value = localStorage.getItem(LS_REPO) || '';
  loadLastSyncTime();
  if (isConfigured()) {
    updateSyncStatus('synced');
  } else {
    updateSyncStatus('unconfigured');
  }
}

function toggleTokenVisibility() {
  const input = document.getElementById('settings-token');
  const icon = document.getElementById('token-eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.setAttribute('d', 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22');
  } else {
    input.type = 'password';
    if (icon) icon.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z');
  }
}

function clearAllAppData() {
  if (!confirm('确定清空所有数据？此操作不可撤销！')) return;
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  localStorage.removeItem(STORAGE_KEYS.LOCATIONS);
  localStorage.removeItem(STORAGE_KEYS.TAGS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(LS_SHA);
  showToast('数据已清空');
  setTimeout(() => location.reload(), 500);
}

// ============================================
// 状态管理
// ============================================

let currentView = 'homeView';
let currentItemId = null;
let currentHighlightMode = 'keyword';
let currentSearchQuery = '';
let deleteCallback = null;

// ============================================
// 工具函数
// ============================================

// 根据位置名称返回图标 SVG
function getLocationIcon(name) {
  const iconStyle = 'width: 20px; height: 20px; color: var(--brand-primary);';
  const icons = {
    '客厅': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    '卧室': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`,
    '厨房': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="M6 8h12v4a6 6 0 1 1-12 0V8z"/><path d="M6 12h12"/></svg>`,
    '书房': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    '卫生间': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="7" y1="19" x2="7" y2="21"/><line x1="17" y1="19" x2="17" y2="21"/></svg>`,
    '玄关': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
    '阳台': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3v9"/></svg>`,
    '儿童房': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M12 12v8"/><path d="M8 20h8"/></svg>`,
    '餐厅': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
    '车库': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="22" height="18" rx="2"/><path d="M1 9h22"/><path d="M9 21V9"/></svg>`,
    '储藏室': `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
  };

  // 精确匹配
  if (icons[name]) return icons[name];

  // 模糊匹配关键词
  const lowerName = name.toLowerCase();
  if (lowerName.includes('客厅') || lowerName.includes('起居')) return icons['客厅'];
  if (lowerName.includes('卧') || lowerName.includes('床')) return icons['卧室'];
  if (lowerName.includes('厨')) return icons['厨房'];
  if (lowerName.includes('书') || lowerName.includes('办公')) return icons['书房'];
  if (lowerName.includes('卫') || lowerName.includes('浴') || lowerName.includes('洗手间')) return icons['卫生间'];
  if (lowerName.includes('玄关') || lowerName.includes('门厅')) return icons['玄关'];
  if (lowerName.includes('阳台')) return icons['阳台'];
  if (lowerName.includes('儿童') || lowerName.includes('小孩')) return icons['儿童房'];
  if (lowerName.includes('餐厅') || lowerName.includes('饭厅')) return icons['餐厅'];
  if (lowerName.includes('车库')) return icons['车库'];
  if (lowerName.includes('储藏') || lowerName.includes('收纳')) return icons['储藏室'];

  // 默认位置图标
  return `<svg style="${iconStyle}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function formatTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

function getLocationPath(locationId) {
  const locations = getLocations();
  const path = [];
  const visited = new Set();
  let current = locations.find(l => l.id === locationId);

  // 防止父子级被误设成循环引用后，页面点击时进入死循环卡住
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current.name);
    current = current.parentId ? locations.find(l => l.id === current.parentId) : null;
  }

  return path.join(' > ');
}

function getLocationName(locationId) {
  const locations = getLocations();
  const location = locations.find(l => l.id === locationId);
  return location ? location.name : '未设置';
}

function getTagName(tagId) {
  const tags = getTags();
  const tag = tags.find(t => t.id === tagId);
  return tag ? tag.name : '';
}

function getTagColor(tagId) {
  const tags = getTags();
  const tag = tags.find(t => t.id === tagId);
  return tag ? tag.color : '#8B5CF6';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 高亮文本
function highlightText(text, query, mode) {
  if (!query || mode === 'none') return escapeHtml(text);

  const escaped = escapeHtml(text);

  if (mode === 'keyword' || mode === 'both') {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<span class="highlight-keyword">$1</span>');
  }

  return escaped;
}

// 高亮数量
function highlightQuantity(text, mode) {
  if (mode === 'none' || mode === 'keyword') return escapeHtml(text);

  // 匹配数字
  return escapeHtml(text).replace(/(\d+)/g, '<span class="highlight-quantity">$1</span>');
}

// ============================================
// 视图切换
// ============================================

function switchView(viewId) {
  console.log('切换视图:', viewId);

  // 隐藏所有视图
  document.querySelectorAll('.view-section').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });

  // 显示目标视图
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.style.display = 'block';
    targetView.classList.add('active');
    currentView = viewId;
  }

  // 设置 body 的 data-view 属性，供 CSS 样式使用
  document.body.dataset.view = viewId || 'homeView';

  // 所有物品页面隐藏"好好收"标题
  const appTitle = document.querySelector('.app-title');
  if (appTitle) {
    appTitle.style.display = viewId === 'allItemsView' ? 'none' : 'block';
  }

  // 更新 Tab 高亮
  document.querySelectorAll('.tab-bar-item').forEach(tab => {
    const tabView = tab.dataset.view;
    if (tabView === viewId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // 关闭所有模态框
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// ============================================
// 首页渲染
// ============================================

function renderHome() {
  const items = getItems();
  const locations = getLocations();

  // 更新概览统计 - 总物品可点击
  const totalCount = items.length;
  document.getElementById('totalItems').textContent = totalCount;
  document.getElementById('totalItems').style.cursor = 'pointer';
  document.getElementById('totalItems').onclick = () => showAllItemsList();

  // 计算需要补货的数量
  const lowStockItems = items.filter(item => item.threshold && item.quantity <= item.threshold);
  const lowStockCount = lowStockItems.length;
  const alertStat = document.getElementById('lowStockAlert');
  alertStat.querySelector('.stat-value').textContent = lowStockCount;
  // 需补货也可点击
  alertStat.style.cursor = 'pointer';
  alertStat.onclick = () => showAlertList();

  // 更新 Tab Badge
  const badge = document.getElementById('alertBadge');
  if (lowStockCount > 0) {
    badge.textContent = lowStockCount;
    badge.style.display = 'inline';
  } else {
    badge.style.display = 'none';
  }

  // 渲染位置列表 - 增加搜索功能
  const locationListItems = document.getElementById('locationListItems');
  const rootLocations = locations.filter(l => !l.parentId);

  const locationCounts = {};
  items.forEach(item => {
    // 统计直接位置
    locationCounts[item.locationId] = (locationCounts[item.locationId] || 0) + 1;
    // 递归统计所有父位置
    let currentLoc = locations.find(l => l.id === item.locationId);
    while (currentLoc && currentLoc.parentId) {
      locationCounts[currentLoc.parentId] = (locationCounts[currentLoc.parentId] || 0) + 1;
      currentLoc = locations.find(l => l.id === currentLoc.parentId);
    }
  });

  // 位置列表增加搜索
  locationListItems.innerHTML = `
    ${rootLocations.map(loc => `
      <div class="location-item" style="cursor: pointer;" onclick="filterByLocation('${loc.id}')">
        <div class="location-info">
          <span class="location-icon">${getLocationIcon(loc.name)}</span>
          <div>
            <div class="location-name">${escapeHtml(loc.name)}</div>
            <div class="location-meta">${locationCounts[loc.id] || 0} 个物品</div>
          </div>
        </div>
        <span class="location-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></span>
      </div>
    `).join('')}
    ${rootLocations.length === 0 ? '<div class="empty-state"><div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div><div class="empty-text">暂无位置，点击右下角添加</div></div>' : ''}
  `;

  // 渲染最近更新
  const recentList = document.getElementById('recentList');
  const sortedItems = [...items].sort((a, b) => b.updatedAt - a.updatedAt);

  if (sortedItems.length === 0) {
    recentList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="empty-text">还没有任何物品，点击 + 添加第一个</div>
      </div>
    `;
  } else {
    recentList.innerHTML = sortedItems.slice(0, 5).map(item => `
      <div class="item-card-compact" style="cursor: pointer;" onclick="showItemDetail('${item.id}')">
        <div class="item-name-row">
          <span class="item-name">${escapeHtml(item.name)}</span>
          <span style="color: var(--color-text-muted); font-size: 12px;">${formatTime(item.updatedAt)}</span>
        </div>
        <div class="item-location-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${getLocationPath(item.locationId)}</span>
        </div>
      </div>
    `).join('');
  }
}

// ============================================
// 搜索功能
// ============================================

function performSearch(query) {
  const keyword = (query || '').trim();

  // 清空搜索时：如果当前在"所有物品"页，就留在所有物品页；否则回首页
  if (!keyword) {
    currentSearchQuery = '';
    if (currentView === 'allItemsView') {
      showAllItemsList();
    } else if (currentView === 'searchView') {
      switchView('homeView');
      renderHome();
    }
    return;
  }

  currentSearchQuery = keyword;
  const items = getItems();
  const locations = getLocations();
  const tags = getTags();

  const lowerQuery = keyword.toLowerCase();

  // 搜索逻辑：匹配物品名称、完整位置路径、标签、备注、数量
  const results = items.filter(item => {
    const nameMatch = (item.name || '').toLowerCase().includes(lowerQuery);
    const remarkMatch = (item.remark || '').toLowerCase().includes(lowerQuery);
    const quantityMatch = String(item.quantity ?? '').includes(lowerQuery);
    const locationPath = getLocationPath(item.locationId).toLowerCase();
    const locationMatch = locationPath.includes(lowerQuery);
    const tagMatch = (item.tags || []).some(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag && tag.name.toLowerCase().includes(lowerQuery);
    });

    return nameMatch || remarkMatch || quantityMatch || locationMatch || tagMatch;
  });

  renderSearchResults(results);
  switchView('searchView');
}

// ============================================
// 位置列表搜索筛选
// ============================================

function filterLocationList(query) {
  const locations = getLocations();
  const items = getItems();
  const container = document.getElementById('locationListItems');
  if (!container) return;

  const keyword = (query || '').trim().toLowerCase();

  const locationCounts = {};
  items.forEach(item => {
    // 统计当前位置
    locationCounts[item.locationId] = (locationCounts[item.locationId] || 0) + 1;
    // 同时统计所有父级位置，保证一级位置数量不丢
    let currentLoc = locations.find(l => l.id === item.locationId);
    while (currentLoc && currentLoc.parentId) {
      locationCounts[currentLoc.parentId] = (locationCounts[currentLoc.parentId] || 0) + 1;
      currentLoc = locations.find(l => l.id === currentLoc.parentId);
    }
  });

  // 有搜索词时匹配完整位置路径；无搜索词时仍保持首页原来的一级位置卡片样式
  const filteredLocations = keyword
    ? locations.filter(loc => getLocationPath(loc.id).toLowerCase().includes(keyword))
    : locations.filter(loc => !loc.parentId);

  if (filteredLocations.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 12px;">
        <div class="empty-state-icon">📍</div>
        <div class="empty-text">没有找到匹配的位置</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredLocations.map(loc => {
    const path = getLocationPath(loc.id);
    const showPath = keyword && path !== loc.name;
    return `
      <div class="location-item" style="cursor: pointer;" onclick="filterByLocation('${loc.id}')">
        <div class="location-info">
          <span class="location-icon">${getLocationIcon(loc.name)}</span>
          <div>
            <div class="location-name">${escapeHtml(loc.name)}</div>
            <div class="location-meta">
              ${showPath ? `${escapeHtml(path)} · ` : ''}${locationCounts[loc.id] || 0} 个物品
            </div>
          </div>
        </div>
        <span class="location-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></span>
      </div>
    `;
  }).join('');
}

function renderSearchResults(results) {
  const container = document.getElementById('searchResults');
  if (!container) return;

  let countEl = document.getElementById('resultCount');
  if (!countEl) {
    countEl = document.createElement('div');
    countEl.id = 'resultCount';
    countEl.className = 'result-count';
    container.parentNode.insertBefore(countEl, container);
  }
  countEl.textContent = `找到 ${results.length} 个结果`;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>
        <div class="empty-state-text">没有找到匹配的结果</div>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(item => `
    <div class="search-result-item" onclick="showItemDetail('${item.id}')">
      <div class="result-name">${highlightText(item.name, currentSearchQuery, currentHighlightMode)}</div>
      <div class="result-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${highlightText(getLocationPath(item.locationId), currentSearchQuery, currentHighlightMode)}</div>
      <div class="result-tags">
        ${(item.tags || []).map(tagId => `
          <span class="tag-chip" style="background: ${getTagColor(tagId)}20; color: ${getTagColor(tagId)}">
            <span class="tag-dot" style="background: ${getTagColor(tagId)}"></span>
            ${escapeHtml(getTagName(tagId))}
          </span>
        `).join('')}
      </div>
      <div class="result-quantity">${highlightQuantity(`数量: ${item.quantity}`, currentHighlightMode)}</div>
    </div>
  `).join('');
}

// ============================================
// 标签筛选
// ============================================

function filterByTag(tagId) {
  const items = getItems();
  const tag = getTags().find(t => t.id === tagId);

  const results = items.filter(item => item.tags.includes(tagId));

  document.getElementById('tagFilterTitle').textContent = `${tag ? tag.name : '标签'}`;

  const container = document.getElementById('tagFilterResults');
  container.innerHTML = results.map(item => `
    <div class="search-result-item" onclick="showItemDetail('${item.id}')">
      <div class="result-name">${highlightText(item.name, item.name, currentHighlightMode)}</div>
      <div class="result-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${getLocationPath(item.locationId)}</div>
      <div class="result-quantity">${highlightQuantity(`数量: ${item.quantity}`, currentHighlightMode)}</div>
    </div>
  `).join('') || `
    <div class="empty-state">
      <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 17 4H7a2 2 0 0 0-1.55.89z"/></svg></div>
      <div class="empty-state-text">该标签下没有物品</div>
    </div>
  `;

  switchView('tagFilterView');
}

// ============================================
// 位置筛选
// ============================================

function filterByLocation(locationId) {
  const items = getItems();
  const locations = getLocations();

  // 获取该位置及其所有子位置
  const locationIds = new Set([locationId]);

  function addChildren(parentId) {
    locations.forEach(loc => {
      if (loc.parentId === parentId) {
        locationIds.add(loc.id);
        addChildren(loc.id);
      }
    });
  }
  addChildren(locationId);

  const results = items.filter(item => locationIds.has(item.locationId));
  const location = locations.find(l => l.id === locationId);

  document.getElementById('locationFilterTitle').textContent = `${location ? location.name : '位置'}`;

  const container = document.getElementById('locationFilterResults');
  container.innerHTML = results.map(item => `
    <div class="search-result-item" onclick="showItemDetail('${item.id}')">
      <div class="result-name">${highlightText(item.name, item.name, currentHighlightMode)}</div>
      <div class="result-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${getLocationPath(item.locationId)}</div>
      <div class="result-quantity">${highlightQuantity(`数量: ${item.quantity}`, currentHighlightMode)}</div>
    </div>
  `).join('') || `
    <div class="empty-state">
      <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 17 4H7a2 2 0 0 0-1.55.89z"/></svg></div>
      <div class="empty-state-text">该位置下没有物品</div>
    </div>
  `;

  switchView('locationFilterView');
}

// ============================================
// 物品详情
// ============================================

function showItemDetail(itemId) {
  const items = getItems();
  const item = items.find(i => i.id === itemId);

  if (!item) {
    showToast('物品不存在');
    return;
  }

  currentItemId = itemId;

  const container = document.getElementById('itemDetail');

  container.innerHTML = `
    <div class="detail-quantity-row">
      <span class="quantity-display">${highlightQuantity(item.quantity.toString(), currentHighlightMode)}</span>
      <span class="quantity-unit">件</span>
      <div class="quantity-actions">
        <button class="qty-action-btn" onclick="updateItemQuantity(-1)">-</button>
        <button class="qty-action-btn" onclick="updateItemQuantity(1)">+</button>
      </div>
    </div>

    <div class="detail-row">
      <span class="detail-label">存放位置</span>
      <span class="detail-value"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${getLocationPath(item.locationId)}</span>
    </div>

    ${item.tags.length > 0 ? `
      <div class="detail-row">
        <span class="detail-label">标签</span>
        <div class="detail-value">
          ${item.tags.map(tagId => `
            <span class="tag-chip" style="background: ${getTagColor(tagId)}20; color: ${getTagColor(tagId)}; margin-right: 4px;">
              <span class="tag-dot" style="background: ${getTagColor(tagId)}"></span>
              ${escapeHtml(getTagName(tagId))}
            </span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${item.threshold ? `
      <div class="detail-row">
        <span class="detail-label">提醒阈值</span>
        <span class="detail-value">低于 ${item.threshold} 件时提醒</span>
      </div>
    ` : ''}

    ${item.remark ? `
      <div class="detail-row">
        <span class="detail-label">备注</span>
        <span class="detail-value detail-remark">${escapeHtml(item.remark)}</span>
      </div>
    ` : ''}

    <div class="detail-row detail-time-row">
      <span class="detail-label">更新时间</span>
      <span class="detail-value detail-time">${formatTime(item.updatedAt)}</span>
    </div>
  `;

  switchView('itemDetailView');
}

function updateItemQuantity(delta) {
  const items = getItems();
  const itemIndex = items.findIndex(i => i.id === currentItemId);

  if (itemIndex === -1) return;

  items[itemIndex].quantity = Math.max(0, items[itemIndex].quantity + delta);
  items[itemIndex].updatedAt = Date.now();
  saveItems(items);

  showItemDetail(currentItemId);
  showToast(`数量已更新为 ${items[itemIndex].quantity}`);
}

// ============================================
// 添加/编辑物品
// ============================================

function showAddItemForm() {
  currentItemId = null;
  document.getElementById('formTitle').textContent = '添加物品';
  document.getElementById('itemForm').reset();
  document.getElementById('itemId').value = '';
  document.getElementById('itemQuantity').value = 1;
  document.getElementById('selectedTags').value = '';
  document.getElementById('formActions').style.display = 'none';

  renderLocationSelector(null);
  renderTagSelector([]);

  switchView('itemFormView');
}

function showEditItemForm(itemId) {
  const items = getItems();
  const item = items.find(i => i.id === itemId);

  if (!item) {
    showToast('物品不存在');
    return;
  }

  currentItemId = itemId;
  document.getElementById('formTitle').textContent = '编辑物品';
  document.getElementById('itemId').value = item.id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemQuantity').value = item.quantity;
  document.getElementById('itemThreshold').value = item.threshold || '';
  document.getElementById('itemRemark').value = item.remark || '';
  document.getElementById('selectedTags').value = JSON.stringify(item.tags);
  document.getElementById('formActions').style.display = 'block';

  renderLocationSelector(item.locationId);
  renderTagSelector(item.tags);

  switchView('itemFormView');
}

function renderLocationSelector(selectedId) {
  const locations = getLocations();
  const container = document.getElementById('locationSelector');
  const tagEl = document.getElementById('currentLocationTag');
  const nameEl = document.getElementById('currentLocationName');

  // 更新标签显示
  if (selectedId) {
    const path = getLocationPath(selectedId);
    nameEl.textContent = path;
    tagEl.style.display = 'inline-flex';
  } else {
    tagEl.style.display = 'none';
  }

  const rootLocations = locations.filter(l => !l.parentId);

  container.innerHTML = rootLocations.map(loc => {
    const children = locations.filter(l => l.parentId === loc.id);
    const isSelected = loc.id === selectedId;

    return `
      <div class="location-option ${isSelected ? 'selected' : ''}" data-id="${loc.id}" onclick="selectLocation('${loc.id}')">
        <div class="location-option-name"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHtml(loc.name)}</div>
      </div>
      ${children.map(child => {
        const childSelected = child.id === selectedId;
        return `
          <div class="location-option location-option-child ${childSelected ? 'selected' : ''}" data-id="${child.id}" onclick="selectLocation('${child.id}')">
            <div class="location-option-name">  ↳ ${escapeHtml(child.name)}</div>
            <div class="location-path">${escapeHtml(loc.name)}</div>
          </div>
        `;
      }).join('')}
    `;
  }).join('');
}

function showLocationPicker() {
  const picker = document.getElementById('locationPicker');
  picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

function clearLocation() {
  selectLocation(null);
  document.getElementById('currentLocationTag').style.display = 'none';
  showToast('位置已清除，请重新选择');
}

function selectLocation(locationId) {
  document.querySelectorAll('.location-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.id === locationId);
  });

  // 更新标签显示
  const tagEl = document.getElementById('currentLocationTag');
  const nameEl = document.getElementById('currentLocationName');

  if (locationId) {
    const path = getLocationPath(locationId);
    nameEl.textContent = path;
    tagEl.style.display = 'inline-flex';

    // 关闭选择器
    document.getElementById('locationPicker').style.display = 'none';
    showToast(`已选择: ${path}`);
  } else {
    tagEl.style.display = 'none';
  }
}

function renderTagSelector(selectedTagIds = []) {
  const tags = getTags();
  const container = document.getElementById('tagSelector');

  container.innerHTML = tags.map(tag => {
    const isSelected = selectedTagIds.includes(tag.id);
    return `
      <button class="tag-chip ${isSelected ? 'selected' : ''}" data-tag-id="${tag.id}" onclick="toggleTag('${tag.id}')">
        <span class="tag-dot" style="background: ${tag.color}"></span>
        ${escapeHtml(tag.name)}
      </button>
    `;
  }).join('') + `
    <button class="add-tag-btn" onclick="showAddTagModal()">+ 新建</button>
  `;
}

function toggleTag(tagId) {
  const tags = getTags();
  let selectedTags = document.getElementById('selectedTags').value;
  selectedTags = selectedTags ? JSON.parse(selectedTags) : [];

  const index = selectedTags.indexOf(tagId);
  if (index > -1) {
    selectedTags.splice(index, 1);
  } else {
    selectedTags.push(tagId);
  }

  document.getElementById('selectedTags').value = JSON.stringify(selectedTags);
  renderTagSelector(selectedTags);
}

function saveItem() {
  const name = document.getElementById('itemName').value.trim();
  const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;
  const threshold = parseInt(document.getElementById('itemThreshold').value) || null;
  const remark = document.getElementById('itemRemark').value.trim();
  const selectedTags = JSON.parse(document.getElementById('selectedTags').value || '[]');

  const selectedLocation = document.querySelector('.location-option.selected');
  const locationId = selectedLocation ? selectedLocation.dataset.id : null;

  // 清理上一次的高亮
  const nameInput = document.getElementById('itemName');
  const locationGroup = document.getElementById('selectedLocationTag').closest('.form-group');
  nameInput.classList.remove('input-error');
  if (locationGroup) locationGroup.classList.remove('has-error');

  // 收集未填的必填项，统一高亮 + 聚焦第一个
  const missing = [];
  if (!name) missing.push(nameInput);
  if (!locationId && locationGroup) missing.push(locationGroup);

  if (missing.length) {
    missing.forEach(el => el.classList.add(nameInput === el ? 'input-error' : 'has-error'));
    missing[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (missing[0] === nameInput) nameInput.focus();
    showToast(missing.length > 1 ? '请填写物品名称和存放位置' : (!name ? '请输入物品名称' : '请选择存放位置'));
    return;
  }

  const items = getItems();

  if (currentItemId) {
    // 更新
    const index = items.findIndex(i => i.id === currentItemId);
    if (index > -1) {
      items[index] = {
        ...items[index],
        name,
        quantity,
        locationId,
        tags: selectedTags,
        threshold,
        remark,
        updatedAt: Date.now()
      };
    }
    showToast('物品已更新');
  } else {
    // 新增
    const newItem = {
      id: generateId('item'),
      name,
      quantity,
      locationId,
      tags: selectedTags,
      threshold,
      remark,
      updatedAt: Date.now()
    };
    items.push(newItem);
    showToast('物品已添加');
  }

  saveItems(items);
  switchView('homeView');
  renderHome();
}

// ============================================
// 删除物品
// ============================================

function showDeleteConfirm(itemId) {
  const items = getItems();
  const item = items.find(i => i.id === itemId);

  document.getElementById('confirmMessage').textContent = `确定要删除"${item ? item.name : ''}"吗？此操作不可撤销。`;

  deleteCallback = () => {
    const currentItems = getItems();
    const filtered = currentItems.filter(i => i.id !== itemId);
    saveItems(filtered);
    showToast('物品已删除');
    switchView('homeView');
    renderHome();
  };

  document.getElementById('confirmModal').classList.add('active');
}

// ============================================
// 标签管理
// ============================================

function showTagManage() {
  renderTagManageList();
  switchView('tagManageView');
}

function renderTagManageList() {
  const tags = getTags();
  const items = getItems();
  const container = document.getElementById('tagManageList');

  container.innerHTML = tags.map(tag => {
    const count = items.filter(item => item.tags.includes(tag.id)).length;
    return `
      <div class="manage-item">
        <div class="manage-item-left">
          <span class="manage-item-color" style="background: ${tag.color}"></span>
          <div>
            <div class="manage-item-name">${escapeHtml(tag.name)}</div>
            <div class="manage-item-count">${count} 个物品</div>
          </div>
        </div>
        <div class="manage-item-actions">
          <button class="icon-btn" onclick="editTag('${tag.id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="icon-btn delete" onclick="deleteTag('${tag.id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </div>
    `;
  }).join('') || `
    <div class="empty-state">
      <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></div>
      <div class="empty-state-text">还没有标签</div>
    </div>
  `;
}

function showAddTagModal() {
  document.getElementById('tagModalTitle').textContent = '添加标签';
  document.getElementById('tagName').value = '';
  document.getElementById('editLocationId')?.removeAttribute('data-edit-id');

  document.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.color === '#8B5CF6');
  });

  document.getElementById('tagModal').classList.add('active');
}

function editTag(tagId) {
  const tags = getTags();
  const tag = tags.find(t => t.id === tagId);

  if (!tag) return;

  document.getElementById('tagModalTitle').textContent = '编辑标签';
  document.getElementById('tagName').value = tag.name;

  document.querySelectorAll('.color-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.color === tag.color);
  });

  document.getElementById('tagModal').setAttribute('data-edit-id', tagId);

  document.getElementById('tagModal').classList.add('active');
}

function saveTag() {
  const name = document.getElementById('tagName').value.trim();
  const selectedColor = document.querySelector('.color-option.selected');
  const color = selectedColor ? selectedColor.dataset.color : '#8B5CF6';
  const editId = document.getElementById('tagModal').dataset.editId;

  if (!name) {
    showToast('请输入标签名称');
    return;
  }

  const tags = getTags();

  if (editId) {
    const index = tags.findIndex(t => t.id === editId);
    if (index > -1) {
      tags[index].name = name;
      tags[index].color = color;
    }
    showToast('标签已更新');
  } else {
    tags.push({
      id: generateId('tag'),
      name,
      color,
      parentId: null
    });
    showToast('标签已添加');
  }

  saveTags(tags);
  document.getElementById('tagModal').classList.remove('active');
  renderTagManageList();
  renderHome();
}

function deleteTag(tagId) {
  const tags = getTags();
  const tag = tags.find(t => t.id === tagId);

  document.getElementById('confirmMessage').textContent = `确定要删除标签"${tag ? tag.name : ''}"吗？使用该标签的物品将移除此标签。`;

  deleteCallback = () => {
    // 从标签中移除
    const currentTags = getTags().filter(t => t.id !== tagId);
    saveTags(currentTags);

    // 从物品中移除该标签
    const items = getItems().map(item => ({
      ...item,
      tags: item.tags.filter(t => t !== tagId)
    }));
    saveItems(items);

    showToast('标签已删除');
    renderTagManageList();
    renderHome();
  };

  document.getElementById('confirmModal').classList.add('active');
}

// ============================================
// 位置管理
// ============================================

function showLocationManage() {
  renderLocationManageList();
  switchView('locationManageView');
}

function renderLocationManageList() {
  const locations = getLocations();
  const items = getItems();
  const container = document.getElementById('locationManageList');

  if (!container) return;

  function locationIconSvg() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>`;
  }

  function addSvg() {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"></path></svg>`;
  }

  function editSvg() {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`;
  }

  function deleteSvg() {
    return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
    </svg>`;
  }

  function getAllChildIds(parentId) {
    const ids = new Set([parentId]);
    locations.forEach(loc => {
      if (loc.parentId === parentId) {
        getAllChildIds(loc.id).forEach(id => ids.add(id));
      }
    });
    return ids;
  }

  function buildTree(parentId = null, level = 0) {
    return locations
      .filter(loc => loc.parentId === parentId)
      .map(loc => {
        const allLocationIds = getAllChildIds(loc.id);
        const count = items.filter(item => allLocationIds.has(item.locationId)).length;
        const directChildCount = locations.filter(child => child.parentId === loc.id).length;
        const depthText = level === 0 ? '一级位置' : `${level + 1}级位置`;
        const childrenHtml = buildTree(loc.id, level + 1).join('');

        return `
          <div class="location-manage-node" style="--level:${level}">
            <div class="manage-item location-manage-card">
              <button type="button" class="manage-item-left location-open-btn" onclick="showLocationItems('${loc.id}')" title="查看该位置物品">
                <span class="manage-location-icon">${locationIconSvg()}</span>
                <span class="manage-location-main">
                  <span class="manage-item-name">${escapeHtml(loc.name)}</span>
                  <span class="manage-item-count">${depthText} · ${count} 个物品${directChildCount ? ` · ${directChildCount} 个子位置` : ''}</span>
                </span>
              </button>
              <div class="manage-item-actions">
                <button type="button" class="icon-btn add" onclick="event.stopPropagation(); showAddLocationModal('${loc.id}')" title="添加子位置">${addSvg()}</button>
                <button type="button" class="icon-btn" onclick="event.stopPropagation(); editLocation('${loc.id}')" title="编辑位置">${editSvg()}</button>
                <button type="button" class="icon-btn delete" onclick="event.stopPropagation(); deleteLocation('${loc.id}')" title="删除位置">${deleteSvg()}</button>
              </div>
            </div>
            ${childrenHtml ? `<div class="location-manage-children">${childrenHtml}</div>` : ''}
          </div>
        `;
      });
  }

  container.innerHTML = `
    <div class="location-manage-hint">
      <span>点击位置名称查看物品；右侧按钮分别用于新增子位置、编辑和删除。</span>
    </div>
    ${buildTree().join('') || `
      <div class="empty-state">
        <div class="empty-state-icon">${locationIconSvg()}</div>
        <div class="empty-state-text">还没有位置</div>
      </div>
    `}
  `;
}

function showAddLocationModal(parentId = null) {
  document.getElementById('locationModalTitle').textContent = '添加位置';
  document.getElementById('locationName').value = '';
  document.getElementById('editLocationId').value = '';

  // 填充父级选择器
  const locations = getLocations();
  const parentSelect = document.getElementById('locationParentSelect');
  parentSelect.innerHTML = '<option value="">无（顶级位置）</option>' +
    locations.map(loc => {
      const path = getLocationPath(loc.id);
      const selected = loc.id === parentId ? 'selected' : '';
      return `<option value="${loc.id}" ${selected}>${path}</option>`;
    }).join('');

  document.getElementById('locationModal').classList.add('active');
}

function editLocation(locationId) {
  const locations = getLocations();
  const location = locations.find(l => l.id === locationId);

  if (!location) return;

  document.getElementById('locationModalTitle').textContent = '编辑位置';
  document.getElementById('locationName').value = location.name;
  document.getElementById('editLocationId').value = locationId;

  // 填充父级选择器
  const parentSelect = document.getElementById('locationParentSelect');
  parentSelect.innerHTML = '<option value="">无（顶级位置）</option>' +
    locations.filter(loc => loc.id !== locationId).map(loc => {
      const path = getLocationPath(loc.id);
      const selected = loc.id === location.parentId ? 'selected' : '';
      return `<option value="${loc.id}" ${selected}>${path}</option>`;
    }).join('');

  document.getElementById('locationModal').classList.add('active');
}

function saveLocation() {
  const name = document.getElementById('locationName').value.trim();
  const parentSelect = document.getElementById('locationParentSelect');
  const parentId = parentSelect.value || null;
  const editId = document.getElementById('editLocationId').value;

  if (!name) {
    showToast('请输入位置名称');
    return;
  }

  const locations = getLocations();

  // 检查是否形成循环引用（如果选择自己作为父级）
  if (parentId === editId) {
    showToast('不能将自己设为父级');
    return;
  }

  if (editId) {
    const index = locations.findIndex(l => l.id === editId);
    if (index > -1) {
      locations[index].name = name;
      locations[index].parentId = parentId;
      locations[index].level = parentId ? 2 : 1;
    }
    showToast('位置已更新');
  } else {
    locations.push({
      id: generateId('loc'),
      name,
      parentId,
      level: parentId ? 2 : 1
    });
    showToast('位置已添加');
  }

  saveLocations(locations);
  document.getElementById('locationModal').classList.remove('active');
  renderLocationManageList();
  renderHome();
}

function deleteLocation(locationId) {
  const locations = getLocations();
  const location = locations.find(l => l.id === locationId);
  const items = getItems();

  // 检查是否有子位置
  const hasChildren = locations.some(l => l.parentId === locationId);
  if (hasChildren) {
    showToast('该位置有子位置，请先删除子位置');
    return;
  }

  // 检查是否有物品
  const hasItems = items.some(item => item.locationId === locationId);
  if (hasItems) {
    // 弹出选项：移动物品还是删除
    showLocationDeleteOptions(locationId, location);
    return;
  }

  document.getElementById('confirmMessage').textContent = `确定要删除位置"${location ? location.name : ''}"吗？`;

  deleteCallback = () => {
    const currentLocations = locations.filter(l => l.id !== locationId);
    saveLocations(currentLocations);
    showToast('位置已删除');
    renderLocationManageList();
  };

  document.getElementById('confirmModal').classList.add('active');
}

// 位置删除选项 - 有物品时
function showLocationDeleteOptions(locationId, location) {
  const locations = getLocations();
  const allOtherLocations = locations.filter(l => l.id !== locationId);

  let optionsHtml = allOtherLocations.map(loc => {
    const path = getLocationPath(loc.id);
    return `<option value="${loc.id}">${path}</option>`;
  }).join('');

  if (!optionsHtml) {
    optionsHtml = '<option value="">请先创建其他位置</option>';
  }

  const modalContent = `
    <h4>位置 "${location ? location.name : ''}" 下有物品</h4>
    <p style="margin-bottom: 16px; color: var(--text-secondary);">请选择如何处理这些物品：</p>

    <div style="margin-bottom: 12px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500;">移动到其他位置：</label>
      <select id="moveToLocation" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--bg-input); font-size: 14px;">
        ${optionsHtml}
      </select>
    </div>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModal('confirmModal')">取消</button>
      <button class="btn-danger-outline" onclick="deleteLocationWithItems('${locationId}')">直接删除</button>
      <button class="btn-primary" onclick="moveLocationItems('${locationId}')">移动</button>
    </div>
  `;

  document.getElementById('confirmModal').querySelector('.modal-body').innerHTML = modalContent;
  document.getElementById('confirmModal').classList.add('active');
}

// 移动物品（保留原位置）
function moveLocationItems(locationId) {
  const moveToId = document.getElementById('moveToLocation').value;
  if (!moveToId) {
    showToast('请选择目标位置');
    return;
  }

  // 移动物品
  const items = getItems().map(item => {
    if (item.locationId === locationId) {
      return { ...item, locationId: moveToId, updatedAt: Date.now() };
    }
    return item;
  });
  saveItems(items);

  showToast('物品已移动');
  closeModal('confirmModal');
  renderLocationManageList();
  renderHome();
}

// 直接删除位置及其所有物品
function deleteLocationWithItems(locationId) {
  // 删除该位置的物品
  const items = getItems().filter(item => item.locationId !== locationId);
  saveItems(items);

  // 删除位置
  const locations = getLocations().filter(l => l.id !== locationId);
  saveLocations(locations);

  showToast('位置和物品已删除');
  closeModal('confirmModal');
  renderLocationManageList();
  renderHome();
}

function moveAndDeleteLocation(locationId) {
  const moveToId = document.getElementById('moveToLocation').value;
  if (!moveToId) {
    showToast('请选择目标位置');
    return;
  }

  // 移动物品
  const items = getItems().map(item => {
    if (item.locationId === locationId) {
      return { ...item, locationId: moveToId, updatedAt: Date.now() };
    }
    return item;
  });
  saveItems(items);

  // 删除位置
  const locations = getLocations().filter(l => l.id !== locationId);
  saveLocations(locations);

  showToast('物品已移动，位置已删除');
  closeModal('confirmModal');
  renderLocationManageList();
  renderHome();
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  // 恢复确认框默认内容
  if (modalId === 'confirmModal') {
    document.getElementById('confirmModal').querySelector('.modal-body').innerHTML = `
      <p id="confirmMessage" style="text-align: center; color: var(--color-text-secondary);">确定要删除吗？此操作不可撤销。</p>
    `;
  }
}

// ============================================
// 提醒列表
// ============================================

function showAlertList() {
  const items = getItems();
  const lowStockItems = items.filter(item => item.threshold && item.quantity <= item.threshold);
  const container = document.getElementById('alertFullList');

  if (lowStockItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <div class="empty-state-text">所有物品库存充足，无需补货</div>
      </div>
    `;
  } else {
    container.innerHTML = lowStockItems.map(item => `
      <div class="search-result-item" onclick="showItemDetail('${item.id}')">
        <div class="result-name">${highlightText(item.name, currentSearchQuery, currentHighlightMode)}</div>
        <div class="result-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${getLocationPath(item.locationId)}</div>
        <div class="result-tags">
          ${item.threshold ? `
            <span style="color: var(--warning); font-weight: 600;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 还剩 ${highlightQuantity(item.quantity.toString(), currentHighlightMode)} / ${item.threshold} 件
            </span>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  switchView('alertListView');
}

// ============================================
// 所有物品列表
// ============================================

function showAllItemsList() {
  const items = getItems();
  const tags = getTags();
  const locations = getLocations();
  const container = document.getElementById('allItemsList');
  const title = document.getElementById('allItemsTitle');
  const tabsContainer = document.getElementById('viewTabs');

  title.textContent = `所有物品（${items.length}件）`;

  // 构建标签 Tabs
  const usedTags = new Set();
  items.forEach(item => {
    if (item.tags) item.tags.forEach(t => usedTags.add(t));
  });

  if (usedTags.size > 0) {
    let tabsHtml = `<button class="view-tab active" data-tag="" onclick="filterItemsByTag('', this)">全部</button>`;
    usedTags.forEach(tagId => {
      const tag = tags.find(t => t.id === tagId);
      if (tag) {
        tabsHtml += `<button class="view-tab" data-tag="${tagId}" onclick="filterItemsByTag('${tagId}', this)">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${tag.color}; margin-right: 4px;"></span>
          ${tag.name}
        </button>`;
      }
    });
    tabsContainer.innerHTML = tabsHtml;
    tabsContainer.style.display = 'flex';
  } else {
    tabsContainer.innerHTML = `<button class="view-tab active" data-tag="" onclick="filterItemsByTag('', this)">全部</button>`;
  }

  // 默认显示全部
  window._allItemsData = { items, tags, locations };
  renderAllItemsList(items);

  switchView('allItemsView');
}

function filterItemsByTag(tagId, btn) {
  // 更新 Tab 状态
  document.querySelectorAll('#viewTabs .view-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const { items, tags, locations } = window._allItemsData;
  let filtered = items;

  if (tagId) {
    filtered = items.filter(item => item.tags && item.tags.includes(tagId));
  }

  renderAllItemsList(filtered);
  document.getElementById('allItemsTitle').textContent = `所有物品（${filtered.length}件）`;
}

function renderAllItemsList(items) {
  const container = document.getElementById('allItemsList');

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 40px 20px;">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="empty-text">还没有物品</div>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item-card" style="cursor: pointer;" onclick="showItemDetail('${item.id}')">
      <div class="item-name-row">
        <span class="item-name">${escapeHtml(item.name)}</span>
      </div>
      <div class="item-location-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>${getLocationPath(item.locationId)}</span>
      </div>
    </div>
  `).join('');
}

// ============================================
// 位置管理详情 - 查看某位置下的物品
// ============================================

function showLocationItems(locationId) {
  const items = getItems();
  const locations = getLocations();
  const tags = getTags();
  const location = locations.find(l => l.id === locationId);

  if (!location) {
    showToast('位置不存在');
    return;
  }

  // 获取该位置及所有下级位置的物品，避免只显示一级子位置
  const locationIds = new Set([locationId]);
  function collectChildren(parentId) {
    locations.forEach(loc => {
      if (loc.parentId === parentId) {
        locationIds.add(loc.id);
        collectChildren(loc.id);
      }
    });
  }
  collectChildren(locationId);

  const locationItems = items.filter(item => locationIds.has(item.locationId));
  const title = document.getElementById('locationFilterTitle');
  const tagTabs = document.getElementById('locationTagTabs');

  if (title) title.textContent = `${location.name}（${locationItems.length}件）`;

  // 无论是否有标签，都刷新当前筛选数据，防止点击空位置时复用上一次数据造成"卡住/错乱"
  window._locationFilterData = { locationItems, tags, isAllItems: false };

  const usedTags = new Set();
  locationItems.forEach(item => {
    if (Array.isArray(item.tags)) item.tags.forEach(tagId => usedTags.add(tagId));
  });

  if (tagTabs) {
    if (usedTags.size > 0) {
      let tabsHtml = '<button type="button" class="filter-tab active" data-tag="" onclick="filterLocationByTag(\'\')">全部</button>';
      usedTags.forEach(tagId => {
        const tag = tags.find(t => t.id === tagId);
        if (tag) {
          tabsHtml += `<button type="button" class="filter-tab" data-tag="${tagId}" onclick="filterLocationByTag('${tagId}')">
            <span class="tag-dot" style="background:${tag.color}"></span>${escapeHtml(tag.name)}
          </button>`;
        }
      });
      tagTabs.innerHTML = tabsHtml;
      tagTabs.style.display = 'flex';
    } else {
      tagTabs.innerHTML = '';
      tagTabs.style.display = 'none';
    }
  }

  filterLocationByTag('');
  switchView('locationFilterView');
}

// 按标签筛选位置物品
function filterLocationByTag(tagId) {
  const container = document.getElementById('locationFilterResults');
  const tagTabs = document.getElementById('locationTagTabs');
  const data = window._locationFilterData || {};

  // 更新Tab激活状态
  tagTabs.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tag === tagId);
  });

  const { locationItems = [], tags = [] } = data;
  const filtered = tagId
    ? locationItems.filter(item => item.tags && item.tags.includes(tagId))
    : locationItems;

  const isAllItems = data.isAllItems || false;

  if (filtered.length === 0) {
    const emptyText = tagId
      ? '该标签下没有物品'
      : (isAllItems ? '还没有任何物品' : '该位置下还没有物品');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 17 4H7a2 2 0 0 0-1.55.89z"/></svg></div>
        <div class="empty-state-text">${emptyText}</div>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(item => {
      const itemTags = item.tags ? item.tags.map(tid => tags.find(t => t.id === tid)).filter(Boolean) : [];
      const tagHtml = itemTags.map(t => `<span class="tag-badge" style="background:${t.color}20;color:${t.color}">${t.name}</span>`).join('');
      return `
        <div class="search-result-item" onclick="showItemDetail('${item.id}')">
          <div class="result-name">${highlightText(item.name, currentSearchQuery, currentHighlightMode)}</div>
          <div class="result-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${getLocationPath(item.locationId)}</div>
          <div class="result-quantity">${highlightQuantity(`数量: ${item.quantity}`, currentHighlightMode)}</div>
          ${tagHtml ? `<div class="result-tags">${tagHtml}</div>` : ''}
        </div>
      `;
    }).join('');
  }
}

// ============================================
// 高亮设置
// ============================================

function showHighlightModal() {
  const settings = getSettings();
  document.querySelectorAll('input[name="highlightMode"]').forEach(radio => {
    radio.checked = radio.value === settings.highlightMode;
    radio.closest('.radio-option').classList.toggle('selected', radio.checked);
  });
  document.getElementById('highlightModal').classList.add('active');
}

function saveHighlightSetting() {
  const selected = document.querySelector('input[name="highlightMode"]:checked');
  if (selected) {
    currentHighlightMode = selected.value;
    saveSettings({ highlightMode: selected.value });

    // 更新按钮状态
    const btn = document.getElementById('highlightBtn');
    if (btn) btn.classList.toggle('active', selected.value !== 'none');
  }
  document.getElementById('highlightModal').classList.remove('active');
  showToast('高亮设置已保存');
}

// ============================================
// 事件绑定
// ============================================

function initEventListeners() {
  console.log('初始化事件绑定...');

  const on = (id, event, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
    return el;
  };

  // 搜索输入
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;
  if (searchInput) searchInput.addEventListener('input', (e) => {
    console.log('搜索输入:', e.target.value);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(e.target.value);
    }, 300);
  });

  // 清除搜索
  on('clearSearchBtn', 'click', () => {
    console.log('清除搜索');
    if (searchInput) searchInput.value = '';
    currentSearchQuery = '';
    switchView('homeView');
    renderHome();
  });

  // 添加物品按钮
  const addItemBtn = document.getElementById('addItemBtn');
  addItemBtn.addEventListener('click', () => {
    console.log('点击添加物品按钮');
    showAddItemForm();
  });

  // Tab 导航
  let lastTabPullTime = 0;
  document.querySelectorAll('.tab-bar-item').forEach(tab => {
    tab.addEventListener('click', (e) => {
      console.log('点击Tab:', tab.dataset.view);
      const viewId = tab.dataset.view;
      if (!viewId) return;

      if (viewId === 'tagManageView') {
        showTagManage();
      } else if (viewId === 'locationManageView') {
        showLocationManage();
      } else if (viewId === 'alertListView') {
        showAlertList();
      } else if (viewId === 'settingsView') {
        switchView('settingsView');
        loadSyncSettingsForm();
      } else {
        switchView(viewId);
      }

      // 切换 Tab 时拉取最新数据，30 秒内不重复拉取
      const now = Date.now();
      if (isConfigured() && now - lastTabPullTime > 30000) {
        lastTabPullTime = now;
        pullFromGitHub().then(() => renderHome());
      }
    });
  });

  // 返回按钮
  const backButtons = [
    { id: 'backFromForm', view: 'homeView' },
    { id: 'backFromDetail', view: 'homeView' },
    { id: 'backFromTagFilter', view: 'homeView' },
    { id: 'backFromLocationFilter', view: 'homeView' },
    { id: 'backFromTagManage', view: 'homeView' },
    { id: 'backFromLocationManage', view: 'homeView' },
    { id: 'backFromAlertList', view: 'homeView' },
    { id: 'backFromSearch', view: 'homeView' }
  ];

  backButtons.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (el) {
      el.addEventListener('click', () => {
        console.log('返回:', btn.id);
        if (btn.id === 'backFromSearch') {
          const searchInput = document.getElementById('searchInput');
          if (searchInput) searchInput.value = '';
          currentSearchQuery = '';
        }
        switchView(btn.view);
      });
    }
  });

  // 编辑物品
  document.getElementById('editItemBtn').addEventListener('click', () => {
    console.log('编辑物品:', currentItemId);
    showEditItemForm(currentItemId);
  });

  // 保存物品
  document.getElementById('saveItemBtn').addEventListener('click', () => {
    console.log('保存物品');
    saveItem();
  });

  // 删除物品
  document.getElementById('deleteItemBtn').addEventListener('click', () => {
    console.log('删除物品:', currentItemId);
    showDeleteConfirm(currentItemId);
  });

  // 详情页底部删除物品
  const detailDeleteBtn = document.getElementById('detailDeleteBtn');
  if (detailDeleteBtn) {
    detailDeleteBtn.addEventListener('click', () => {
      console.log('详情页删除物品:', currentItemId);
      showDeleteConfirm(currentItemId);
    });
  }

  // 数量加减
  document.getElementById('qtyMinus').addEventListener('click', () => {
    const input = document.getElementById('itemQuantity');
    input.value = Math.max(0, parseInt(input.value || 0) - 1);
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    const input = document.getElementById('itemQuantity');
    input.value = parseInt(input.value || 0) + 1;
  });

  // 管理按钮
  const manageTagsBtn = document.getElementById('manageTagsBtn');
  if (manageTagsBtn) {
    manageTagsBtn.addEventListener('click', () => {
      console.log('管理标签');
      showTagManage();
    });
  }
  const manageLocationsBtn = document.getElementById('manageLocationsBtn');
  if (manageLocationsBtn) {
    manageLocationsBtn.addEventListener('click', () => {
      console.log('管理位置');
      showLocationManage();
    });
  }

  // 标签管理
  document.getElementById('addTagBtn').addEventListener('click', () => {
    console.log('添加标签');
    showAddTagModal();
  });
  document.getElementById('saveTagBtn').addEventListener('click', () => {
    console.log('保存标签');
    saveTag();
  });
  document.getElementById('closeTagModal').addEventListener('click', () => {
    document.getElementById('tagModal').classList.remove('active');
  });

  // 位置管理
  document.getElementById('addLocationBtn').addEventListener('click', () => {
    console.log('添加位置');
    showAddLocationModal();
  });
  document.getElementById('saveLocationBtn').addEventListener('click', () => {
    console.log('保存位置');
    saveLocation();
  });
  document.getElementById('closeLocationModal').addEventListener('click', () => {
    document.getElementById('locationModal').classList.remove('active');
  });
  document.getElementById('closeLocationModal2').addEventListener('click', () => {
    document.getElementById('locationModal').classList.remove('active');
  });

  // 标签弹窗关闭
  document.getElementById('closeTagModal2').addEventListener('click', () => {
    document.getElementById('tagModal').classList.remove('active');
  });

  // 确认弹窗关闭
  document.getElementById('closeConfirmModal2').addEventListener('click', () => {
    document.getElementById('confirmModal').classList.remove('active');
  });

  // 颜色选择
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // 高亮设置
  const highlightBtn = document.getElementById('highlightBtn');
  if (highlightBtn) {
    highlightBtn.addEventListener('click', () => {
      console.log('打开高亮设置');
      showHighlightModal();
    });
  }
  document.getElementById('closeHighlightModal').addEventListener('click', () => {
    document.getElementById('highlightModal').classList.remove('active');
  });
  document.getElementById('confirmHighlight').addEventListener('click', () => {
    console.log('确认高亮设置');
    saveHighlightSetting();
  });

  // 高亮选项切换
  document.querySelectorAll('input[name="highlightMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.radio-option').forEach(opt => {
        opt.classList.toggle('selected', opt.querySelector('input').checked);
      });
    });
  });

  // 确认删除
  document.getElementById('closeConfirmModal').addEventListener('click', () => {
    document.getElementById('confirmModal').classList.remove('active');
    deleteCallback = null;
  });
  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    if (deleteCallback) {
      deleteCallback();
    }
    document.getElementById('confirmModal').classList.remove('active');
    deleteCallback = null;
  });

  // 模态框点击外部关闭
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // 添加新位置按钮
  document.getElementById('addNewLocationBtn').addEventListener('click', () => {
    const input = document.getElementById('newLocationInput');
    const name = input.value.trim();
    if (!name) {
      showToast('请输入位置名称');
      return;
    }

    // 创建新位置
    const locations = getLocations();
    const newLocation = {
      id: generateId('loc'),
      name: name,
      parentId: null,
      level: 1
    };
    locations.push(newLocation);
    saveLocations(locations);

    // 选中新创建的位置
    selectLocation(newLocation.id);

    // 清空输入框
    input.value = '';

    showToast(`新位置 "${name}" 已添加并选中`);
    renderHome();
  });

  // 新位置输入框回车确认
  document.getElementById('newLocationInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('addNewLocationBtn').click();
    }
  });

  // 点击外部关闭位置选择器
  document.addEventListener('click', (e) => {
    const picker = document.getElementById('locationPicker');
    const tagAdd = document.querySelector('.location-tag-add');
    if (picker && !picker.contains(e.target) && e.target !== tagAdd && !tagAdd.contains(e.target)) {
      picker.style.display = 'none';
    }
  });

}

// ============================================
// 初始化
// ============================================

function init() {
  console.log('应用初始化...');

  // 检查是否有数据，没有则初始化示例数据
  const existingItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
  const existingLocations = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
  const existingTags = localStorage.getItem(STORAGE_KEYS.TAGS);

  if (!existingItems) {
    console.log('首次使用，初始化示例数据...');
    saveItems(DEFAULT_ITEMS);
    saveLocations(DEFAULT_LOCATIONS);
    saveTags(DEFAULT_TAGS);
    saveSettings(DEFAULT_SETTINGS);
    console.log('示例数据写入完成');
  } else {
    console.log('加载已有数据...');
  }

  // 加载设置
  const settings = getSettings();
  currentHighlightMode = settings.highlightMode;
  console.log('高亮模式:', currentHighlightMode);

  // 更新高亮按钮状态
  const btn = document.getElementById('highlightBtn');
  if (btn) {
    btn.classList.toggle('active', currentHighlightMode !== 'none');
  }

  // 渲染首页
  renderHome();
  console.log('首页渲染完成');

  // 绑定事件
  initEventListeners();
  console.log('事件绑定完成');

  // 如果已配置 GitHub，自动拉取最新数据
  if (isConfigured()) {
    pullFromGitHub().then(() => {
      if (typeof renderHome === 'function') renderHome();
    });
  }
}

// 启动
document.addEventListener('DOMContentLoaded', () => {
  try {
    init();
  } catch (e) {
    console.error('初始化失败:', e);
    alert('初始化失败: ' + e.message);
  }
});

// 调试：检查 localStorage 状态
function checkStorage() {
  console.log('=== localStorage 状态 ===');
  console.log('items:', localStorage.getItem('where2put_items'));
  console.log('locations:', localStorage.getItem('where2put_locations'));
  console.log('tags:', localStorage.getItem('where2put_tags'));
}

// 确保文件完整
console.log('脚本加载完成');

/* ============================================
   优化后的核心逻辑
   - 合并了多个补丁的精华，移除了首页标签和反馈功能
   ============================================ */
(function () {
  let searchReturnView = 'homeView';

  function setBodyView(viewId) {
    document.body.dataset.view = viewId || 'homeView';
  }

  function clearActiveTabs() {
    document.querySelectorAll('.tab-bar-item').forEach(tab => {
      const viewId = tab.dataset.view;
      const active =
        viewId === currentView ||
        (currentView === 'allItemsView' && viewId === 'homeView') ||
        (currentView === 'searchView' && viewId === 'homeView') ||
        (currentView === 'tagFilterView' && viewId === 'homeView') ||
        (currentView === 'locationFilterView' && viewId === 'homeView');
      tab.classList.toggle('active', !!active);
    });
  }

  function closeOverlays() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  function setSearchValue(value) {
    const input = document.getElementById('searchInput');
    if (input && input.value !== value) input.value = value;
  }

  function buildTagBadges(item, max = 3) {
    const tags = getTags();
    const itemTags = (item.tags || []).map(id => tags.find(t => t.id === id)).filter(Boolean);
    const shown = itemTags.slice(0, max).map(tag => `
      <span class="item-tag-badge" style="background:${tag.color}18;color:${tag.color}">
        <span class="tag-dot" style="background:${tag.color}"></span>${escapeHtml(tag.name)}
      </span>
    `).join('');
    const rest = itemTags.length > max ? `<span class="item-tag-badge" style="background:#f1f5f9;color:#64748b">+${itemTags.length - max}</span>` : '';
    return shown + rest;
  }

  function getAllChildLocationIds(locationId, locations) {
    const ids = new Set([locationId]);
    function addChildren(parentId) {
      locations.forEach(loc => {
        if (loc.parentId === parentId) {
          ids.add(loc.id);
          addChildren(loc.id);
        }
      });
    }
    addChildren(locationId);
    return ids;
  }

  switchView = function optimizedSwitchView(viewId) {
    document.querySelectorAll('.view-section').forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });

    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.style.display = 'block';
      requestAnimationFrame(() => targetView.classList.add('active'));
      currentView = viewId;
      setBodyView(viewId);
    }

    const appTitle = document.querySelector('.app-title');
    if (appTitle) {
      appTitle.style.display = viewId === 'homeView' ? 'block' : 'none';
    }

    clearActiveTabs();
    closeOverlays();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function renderHomeRecentList() {
    const items = getItems();
    const recentList = document.getElementById('recentList');
    if (!recentList) return;

    const sortedItems = [...items].sort((a, b) => b.updatedAt - a.updatedAt);

    if (sortedItems.length === 0) {
      recentList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-text">还没有任何物品，点击 + 添加第一个</div>
        </div>
      `;
      return;
    }

    recentList.innerHTML = sortedItems.slice(0, 6).map(item => `
      <div class="item-card-compact" style="cursor: pointer;" onclick="showItemDetail('${item.id}')">
        <div class="item-name-row">
          <span class="item-name">${escapeHtml(item.name)}</span>
          <span class="qty-pill ${window.isLowStock(item) ? 'warning' : ''}">${escapeHtml(String(item.quantity))} 件</span>
        </div>
        <div class="item-location-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${escapeHtml(getLocationPath(item.locationId))}</span>
        </div>
        <div class="item-meta-row">
          <div class="item-tags">${buildTagBadges(item, 2)}</div>
          <span class="item-date">${formatTime(item.updatedAt)}</span>
        </div>
      </div>
    `).join('');
  }

  renderHome = function optimizedRenderHome() {
    const items = getItems();
    const locations = getLocations();

    const totalEl = document.getElementById('totalItems');
    if (totalEl) totalEl.textContent = items.length;

    const lowStockItems = items.filter(window.isLowStock);
    const alertStat = document.getElementById('lowStockAlert');
    if (alertStat) {
      const valueEl = alertStat.querySelector('.stat-value');
      if (valueEl) valueEl.textContent = lowStockItems.length;
      alertStat.onclick = () => showAlertList();
    }

    const badge = document.getElementById('alertBadge');
    if (badge) {
      badge.textContent = lowStockItems.length;
      badge.style.display = lowStockItems.length > 0 ? 'inline' : 'none';
    }

    const locationListItems = document.getElementById('locationListItems');
    if (locationListItems) {
      const rootLocations = locations.filter(l => !l.parentId);
      const locationCounts = {};
      items.forEach(item => {
        locationCounts[item.locationId] = (locationCounts[item.locationId] || 0) + 1;
        let currentLoc = locations.find(l => l.id === item.locationId);
        while (currentLoc && currentLoc.parentId) {
          locationCounts[currentLoc.parentId] = (locationCounts[currentLoc.parentId] || 0) + 1;
          currentLoc = locations.find(l => l.id === currentLoc.parentId);
        }
      });

      locationListItems.innerHTML = rootLocations.map(loc => `
        <div class="location-item" style="cursor: pointer;" onclick="filterByLocation('${loc.id}')">
          <div class="location-info">
            <span class="location-icon">${getLocationIcon(loc.name)}</span>
            <div>
              <div class="location-name">${escapeHtml(loc.name)}</div>
              <div class="location-meta">${locationCounts[loc.id] || 0} 个物品</div>
            </div>
          </div>
          <span class="location-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></span>
        </div>
      `).join('') || `
        <div class="empty-state"><div class="empty-icon">📍</div><div class="empty-text">暂无位置，点击右下角添加</div></div>
      `;
    }

    renderHomeRecentList();
  };

  showItemDetail = function optimizedShowItemDetail(itemId) {
    const items = getItems();
    const item = items.find(i => i.id === itemId);
    if (!item) {
      showToast('物品不存在');
      return;
    }

    window._detailReturnView = currentView || 'homeView';
    currentItemId = itemId;

    const titleEl = document.getElementById('detailItemName');
    if (titleEl) titleEl.textContent = item.name;

    const container = document.getElementById('itemDetail');
    container.innerHTML = `
      <div class="detail-quantity-row">
        <span class="quantity-display">${highlightQuantity(String(item.quantity), currentHighlightMode)}</span>
        <span class="quantity-unit">件</span>
        <div class="quantity-actions">
          <button class="qty-action-btn" onclick="updateItemQuantity(-1)">-</button>
          <button class="qty-action-btn" onclick="updateItemQuantity(1)">+</button>
        </div>
      </div>

      <div class="detail-row">
        <span class="detail-label">存放位置</span>
        <span class="detail-value"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHtml(getLocationPath(item.locationId))}</span>
      </div>

      ${(item.tags || []).length > 0 ? `
        <div class="detail-row">
          <span class="detail-label">标签</span>
          <div class="detail-value item-tags">${buildTagBadges(item, 8)}</div>
        </div>
      ` : ''}

      ${item.threshold !== null && item.threshold !== undefined && item.threshold !== '' ? `
        <div class="detail-row">
          <span class="detail-label">库存提醒</span>
          <span class="detail-value ${window.isLowStock(item) ? 'warning-text' : ''}">低于 ${escapeHtml(String(item.threshold))} 件提醒${window.isLowStock(item) ? '，当前需要补货' : ''}</span>
        </div>
      ` : ''}

      ${item.remark ? `
        <div class="detail-row">
          <span class="detail-label">备注</span>
          <span class="detail-value detail-remark">${escapeHtml(item.remark)}</span>
        </div>
      ` : ''}

      <div class="detail-row detail-time-row">
        <span class="detail-label">更新时间</span>
        <span class="detail-value detail-time">${formatTime(item.updatedAt)}</span>
      </div>
    `;

    switchView('itemDetailView');
  };

  showAllItemsList = function optimizedShowAllItemsList() {
    const items = getItems();
    const tags = getTags();
    const title = document.getElementById('allItemsTitle');
    const tabsContainer = document.getElementById('viewTabs');
    if (title) title.textContent = `所有物品（${items.length}件）`;

    const tagCounts = {};
    items.forEach(item => (item.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const usedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

    let tabsHtml = `<button class="view-tab active" data-tag="" onclick="filterItemsByTag('', this)">全部 ${items.length}</button>`;
    usedTags.forEach(tagId => {
      const tag = tags.find(t => t.id === tagId);
      if (tag) {
        tabsHtml += `
          <button class="view-tab" data-tag="${tagId}" onclick="filterItemsByTag('${tagId}', this)">
            <span class="tag-dot" style="background:${tag.color}"></span>${escapeHtml(tag.name)} ${tagCounts[tagId]}
          </button>
        `;
      }
    });
    if (tabsContainer) tabsContainer.innerHTML = tabsHtml;

    window._allItemsData = { items, tags, locations: getLocations() };
    setSearchValue('');
    currentSearchQuery = '';
    renderAllItemsList(items);
    switchView('allItemsView');
  };

  filterItemsByTag = function optimizedFilterItemsByTag(tagId, btn) {
    document.querySelectorAll('#viewTabs .view-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const data = window._allItemsData || { items: getItems() };
    const filtered = tagId ? data.items.filter(item => (item.tags || []).includes(tagId)) : data.items;
    renderAllItemsList(filtered);
    const title = document.getElementById('allItemsTitle');
    if (title) title.textContent = `所有物品（${filtered.length}件）`;
  };

  renderAllItemsList = function optimizedRenderAllItemsList(items) {
    const container = document.getElementById('allItemsList');
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-text">还没有物品</div>
        </div>
      `;
      return;
    }

    container.innerHTML = [...items]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(item => `
        <div class="item-card" onclick="showItemDetail('${item.id}')">
          <div class="item-name-row">
            <span class="item-name">${escapeHtml(item.name)}</span>
            <span class="qty-pill ${window.isLowStock(item) ? 'warning' : ''}">${escapeHtml(String(item.quantity))} 件</span>
          </div>
          <div class="item-location-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${escapeHtml(getLocationPath(item.locationId))}</span>
          </div>
          <div class="item-meta-row">
            <div class="item-tags">${buildTagBadges(item, 3)}</div>
            <span class="item-date">${formatTime(item.updatedAt)}</span>
          </div>
        </div>
      `).join('');
  };

  performSearch = function optimizedPerformSearch(query) {
    const q = (query || '').trim();
    currentSearchQuery = q;

    if (!q) {
      if (currentView === 'searchView') {
        switchView(searchReturnView || 'homeView');
        if (searchReturnView === 'allItemsView') showAllItemsList();
      } else if (currentView === 'allItemsView') {
        renderAllItemsList((window._allItemsData && window._allItemsData.items) || getItems());
      }
      return;
    }

    if (currentView !== 'searchView') {
      searchReturnView = currentView || 'homeView';
    }

    const items = getItems();
    const tags = getTags();
    const lower = q.toLowerCase();

    const results = items.filter(item => {
      const tagNames = (item.tags || []).map(tid => (tags.find(t => t.id === tid) || {}).name || '').join(' ');
      const haystack = [
        item.name,
        item.remark || '',
        getLocationPath(item.locationId),
        tagNames,
        String(item.quantity)
      ].join(' ').toLowerCase();
      return haystack.includes(lower);
    });

    renderSearchResults(results, q);
    switchView('searchView');
  };

  renderSearchResults = function optimizedRenderSearchResults(results, query = currentSearchQuery) {
    const container = document.getElementById('searchResults');
    const countEl = document.getElementById('resultCount');
    if (countEl) countEl.textContent = `找到 ${results.length} 个结果`;
    if (!container) return;

    if (!results.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>
          <div class="empty-state-text">没有找到匹配的结果</div>
          <div class="empty-hint">可以换个物品名、位置、标签或备注试试</div>
        </div>
      `;
      return;
    }

    container.innerHTML = results
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(item => `
        <div class="search-result-item" onclick="showItemDetail('${item.id}')">
          <div class="item-name-row">
            <div class="result-name">${highlightText(item.name, query, currentHighlightMode)}</div>
            <span class="qty-pill ${window.isLowStock(item) ? 'warning' : ''}">${highlightQuantity(String(item.quantity), currentHighlightMode)} 件</span>
          </div>
          <div class="result-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${highlightText(getLocationPath(item.locationId), query, currentHighlightMode)}</div>
          ${item.remark ? `<div class="item-desc">${highlightText(item.remark, query, currentHighlightMode)}</div>` : ''}
          <div class="item-meta-row">
            <div class="result-tags">${buildTagBadges(item, 3)}</div>
            <span class="result-date">${formatTime(item.updatedAt)}</span>
          </div>
        </div>
      `).join('');
  };

  filterByLocation = function optimizedFilterByLocation(locationId) {
    const items = getItems();
    const locations = getLocations();
    const locIds = getAllChildLocationIds(locationId, locations);
    const results = items.filter(item => locIds.has(item.locationId));
    const location = locations.find(l => l.id === locationId);

    const title = document.getElementById('locationFilterTitle');
    if (title) title.textContent = `${location ? location.name : '位置'}（${results.length}件）`;

    window._locationFilterData = { locationItems: results, tags: getTags(), isAllItems: false };
    renderLocationFilterTabs(results);
    filterLocationByTag('');
    switchView('locationFilterView');
  };

  function renderLocationFilterTabs(locationItems) {
    const tagTabs = document.getElementById('locationTagTabs');
    if (!tagTabs) return;
    const tags = getTags();
    const used = new Set();
    locationItems.forEach(item => (item.tags || []).forEach(t => used.add(t)));
    if (!used.size) {
      tagTabs.style.display = 'none';
      tagTabs.innerHTML = '';
      return;
    }
    let html = '<button class="filter-tab active" data-tag="" onclick="filterLocationByTag(\'\')">全部</button>';
    [...used].forEach(tagId => {
      const tag = tags.find(t => t.id === tagId);
      if (tag) html += `<button class="filter-tab" data-tag="${tagId}" onclick="filterLocationByTag('${tagId}')"><span class="tag-dot" style="background:${tag.color}"></span>${escapeHtml(tag.name)}</button>`;
    });
    tagTabs.innerHTML = html;
    tagTabs.style.display = 'flex';
  }

  showLocationItems = function optimizedShowLocationItems(locationId) {
    filterByLocation(locationId);
  };

  filterLocationByTag = function optimizedFilterLocationByTag(tagId) {
    const container = document.getElementById('locationFilterResults');
    const tagTabs = document.getElementById('locationTagTabs');
    const data = window._locationFilterData || {};
    const locationItems = data.locationItems || [];

    if (tagTabs) {
      tagTabs.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tag === tagId);
      });
    }

    const filtered = tagId ? locationItems.filter(item => (item.tags || []).includes(tagId)) : locationItems;
    if (!container) return;

    if (!filtered.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 17 4H7a2 2 0 0 0-1.55.89z"/></svg></div>
          <div class="empty-state-text">${tagId ? '该标签下没有物品' : '该位置下还没有物品'}</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="search-result-item" onclick="showItemDetail('${item.id}')">
        <div class="item-name-row">
          <div class="result-name">${escapeHtml(item.name)}</div>
          <span class="qty-pill ${window.isLowStock(item) ? 'warning' : ''}">${escapeHtml(String(item.quantity))} 件</span>
        </div>
        <div class="result-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHtml(getLocationPath(item.locationId))}</div>
        <div class="item-meta-row">
          <div class="result-tags">${buildTagBadges(item, 3)}</div>
          <span class="result-date">${formatTime(item.updatedAt)}</span>
        </div>
      </div>
    `).join('');
  };

  function renderAlertList(query = '') {
    const container = document.getElementById('alertFullList');
    if (!container) return;

    const keyword = String(query || '').trim().toLowerCase();
    const lowStockItems = getItems().filter(window.isLowStock).sort((a, b) => Number(a.quantity) - Number(b.quantity));
    const filteredItems = keyword
      ? lowStockItems.filter(item => {
          const tagText = (item.tags || []).map(getTagName).join(' ');
          const haystack = [
            item.name,
            getLocationPath(item.locationId),
            tagText,
            item.remark || '',
            String(item.quantity),
            String(item.threshold || '')
          ].join(' ').toLowerCase();
          return haystack.includes(keyword);
        })
      : lowStockItems;

    if (!lowStockItems.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
          <div class="empty-state-text">所有物品库存充足，无需补货</div>
        </div>
      `;
      return;
    }

    if (!filteredItems.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>
          <div class="empty-state-text">没有找到匹配的需补货物品</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredItems.map(item => `
      <div class="search-result-item" onclick="showItemDetail('${item.id}')">
        <div class="item-name-row">
          <div class="result-name">${escapeHtml(item.name)}</div>
          <span class="qty-pill warning">剩 ${escapeHtml(String(item.quantity))} 件</span>
        </div>
        <div class="result-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHtml(getLocationPath(item.locationId))}</div>
        <div class="item-meta-row">
          <div class="result-tags">${buildTagBadges(item, 3)}</div>
          <span class="result-date">阈值 ${escapeHtml(String(item.threshold))} 件</span>
        </div>
      </div>
    `).join('');
  }

  showAlertList = function optimizedShowAlertList() {
    const input = document.getElementById('alertSearchInput');
    const query = input ? input.value : '';
    renderAlertList(query);
    switchView('alertListView');
  };

  // DOM 加载后补充事件
  document.addEventListener('DOMContentLoaded', () => {
    setBodyView(currentView || 'homeView');

    const backDetail = document.getElementById('backFromDetail');
    if (backDetail) {
      backDetail.onclick = (e) => {
        e.preventDefault();
        const target = window._detailReturnView || 'homeView';
        if (target === 'allItemsView') showAllItemsList();
        else if (target === 'alertListView') showAlertList();
        else switchView(target);
      };
    }

    const backSearch = document.getElementById('backFromSearch');
    if (backSearch) {
      backSearch.onclick = (e) => {
        e.preventDefault();
        setSearchValue('');
        currentSearchQuery = '';
        const target = searchReturnView || 'homeView';
        if (target === 'allItemsView') showAllItemsList();
        else switchView(target);
      };
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          performSearch(searchInput.value);
          searchInput.blur();
        }
      });
    }

    const alertSearchInput = document.getElementById('alertSearchInput');
    const clearAlertSearchBtn = document.getElementById('clearAlertSearchBtn');
    if (alertSearchInput) {
      let alertTimer;
      alertSearchInput.addEventListener('input', (e) => {
        const value = e.target.value || '';
        if (clearAlertSearchBtn) clearAlertSearchBtn.style.display = value.trim() ? 'inline-flex' : 'none';
        clearTimeout(alertTimer);
        alertTimer = setTimeout(() => renderAlertList(value), 180);
      });
      alertSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          renderAlertList(alertSearchInput.value);
          alertSearchInput.blur();
        }
      });
    }
    if (clearAlertSearchBtn) {
      clearAlertSearchBtn.addEventListener('click', () => {
        if (alertSearchInput) alertSearchInput.value = '';
        clearAlertSearchBtn.style.display = 'none';
        renderAlertList('');
      });
    }
  });
})();


// ============================================
// FINAL：位置管理完整交互兜底实现
// - 顶部新建、子位置新增、编辑、删除、查看物品全部可用
// - 使用事件捕获 + 事件委托，避免旧 onclick / 旧监听互相干扰
// - 保存时校验重名、父子循环；删除时处理含物品位置
// ============================================
(function finalLocationManageInteraction() {
  function $(id) { return document.getElementById(id); }
  function locs() { const data = getLocations(); return Array.isArray(data) ? data : []; }
  function items() { const data = getItems(); return Array.isArray(data) ? data : []; }
  function normParent(v) { return v || null; }
  function toast(msg) { if (typeof showToast === 'function') showToast(msg); }

  function safeEscape(text) {
    return typeof escapeHtml === 'function' ? escapeHtml(String(text ?? '')) : String(text ?? '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  function iconLocation() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  }
  function iconPlus() {
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"></path></svg>';
  }
  function iconEdit() {
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
  }
  function iconDelete() {
    return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>';
  }

  function childrenOf(parentId) {
    const parent = normParent(parentId);
    return locs().filter(l => normParent(l.parentId) === parent);
  }

  function descendantsOf(id) {
    const result = new Set();
    const stack = [id];
    const visited = new Set();
    const all = locs();
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || visited.has(cur)) continue;
      visited.add(cur);
      for (const l of all) {
        if (l.parentId === cur && !visited.has(l.id)) {
          result.add(l.id);
          stack.push(l.id);
        }
      }
    }
    return result;
  }

  function relatedIds(id) {
    const set = descendantsOf(id);
    set.add(id);
    return set;
  }

  window.getLocationPath = function getLocationPathFinal(locationId) {
    const all = locs();
    const path = [];
    const visited = new Set();
    let cur = all.find(l => l.id === locationId);
    while (cur && !visited.has(cur.id)) {
      visited.add(cur.id);
      path.unshift(cur.name || '未命名位置');
      cur = cur.parentId ? all.find(l => l.id === cur.parentId) : null;
    }
    return path.join(' > ');
  };

  function calcLevel(parentId) {
    if (!parentId) return 1;
    let level = 2;
    let cur = locs().find(l => l.id === parentId);
    const visited = new Set();
    while (cur && cur.parentId && !visited.has(cur.id)) {
      visited.add(cur.id);
      level += 1;
      cur = locs().find(l => l.id === cur.parentId);
    }
    return level;
  }

  function getRoots() {
    const all = locs();
    const ids = new Set(all.map(l => l.id));
    // 父级为空，或者父级不存在的异常数据，统一作为根节点展示，避免卡死/丢失。
    return all.filter(l => !l.parentId || !ids.has(l.parentId));
  }

  function buildNode(loc, level, visited) {
    if (!loc || visited.has(loc.id)) return '';
    visited.add(loc.id);
    const childList = childrenOf(loc.id).filter(c => !visited.has(c.id));
    const count = items().filter(it => relatedIds(loc.id).has(it.locationId)).length;
    const levelText = level === 0 ? '一级位置' : `${level + 1}级位置`;
    const childrenHtml = childList.map(child => buildNode(child, level + 1, new Set(visited))).join('');
    return `
      <div class="location-manage-node" style="--level:${level}">
        <div class="manage-item location-manage-card" data-location-id="${safeEscape(loc.id)}">
          <button type="button" class="manage-item-left location-open-btn" data-loc-action="open" data-id="${safeEscape(loc.id)}" title="查看该位置物品">
            <span class="manage-location-icon">${iconLocation()}</span>
            <span class="manage-location-main">
              <span class="manage-item-name">${safeEscape(loc.name || '未命名位置')}</span>
              <span class="manage-item-count">${levelText} · ${count} 个物品${childList.length ? ` · ${childList.length} 个子位置` : ''}</span>
            </span>
          </button>
          <div class="manage-item-actions">
            <button type="button" class="icon-btn add" data-loc-action="add-child" data-id="${safeEscape(loc.id)}" title="添加子位置">${iconPlus()}</button>
            <button type="button" class="icon-btn" data-loc-action="edit" data-id="${safeEscape(loc.id)}" title="编辑位置">${iconEdit()}</button>
            <button type="button" class="icon-btn delete" data-loc-action="delete" data-id="${safeEscape(loc.id)}" title="删除位置">${iconDelete()}</button>
          </div>
        </div>
        ${childrenHtml ? `<div class="location-manage-children">${childrenHtml}</div>` : ''}
      </div>`;
  }

  window.renderLocationManageList = function renderLocationManageListFinal() {
    const container = $('locationManageList');
    if (!container) return;
    const roots = getRoots();
    container.innerHTML = `
      <div class="location-manage-hint">
        <span>点击位置名称查看物品；右侧按钮分别用于新增子位置、编辑和删除。</span>
      </div>
      ${roots.length ? roots.map(loc => buildNode(loc, 0, new Set())).join('') : `
        <div class="empty-state">
          <div class="empty-state-icon">${iconLocation()}</div>
          <div class="empty-state-text">还没有位置，点击右上角新建</div>
        </div>`}
    `;
  };

  function parentOptions(selectedParentId, editingId) {
    const forbidden = editingId ? descendantsOf(editingId) : new Set();
    if (editingId) forbidden.add(editingId);
    return '<option value="">无（顶级位置）</option>' + locs().map(loc => {
      const disabled = forbidden.has(loc.id);
      const selected = loc.id === selectedParentId ? 'selected' : '';
      const path = window.getLocationPath(loc.id) || loc.name || '未命名位置';
      return `<option value="${safeEscape(loc.id)}" ${selected} ${disabled ? 'disabled' : ''}>${safeEscape(path)}${disabled ? '（不可选）' : ''}</option>`;
    }).join('');
  }

  window.showAddLocationModal = function showAddLocationModalFinal(parentId = null) {
    const modal = $('locationModal');
    const title = $('locationModalTitle');
    const name = $('locationName');
    const editId = $('editLocationId');
    const parent = $('locationParentSelect');
    if (!modal || !name || !editId || !parent) return;
    if (title) title.textContent = parentId ? '添加子位置' : '添加位置';
    name.value = '';
    editId.value = '';
    parent.innerHTML = parentOptions(parentId || '', '');
    parent.value = parentId || '';
    modal.classList.add('active');
    setTimeout(() => name.focus(), 50);
  };

  window.editLocation = function editLocationFinal(locationId) {
    const loc = locs().find(l => l.id === locationId);
    if (!loc) return toast('位置不存在');
    const modal = $('locationModal');
    const title = $('locationModalTitle');
    const name = $('locationName');
    const editId = $('editLocationId');
    const parent = $('locationParentSelect');
    if (!modal || !name || !editId || !parent) return;
    if (title) title.textContent = '编辑位置';
    name.value = loc.name || '';
    editId.value = loc.id;
    parent.innerHTML = parentOptions(loc.parentId || '', loc.id);
    parent.value = loc.parentId || '';
    modal.classList.add('active');
    setTimeout(() => name.focus(), 50);
  };

  window.saveLocation = function saveLocationFinal() {
    const nameEl = $('locationName');
    const editEl = $('editLocationId');
    const parentEl = $('locationParentSelect');
    const modal = $('locationModal');
    if (!nameEl || !editEl || !parentEl) return;
    const name = nameEl.value.trim();
    const editId = editEl.value || '';
    const parentId = parentEl.value || null;
    if (!name) return toast('请输入位置名称');
    if (editId && (parentId === editId || descendantsOf(editId).has(parentId))) {
      return toast('不能选择自己或自己的下级作为父级');
    }
    const all = locs();
    if (all.some(l => l.id !== editId && normParent(l.parentId) === normParent(parentId) && l.name === name)) {
      return toast('同级位置已存在相同名称');
    }
    if (editId) {
      const idx = all.findIndex(l => l.id === editId);
      if (idx < 0) return toast('位置不存在');
      all[idx] = { ...all[idx], name, parentId, level: calcLevel(parentId) };
      toast('位置已更新');
    } else {
      all.push({ id: generateId('loc'), name, parentId, level: calcLevel(parentId) });
      toast('位置已添加');
    }
    saveLocations(all);
    if (modal) modal.classList.remove('active');
    window.renderLocationManageList();
    if (typeof renderHome === 'function') renderHome();
  };

  function restoreConfirmModal() {
    const body = document.querySelector('#confirmModal .modal-body');
    const footer = document.querySelector('#confirmModal .modal-footer');
    if (body) body.innerHTML = '<p id="confirmMessage" style="text-align: center; color: var(--color-text-secondary);">确定要删除吗？此操作不可撤销。</p>';
    if (footer) footer.innerHTML = '<button class="btn btn-secondary" style="flex:1;" id="closeConfirmModal2">取消</button><button class="btn btn-danger" style="flex:1;" id="confirmDeleteBtn">删除</button>';
  }

  function closeConfirm() {
    const modal = $('confirmModal');
    if (modal) modal.classList.remove('active');
    setTimeout(restoreConfirmModal, 120);
  }

  window.deleteLocation = function deleteLocationFinal(locationId) {
    const all = locs();
    const loc = all.find(l => l.id === locationId);
    if (!loc) return toast('位置不存在');
    if (all.some(l => l.parentId === locationId)) return toast('该位置有子位置，请先删除子位置');

    const directItems = items().filter(it => it.locationId === locationId);
    const modal = $('confirmModal');
    if (!modal) return;

    if (!directItems.length) {
      restoreConfirmModal();
      const msg = $('confirmMessage');
      if (msg) msg.textContent = `确定要删除位置"${loc.name}"吗？此操作不可撤销。`;
      deleteCallback = function () {
        saveLocations(locs().filter(l => l.id !== locationId));
        closeConfirm();
        toast('位置已删除');
        window.renderLocationManageList();
        if (typeof renderHome === 'function') renderHome();
      };
      modal.classList.add('active');
      return;
    }

    const targets = all.filter(l => l.id !== locationId);
    const body = document.querySelector('#confirmModal .modal-body');
    const footer = document.querySelector('#confirmModal .modal-footer');
    if (body) body.innerHTML = `
      <div style="line-height:1.7;color:var(--color-text-secondary);">
        <div style="font-weight:600;color:var(--color-text-primary);margin-bottom:8px;">"${safeEscape(loc.name)}" 下还有 ${directItems.length} 个物品</div>
        <div style="margin-bottom:10px;">可以先把物品移动到其他位置，再删除该位置。</div>
        <select id="locMoveTarget" class="form-input form-select" ${targets.length ? '' : 'disabled'}>
          ${targets.length ? targets.map(t => `<option value="${safeEscape(t.id)}">${safeEscape(window.getLocationPath(t.id))}</option>`).join('') : '<option value="">暂无其他位置</option>'}
        </select>
      </div>`;
    if (footer) footer.innerHTML = `
      <button class="btn btn-secondary" style="flex:1;" id="closeConfirmModal2">取消</button>
      <button class="btn btn-danger" style="flex:1;" id="locDirectDeleteBtn">删除物品和位置</button>
      <button class="btn btn-primary" style="flex:1;" id="locMoveDeleteBtn" ${targets.length ? '' : 'disabled'}>移动后删除</button>`;
    modal.classList.add('active');

    window.__pendingLocationDeleteId = locationId;
  };

  function moveThenDelete(locationId) {
    const target = $('locMoveTarget');
    const targetId = target ? target.value : '';
    if (!targetId) return toast('请选择目标位置');
    saveItems(items().map(it => it.locationId === locationId ? { ...it, locationId: targetId, updatedAt: Date.now() } : it));
    saveLocations(locs().filter(l => l.id !== locationId));
    closeConfirm();
    toast('物品已移动，位置已删除');
    window.renderLocationManageList();
    if (typeof renderHome === 'function') renderHome();
  }

  function deleteWithItems(locationId) {
    saveItems(items().filter(it => it.locationId !== locationId));
    saveLocations(locs().filter(l => l.id !== locationId));
    closeConfirm();
    toast('位置和物品已删除');
    window.renderLocationManageList();
    if (typeof renderHome === 'function') renderHome();
  }

  window.showLocationManage = function showLocationManageFinal() {
    window.renderLocationManageList();
    switchView('locationManageView');
  };

  // 用捕获阶段兜底，保证按钮真实触发完整交互，而不是被旧监听或卡片点击吞掉。
  document.addEventListener('click', function (e) {
    const addTop = e.target.closest && e.target.closest('#addLocationBtn');
    if (addTop) {
      e.preventDefault();
      e.stopImmediatePropagation();
      window.showAddLocationModal(null);
      return;
    }

    const saveBtn = e.target.closest && e.target.closest('#saveLocationBtn');
    if (saveBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      window.saveLocation();
      return;
    }

    const closeLoc = e.target.closest && e.target.closest('#closeLocationModal, #closeLocationModal2');
    if (closeLoc) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const modal = $('locationModal');
      if (modal) modal.classList.remove('active');
      return;
    }

    const locBtn = e.target.closest && e.target.closest('[data-loc-action], [data-action]');
    if (locBtn && locBtn.closest('#locationManageList')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const action = locBtn.dataset.locAction || locBtn.dataset.action;
      const id = locBtn.dataset.id;
      if (action === 'open') {
        if (typeof window.showLocationItems === 'function') window.showLocationItems(id);
        else if (typeof showLocationItems === 'function') showLocationItems(id);
        else if (typeof filterByLocation === 'function') filterByLocation(id);
      } else if (action === 'add-child') {
        window.showAddLocationModal(id);
      } else if (action === 'edit') {
        window.editLocation(id);
      } else if (action === 'delete') {
        window.deleteLocation(id);
      }
      return;
    }

    const closeConfirmBtn = e.target.closest && e.target.closest('#closeConfirmModal, #closeConfirmModal2');
    if (closeConfirmBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      closeConfirm();
      return;
    }

    const moveDelete = e.target.closest && e.target.closest('#locMoveDeleteBtn');
    if (moveDelete) {
      e.preventDefault();
      e.stopImmediatePropagation();
      moveThenDelete(window.__pendingLocationDeleteId);
      return;
    }

    const directDelete = e.target.closest && e.target.closest('#locDirectDeleteBtn');
    if (directDelete) {
      e.preventDefault();
      e.stopImmediatePropagation();
      deleteWithItems(window.__pendingLocationDeleteId);
      return;
    }

    const confirmDelete = e.target.closest && e.target.closest('#confirmDeleteBtn');
    if (confirmDelete) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (typeof deleteCallback === 'function') deleteCallback();
      deleteCallback = null;
      const confirmModal = $('confirmModal');
      if (confirmModal) confirmModal.classList.remove('active');
      return;
    }
  }, true);

  // 在进入页面或刷新渲染时，确保展示的是最终版列表。
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if ($('locationManageList')) window.renderLocationManageList();
    });
  } else if ($('locationManageList')) {
    window.renderLocationManageList();
  }
})();

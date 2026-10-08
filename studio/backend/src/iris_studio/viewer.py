"""离线展示页只渲染冻结资料，不连接 Agent 或提供执行动作。"""

from .export_models import ShowcaseRecord

VIEWER_CSS = """
:root{font-family:Inter,'Segoe UI','Microsoft YaHei',sans-serif;color:#24212e;background:#f6f5f8;font-synthesis:none}*{box-sizing:border-box}body{margin:0}header{padding:24px 32px;background:white;border-bottom:1px solid #e5e2eb;display:flex;justify-content:space-between;align-items:center;gap:20px}h1{font-size:20px;margin:0 0 6px}h2{font-size:16px}h3{font-size:14px}small,.muted{color:#777080}.tag{background:#eeebf6;color:#695098;font-size:12px;border-radius:20px;padding:6px 12px}.layout{display:grid;grid-template-columns:240px minmax(0,1fr);max-width:1500px;margin:auto;min-height:calc(100vh - 93px)}nav{padding:20px 12px;border-right:1px solid #e5e2eb}nav button{display:block;width:100%;padding:12px;border:1px solid transparent;border-radius:8px;background:none;text-align:left;margin-bottom:7px;font:inherit;cursor:pointer;overflow-wrap:anywhere}nav button[aria-pressed=true]{background:white;border-color:#d8cdec;color:#654798}.content{padding:24px;min-width:0}.columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.75fr);gap:24px}.card{background:white;border:1px solid #e5e2eb;border-radius:12px;padding:18px;margin-bottom:14px;min-width:0}.card p{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.65;font-size:14px}.card img{max-width:100%;max-height:450px;border-radius:8px}.role{font-size:12px;font-weight:600;color:#735a9a}details{margin:12px 0}summary{cursor:pointer;font-size:13px;padding:6px 0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;line-height:1.6;background:#f6f5f8;border-radius:6px;padding:12px;max-height:560px;overflow:auto}.notice{padding:14px 18px;background:#fff7e7;border:1px solid #eddfc5;border-radius:9px;font-size:13px;line-height:1.6;margin-bottom:18px}a{color:#654798}button:focus-visible,a:focus-visible{outline:2px solid #8057b1;outline-offset:3px}@media(max-width:850px){.layout{grid-template-columns:1fr}nav{display:flex;gap:8px;overflow:auto;border-right:0;border-bottom:1px solid #e5e2eb}nav button{min-width:180px;margin:0}.columns{grid-template-columns:1fr}header,.content{padding:18px}}
"""

VIEWER_JS = r"""
(()=>{'use strict';
const record=JSON.parse(document.getElementById('record').textContent);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const detail=(title,data)=>{const d=el('details');d.append(el('summary',title),el('pre',JSON.stringify(data,null,2)));return d;};
document.getElementById('title').textContent=record.title;
document.getElementById('time').textContent=new Date(record.captured_at).toLocaleString();
const content=document.getElementById('content'),nav=document.getElementById('runs');
function part(p,card){if(p.type==='text')card.append(el('p',p.text));else if(p.type==='image'){if(!p.media.original_url){card.append(el('p','图片副本未包含在这个包内','muted'));return;}const img=el('img');img.src=p.media.original_url;img.alt=p.name||'记录中的图片';card.append(img);}else if(p.type==='tool_use')card.append(detail('工具请求 · '+p.name,p.input));else if(p.type==='tool_result'){card.append(el('h3','工具结果 · '+p.name));p.content.forEach(item=>part(item,card));}}
function show(index){content.replaceChildren();[...nav.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));const r=record.runs[index];if(!r)return;record.missing.forEach(m=>content.append(el('div',m,'notice')));const heading=el('div',undefined,'card');heading.append(el('h2',r.run.run_id),el('p',`会话 ${r.session_id} · ${r.run.phase} · ${r.run.stop_reason||'捕获时尚未结束'}`));content.append(heading);const columns=el('div',undefined,'columns'),messages=el('section'),facts=el('aside');messages.setAttribute('aria-label','真实消息');facts.setAttribute('aria-label','运行观察');for(const m of r.messages){const card=el('article',undefined,'card');card.append(el('span',`${m.sender||m.role} · #${m.ordinal}`,'role'));m.parts.forEach(p=>part(p,card));messages.append(card);}if(!r.messages.length)messages.append(el('p','捕获范围内没有已提交消息','muted'));const tools=el('section',undefined,'card');tools.append(el('h2','工具与交付物'));for(const t of r.tools){tools.append(detail(`${t.tool_name} · ${t.phase}`,t));if(t.result?.artifact?.download_url){const a=el('a','打开已导出产物');a.href=t.result.artifact.download_url;a.download='';tools.append(a);}}facts.append(tools);const evidence=el('section',undefined,'card');evidence.append(el('h2','实际观察资料'),detail('上下文、配置与模型调用',r.evidence),detail('持久事件',r.events),detail('运行结果',r.result),detail('来源与捕获范围',{source_id:r.source_id,message_start:r.message_start,message_end:r.message_end,event_watermark:r.event_watermark,lineage:r.lineage}));facts.append(evidence);if(record.publications.length)facts.append(detail('选定的发布记录',record.publications));columns.append(messages,facts);content.append(columns);}
record.runs.forEach((r,i)=>{const b=el('button',`${i+1}. ${r.run.run_id}`);b.type='button';b.addEventListener('click',()=>show(i));nav.append(b);});show(0);
})();
"""


def viewer_html(record: ShowcaseRecord) -> str:
    """将 JSON 作为惰性文本嵌入，避免 file 协议跨文件 fetch。"""
    payload = (
        record.model_dump_json()
        .replace("<", "\\u003c")
        .replace("\u2028", "\\u2028")
        .replace("\u2029", "\\u2029")
    )
    return (
        '<!doctype html><html lang="zh-CN"><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Iris Studio · 只读记录</title><link rel="stylesheet" href="viewer.css">'
        '<header><div><h1 id="title"></h1><small id="time"></small></div>'
        '<span class="tag">Iris Studio · 只读记录</span></header>'
        '<div class="layout"><nav id="runs" aria-label="选定运行"></nav>'
        '<main id="content" class="content"></main></div>'
        f'<script type="application/json" id="record">{payload}</script>'
        '<script src="viewer.js"></script></html>'
    )

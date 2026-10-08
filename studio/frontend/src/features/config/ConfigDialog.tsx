import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { parseDocument, stringify } from 'yaml';
import { ApiFailure, post, request, waitOperation } from '../../api/client';
import type {
  ConfigDraft,
  ConfigValidation,
  GenerationView,
  OperationAccepted,
  OperationView,
  ProfileView,
} from '../../api/types';
import { Button, Dialog, ErrorNotice, JsonDetails, Loading } from '../../components/Primitives';
import { configGroups, type ConfigField } from './fields';
import { editYamlField } from './yaml';

function FieldEditor({
  field,
  source,
  change,
  onEdit,
  reportError,
}: {
  field: ConfigField;
  source: string;
  change: (value: string) => void;
  onEdit: () => void;
  reportError: (error: unknown) => void;
}) {
  const document = useMemo(() => parseDocument(source), [source]);
  const value = document.getIn(field.path.split('.'));
  const initial =
    field.kind === 'yaml' ? (value === undefined ? '' : stringify(value)) : String(value ?? '');
  const [text, setText] = useState(initial);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => setText(initial), [initial]);
  const apply = (): void => {
    if (text === initial) {
      reportError(null);
      setError(null);
      return;
    }
    try {
      const parsed = field.kind === 'yaml' ? parseDocument(text) : null;
      if (parsed?.errors.length) throw new Error(parsed.errors[0].message);
      change(editYamlField(source, field.path.split('.'), parsed ? parsed.toJS() : text || null));
      reportError(null);
      setError(null);
    } catch (caught) {
      reportError(caught);
      setError(caught);
    }
  };
  return (
    <label className="config-field">
      <span>{field.label}</span>
      {field.help && <small>{field.help}</small>}
      {field.kind === 'yaml' || field.kind === 'textarea' ? (
        <textarea
          aria-label={field.label}
          className={field.kind === 'yaml' ? 'code-input' : ''}
          rows={Math.min(9, Math.max(3, text.split('\n').length))}
          value={text}
          disabled={document.errors.length > 0}
          onChange={(event) => {
            setText(event.target.value);
            setError(null);
            onEdit();
          }}
          onBlur={apply}
          placeholder="未声明；采用内核默认值"
        />
      ) : (
        <input
          aria-label={field.label}
          value={text}
          disabled={document.errors.length > 0}
          onChange={(event) => {
            setText(event.target.value);
            setError(null);
            onEdit();
          }}
          onBlur={apply}
        />
      )}
      <ErrorNotice error={error} />
    </label>
  );
}

export function ConfigDialog({
  profile,
  generations,
  close,
  adopted,
}: {
  profile: ProfileView;
  generations: GenerationView[];
  close: () => void;
  adopted: (generation: GenerationView) => void;
}) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['draft', profile.profile_id],
    queryFn: () => request<ConfigDraft>(`/api/profiles/${profile.profile_id}/draft`),
  });
  const [draft, setDraft] = useState<ConfigDraft | null>(null);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const textsRef = useRef<Record<string, string>>({});
  const draftRef = useRef<ConfigDraft | null>(null);
  const fieldErrors = useRef(new Map<string, unknown>());
  const [fieldEditing, setFieldEditing] = useState(false);
  const [selected, setSelected] = useState('');
  const [group, setGroup] = useState(0);
  const [sourceMode, setSourceMode] = useState(false);
  const [validation, setValidation] = useState<ConfigValidation | null>(null);
  const [revision, setRevision] = useState(profile.saved_revision_id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [operation, setOperation] = useState<OperationView | null>(null);
  const [importPath, setImportPath] = useState('');
  const [importKind, setImportKind] = useState('context');
  const load = (value: ConfigDraft): void => {
    draftRef.current = value;
    textsRef.current = Object.fromEntries(
      value.documents.map((document) => [document.document_id, document.draft_text]),
    );
    setDraft(value);
    setTexts(textsRef.current);
    setSelected((old) => old || value.documents[0]?.document_id || '');
  };
  useEffect(() => {
    if (query.data) load(query.data);
  }, [query.data]);
  const document = draft?.documents.find((item) => item.document_id === selected);
  const text = texts[selected] ?? '';
  const parsed = useMemo(() => parseDocument(text), [text]);
  const dirty =
    draft?.documents.some((item) => texts[item.document_id] !== item.draft_text) ?? false;
  const unsaved =
    draft?.documents.some((item) => texts[item.document_id] !== item.base_text) ?? false;
  const update = (value: string): void => {
    textsRef.current = { ...textsRef.current, [selected]: value };
    setTexts(textsRef.current);
    setValidation(null);
  };
  const updateSource = (value: string): void => {
    for (const key of fieldErrors.current.keys()) {
      if (key.startsWith(`${selected}/`)) fieldErrors.current.delete(key);
    }
    setFieldEditing(false);
    setError(null);
    update(value);
  };
  const syncDraft = async (): Promise<ConfigDraft> => {
    if (fieldErrors.current.size) throw fieldErrors.current.values().next().value;
    const current = draftRef.current;
    if (!current) throw new Error('草稿尚未载入');
    const latest = textsRef.current;
    if (!current.documents.some((item) => latest[item.document_id] !== item.draft_text))
      return current;
    const result = await request<ConfigDraft>(`/api/profiles/${profile.profile_id}/draft`, {
      method: 'PUT',
      body: JSON.stringify({
        base_draft_revision: current.draft_revision,
        documents: current.documents.map((item) => ({
          document_id: item.document_id,
          text: latest[item.document_id],
        })),
      }),
    });
    load(result);
    return result;
  };
  const act = async (action: 'validate' | 'save' | 'apply'): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      if (action === 'apply') {
        const accepted = await post<OperationAccepted>(
          `/api/profiles/${profile.profile_id}/apply`,
          { config_revision_id: revision },
        );
        const complete = await waitOperation(accepted, setOperation);
        adopted(complete.result as GenerationView);
        client.invalidateQueries({ queryKey: ['app'] });
      } else {
        const current = await syncDraft();
        if (action === 'validate')
          setValidation(
            await post<ConfigValidation>(`/api/profiles/${profile.profile_id}/validate`, {
              draft_revision: current.draft_revision,
            }),
          );
        else {
          const result = await post<{ config_revision_id: string; draft: ConfigDraft }>(
            `/api/profiles/${profile.profile_id}/save`,
            {
              draft_revision: current.draft_revision,
              document_ids: current.documents.map((item) => item.document_id),
            },
          );
          setRevision(result.config_revision_id);
          load(result.draft);
          client.invalidateQueries({ queryKey: ['app'] });
        }
      }
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const importDocument = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      await syncDraft();
      load(
        await post<ConfigDraft>(`/api/profiles/${profile.profile_id}/documents/import`, {
          path: importPath,
          kind: importKind,
        }),
      );
      setImportPath('');
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  const retire = async (generation: GenerationView): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      await waitOperation(
        await post<OperationAccepted>(`/api/generations/${generation.generation_id}/retire`),
        setOperation,
      );
      client.invalidateQueries({ queryKey: ['app'] });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog title={`Agent 配置 · ${profile.title}`} wide onClose={close}>
      <ErrorNotice error={query.error || error} />
      {error instanceof ApiFailure && (
        <JsonDetails value={error.details} label="冲突与占用详情" open />
      )}
      {!draft ? (
        <Loading />
      ) : (
        <>
          <div className="config-toolbar">
            <select
              aria-label="配置文档"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              {draft.documents.map((item) => (
                <option key={item.document_id} value={item.document_id}>
                  {item.kind} · {item.original_path}
                </option>
              ))}
            </select>
            <Button onClick={() => setSourceMode(!sourceMode)}>
              {sourceMode ? '分组编辑' : '完整 YAML'}
            </Button>
          </div>
          <p className="muted small">
            {document?.original_path} {dirty ? '· 有未保存修改' : ''}
          </p>
          <div className="config-layout">
            <nav aria-label="配置分组">
              {configGroups.map((item, index) => (
                <button
                  className={group === index ? 'selected' : ''}
                  key={item.title}
                  onClick={() => setGroup(index)}
                >
                  {item.title}
                </button>
              ))}
            </nav>
            <div className="config-content">
              {sourceMode || document?.kind !== 'agent' ? (
                <CodeMirror
                  value={text}
                  height="430px"
                  extensions={[yaml()]}
                  onChange={updateSource}
                  aria-label="YAML 源文档"
                />
              ) : (
                <>
                  <h3>{configGroups[group].title}</h3>
                  <p className="muted">{configGroups[group].description}</p>
                  {parsed.errors.length > 0 ? (
                    <ErrorNotice error={parsed.errors[0].message} />
                  ) : (
                    configGroups[group].fields.map((field) => (
                      <FieldEditor
                        key={`${selected}-${field.path}`}
                        field={field}
                        source={text}
                        change={update}
                        onEdit={() => {
                          setValidation(null);
                          setError(null);
                          setFieldEditing(true);
                        }}
                        reportError={(error) => {
                          const key = `${selected}/${field.path}`;
                          if (error) fieldErrors.current.set(key, error);
                          else fieldErrors.current.delete(key);
                          setFieldEditing(!!error);
                        }}
                      />
                    ))
                  )}
                </>
              )}
            </div>
          </div>
          {validation && (
            <div className={validation.valid ? 'notice' : 'error-notice'}>
              {validation.valid ? '声明校验通过' : '请修正以下配置问题'}
              {validation.diagnostics.map((diagnostic, index) => (
                <p key={index}>
                  {diagnostic.path} {diagnostic.message}
                </p>
              ))}
            </div>
          )}
          <div className="actions config-actions">
            <Button disabled={busy} onClick={() => void act('validate')}>
              校验声明
            </Button>
            <Button disabled={busy} onClick={() => void act('save')}>
              保存文件
            </Button>
            <Button
              variant="primary"
              disabled={busy || unsaved || fieldEditing || !revision}
              onClick={() => void act('apply')}
            >
              采用为新实例
            </Button>
            <span className="muted small">保存与采用分别执行，已有会话仍属于原实例。</span>
          </div>
          <details>
            <summary>关联文档与已采用实例</summary>
            <div className="inline-form">
              <input
                aria-label="关联文件路径"
                placeholder="关联文件路径"
                value={importPath}
                onChange={(event) => setImportPath(event.target.value)}
              />
              <select
                aria-label="文档类型"
                value={importKind}
                onChange={(event) => setImportKind(event.target.value)}
              >
                {['context', 'mcp', 'decision', 'subagent_catalog', 'prompt', 'skill'].map(
                  (kind) => (
                    <option key={kind}>{kind}</option>
                  ),
                )}
              </select>
              <Button disabled={busy || !importPath} onClick={() => void importDocument()}>
                导入文档
              </Button>
            </div>
            {generations
              .filter((item) => item.profile_id === profile.profile_id)
              .map((item) => (
                <div className="generation-row" key={item.generation_id}>
                  <div>
                    <strong>{item.state}</strong>
                    <small>{item.generation_id}</small>
                    <small>采用 {item.config_revision_id}</small>
                    {item.requested_config_revision_id && (
                      <small>请求起点 {item.requested_config_revision_id}</small>
                    )}
                  </div>
                  <Button
                    disabled={busy || item.state === 'retired'}
                    onClick={() => void retire(item)}
                  >
                    退役实例
                  </Button>
                </div>
              ))}
          </details>
          {operation && (
            <JsonDetails
              value={operation}
              label={operation.state === 'running' ? '操作进行中 / 占用详情' : '操作结果'}
              open={(operation.blockers?.length ?? 0) > 0}
            />
          )}
        </>
      )}
    </Dialog>
  );
}

import { isScalar, parseDocument } from 'yaml';

/** 单字段更新原 YAML AST，保留其它字段、相对路径与注释。 */
export function editYamlField(source: string, path: string[], value: unknown): string {
  const document = parseDocument(source);
  if (document.errors.length) throw new Error(document.errors[0].message);
  const previous = document.getIn(path, true);
  if (isScalar(previous) && (value === null || typeof value !== 'object')) previous.value = value;
  else document.setIn(path, value);
  return document.toString();
}

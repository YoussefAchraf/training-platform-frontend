#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const filePath = process.argv[2] || '';
const ext = path.extname(filePath);
const base = path.basename(filePath);
const input = fs.readFileSync(0, 'utf8');



function isPreservedDirective(line) {
  return /^#!/.test(line) || /^#\s*syntax\s*=/i.test(line) || /^#\s*escape\s*=/i.test(line);
}

function stripHashComments(text) {
  return text
    .split('\n')
    .map((line) => {
      if (isPreservedDirective(line)) return line;
      let inSingle = false;
      let inDouble = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (!inDouble && ch === "'") inSingle = !inSingle;
        else if (!inSingle && ch === '"') inDouble = !inDouble;
        else if (!inSingle && !inDouble && ch === '#') {
          return line.slice(0, i).replace(/\s+$/, '');
        }
      }
      return line;
    })
    .join('\n');
}

function stripSqlComments(text) {
  return text
    .split('\n')
    .map((line) => {
      let inSingle = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === "'") {
          if (inSingle && line[i + 1] === "'") {
            i++;
            continue;
          }
          inSingle = !inSingle;
        } else if (!inSingle && ch === '-' && line[i + 1] === '-') {
          return line.slice(0, i).replace(/\s+$/, '');
        }
      }
      return line;
    })
    .join('\n');
}



function stripCssComments(text) {
  let result = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      result += ch;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      result += ch;
      continue;
    }
    if (!inSingle && !inDouble && ch === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end === -1 ? text.length : end + 1;
      continue;
    }
    result += ch;
  }
  return result;
}





function stripJsonComments(text) {
  let result = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inString) {
      result += ch;
      if (ch === '\\') {
        result += next;
        i++;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      result += ch;
      continue;
    }
    if (ch === '/' && next === '/') {
      const end = text.indexOf('\n', i + 2);
      i = end === -1 ? text.length : end - 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end === -1 ? text.length : end + 1;
      continue;
    }
    result += ch;
  }
  return result;
}




function stripXmlComments(text) {
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (text.startsWith('<!--', i)) {
      const end = text.indexOf('-->', i + 4);
      i = end === -1 ? text.length : end + 3;
      continue;
    }
    result += text[i];
    i++;
  }
  return result;
}






const REGEX_PRECEDING_KEYWORDS = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void',
  'throw', 'case', 'do', 'else', 'yield', 'await',
]);
const EXPRESSION_END_KINDS = new Set([
  ts.SyntaxKind.NumericLiteral,
  ts.SyntaxKind.BigIntLiteral,
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.RegularExpressionLiteral,
  ts.SyntaxKind.CloseParenToken,
  ts.SyntaxKind.CloseBracketToken,
  ts.SyntaxKind.CloseBraceToken,
  ts.SyntaxKind.PlusPlusToken,
  ts.SyntaxKind.MinusMinusToken,
  ts.SyntaxKind.ThisKeyword,
  ts.SyntaxKind.SuperKeyword,
  ts.SyntaxKind.TrueKeyword,
  ts.SyntaxKind.FalseKeyword,
  ts.SyntaxKind.NullKeyword,
]);

function canPrecedeRegex(prevKind, prevText) {
  if (prevKind === undefined) return true;
  if (prevKind === ts.SyntaxKind.Identifier) return REGEX_PRECEDING_KEYWORDS.has(prevText);
  return !EXPRESSION_END_KINDS.has(prevKind);
}






function stripJsComments(text) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.JSX, text);
  let output = '';
  let pos = 0;
  let prevKind;
  let prevText;
  let tok = scanner.scan();
  while (tok !== ts.SyntaxKind.EndOfFileToken) {
    if (tok === ts.SyntaxKind.SlashToken || tok === ts.SyntaxKind.SlashEqualsToken) {
      if (canPrecedeRegex(prevKind, prevText)) tok = scanner.reScanSlashToken();
    }
    const start = scanner.getTokenPos();
    const end = scanner.getTextPos();
    if (tok === ts.SyntaxKind.SingleLineCommentTrivia || tok === ts.SyntaxKind.MultiLineCommentTrivia) {
      output += text.slice(pos, start);
      pos = end;
    } else if (tok !== ts.SyntaxKind.WhitespaceTrivia && tok !== ts.SyntaxKind.NewLineTrivia) {
      prevKind = tok;
      prevText = text.slice(start, end);
    }
    tok = scanner.scan();
  }
  output += text.slice(pos);
  return output;
}

const jsLikeExts = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const jsonLikeExts = new Set(['.json', '.webmanifest']);
const xmlCommentExts = new Set(['.html', '.svg', '.md']);
const hashCommentExts = new Set(['.yml', '.yaml', '.sh', '.template']);
const hashCommentFiles = new Set(['Dockerfile', '.dockerignore', '.gitignore', '.gitattributes']);
const isEnvFile = base === '.env' || base.startsWith('.env.');

let output;
if (jsLikeExts.has(ext)) {
  output = stripJsComments(input);
} else if (ext === '.css') {
  output = stripCssComments(input);
} else if (jsonLikeExts.has(ext)) {
  output = stripJsonComments(input);
} else if (xmlCommentExts.has(ext)) {
  output = stripXmlComments(input);
} else if (ext === '.sql') {
  output = stripSqlComments(input);
} else if (hashCommentExts.has(ext) || hashCommentFiles.has(base) || isEnvFile) {
  output = stripHashComments(input);
} else {
  output = input;
}

process.stdout.write(output);

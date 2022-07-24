import LispCell, { LispType } from "./LispCell";

export type Token = {
  val: string;
  offset: number;
  len: number;
};

// return true iff given character is '0'..'9'
function isdig(c: string): boolean {
  return !!c.match(/\d+/);
}

// numbers become Numbers; every other token is a Symbol
export function lispAtom(token: Token) {
  // console.log("Making atom for " + token);
  if (
    isdig(token.val[0]) ||
    (token.val[0] === "-" && token.val.length > 1 && isdig(token.val[1]))
  ) {
    return new LispCell(LispType.Number, token.val);
  }
  return new LispCell(LispType.Symbol, token.val);
}

/**
 * Convert given string to list of tokens.
 */
export function tokenize(str: string): Token[] {
  const tokens: Token[] = [];
  str = str.toString();
  let i = 0;
  while (i < str.length) {
    let c = str.charAt(i);
    if (c === ";") {
      while (c !== "\n") {
        c = str.charAt(++i);
      }
      ++i;
      continue;
    }
    if (c === " ") {
      ++i;
      continue;
    }
    if (c === "\n") {
      tokens.push({ val: c, offset: i, len: 1 });
      ++i;
      continue;
    }
    if (c === "(" || c === ")") {
      tokens.push({ val: c, offset: i, len: 1 });
      ++i;
      continue;
    }

    // A string.
    if (c === '"') {
      ++i;
      const start = i;
      let count = 0;
      c = str.charAt(i);
      while (c != '"') {
        ++count;
        ++i;
        c = str.charAt(i);
      }
      tokens.push({
        val: str.substring(start, start + count),
        offset: start - 1,
        len: count + 1,
      });
      ++i;
      continue;
    }

    // A symbol or procedure name.
    const start = i;
    let count = 0;
    while (
      i < str.length &&
      c !== " " &&
      c !== "\n" &&
      c !== "(" &&
      c !== ")"
    ) {
      ++count;
      c = str.charAt(i++);
    }
    --count;
    --i;
    tokens.push({
      val: str.substring(start, start + count),
      offset: start,
      len: count,
    });
  }
  return tokens;
}

/**
 * Returns the Lisp expression in the given tokens.
 */
export function parseTokens(
  tokens: Token[],
  replace: (start: number, len: number, val: string) => void
): LispCell {
  let token: Token = tokens.shift();
  while (token.val == "\n") {
    token = tokens.shift();
  }
  if (token.val === "(") {
    const start = token.offset;
    const c = new LispCell(LispType.List);
    let newLined = false;
    while (tokens.length > 1 && tokens[0].val !== ")") {
      if (tokens[0].val === "\n") {
        tokens.shift();
        newLined = true;
        continue;
      }
      const child = parseTokens(tokens, replace);
      if (newLined) {
        child.newLined = true;
        newLined = false;
      }
      c.list.push(child);
    }
    const endToken = tokens.shift();
    c.setReplace(start, endToken.offset + endToken.len - start)
    return c;
  } else {
    const c = lispAtom(token);
    c.setReplace(token.offset, token.len)
    return c;
  }
}

/**
 * Return the Lisp expression represented by the given string.
 */
export default function parse(
  src: string,
  replace?: (start: number, len: number, val: string) => void
): LispCell {
  return parseTokens(tokenize("(" + src + ")"), replace);
}

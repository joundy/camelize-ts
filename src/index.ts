type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
    : S;

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

export type Camelize<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K] extends Array<infer U>
    ? U extends {}
      ? Array<Camelize<U>>
      : T[K]
    : T[K] extends {}
    ? Camelize<T[K]>
    : T[K];
};

export type Snakeize<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K] extends Array<infer U>
    ? U extends {}
      ? Array<Snakeize<U>>
      : T[K]
    : T[K] extends {}
    ? Snakeize<T[K]>
    : T[K];
};

function camelCase(str: string) {
  return str.replace(/[_.-](\w|$)/g, function (_, x) {
    return x.toUpperCase();
  });
}

function snakeCase(str: string) {
  return str.replace(/[A-Z]/g, function (str) {
    return `_${str.toLowerCase()}`;
  });
}

function processWalk(obj, fn): any {
  const walk = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    if (obj instanceof Date || obj instanceof RegExp) return obj;
    if (Array.isArray(obj)) return obj.map(walk);

    return Object.keys(obj).reduce((res, key) => {
      const camel = fn(key);
      res[camel] = walk(obj[key]);
      return res;
    }, {});
  };

  return walk(obj);
}

export function camelize<T>(obj: T): T extends String ? string : Camelize<T> {
  return typeof obj === "string"
    ? camelCase(obj)
    : processWalk(obj, (key) => camelCase(key));
}

export function snakeize<T>(obj: T): T extends String ? string : Snakeize<T> {
  return typeof obj === "string"
    ? camelCase(obj)
    : processWalk(obj, (key) => snakeCase(key));
}

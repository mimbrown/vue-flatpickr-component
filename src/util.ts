export type Kebab<T extends string, A extends string = ""> =
    T extends `${infer F}${infer R}` ?
    Kebab<R, `${A}${F extends Lowercase<F> ? "" : "-"}${Lowercase<F>}`> :
    A;

export const camelToKebab = <T extends string>(string: T) => {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() as Kebab<T>;
};

export const nullify = (value: string): string | null => {
  return (value && value.length) ? value : null;
}

export const cloneObject = <T extends {}>(obj: T): T => {
  return Object.assign({}, obj);
};

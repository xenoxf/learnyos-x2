/**
 * Utilidades de tipado seguro para evitar errores comunes
 */

// Tipo para objeto genérico con cualquier propiedad
export type AnyRecord = Record<string, any>;

// Tipo para función que retorna void
export type VoidFunction = () => void;

// Tipo para función que retorna Promise<void>
export type AsyncVoidFunction = () => Promise<void>;

// Función para crear objeto con valores por defecto
export const createObject = <T extends AnyRecord>(
  base: T,
  overrides?: Partial<T>
): T => {
  return Object.assign({}, base, overrides) as T;
};

// Función para acceso seguro a propiedades anidadas
export const getNestedValue = <T = any>(
  obj: AnyRecord | undefined | null,
  path: string,
  defaultValue?: T
): T | undefined => {
  if (!obj) return defaultValue;

  const value = path.split('.').reduce((current: any, prop: string) => {
    return current?.[prop];
  }, obj);

  return value ?? defaultValue;
};

// Función para mergear objetos evitando sobrescritura
export const mergeObjects = <T extends AnyRecord>(
  target: T,
  ...sources: Partial<T>[]
): T => {
  return sources.reduce(
    (result, source) => ({
      ...result,
      ...Object.entries(source).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {} as AnyRecord
      ),
    }),
    target
  ) as T;
};

// Validador de tipo para objetos
export const isRecord = (value: unknown): value is AnyRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// Función para tipado seguro de arrays
export const asArray = <T,>(value: T | T[] | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

// Función para tipado seguro de strings
export const asString = (value: unknown, defaultValue: string = ''): string => {
  return typeof value === 'string' ? value : defaultValue;
};

// Función para tipado seguro de numbers
export const asNumber = (value: unknown, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Función para tipado seguro de booleanos
export const asBoolean = (value: unknown, defaultValue: boolean = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return defaultValue;
};

// Hook para validar tipo en runtime
export const validateType = <T,>(
  value: unknown,
  schema: (val: unknown) => val is T,
  fallback: T
): T => {
  return schema(value) ? value : fallback;
};

// Tipo helper para extraer props de un componente
export type ComponentProps<T> = T extends React.FC<infer P> ? P : never;

// Tipo helper para opcional
export type Optional<T> = T | undefined | null;

// Tipo helper para resultado
export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T,>(value: T): Result<T> => ({ ok: true, value });
export const Err = <E,>(error: E): Result<any, E> => ({ ok: false, error } as any);

// Función para mapear resultados
export const mapResult = <T, U, E>(
  result: Result<T, E>,
  mapper: (value: T) => U
): Result<U, E> => {
  if (result.ok) {
    return { ok: true, value: mapper(result.value) } as Result<U, E>;
  }
  return result as Result<U, E>;
};

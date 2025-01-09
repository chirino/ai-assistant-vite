export interface HubFilter {
  field: string;
  operator?: "=" | "!=" | "~" | ">" | ">=" | "<" | "<=";
  value:
    | string
    | number
    | {
        list: (string | number)[];
        operator?: "AND" | "OR";
      };
}

/**
 * Like serializeRequestParamsForHub but returns a plain object instead of URLSearchParams.
 */
export const encodeFilters = (filters: HubFilter[]): string | undefined => {
  let q = undefined as string | undefined;
  if (filters) {
    q = filters
      .filter((f) => {
        const { value } = f;
        return typeof value === "string" || typeof value === "number"
          ? true
          : value.list.length > 0;
      })
      .sort((a, b) => a.field.localeCompare(b.field))
      .map(serializeFilterForHub)
      .join("&");
  }
  return q;
};

/**
 * Converts a single filter object (HubFilter, the higher-level inspectable type) to the query string filter format used by the hub API
 */
const serializeFilterForHub = (filter: HubFilter): string => {
  const { field, operator, value } = filter;
  const joinedValue =
    typeof value === "string"
      ? value
      : typeof value === "number"
        ? `"${value}"`
        : `${value.list.join(value.operator === "OR" ? "|" : ",")}`;

  if (!field) {
    return joinedValue;
  } else {
    return `${field}${operator}${joinedValue}`;
  }
};

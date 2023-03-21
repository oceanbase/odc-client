export interface ISQLLintReuslt {
  sql: string;
  violations: {
    col: number;
    level: number;
    localizedMessage: string;
    row: number;
    type: string;
  }[];
}

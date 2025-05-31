// Type definitions for node-sql-parser

export interface Location {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
}

export interface ColumnRef {
  type: 'column_ref';
  table: string | null;
  column: string;
  _location?: Location;
}

export interface TableNode {
  type: 'table';
  db: string | null;
  table: string;
  as?: string;
  _location?: Location;
}

export interface SelectColumn {
  expr: ColumnRef | ASTNode;
  as?: string;
  _location?: Location;
}

export interface SelectStatement {
  type: 'select';
  columns: SelectColumn[];
  from?: TableNode[];
  where?: ASTNode;
  groupby?: ASTNode[];
  having?: ASTNode;
  orderby?: ASTNode[];
  limit?: ASTNode;
  _location?: Location;
}

export interface InsertStatement {
  type: 'insert';
  table: TableNode[];
  columns?: string[];
  values: ASTNode[][];
  _location?: Location;
}

export interface UpdateStatement {
  type: 'update';
  table: TableNode[];
  set: ASTNode[];
  where?: ASTNode;
  _location?: Location;
}

export interface DeleteStatement {
  type: 'delete';
  from: TableNode[];
  where?: ASTNode;
  _location?: Location;
}

export type ASTNode = 
  | SelectStatement 
  | InsertStatement 
  | UpdateStatement 
  | DeleteStatement
  | ColumnRef
  | TableNode
  | { [key: string]: unknown };

export interface ParseError {
  message: string;
  location?: Location;
}
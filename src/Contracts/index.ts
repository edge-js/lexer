/**
 * @module Lexer
 */

enum NodeType {
  BLOCK = 'block',
  RAW = 'raw',
  NEWLINE = 'newline',
  MUSTACHE = 'mustache',
}

enum WhiteSpaceModes { NONE, ALL, CONTROLLED }

interface IStatement {
  started: boolean
  ended: boolean
  props: IProp
  feed (line: string): void
}

interface IProp {
  name: string
  jsArg: string,
  raw: string
}

interface IMustacheProp extends IProp {
  textLeft: string
  textRight: string
}

interface INode {
  type: NodeType
  value?: string
  lineno: number
}

interface IBlockNode extends INode {
  properties: IProp
  children: Array<INode | IBlockNode>
}

interface IMustacheNode extends INode {
  properties: IProp
}

export { IProp as IProp }
export { INode as INode }
export { IBlockNode as IBlockNode }
export { IMustacheNode as IMustacheNode }
export { NodeType as NodeType }
export { IStatement as IStatement }
export { IMustacheProp as IMustacheProp }
export { WhiteSpaceModes as WhiteSpaceModes }

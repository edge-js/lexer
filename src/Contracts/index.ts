/**
 * @module Lexer
 */

enum NodeType {
  BLOCK = 'block',
  RAW = 'raw',
  NEWLINE = 'newline',
  MUSTACHE = 'mustache',
}

enum MustacheType {
  SMUSTACHE = 's__mustache',
  ESMUSTACHE = 'es__mustache',
  MUSTACHE = 'mustache',
  EMUSTACHE = 'e__mustache',
}

enum WhiteSpaceModes { NONE, ALL }

interface IProp {
  name: string
  jsArg: string,
  raw: string
}

interface IMustacheProp {
  name: MustacheType | null
  jsArg: string,
  raw: string
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

interface ITagDefination {
  block: boolean
  selfclosed: boolean
  escaped: boolean
  seekable: boolean
}

export { IProp as IProp }
export { INode as INode }
export { IBlockNode as IBlockNode }
export { IMustacheNode as IMustacheNode }
export { NodeType as NodeType }
export { IMustacheProp as IMustacheProp }
export { WhiteSpaceModes as WhiteSpaceModes }
export { MustacheType as MustacheType }
export { ITagDefination as ITagDefination }

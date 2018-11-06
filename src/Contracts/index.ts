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

interface IBlockProp extends IProp {
  selfclosed: boolean
}

interface IMustacheProp {
  name: MustacheType
  jsArg: string,
  raw: string
  textLeft: string
  textRight: string
}

type ILoc = {
  start: {
    line: number,
    col: number,
  },
  end: {
    line: number,
    col: number,
  },
}

interface INode {
  type: NodeType
  value?: string
  line: number
}

interface IBlockNode {
  type: NodeType
  properties: IBlockProp
  loc: ILoc
  children: Array<INode | IBlockNode>
}

interface IMustacheNode {
  type: NodeType
  properties: IProp
  loc: ILoc
}

interface ITagDefination {
  block: boolean
  selfclosed: boolean
  escaped?: boolean
  seekable: boolean,
  new? ()
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
export { IBlockProp as IBlockProp }
export { ILoc as ILoc }

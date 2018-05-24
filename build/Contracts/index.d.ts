/**
 * @module Lexer
 */
declare enum NodeType {
    BLOCK = "block",
    RAW = "raw",
    NEWLINE = "newline",
    MUSTACHE = "mustache",
}
declare enum MustacheType {
    SMUSTACHE = "s__mustache",
    ESMUSTACHE = "es__mustache",
    MUSTACHE = "mustache",
    EMUSTACHE = "e__mustache",
}
declare enum WhiteSpaceModes {
    NONE = 0,
    ALL = 1,
    CONTROLLED = 2,
}
interface IStatement {
    started: boolean;
    ended: boolean;
    props: IProp;
    feed(line: string): void;
}
interface IProp {
    name: string;
    jsArg: string;
    raw: string;
}
interface IMustacheProp extends IProp {
    name: null | MustacheType;
    textLeft: string;
    textRight: string;
}
interface INode {
    type: NodeType;
    value?: string;
    lineno: number;
}
interface IBlockNode extends INode {
    properties: IProp;
    children: Array<INode | IBlockNode>;
}
interface IMustacheNode extends INode {
    properties: IProp;
}
export { IProp as IProp };
export { INode as INode };
export { IBlockNode as IBlockNode };
export { IMustacheNode as IMustacheNode };
export { NodeType as NodeType };
export { IStatement as IStatement };
export { IMustacheProp as IMustacheProp };
export { WhiteSpaceModes as WhiteSpaceModes };
export { MustacheType as MustacheType };

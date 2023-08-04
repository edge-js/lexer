/**
 * edge-lexer
 *
 * (c) Edge
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Types for mustache statements
 */
export enum MustacheTypes {
  SMUSTACHE = 's__mustache',
  ESMUSTACHE = 'es__mustache',
  MUSTACHE = 'mustache',
  EMUSTACHE = 'e__mustache',
}

/**
 * The type of node types. Each token
 * will have one of these types
 */
export enum TagTypes {
  TAG = 'tag',
  ETAG = 'e__tag',
}

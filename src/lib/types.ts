/**
 * Canonical data model for a single Billy McComiskey composition.
 * Mirrors the schema in `public/data/tunes.json` and is documented for
 * machine consumers in `public/.well-known/llms.txt`.
 */

export type Rhythm =
  | 'reel'
  | 'jig'
  | 'slip jig'
  | 'hornpipe'
  | 'polka'
  | 'slide'
  | 'waltz'
  | 'air'
  | 'march'
  | 'barndance'

export interface TuneCredits {
  /** Composer of the melody — Billy McComiskey for original compositions. */
  composer: string
  /** Author of the accompanying narrative/story, when different from composer. */
  storyBy?: string
  /** Person who edited/transcribed the archive entry. */
  editor?: string
}

/**
 * Archival provenance block, shaped to match ingest standards expected by the
 * Irish Traditional Music Archive (ITMA), Dublin.
 */
export interface ArchivalMetadata {
  /** Name of the collection this entry belongs to. */
  sourceCollection: string
  /** Entity/person holding the rights to the composition. */
  rightsHolder: string
  /** ISO-8601 date (or year) of the reference recording, if any. */
  recordingDate: string
}

export interface Tune {
  /** URL-safe stable identifier (kebab-case). */
  id: string
  /** Display title, e.g. "The Diamond". */
  title: string
  /** Tune type / dance rhythm. */
  rhythm: Rhythm
  /** Musical key, e.g. "G", "Dmaj", "Amaj". */
  key: string
  /** The historical story behind the composition. */
  narrative: string
  credits: TuneCredits
  archivalMetadata: ArchivalMetadata
  /** Standard ABC notation string, rendered client-side via abcjs. */
  abcNotation: string
  /**
   * Provenance of `abcNotation`:
   *  - `placeholder`: fabricated scaffolding — NOT the real melody.
   *  - `thesession`: community transcription from thesession.org (pending Billy's sign-off).
   *  - `official`: verified/authoritative transcription.
   */
  notationSource: 'placeholder' | 'thesession' | 'official'
  /** Link to the source transcription, when applicable. */
  notationSourceUrl?: string
}

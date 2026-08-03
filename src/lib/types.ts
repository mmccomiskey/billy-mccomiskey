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

/**
 * A visual asset attached to a tune — a manuscript scan, a photo, or a
 * hand-written setting. Shown in the per-tune media viewer alongside the
 * engraved notation. `src` is a path under `/public` (or an absolute URL).
 */
export interface TuneImage {
  /** Path under /public, e.g. "/images/tunes/perpetual-light/manuscript-1.svg". */
  src: string
  /** Required alt text for accessibility. */
  alt: string
  /** Short caption shown beneath the image in the viewer. */
  caption?: string
  /** What the image is, for labelling/grouping. */
  kind?: 'manuscript' | 'photo' | 'setting'
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
  /** Manuscript scans, photos, and settings shown in the media viewer. */
  images?: TuneImage[]
}

/** Billy's involvement on an album. */
export type AlbumRole = 'solo' | 'member' | 'ensemble' | 'guest'

/**
 * Outbound links for an album. Albums are external releases (not content this
 * site hosts), so the card links out to listen or buy rather than embedding.
 */
export interface AlbumLinks {
  bandcamp?: string
  spotify?: string
  appleMusic?: string
  /** Label / store page (Compass, etc.). */
  compass?: string
  discogs?: string
  allmusic?: string
}

/** A record Billy appears on — solo, with a band, or as a guest. */
export interface Album {
  /** URL-safe stable identifier (kebab-case). */
  id: string
  /** Album title, e.g. "Outside the Box". */
  title: string
  /** Release year. */
  year: number
  /** Who the record is billed under (artist, band, or collaboration). */
  artist: string
  /** Billy's involvement. */
  role: AlbumRole
  /** Record label. */
  label: string
  /** Key players, when noteworthy. */
  personnel?: string
  /** Short editorial note (producer, award, context). */
  notes?: string
  /** Outbound listen/buy/reference links. */
  links: AlbumLinks
}

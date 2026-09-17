/**
 * When each content file was last changed, from git — what Starlight's
 * `lastUpdated` shows on the buraq docs.
 *
 * The frontmatter `updatedAt` came from the Django database and freezes at the
 * migration date, so an edited page would keep claiming July. The commit date
 * is the honest answer; frontmatter stays the fallback for a file that has
 * never been committed (a new page in a working tree, or a shallow clone).
 *
 * One `git log` pass for the whole content tree: a call per file would be
 * hundreds of processes for 819 pages.
 */
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

let dates;

function read() {
  const map = new Map();
  try {
    const log = execFileSync(
      'git',
      ['log', '--pretty=format:@%cI', '--name-only', '--', 'src/content'],
      { cwd: DOCS, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
    );
    let commit;
    for (const line of log.split('\n')) {
      if (line.startsWith('@')) commit = line.slice(1);
      else if (line.trim() && commit && !map.has(line)) map.set(line, commit);
    }
  } catch {
    // No git, or no history yet: every page falls back to its frontmatter.
  }
  return map;
}

/** ISO date of the file's last commit, or undefined. `id` is "en/components/button". */
export function lastCommitDate(collection, id, extension) {
  dates ??= read();
  return dates.get(`docs/src/content/${collection}/${id}.${extension}`)
    ?? dates.get(`src/content/${collection}/${id}.${extension}`);
}
